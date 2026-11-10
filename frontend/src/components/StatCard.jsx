import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, accentColor = "#FF6B35", trend }) {
  return (
    <div className="ipl-card p-5 relative overflow-hidden group">
      {/* Background ambient accent glow */}
      <div 
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition duration-300 blur-xl pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#94A3B8] tracking-wider uppercase">
          {title}
        </span>
        {Icon && (
          <div 
            className="p-2 rounded-lg bg-[#1B2430] border border-[#283241] group-hover:border-[#FF6B35]/40 transition"
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-[#A3E635]">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#94A3B8]/80 mt-1 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
