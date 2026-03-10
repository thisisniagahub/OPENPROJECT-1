"use client";

import type { SeatState, SeatStatus } from "@/types/game";

// ── Status Helpers ──────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  badgeClass: string;
  animate: boolean;
}

const STATUS_MAP: Record<SeatStatus, StatusConfig> = {
  empty: { label: "IDLE", dotColor: "bg-slate-400", badgeClass: "bg-slate-800 text-slate-400 border-slate-700", animate: true },
  running: { label: "BUSY", dotColor: "bg-green-400", badgeClass: "bg-green-500/20 text-green-400 border-green-500/50", animate: true },
  returning: { label: "RETURNING", dotColor: "bg-green-400", badgeClass: "bg-green-500/20 text-green-400 border-green-500/50", animate: true },
  done: { label: "DONE", dotColor: "bg-cyan-400", badgeClass: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50", animate: false },
  failed: { label: "ERROR", dotColor: "bg-red-500", badgeClass: "bg-red-500/20 text-red-500 border-red-500/50", animate: false },
};

const VACANT_CONFIG: StatusConfig = {
  label: "VACANT", dotColor: "bg-slate-600", badgeClass: "bg-transparent text-slate-600 border-slate-700 border-dashed", animate: false,
};

function getStatusConfig(seat: SeatState): StatusConfig {
  if (!seat.assigned) return VACANT_CONFIG;
  return STATUS_MAP[seat.status] ?? STATUS_MAP.empty;
}

function isBusy(seat: SeatState): boolean {
  return seat.assigned === true && (seat.status === "running" || seat.status === "returning");
}

// ── Component ───────────────────────────────────────────────────────────

export default function WorkerPanel({
  seats,
  onOpenManager,
}: {
  seats: SeatState[];
  onOpenManager: () => void;
}) {
  const assigned = seats.filter((s) => s.assigned);
  const busy = assigned.filter(isBusy);

  return (
    <div className="modern-glass flex flex-col h-full pointer-events-auto border-cyber-muted/30 relative">
      {/* HEADER */}
      <div className="flex-none px-5 py-3 bg-cyber-primary/5 border-b border-cyber-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-cyber-primary shadow-[0_0_8px_var(--cyber-primary)] animate-pulse" />
          <h2 className="text-[12px] font-cyber-display font-bold text-cyber-primary tracking-[0.2em] uppercase">ACTIVE OPERATIVES</h2>
        </div>
        <button
          onClick={onOpenManager}
          className="text-[9px] font-cyber-display font-bold text-cyber-primary hover:text-white uppercase tracking-[0.1em] border border-cyber-primary/40 bg-cyber-primary/10 hover:bg-cyber-primary/30 px-3 py-1 transition-all duration-300 diagonal-cut"
        >
          Manage
        </button>
      </div>
      <div className="flex-none px-5 py-2 bg-black/40 border-b border-cyber-muted/10 flex justify-between items-center text-[10px] font-cyber-mono font-medium text-cyber-muted/60 uppercase tracking-[0.1em]">
        <span>LINKED: {assigned.length}/{seats.length}</span>
        <span>LOAD: {busy.length} UNIT(s)</span>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        {seats.map((seat) => (
          <WorkerRow key={seat.seatId} seat={seat} />
        ))}
      </div>
    </div>
  );
}

// ── Worker Row ──────────────────────────────────────────────────────────

function WorkerRow({ seat }: { seat: SeatState }) {
  const config = getStatusConfig(seat);
  const busy = isBusy(seat);

  return (
    <div className="px-4 py-3 border border-cyber-muted/10 bg-black/30 relative group hover:border-cyber-primary/30 transition-all duration-300 diagonal-cut">
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-500 ${busy ? "bg-cyber-primary shadow-[0_0_10px_var(--cyber-primary)]" : seat.assigned ? "bg-cyber-muted group-hover:bg-cyber-primary/60" : "bg-cyber-muted/20"}`} />

      <div className="flex justify-between items-start mb-2 pl-3">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 ${config.dotColor.replace('cyan', 'cyber-primary').replace('green', 'cyber-primary').replace('bg-', 'bg-')} ${config.animate ? "animate-pulse shadow-[0_0_8px_currentColor]" : ""}`} />
          <div className="flex flex-col">
            <span className={`text-[11px] font-cyber-display font-bold uppercase tracking-[0.1em] leading-tight ${seat.assigned ? "text-cyber-text" : "text-cyber-muted"}`}>
              {seat.assigned ? seat.label : "UNASSIGNED_UNIT"}
            </span>
            {seat.assigned && (
              <span className="text-[9px] font-cyber-mono font-bold text-cyber-muted/60 uppercase mt-0.5">
                XID: {seat.seatId.split("-")[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <span className={`text-[9px] font-cyber-mono font-bold uppercase px-2 py-0.5 border ${config.badgeClass.replace('cyan-500', 'cyber-primary').replace('green-500', 'cyber-primary')}`}>
          {config.label}
        </span>
      </div>

      <div className={`text-[11px] font-cyber-mono font-medium uppercase leading-relaxed pl-3 line-clamp-2 ${seat.assigned ? "text-cyber-primary/80" : "text-cyber-muted/30"}`}>
        {seat.assigned
          ? seat.taskSnippet ?? `[ ${seat.roleTitle ?? "OPERATIVE"} ] AWAITING_DATA_STREAM...`
          : "assign a new neural node to this terminal."}
      </div>
    </div>
  );
}
