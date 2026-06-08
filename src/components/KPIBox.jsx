import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const KPIBox = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "up", // 'up' (பச்சை) அல்லது 'down' (சிவப்பு) அல்லது 'neutral' (சாம்பல்)
  description,
  color = "primary", // 'primary' | 'success' | 'warning' | 'danger'
}) => {
  // கலர் தீம்களை மேனேஜ் செய்ய குட்டி லாஜிக்
  const colorMaps = {
    primary: {
      bg: "bg-brand-primary/10",
      text: "text-brand-primary",
      border: "border-brand-primary/20 hover:border-brand-primary/40",
    },
    success: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
    },
    warning: {
      bg: "bg-brand-warning/10",
      text: "text-brand-warning",
      border: "border-brand-warning/20 hover:border-brand-warning/40",
    },
    danger: {
      bg: "bg-brand-danger/10",
      text: "text-brand-danger",
      border: "border-brand-danger/20 hover:border-brand-danger/40",
    },
  };

  const selectedColor = colorMaps[color] || colorMaps.primary;

  return (
    <div
      className={`bg-pos-card border ${selectedColor.border} p-6 rounded-2xl shadow-xl transition-all duration-300 hover:-translate-y-1`}
    >
      {/* டாப் லைன்: டைட்டில் மற்றும் ஐகான் */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl ${selectedColor.bg} ${selectedColor.text}`}
        >
          <Icon size={20} />
        </div>
      </div>

      {/* மிடில் லைன்: மெயின் வேல்யூ (தொகை அல்லது எண்ணிக்கை) */}
      <div className="flex items-baseline gap-2.5 mb-2">
        <span className="text-3xl font-extrabold text-[#2E7D32] tracking-tight">
          {value}
        </span>

        {/* டிரெண்ட் பர்சடேஜ் (Trend Percentage) */}
        {trend && (
          <div
            className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full
            ${trendType === "up" ? "bg-emerald-500/15 text-emerald-400" : ""}
            ${trendType === "down" ? "bg-rose-500/15 text-brand-danger" : ""}
            ${trendType === "neutral" ? "bg-slate-800 text-slate-400" : ""}
          `}
          >
            {trendType === "up" && <ArrowUpRight size={14} />}
            {trendType === "down" && <ArrowDownRight size={14} />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* பாட்டம் லைன்: குட்டி விபரம் */}
      {description && (
        <p className="text-xs text-slate-500 font-medium">{description}</p>
      )}
    </div>
  );
};

export default KPIBox;
