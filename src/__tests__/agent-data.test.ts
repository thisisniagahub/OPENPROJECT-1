import { describe, it, expect } from "vitest";
import {
    AGENCY_AGENTS,
    DEPARTMENTS,
    TOTAL_MIN_REVENUE,
    TOTAL_MAX_REVENUE,
    AGENT_LABELS,
    getAgentDepartment,
    getAgentById,
    getAgentByOpenclawId,
    getAgentsByDept,
    getRandomTaskTemplate,
    type Department,
} from "@/lib/agent-data";

const VALID_OPENCLAW_IDS = new Set([
    "trend-intelligence-agent",
    "tiktok-viral-agent",
    "instagram-reels-agent",
    "hook-script-agent",
    "affiliate-product-scout-agent",
    "shopee-commerce-agent",
    "tiktok-shop-agent",
    "scheduler-publisher-agent",
    "analytics-optimizer-agent",
    "main",
    "facebook-distribution-agent",
    "youtube-growth-agent",
    "affiliate-compliance-gate-agent",
    "commerce-content-factory-agent",
    "commerce-sales-optimizer-agent",
    "visual-prompt-director-agent",
    "canva-growth-operator-agent",
    "brand-research-agent",
]);

describe("agent-data", () => {
    // ── Agent roster ─────────────────────────────────────
    it("has exactly 24 agents", () => {
        expect(AGENCY_AGENTS).toHaveLength(24);
    });

    it("each agent has required fields", () => {
        for (const a of AGENCY_AGENTS) {
            expect(a.id).toBeTruthy();
            expect(a.dept).toBeTruthy();
            expect(a.name).toBeTruthy();
            expect(a.code).toMatch(/^[A-Z]{2,4}$/);
            expect(a.skills.length).toBeGreaterThan(0);
            expect(a.platforms.length).toBeGreaterThan(0);
            expect(typeof a.revenueMin).toBe("number");
            expect(typeof a.revenueMax).toBe("number");
        }
    });

    it("all agent IDs are unique", () => {
        const ids = AGENCY_AGENTS.map((a) => a.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("all agent codes are unique", () => {
        const codes = AGENCY_AGENTS.map((a) => a.code);
        expect(new Set(codes).size).toBe(codes.length);
    });

    it("all mapped openclaw IDs use valid workspace names", () => {
        const mapped = AGENCY_AGENTS.filter((a) => a.openclawId);
        expect(mapped).toHaveLength(18);
        for (const agent of mapped) {
            expect(VALID_OPENCLAW_IDS.has(agent.openclawId!)).toBe(true);
        }
    });

    // ── Department counts ────────────────────────────────
    const expectedCounts: Record<Department, number> = {
        intel: 3,
        content: 9,
        commerce: 6,
        ops: 3,
        research: 1,
        labs: 2,
    };

    it.each(Object.entries(expectedCounts))(
        "department %s has %i agents",
        (dept, count) => {
            const agents = AGENCY_AGENTS.filter((a) => a.dept === dept);
            expect(agents).toHaveLength(count);
        },
    );

    // ── Departments ──────────────────────────────────────
    it("has 6 departments with labels and colors", () => {
        const depts = Object.keys(DEPARTMENTS);
        expect(depts).toHaveLength(6);
        for (const d of Object.values(DEPARTMENTS)) {
            expect(d.label).toBeTruthy();
            expect(d.color).toMatch(/^#[0-9a-f]{6}$/);
            expect(d.taskTemplates.length).toBeGreaterThan(0);
        }
    });

    // ── Revenue totals ───────────────────────────────────
    it("calculates revenue totals correctly", () => {
        const manualMin = AGENCY_AGENTS.reduce((s, a) => s + a.revenueMin, 0);
        const manualMax = AGENCY_AGENTS.reduce((s, a) => s + a.revenueMax, 0);
        expect(TOTAL_MIN_REVENUE).toBe(manualMin);
        expect(TOTAL_MAX_REVENUE).toBe(manualMax);
        expect(TOTAL_MIN_REVENUE).toBeGreaterThan(0);
        expect(TOTAL_MAX_REVENUE).toBeGreaterThan(TOTAL_MIN_REVENUE);
    });

    // ── Labels ───────────────────────────────────────────
    it("has a label for every agent", () => {
        for (const a of AGENCY_AGENTS) {
            expect(AGENT_LABELS[a.id]).toBeTruthy();
        }
    });

    // ── Helper functions ─────────────────────────────────
    describe("getAgentById", () => {
        it("returns agent for valid ID", () => {
            const agent = getAgentById("a1");
            expect(agent).toBeDefined();
            expect(agent!.code).toBe("TIA");
        });

        it("returns undefined for invalid ID", () => {
            expect(getAgentById("z99")).toBeUndefined();
        });
    });

    describe("getAgentByOpenclawId", () => {
        it("returns agent for valid OpenClaw ID", () => {
            const agent = getAgentByOpenclawId("brand-research-agent");
            expect(agent).toBeDefined();
            expect(agent!.id).toBe("e1");
        });

        it("returns undefined for invalid OpenClaw ID", () => {
            expect(getAgentByOpenclawId("missing-agent")).toBeUndefined();
        });
    });

    describe("getAgentDepartment", () => {
        it("returns department info for valid agent", () => {
            const dept = getAgentDepartment("b1");
            expect(dept).toBeDefined();
            expect(dept!.label).toBe("CONTENT");
        });

        it("returns undefined for invalid agent", () => {
            expect(getAgentDepartment("z99")).toBeUndefined();
        });
    });

    describe("getAgentsByDept", () => {
        it("returns correct agents for intel", () => {
            const agents = getAgentsByDept("intel");
            expect(agents).toHaveLength(3);
            expect(agents.every((a) => a.dept === "intel")).toBe(true);
        });

        it("returns empty for invalid dept", () => {
            // @ts-expect-error testing invalid input
            expect(getAgentsByDept("invalid")).toHaveLength(0);
        });
    });

    describe("getRandomTaskTemplate", () => {
        it("returns a string from department templates", () => {
            const template = getRandomTaskTemplate("ops");
            expect(typeof template).toBe("string");
            expect(DEPARTMENTS.ops.taskTemplates).toContain(template);
        });
    });
});
