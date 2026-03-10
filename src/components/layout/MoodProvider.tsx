'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Mood, MOODS, ThemeTokens } from '@/lib/theme-registry';

interface MoodContextType {
    mood: Mood;
    setMood: (mood: Mood) => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: React.ReactNode }) {
    const [mood, setMood] = useState<Mood>('cyber-glass');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        const tokens = MOODS[mood];

        // Apply tokens as CSS variables
        Object.entries(tokens).forEach(([key, value]) => {
            if (value) {
                root.style.setProperty(key, value);
            }
        });

        // Apply specific class for mood-based styling (e.g., for complex glass effects)
        // Remove all previous mood classes
        Object.keys(MOODS).forEach((m) => {
            root.classList.remove(`mood-${m}`);
        });
        root.classList.add(`mood-${mood}`);

        // Persist mood
        localStorage.setItem('openproject:mood', mood);
    }, [mood]);

    // Load persisted mood on mount
    useEffect(() => {
        setMounted(true);
        const savedMood = localStorage.getItem("openproject:mood") as Mood;
        if (savedMood && MOODS[savedMood]) {
            setMood(savedMood);
        }
    }, []);

    if (!mounted) return <>{children}</>;

    return (
        <MoodContext.Provider value={{ mood, setMood }}>
            {children}
        </MoodContext.Provider>
    );
}

export function useMood() {
    const context = useContext(MoodContext);
    if (context === undefined) {
        throw new Error('useMood must be used within a MoodProvider');
    }
    return context;
}
