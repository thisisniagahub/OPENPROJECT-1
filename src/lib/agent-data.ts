/**
 * OPENPROJECT Agent Data — ported from niagabot-office/src/agents/agentData.js
 *
 * 24 agents across 6 departments:
 *   intel (3), content (9), commerce (6), ops (3), research (1), labs (2)
 */

// ── Department Definitions ─────────────────────────────────────────────

export type Department = "intel" | "content" | "commerce" | "ops" | "research" | "labs";

export interface DepartmentInfo {
    label: string;
    color: string;
    taskTemplates: string[];
}

export const DEPARTMENTS: Record<Department, DepartmentInfo> = {
    intel: {
        label: "INTEL",
        color: "#4fc3f7",
        taskTemplates: [
            "Analyze trends",
            "Scan competitors",
            "Profile audience",
            "SEO research",
            "Generate report",
        ],
    },
    content: {
        label: "CONTENT",
        color: "#ff6eb4",
        taskTemplates: [
            "Write TikTok script",
            "IG reel concept",
            "Email sequence",
            "Optimize hook",
            "Content brief",
        ],
    },
    commerce: {
        label: "COMMERCE",
        color: "#ffb347",
        taskTemplates: [
            "Scout affiliates",
            "Shopee listings",
            "Sales analysis",
            "Budget track",
            "Merchant leads",
        ],
    },
    ops: {
        label: "OPS",
        color: "#8c9eff",
        taskTemplates: [
            "Schedule queue",
            "Monitor pipeline",
            "Check fallback",
            "Analytics report",
            "Quality gate",
        ],
    },
    research: {
        label: "RESEARCH",
        color: "#80cbc4",
        taskTemplates: [
            "Brand audit",
            "Market signals",
            "Competitor deep-dive",
            "Sentiment analysis",
            "Trend map",
        ],
    },
    labs: {
        label: "LABS",
        color: "#b388ff",
        taskTemplates: [
            "Test prompt variant",
            "A/B experiment",
            "Eval model",
            "Benchmark perf",
            "Document findings",
        ],
    },
};

// ── Agent Definition ───────────────────────────────────────────────────

export interface AgentDef {
    /** Unique agent ID (e.g. "a1", "b3") */
    id: string;
    /** Department key */
    dept: Department;
    /** Full agent name */
    name: string;
    /** Short agent code (e.g. "TIA", "CSA") */
    code: string;
    /** Skills list */
    skills: string[];
    /** Platforms the agent operates on */
    platforms: string[];
    /** Minimum monthly revenue potential (RM) */
    revenueMin: number;
    /** Maximum monthly revenue potential (RM) */
    revenueMax: number;
    /** OpenClaw workspace agent ID or entry agent alias used by the external gateway */
    openclawId?: string;
}

export const AGENCY_AGENTS: AgentDef[] = [
    // ── Intel Department ──
    { id: "a1", dept: "intel", name: "Trend Intel Agent", code: "TIA", skills: ["Trend detection", "Viral prediction", "Hashtag analysis"], platforms: ["TikTok", "IG", "X"], revenueMin: 800, revenueMax: 2000, openclawId: "trend-intelligence-agent" },
    { id: "a2", dept: "intel", name: "Competitor Spy Agent", code: "CSA", skills: ["Competitor monitoring", "Strategy analysis", "Gap detection"], platforms: ["All"], revenueMin: 500, revenueMax: 1500 },
    { id: "a3", dept: "intel", name: "Audience Profiler", code: "APA", skills: ["Demographic analysis", "Interest mapping", "Behavior prediction"], platforms: ["Meta", "TikTok"], revenueMin: 600, revenueMax: 1800 },
    // ── Content Department ──
    { id: "b1", dept: "content", name: "TikTok Viral Agent", code: "TVA", skills: ["Script writing", "Hook optimization", "Sound selection"], platforms: ["TikTok"], revenueMin: 1500, revenueMax: 5000, openclawId: "tiktok-viral-agent" },
    { id: "b2", dept: "content", name: "Instagram Growth Agent", code: "IGA", skills: ["Reel concepts", "Carousel design", "Caption writing"], platforms: ["Instagram"], revenueMin: 1200, revenueMax: 4000, openclawId: "instagram-reels-agent" },
    { id: "b3", dept: "content", name: "Hook & Script Agent", code: "HSA", skills: ["Copywriting", "A/B testing", "Emotional triggers"], platforms: ["All"], revenueMin: 1000, revenueMax: 3000, openclawId: "hook-script-agent" },
    { id: "b4", dept: "content", name: "Email Copywriter", code: "ECA", skills: ["Email sequences", "Subject lines", "CTA optimization"], platforms: ["Email"], revenueMin: 800, revenueMax: 2500 },
    { id: "g2", dept: "content", name: "Facebook Distribution", code: "FDA", skills: ["FB content distribution", "Audience targeting", "Engagement optimization"], platforms: ["Facebook"], revenueMin: 800, revenueMax: 2500, openclawId: "facebook-distribution-agent" },
    { id: "g3", dept: "content", name: "YouTube Growth", code: "YGA", skills: ["YouTube packaging", "Thumbnail strategy", "SEO optimization"], platforms: ["YouTube"], revenueMin: 1000, revenueMax: 4000, openclawId: "youtube-growth-agent" },
    { id: "g5", dept: "content", name: "Commerce Content Factory", code: "CCF", skills: ["Commerce content packs", "Product visuals", "Sales copy"], platforms: ["All"], revenueMin: 1200, revenueMax: 4000, openclawId: "commerce-content-factory-agent" },
    { id: "g7", dept: "content", name: "Visual Prompt Director", code: "VPD", skills: ["Image prompts", "Video prompts", "Visual consistency"], platforms: ["All"], revenueMin: 600, revenueMax: 2000, openclawId: "visual-prompt-director-agent" },
    { id: "g8", dept: "content", name: "Canva Growth Operator", code: "CGO", skills: ["Canva design", "Lead capture", "Proposal assets", "Inbound growth"], platforms: ["Canva", "Web"], revenueMin: 800, revenueMax: 3000, openclawId: "canva-growth-operator-agent" },
    // ── Commerce Department ──
    { id: "c1", dept: "commerce", name: "Affiliate Scout Agent", code: "ASA", skills: ["Program discovery", "Commission optimization", "Partner vetting"], platforms: ["Shopee", "Lazada"], revenueMin: 2000, revenueMax: 8000, openclawId: "affiliate-product-scout-agent" },
    { id: "c2", dept: "commerce", name: "Shopee Optimizer", code: "SOA", skills: ["Listing optimization", "Keyword targeting", "Price monitoring"], platforms: ["Shopee"], revenueMin: 1500, revenueMax: 6000, openclawId: "shopee-commerce-agent" },
    { id: "c3", dept: "commerce", name: "TikTok Shop Agent", code: "TSA", skills: ["Product showcase", "Live selling", "Shop management"], platforms: ["TikTok Shop"], revenueMin: 2000, revenueMax: 10000, openclawId: "tiktok-shop-agent" },
    { id: "c4", dept: "commerce", name: "Budget Tracker", code: "BTA", skills: ["Expense tracking", "ROI calculation", "Budget optimization"], platforms: ["Internal"], revenueMin: 0, revenueMax: 0 },
    { id: "g4", dept: "commerce", name: "Affiliate Compliance", code: "ACG", skills: ["Compliance checks", "Approval gates", "Policy enforcement"], platforms: ["Shopee", "TikTok Shop"], revenueMin: 0, revenueMax: 0, openclawId: "affiliate-compliance-gate-agent" },
    { id: "g6", dept: "commerce", name: "Sales Optimizer", code: "CSO", skills: ["Conversion optimization", "Sales funnel analysis", "Revenue maximization"], platforms: ["Shopee", "TikTok Shop"], revenueMin: 1500, revenueMax: 5000, openclawId: "commerce-sales-optimizer-agent" },
    // ── Ops Department ──
    { id: "d1", dept: "ops", name: "Schedule Commander", code: "SCA", skills: ["Queue management", "Priority routing", "Conflict resolution"], platforms: ["OpenClaw"], revenueMin: 0, revenueMax: 0, openclawId: "scheduler-publisher-agent" },
    { id: "d2", dept: "ops", name: "Fallback Guardian", code: "FGA", skills: ["Error recovery", "State preservation", "Alert management"], platforms: ["OpenClaw"], revenueMin: 0, revenueMax: 0 },
    { id: "g1", dept: "ops", name: "Social Command Center", code: "SCC", skills: ["Orchestration", "Goal clarification", "Delegation", "Synthesis"], platforms: ["All"], revenueMin: 0, revenueMax: 0, openclawId: "main" },
    // ── Research Department ──
    { id: "e1", dept: "research", name: "Brand Research Agent", code: "BRA", skills: ["Brand audit", "Market signals", "Competitor deep-dive", "Sentiment analysis"], platforms: ["Web", "Social"], revenueMin: 1000, revenueMax: 3000, openclawId: "brand-research-agent" },
    // ── Labs Department ──
    { id: "f1", dept: "labs", name: "Prompt Engineer", code: "PEA", skills: ["Prompt design", "Chain optimization", "Model evaluation"], platforms: ["Internal"], revenueMin: 0, revenueMax: 0 },
    { id: "f2", dept: "labs", name: "A/B Test Agent", code: "ABA", skills: ["Experiment design", "Statistical analysis", "Result documentation"], platforms: ["Internal"], revenueMin: 0, revenueMax: 0, openclawId: "analytics-optimizer-agent" },
];

// ── Revenue Totals ─────────────────────────────────────────────────────

export const TOTAL_MIN_REVENUE = AGENCY_AGENTS.reduce((s, a) => s + a.revenueMin, 0);
export const TOTAL_MAX_REVENUE = AGENCY_AGENTS.reduce((s, a) => s + a.revenueMax, 0);

// ── Short Labels (for HUD / name tags) ─────────────────────────────────

export const AGENT_LABELS: Record<string, string> = {
    a1: "Trend Intel", a2: "Competitor", a3: "Audience",
    b1: "TikTok Viral", b2: "Instagram", b3: "Hook Script", b4: "Email Copy",
    c1: "Affiliate Scout", c2: "Shopee", c3: "TikTok Shop", c4: "Budget Track",
    d1: "Scheduler", d2: "Fallback",
    e1: "Brand Research",
    f1: "Prompt Eng", f2: "A/B Test",
    g1: "Command Center", g2: "Facebook", g3: "YouTube", g4: "Compliance",
    g5: "Content Factory", g6: "Sales Opt", g7: "Visual Dir", g8: "Canva Growth",
};

// ── Helpers ────────────────────────────────────────────────────────────

/** Get department info for an agent */
export function getAgentDepartment(agentId: string): DepartmentInfo | undefined {
    const agent = AGENCY_AGENTS.find((a) => a.id === agentId);
    return agent ? DEPARTMENTS[agent.dept] : undefined;
}

/** Get agent definition by ID */
export function getAgentById(agentId: string): AgentDef | undefined {
    return AGENCY_AGENTS.find((a) => a.id === agentId);
}

/** Get agent definition by OpenClaw workspace ID */
export function getAgentByOpenclawId(openclawId: string): AgentDef | undefined {
    return AGENCY_AGENTS.find((a) => a.openclawId === openclawId);
}

/** Get all agents in a department */
export function getAgentsByDept(dept: Department): AgentDef[] {
    return AGENCY_AGENTS.filter((a) => a.dept === dept);
}

/** Get a random task template for a department */
export function getRandomTaskTemplate(dept: Department): string {
    const templates = DEPARTMENTS[dept].taskTemplates;
    return templates[Math.floor(Math.random() * templates.length)];
}
