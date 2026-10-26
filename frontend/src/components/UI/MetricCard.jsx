import React from 'react';

export function MetricCard({
  title,
  value,
  subtitle,
  badge,
  badgeColor = 'emerald', // emerald, blue, rose, amber, slate
  icon: Icon,
  className = ''
}) {
  const badgeStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor] || badgeStyles.slate}`}
          >
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <Icon className="w-4 h-4 text-slate-500" />
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
          {value}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
