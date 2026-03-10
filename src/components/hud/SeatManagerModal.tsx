"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check, Search, Crosshair } from "lucide-react";
import { useStudio } from "@/lib/store";
import {
  DEFAULT_OPERATIVE_AGENT_ID,
  WORKER_SPRITES,
  getCharacterConfig,
} from "@/components/game/config/animations";
import type { SeatState } from "@/types/game";
import CharacterPortrait from "./CharacterPortrait";

export default function SeatManagerModal({
  open,
  onClose,
  seats,
}: {
  open: boolean;
  onClose: () => void;
  seats: SeatState[];
}) {
  const { updateSeatConfig } = useStudio();
  const [selectedSeatId, setSelectedSeatId] = useState<string>("");
  const [draftSeatId, setDraftSeatId] = useState<string>("");
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [agentId, setAgentId] = useState(DEFAULT_OPERATIVE_AGENT_ID);
  const [openclawId, setOpenclawId] = useState<string | undefined>(undefined);
  const [spriteKey, setSpriteKey] = useState("");
  const [spritePath, setSpritePath] = useState("");

  const selectedSeat = useMemo(
    () => seats.find((seat) => seat.seatId === selectedSeatId) ?? seats[0],
    [seats, selectedSeatId],
  );

  useEffect(() => {
    if (open && seats.length > 0 && !seats.find((s) => s.seatId === selectedSeatId)) {
      setSelectedSeatId(seats[0].seatId);
    }
  }, [open, seats, selectedSeatId]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !selectedSeat) return null;

  const usingDraft = draftSeatId === selectedSeat.seatId;
  const effectiveName = usingDraft ? name : (selectedSeat.assigned ? selectedSeat.label : "");
  const effectiveRoleTitle = usingDraft ? roleTitle : (selectedSeat.roleTitle ?? "");
  const effectiveAgentId = usingDraft
    ? agentId
    : (selectedSeat.agentId ?? DEFAULT_OPERATIVE_AGENT_ID);
  const effectiveSpriteKey = usingDraft ? spriteKey : (selectedSeat.spriteKey ?? WORKER_SPRITES[0]?.key ?? "");
  const effectiveSpritePath = usingDraft ? spritePath : (selectedSeat.spritePath ?? WORKER_SPRITES[0]?.path ?? "");

  const assignedCount = seats.filter((seat) => seat.assigned).length;
  const busy = selectedSeat.status === "running" || selectedSeat.status === "returning";
  const canSave = Boolean(effectiveName.trim() && effectiveRoleTitle.trim() && effectiveSpriteKey && effectiveSpritePath && !busy);

  const beginDraftForSeat = (seat: SeatState) => {
    const selectedSprite = seat.agentId
      ? getCharacterConfig(seat.agentId)
      : getCharacterConfig(seat.spriteKey ?? DEFAULT_OPERATIVE_AGENT_ID);

    setDraftSeatId(seat.seatId);
    setName(seat.assigned ? seat.label : "");
    setRoleTitle(seat.roleTitle ?? "");
    setAgentId(seat.agentId ?? selectedSprite?.agentId ?? DEFAULT_OPERATIVE_AGENT_ID);
    setOpenclawId(seat.openclawId ?? selectedSprite?.openclawId);
    setSpriteKey(seat.spriteKey ?? selectedSprite?.key ?? WORKER_SPRITES[0]?.key ?? "");
    setSpritePath(seat.spritePath ?? selectedSprite?.path ?? WORKER_SPRITES[0]?.path ?? "");
  };

  const handleSave = () => {
    if (!canSave) return;
    updateSeatConfig(selectedSeat.seatId, {
      assigned: true,
      label: effectiveName.trim(),
      roleTitle: effectiveRoleTitle.trim(),
      agentId: effectiveAgentId,
      openclawId: openclawId,
      spriteKey: effectiveSpriteKey,
      spritePath: effectiveSpritePath,
    });
  };

  const handleUnassign = () => {
    if (busy) return;
    updateSeatConfig(selectedSeat.seatId, {
      assigned: false,
      agentId: undefined,
      openclawId: undefined,
      roleTitle: undefined,
      spriteKey: undefined,
      spritePath: undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-500"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-6xl h-[85vh] mx-4 modern-glass border-cyber-primary/30 flex flex-col diagonal-cut shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Header */}
        <div className="relative flex-none px-6 py-4 border-b border-cyber-primary/20 bg-black/40 flex items-center justify-between">
          <div className="absolute top-0 left-0 w-3 h-3 border-r-2 border-b-2 border-cyber-primary/40" />

          <div>
            <h2 className="text-[18px] font-cyber-display font-bold text-cyber-primary flex items-center gap-4 tracking-[0.3em] uppercase">
              <div className="w-3 h-3 bg-cyber-primary rotate-45 animate-pulse" />
              TERMINAL_ASSIGNMENT_V2.0
            </h2>
            <div className="text-[10px] text-cyber-muted font-cyber-mono font-bold tracking-[0.2em] uppercase mt-2 opacity-60">
              UPLINK_CAPACITY: {seats.length} {"//"} ACTIVE_NODES: {assignedCount} {"//"} STANDBY: {seats.length - assignedCount}
            </div>
          </div>
          <button
            onClick={onClose}
            title="Terminate Configuration"
            className="w-10 h-10 flex items-center justify-center border border-cyber-accent-red/30 bg-cyber-accent-red/5 text-cyber-accent-red hover:bg-cyber-accent-red hover:text-white transition-all duration-300 diagonal-cut"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden relative z-10">

          {/* Left Column: Seat Selector */}
          <div className="w-72 border-r border-cyber-primary/10 bg-black/20 flex flex-col pt-4">
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-3 pb-6">
              {seats.map((seat, index) => {
                const active = seat.seatId === selectedSeat.seatId;
                const statusColor = !seat.assigned ? "rgba(148,163,184,0.5)" : seat.status === "running" ? "var(--cyber-primary)" : "var(--cyber-accent-purple)";

                return (
                  <button
                    key={seat.seatId}
                    type="button"
                    className={`w-full text-left relative p-3 border transition-all duration-300 diagonal-cut ${active ? "bg-cyber-primary/10 border-cyber-primary shadow-[0_0_15px_rgba(0,240,255,0.1)]" : "bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/5"
                      }`}
                    onClick={() => {
                      setSelectedSeatId(seat.seatId);
                      beginDraftForSeat(seat);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black/40 border border-white/5 flex items-center justify-center diagonal-cut">
                        {seat.assigned && seat.spritePath ? (
                          <div className="scale-75"><CharacterPortrait spritePath={seat.spritePath} name={seat.label} /></div>
                        ) : (
                          <div className={`text-[10px] font-cyber-mono font-bold uppercase text-cyber-muted opacity-30`}>__</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-cyber-mono font-bold tracking-[0.1em] uppercase ${active ? "text-cyber-primary" : "text-cyber-muted opacity-60"}`}>
                          NODE_{index + 1}
                        </div>
                        <div className={`text-[12px] font-cyber-display font-bold uppercase tracking-[0.1em] truncate mt-0.5 ${active ? "text-white" : "text-cyber-muted"}`}>
                          {seat.assigned ? seat.label : "VACANT_SLOT"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Middle Column: Configuration */}
          <div className="flex-1 flex flex-col bg-[#050a15]">
            <div className="p-6 border-b border-cyber-primary/10 flex gap-8 items-start bg-black/40">
              {/* Large Portrait */}
              <div className="w-32 h-32 modern-glass border-2 border-cyber-primary shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center relative diagonal-cut">
                <div className="absolute top-0 left-0 w-3 h-3 border-b-2 border-r-2 border-cyber-primary/40" />
                {effectiveSpritePath ? (
                  <div className="scale-[2.0] transform transition-transform"><CharacterPortrait spritePath={effectiveSpritePath} name={effectiveName || "NEW_CLONE"} /></div>
                ) : (
                  <div className="w-6 h-6 bg-cyber-primary/20 animate-pulse" />
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[16px] font-cyber-display font-bold text-white uppercase tracking-[0.2em]">
                      {selectedSeat.assigned ? effectiveName || selectedSeat.label : "MANIFESTATION_INITIALIZING"}
                    </h3>
                    <div className="text-[10px] text-cyber-primary/60 font-cyber-mono font-bold mt-2 tracking-[0.1em]">
                      UPLINK_ID: {selectedSeat.seatId} {"//"} VECTOR: {selectedSeat.spawnFacing ?? "DOWN"}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 text-[10px] font-cyber-mono font-bold uppercase tracking-[0.2em] border diagonal-cut ${!selectedSeat.assigned ? "border-white/10 text-cyber-muted bg-white/5" : "border-cyber-primary text-cyber-primary bg-cyber-primary/10 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    }`}>
                    NODE_STAT: {selectedSeat.assigned ? selectedSeat.status : "OFFLINE"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber-display font-bold text-cyber-primary uppercase tracking-[0.2em] opacity-60">Operative_Designation</label>
                    <input
                      className="w-full bg-black/40 border border-cyber-primary/30 text-[11px] font-cyber-mono font-bold text-white placeholder:text-cyber-primary/20 px-4 py-3 uppercase tracking-[0.1em] focus:outline-none focus:border-cyber-primary diagonal-cut transition-all"
                      value={effectiveName}
                      onChange={(event) => { if (!usingDraft) beginDraftForSeat(selectedSeat); setName(event.target.value); }}
                      disabled={busy}
                      placeholder="CALLSIGN"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-cyber-display font-bold text-cyber-primary uppercase tracking-[0.2em] opacity-60">Neural_Profile</label>
                    <input
                      className="w-full bg-black/40 border border-cyber-primary/30 text-[11px] font-cyber-mono font-bold text-white placeholder:text-cyber-primary/20 px-4 py-3 uppercase tracking-[0.1em] focus:outline-none focus:border-cyber-primary diagonal-cut transition-all"
                      value={effectiveRoleTitle}
                      onChange={(event) => { if (!usingDraft) beginDraftForSeat(selectedSeat); setRoleTitle(event.target.value); }}
                      disabled={busy}
                      placeholder="FUNCTIONAL_ROLE"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Clone Selector Grid */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/20">
              <div className="text-[11px] font-cyber-display font-bold text-cyber-muted uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
                <Crosshair size={14} className="text-cyber-primary animate-pulse" /> PHYSICAL_MANIFESTATION_PROTOCOLS
              </div>
              <div className="grid grid-cols-6 gap-4">
                {WORKER_SPRITES.map((sprite) => {
                  const active = sprite.agentId === effectiveAgentId || sprite.key === effectiveSpriteKey;
                  return (
                    <button
                      key={sprite.agentId ?? sprite.key}
                      type="button"
                      className={`relative p-3 border transition-all duration-300 flex flex-col items-center gap-3 diagonal-cut ${active
                        ? "bg-cyber-primary/10 border-cyber-primary shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                        : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                        }`}
                      onClick={() => {
                        if (!usingDraft) beginDraftForSeat(selectedSeat);
                        setAgentId(sprite.agentId ?? DEFAULT_OPERATIVE_AGENT_ID);
                        setOpenclawId(sprite.openclawId);
                        setSpriteKey(sprite.key);
                        setSpritePath(sprite.path);
                        if (!effectiveName.trim()) setName(sprite.label);
                      }}
                      disabled={busy}
                    >
                      {active && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-cyber-primary rotate-45 shadow-[0_0_5px_rgba(0,240,255,0.5)]" />
                      )}
                      <div className={`w-14 h-14 bg-black/60 flex items-center justify-center border diagonal-cut ${active ? "border-cyber-primary/40" : "border-white/5"}`}>
                        <CharacterPortrait spritePath={sprite.path} name={sprite.label} />
                      </div>
                      <div className={`text-[9px] font-cyber-mono font-bold uppercase tracking-[0.1em] text-center leading-tight ${active ? "text-white" : "text-cyber-muted"}`}>
                        {sprite.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-none p-6 border-t border-cyber-primary/20 bg-black/50 flex justify-between items-center">
              <button
                type="button"
                className="px-6 py-3 text-[10px] font-cyber-display font-bold uppercase tracking-[0.2em] border border-cyber-accent-red/30 bg-cyber-accent-red/10 text-cyber-accent-red hover:bg-cyber-accent-red hover:text-white transition-all duration-300 diagonal-cut disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={handleUnassign}
                disabled={!selectedSeat.assigned || busy}
              >
                PURGE_ASSIGNMENT
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 py-3 text-[10px] font-cyber-display font-bold uppercase tracking-[0.2em] border border-white/20 bg-transparent text-white/40 hover:border-white/40 hover:text-white transition-all duration-300 diagonal-cut"
                  onClick={onClose}
                >
                  ABORT_SESSION
                </button>
                <button
                  type="button"
                  className="px-8 py-3 text-[11px] font-cyber-display font-bold uppercase tracking-[0.3em] bg-cyber-primary/10 border-2 border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 diagonal-cut disabled:opacity-30 disabled:cursor-not-allowed"
                  onClick={handleSave}
                  disabled={!canSave}
                >
                  {selectedSeat.assigned ? "OVERRIDE_MANIFESTATION" : "INITIATE_ASSIGNMENT"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
