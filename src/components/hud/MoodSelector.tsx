"use client";

import { useMood } from "@/components/layout/MoodProvider";
import { AVAILABLE_MOODS, type Mood } from "@/lib/theme-registry";
import type { LucideIcon } from "lucide-react";
import { Cpu, Terminal } from "lucide-react";

interface MoodOption {
    id: Mood;
    label: string;
    icon: LucideIcon;
    color: string;
}

const ALL_MOOD_OPTIONS: MoodOption[] = [
    { id: "standard", label: "Vanilla", icon: Terminal, color: "text-slate-400" },
    { id: "cyber-glass", label: "Cyber", icon: Cpu, color: "text-cyan-400" },
];

const MOOD_OPTIONS = ALL_MOOD_OPTIONS.filter((option) =>
    (AVAILABLE_MOODS as readonly string[]).includes(option.id),
);

// MoodSelector is largely deprecated now that we enforce 100% pixel art,
// but we keep its styling consistent just in case.
export default function MoodSelector() {
    const { mood: currentMood, setMood } = useMood();

    return (
        <div className="flex bg-[#050a15] border border-cyan-500/50 p-1 flex-wrap gap-1">
            {MOOD_OPTIONS.map((mood) => {
                const Icon = mood.icon;
                const isActive = currentMood === mood.id;

                return (
                    <button
                        key={mood.id}
                        onClick={() => setMood(mood.id)}
                        className={`flex items-center gap-2 px-2 py-1 transition-all group
              ${isActive
                                ? "bg-cyan-500/20 shadow-[inset_0_0_5px_rgba(0,240,255,0.3)] border border-cyan-400"
                                : "hover:bg-cyan-900/30 border border-transparent"
                            }`}
                        title={mood.label}
                    >
                        <Icon size={12} className={`${isActive ? mood.color : "text-slate-500 group-hover:text-cyan-600"} transition-colors`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest hidden md:block
              ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-600"}`}>
                            {mood.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
