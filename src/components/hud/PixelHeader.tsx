"use client";

interface PixelHeaderProps {
  isConnected: boolean;
  taskCount: number;
  completedCount: number;
}

export default function PixelHeader({
  isConnected,
  taskCount,
  completedCount,
}: PixelHeaderProps) {
  const efficiency = taskCount > 0
    ? ((completedCount / taskCount) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="pixel-header">
      <div className="flex min-w-0 items-center gap-4">
        <h2 className="pixel-header__title">NIAGABOT CONTROL CENTER</h2>
        <div className={`pixel-header__badge ${!isConnected ? "pixel-header__badge--inactive" : ""}`}>
          <span className={isConnected ? "pixel-dot pixel-dot--green" : "pixel-dot pixel-dot--red"} />
          <span>{isConnected ? "ACTIVE" : "INACTIVE"}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="pixel-header__metric">
          <span>EFFICIENCY</span>
          <span className="pixel-header__metric-value">{efficiency}%</span>
        </div>
        <div className="pixel-header__metric">
          <span>TASKS</span>
          <span className="pixel-header__metric-value">{taskCount}</span>
        </div>
      </div>
    </div>
  );
}
