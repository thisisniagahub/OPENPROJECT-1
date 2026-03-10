"use client";

import type { PipelineStage, TaskPipelineState } from "@/types/game";

interface TaskPipelineTrackerProps {
  pipeline: TaskPipelineState | null;
}

const DISPLAY_STAGES: Array<{ key: Exclude<PipelineStage, "failed">; label: string }> = [
  { key: "submitted", label: "SUBMITTED" },
  { key: "received", label: "RECEIVED" },
  { key: "routing", label: "ROUTING" },
  { key: "delegated", label: "DELEGATED" },
  { key: "processing", label: "PROCESSING" },
  { key: "completed", label: "DONE" },
];

function getCurrentIndex(currentStage: PipelineStage) {
  if (currentStage === "failed") return DISPLAY_STAGES.length - 1;
  return DISPLAY_STAGES.findIndex((stage) => stage.key === currentStage);
}

function formatElapsed(elapsed?: number) {
  if (!elapsed || elapsed <= 0) return null;
  if (elapsed < 1000) return `${elapsed}ms`;
  if (elapsed < 60_000) return `${(elapsed / 1000).toFixed(1)}s`;

  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function TaskPipelineTracker({
  pipeline,
}: TaskPipelineTrackerProps) {
  const currentIndex = pipeline ? getCurrentIndex(pipeline.currentStage) : -1;
  const elapsedLabel = formatElapsed(pipeline?.elapsed);
  const finalLabel = pipeline?.currentStage === "failed" ? "FAILED" : "DONE";

  return (
    <div className="pixel-panel flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="pixel-header__metric-value">TASK PIPELINE</span>
        {elapsedLabel ? <span className="pixel-pipeline__time">ELAPSED {elapsedLabel}</span> : null}
      </div>

      {!pipeline ? (
        <div className="pixel-pipeline__time">AWAITING TASK...</div>
      ) : null}

      <div className="pixel-pipeline">
        {DISPLAY_STAGES.map((stage, index) => {
          const isFailedStage = Boolean(
            pipeline?.currentStage === "failed" && index === DISPLAY_STAGES.length - 1,
          );
          const isDoneStage = Boolean(pipeline && !isFailedStage && index < currentIndex);
          const isActiveStage = Boolean(pipeline && !isFailedStage && index === currentIndex);
          const dotClass = isFailedStage
            ? "pixel-pipeline__dot--failed"
            : isDoneStage
              ? "pixel-pipeline__dot--done"
              : isActiveStage
                ? "pixel-pipeline__dot--active"
                : "pixel-pipeline__dot--pending";
          const labelClass = isDoneStage
            ? "pixel-pipeline__label--done"
            : isActiveStage || isFailedStage
              ? "pixel-pipeline__label--active"
              : "";
          const connectorClass = pipeline
            ? index < currentIndex - 1
              ? "pixel-pipeline__connector--done"
              : index === currentIndex - 1 && pipeline.currentStage !== "failed" && pipeline.currentStage !== "completed"
                ? "pixel-pipeline__connector--active"
                : index === currentIndex - 1
                  ? "pixel-pipeline__connector--done"
                  : ""
            : "";
          const timestamp = pipeline?.stages[stage.key]?.timestamp;
          const delegatedTo = stage.key === "delegated" ? pipeline?.delegatedTo : undefined;

          return (
            <div key={stage.key} className="flex flex-1 items-start">
              <div className="pixel-pipeline__stage">
                <div className={`pixel-pipeline__dot ${dotClass}`} />
                <div className={`pixel-pipeline__label ${labelClass}`}>
                  {index === DISPLAY_STAGES.length - 1 ? finalLabel : stage.label}
                </div>
                {typeof timestamp === "number" ? (
                  <div className="pixel-pipeline__time">
                    {new Date(timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                ) : null}
                {delegatedTo ? (
                  <div className="pixel-pipeline__agent">{delegatedTo}</div>
                ) : null}
              </div>

              {index < DISPLAY_STAGES.length - 1 ? (
                <div className={`pixel-pipeline__connector ${connectorClass}`} />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
