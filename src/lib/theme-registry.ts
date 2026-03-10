/**
 * Theme Registry for Agent Town Multi-Mood System.
 * Maps moods to CSS variable sets.
 */

export type Mood = 'standard' | 'cyber-glass' | 'industrial' | 'synthwave' | 'bauhaus' | 'oracle' | 'brutalist';

export interface ThemeTokens {
    '--mood-bg': string;
    '--mood-glass-bg': string;
    '--mood-glass-border-cyan': string;
    '--mood-glass-border-purple'?: string;
    '--mood-accent-cyan': string;
    '--mood-accent-magenta': string;
    '--mood-accent-green': string;
    '--mood-text-primary': string;
    '--mood-text-secondary': string;
    '--mood-blur': string;
    '--mood-radius': string;
    '--mood-font-sans': string;
}

export const AVAILABLE_MOODS = ["standard", "cyber-glass"] as const satisfies readonly Mood[];

export const MOODS: Record<Mood, Partial<ThemeTokens>> = {
    'standard': {
        '--mood-bg': '#0F172A',
        '--mood-glass-bg': 'rgba(15, 23, 42, 0.9)',
        '--mood-glass-border-cyan': '#2a2a4a',
        '--mood-accent-cyan': '#10b981', // Emerald
        '--mood-accent-magenta': '#facc15', // Yellow
        '--mood-accent-green': '#22c55e',
        '--mood-text-primary': '#e2e8f0',
        '--mood-text-secondary': '#64748b',
        '--mood-blur': '4px',
        '--mood-radius': '4px',
        '--mood-font-sans': 'var(--font-geist-sans)',
    },
    'cyber-glass': {
        '--mood-bg': '#020617',
        '--mood-glass-bg': 'rgba(15, 23, 42, 0.45)',
        '--mood-glass-border-cyan': 'rgba(6, 182, 212, 0.6)',
        '--mood-glass-border-purple': 'rgba(168, 85, 247, 0.6)',
        '--mood-accent-cyan': '#06B6D4',
        '--mood-accent-magenta': '#D946EF',
        '--mood-accent-green': '#22C55E',
        '--mood-text-primary': '#F8FAFC',
        '--mood-text-secondary': '#94A3B8',
        '--mood-blur': '20px',
        '--mood-radius': '16px',
        '--mood-font-sans': 'var(--font-geist-sans)',
    },
    // TODO: enable the remaining moods in the selector only after real token sets exist.
    'industrial': {},
    'synthwave': {},
    'bauhaus': {},
    'oracle': {},
    'brutalist': {},
};
