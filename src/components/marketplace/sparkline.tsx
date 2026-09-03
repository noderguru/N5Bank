import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export type SparklineProps = {
  data?: number[];
  label?: string;
  changePercent?: string;
  className?: string;
};

export function Sparkline({
  data = [12, 14, 18, 16, 22, 28, 26, 32, 36, 42, 40, 48],
  label,
  changePercent = "+18.4% YoY",
  className = "",
}: SparklineProps) {
  const t = useTranslations("marketplace");
  const heading = label ?? t("liquidityTrend");
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 240;
  const height = 64;
  const padding = 6;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const polylinePoints = points.join(" ");
  const firstPoint = (points[0] ?? "0,0").split(",");
  const lastPoint = (points[points.length - 1] ?? `${width},0`).split(",");
  const areaPoints = `${firstPoint[0] ?? "0"},${height} ${polylinePoints} ${lastPoint[0] ?? width},${height}`;

  return (
    <div
      data-testid="market-trend-sparkline"
      className={`rounded-2xl border border-hairline bg-surface p-4 shadow-2xs space-y-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Market Index
          </span>
          <div className="text-xs font-medium text-ink">{heading}</div>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-xs font-semibold text-success">
          <TrendingUp className="size-3.5" />
          <span>{changePercent}</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-canvas/60 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-16 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#383BFE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#383BFE" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#sparkline-grad)" />
          <polyline
            fill="none"
            stroke="#383BFE"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Q1 2025</span>
        <span>Q4 2025</span>
        <span>{t("present")}</span>
      </div>
    </div>
  );
}
