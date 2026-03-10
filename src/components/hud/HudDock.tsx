"use client";

import React from "react";

export type HudPanelId = "music" | "connection" | "chat" | "tasks" | "workers";

export interface HudDockItem {
  id: HudPanelId;
  label: string;
  icon: string | React.ElementType; // Support both path and component
  iconActive?: string | React.ElementType;
}

interface Props {
  items: HudDockItem[];
  openPanel: HudPanelId | null;
  onToggle: (id: HudPanelId) => void;
  iconOverrides?: Partial<Record<HudPanelId, string | React.ElementType>>;
}

export default function HudDock({ items, openPanel, onToggle, iconOverrides }: Props) {
  return (
    <div className="flex items-center justify-center gap-2 p-2 bg-[#050a15]/90 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.15)] pointer-events-auto relative">
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />

      {items.map((item) => {
        const isActive = openPanel === item.id;
        const iconSource = iconOverrides?.[item.id] || (isActive ? item.iconActive || item.icon : item.icon);

        return (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`
              relative w-[40px] h-[40px] flex items-center justify-center transition-all group border
              ${isActive
                ? "bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                : "bg-[#0a0f1c] text-cyan-500/60 border-slate-700/50 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/50"
              }
            `}
            title={item.label}
          >
            {typeof iconSource === "string" ? (
              <img
                src={iconSource}
                alt=""
                className={`w-5 h-5 object-contain ${isActive ? "filter brightness-0" : "opacity-80 group-hover:opacity-100"}`}
              />
            ) : (
              React.createElement(iconSource as React.ElementType, {
                size: 18,
                strokeWidth: isActive ? 3 : 2
              })
            )}

            {isActive && (
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-black animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}
