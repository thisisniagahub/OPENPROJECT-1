"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useStudio } from "@/lib/store";
import { isVisibleChatMessage } from "@/lib/constants";
import { MAIN_SESSION_KEY } from "@/lib/reducer";
import { loadOnboardingDone, loadGatewayConfig, saveOnboardingDone } from "@/lib/persistence";
import type { ConnectionStatus, PipelineStage, TaskItem, TaskPipelineState } from "@/types/game";

import AgentStatusPanel from "./AgentStatusPanel";
import ConnectionPanel from "./ConnectionPanel";
import ChatPanel from "./ChatPanel";
import TaskPanel from "./TaskPanel";
import WorkerPanel from "./WorkerPanel";
import SeatManagerModal from "./SeatManagerModal";
import OnboardingOverlay from "./OnboardingOverlay";
import PixelHeader from "./PixelHeader";
import AnalyticsDashboard from "./AnalyticsDashboard";
import PixelTabBar from "./PixelTabBar";
import CommandTerminal from "./CommandTerminal";
import TaskPipelineTracker from "./TaskPipelineTracker";

type HudTab = "notifications" | "logs" | "settings" | "more";

function mapTaskToPipeline(task?: TaskItem): TaskPipelineState | null {
  if (!task) return null;

  const createdAt = Date.parse(task.createdAt);
  const completedAt = task.completedAt ? Date.parse(task.completedAt) : undefined;
  const delegatedTo = task.actorName ?? task.openclawId ?? task.seatId;
  const stages: Partial<Record<PipelineStage, { timestamp?: number; detail?: string }>> = {
    submitted: { timestamp: Number.isFinite(createdAt) ? createdAt : undefined },
  };

  let currentStage: PipelineStage = "submitted";

  if (task.status === "submitted" && (task.seatId || task.actorName)) {
    currentStage = "received";
    stages.received = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
  }

  if (task.status === "queued") {
    currentStage = "routing";
    stages.received = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.routing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: task.seatId };
  }

  if (task.status === "returning") {
    currentStage = "delegated";
    stages.received = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.routing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: task.seatId };
    stages.delegated = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: delegatedTo };
  }

  if (task.status === "running") {
    currentStage = "processing";
    stages.received = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.routing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: task.seatId };
    stages.delegated = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: delegatedTo };
    stages.processing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
  }

  if (task.status === "completed") {
    currentStage = "completed";
    stages.received = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.routing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: task.seatId };
    stages.delegated = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: delegatedTo };
    stages.processing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.completed = { timestamp: completedAt };
  }

  if (task.status === "failed" || task.status === "stopped") {
    currentStage = "failed";
    stages.received = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.routing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: task.seatId };
    stages.delegated = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined, detail: delegatedTo };
    stages.processing = { timestamp: Number.isFinite(createdAt) ? createdAt : undefined };
    stages.failed = { timestamp: completedAt };
  }

  return {
    taskId: task.taskId,
    currentStage,
    stages,
    delegatedTo,
    elapsed: Number.isFinite(createdAt)
      ? Math.max((completedAt ?? Date.now()) - createdAt, 0)
      : undefined,
  };
}

function averageResponseTime(tasks: TaskItem[]) {
  const durations = tasks
    .map((task) => {
      if (!task.completedAt) return null;
      const start = Date.parse(task.createdAt);
      const end = Date.parse(task.completedAt);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
      return Math.max(end - start, 0);
    })
    .filter((duration): duration is number => typeof duration === "number");

  if (durations.length === 0) return 0;
  return Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length);
}

function resolveGatewayHealth(connection: ConnectionStatus) {
  switch (connection) {
    case "connected":
      return 5;
    case "connecting":
    case "handshaking":
      return 3;
    case "rate_limited":
      return 2;
    case "error":
    case "auth_failed":
    case "unreachable":
      return 1;
    default:
      return 0;
  }
}

export default function GameHud({ children }: { children?: ReactNode }) {
  const { state, assignTask } = useStudio();
  const [seatManagerOpen, setSeatManagerOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<HudTab>("notifications");

  useEffect(() => {
    if (!loadOnboardingDone() && !loadGatewayConfig()) {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    // If onboarding is done because they connected
    if (showOnboarding && state.connection === "connected") {
      setShowOnboarding(false);
      saveOnboardingDone();
    }
  }, [showOnboarding, state.connection]);

  const activeSessionKey = state.activeSessionKey ?? MAIN_SESSION_KEY;
  const visibleTasks = useMemo(
    () => state.tasks.filter((task) => task.sessionKey === activeSessionKey),
    [activeSessionKey, state.tasks],
  );
  const visibleMessages = useMemo(
    () =>
      state.chatMessages.filter(
        (message) => message.sessionKey === activeSessionKey && isVisibleChatMessage(message),
      ),
    [activeSessionKey, state.chatMessages],
  );
  const pipeline = useMemo(() => mapTaskToPipeline(visibleTasks[0]), [visibleTasks]);
  const completedCount = useMemo(
    () => visibleTasks.filter((task) => task.status === "completed").length,
    [visibleTasks],
  );
  const failedCount = useMemo(
    () => visibleTasks.filter((task) => task.status === "failed").length,
    [visibleTasks],
  );
  const tokenUsage = useMemo(() => {
    const used = state.sessionMetrics.usedTokens ?? 0;
    const max = state.sessionMetrics.maxContextTokens ?? 0;
    if (!max) return 0;
    return Math.min((used / max) * 100, 100);
  }, [state.sessionMetrics.maxContextTokens, state.sessionMetrics.usedTokens]);
  const successRate = useMemo(() => {
    const resolvedCount = completedCount + failedCount;
    if (resolvedCount > 0) return (completedCount / resolvedCount) * 100;
    if (visibleTasks.length > 0) return (completedCount / visibleTasks.length) * 100;
    return 0;
  }, [completedCount, failedCount, visibleTasks.length]);
  const responseTime = useMemo(() => averageResponseTime(visibleTasks), [visibleTasks]);
  const activeSessions = Math.max(state.sessions.length, 1);
  const notificationCount = useMemo(
    () =>
      visibleTasks.filter((task) =>
        ["submitted", "queued", "returning", "running", "failed"].includes(task.status),
      ).length,
    [visibleTasks],
  );

  let centerPanel: ReactNode;

  switch (activeTab) {
    case "logs":
      centerPanel = <TaskPanel tasks={visibleTasks} />;
      break;
    case "settings":
      centerPanel = <ConnectionPanel />;
      break;
    case "more":
      centerPanel = (
        <WorkerPanel
          seats={state.seats}
          onOpenManager={() => setSeatManagerOpen(true)}
        />
      );
      break;
    default:
      centerPanel = (
        <ChatPanel
          messages={visibleMessages}
          tasks={visibleTasks}
          isConnected={state.connection === "connected"}
          sessions={state.sessions}
          activeSessionKey={state.activeSessionKey}
          showComposer={false}
        />
      );
      break;
  }

  return (
    <>
      <div className="mx-auto mt-4 px-4 flex w-full max-w-[1700px] flex-col gap-4 flex-1 min-h-0 pointer-events-none">

        {/* Header must be clickable */}
        <div className="pointer-events-auto">
          <PixelHeader
            isConnected={state.connection === "connected"}
            taskCount={visibleTasks.length}
            completedCount={completedCount}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_minmax(0,1fr)_320px] flex-1 min-h-0">

          {/* Left Panel */}
          <div className="flex flex-col min-h-0 h-full pointer-events-auto">
            <AgentStatusPanel />
          </div>

          {/* Center Column with Game Background and UI Overlay */}
          <div className="flex min-w-0 flex-col gap-4 relative min-h-0 h-full">
            <div className="pointer-events-auto">
              <TaskPipelineTracker pipeline={pipeline} />
            </div>

            <div className="flex-1 relative min-h-0">
              {/* Game Background */}
              {children && (
                <div className="absolute inset-0 z-0 bg-black rounded-sm border border-cyan-900/30 overflow-hidden pointer-events-auto">
                  {children}
                </div>
              )}

              {/* Overlay center panel (if any tab is active) */}
              <div className="absolute inset-0 z-10 p-1 pointer-events-none">
                <div className="h-full overflow-y-auto pointer-events-auto">
                  {centerPanel}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-col min-h-0 h-full pointer-events-auto">
            <AnalyticsDashboard
              tokenUsage={tokenUsage}
              successRate={successRate}
              gatewayHealth={resolveGatewayHealth(state.connection)}
              responseTime={responseTime}
              activeSessions={activeSessions}
            />
          </div>
        </div>

        <div className="pointer-events-auto">
          <PixelTabBar
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as HudTab)}
            notificationCount={notificationCount}
          />
        </div>

        <div className="pointer-events-auto">
          <CommandTerminal
            onSubmit={(command) => {
              if (state.connection !== "connected") return;
              const trimmed = command.trim();
              if (!trimmed) return;
              assignTask(trimmed);
            }}
            disabled={state.connection !== "connected"}
          />
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          GLOBAL MODALS & OVERLAYS
          ────────────────────────────────────────────────────────────────── */}
      <SeatManagerModal
        open={seatManagerOpen}
        onClose={() => setSeatManagerOpen(false)}
        seats={state.seats}
      />

      {showOnboarding && (
        <div className="pointer-events-auto z-50">
          <OnboardingOverlay onDone={() => setShowOnboarding(false)} />
        </div>
      )}
    </>
  );
}
