import React from "react";
import { TrendingUp } from "lucide-react";

export default function RevenueChart({ activeTab, revenueData }) {
  if (activeTab !== "revenue") return null;

  const chartData = (revenueData || []).slice(-8); // Show last 8 active days

  if (chartData.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 font-semibold text-xs border border-pos-border bg-pos-card rounded mb-6">
        Not enough historical date ranges or transaction volume to sketch visual aggregates. Log some transactions to populate the graphs.
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map((r) => r.total)) * 1.15 || 1000;
  const height = 200;
  const width = 640;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const spacing = chartData.length > 1 ? chartWidth / (chartData.length - 1) : chartWidth;

  return (
    <div className="bg-pos-card border border-pos-border rounded p-5 shadow-sm mb-6 overflow-hidden no-print">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block select-none mb-5 flex items-center gap-1.5 leading-none">
        <TrendingUp size={14} className="text-brand-primary" />
        <span>Daily Sales Revenue Trend — Last 8 Logged Days</span>
      </h3>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[580px] h-auto">
          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            const gridVal = Number(maxValue * ratio || 0).toFixed(0);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  fill="#94A3B8"
                  fontSize="8"
                  textAnchor="end"
                  className="font-mono font-bold"
                >
                  ₹{Number(gridVal).toLocaleString("en-IN")}
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          {chartData.length > 1 && (
            <path
              d={[
                `M ${paddingLeft} ${paddingTop + chartHeight}`,
                ...chartData.map((d, i) => {
                  const x = paddingLeft + i * spacing;
                  const y = paddingTop + chartHeight * (1 - d.total / maxValue);
                  return `L ${x} ${y}`;
                }),
                `L ${paddingLeft + (chartData.length - 1) * spacing} ${paddingTop + chartHeight}`,
                "Z"
              ].join(" ")}
              fill="url(#areaGrad)"
              opacity="0.15"
            />
          )}

          {/* Spark Gradient definitions */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Connection Line */}
          {chartData.length > 1 && (
            <path
              d={chartData
                .map((d, i) => {
                  const x = paddingLeft + i * spacing;
                  const y = paddingTop + chartHeight * (1 - d.total / maxValue);
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Bar Pillars / Tooltips */}
          {chartData.map((d, i) => {
            const x = paddingLeft + i * spacing;
            const y = paddingTop + chartHeight * (1 - d.total / maxValue);

            return (
              <g key={i} className="group">
                <title>{`${d.date}\nRevenue: ₹${Number(d.total || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2
                })}\nOrders: ${d.count}`}</title>

                {/* Base Anchor line */}
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={paddingTop + chartHeight}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  className="opacity-40 group-hover:opacity-100 transition-opacity duration-200"
                />

                {/* Vector Nodes */}
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="transition-transform duration-250 group-hover:scale-150 cursor-pointer"
                />

                {/* X Axis Labels */}
                <text
                  x={x}
                  y={height - paddingBottom + 16}
                  fill="#64748B"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(-15, ${x}, ${height - paddingBottom + 16})`}
                  className="font-mono"
                >
                  {d.date.replace(", 2026", "").replace(", 2025", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
