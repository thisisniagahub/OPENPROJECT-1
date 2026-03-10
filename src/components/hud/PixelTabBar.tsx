"use client";

type TabId = "notifications" | "logs" | "settings" | "more";

interface PixelTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notificationCount?: number;
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "notifications", label: "NOTIFICATIONS" },
  { id: "logs", label: "LOGS" },
  { id: "settings", label: "SETTINGS" },
  { id: "more", label: "MORE" },
];

export default function PixelTabBar({
  activeTab,
  onTabChange,
  notificationCount = 0,
}: PixelTabBarProps) {
  return (
    <div className="pixel-tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`pixel-tab ${activeTab === tab.id ? "pixel-tab--active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span>{tab.id === "more" ? "..." : tab.label}</span>
          {tab.id === "notifications" && notificationCount > 0 ? (
            <span className="pixel-tab__badge">{notificationCount}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
