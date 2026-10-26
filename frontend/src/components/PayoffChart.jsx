import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label, currency = '₹' }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5">
        <div className="font-bold text-white border-b border-slate-800 pb-1 flex justify-between gap-4">
          <span>Month {item.month}</span>
          <span className="text-slate-400 font-normal">{item.date}</span>
        </div>

        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 font-mono">
            <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.name}:</span>
            </span>
            <span className="font-semibold text-white">
              {currency}{Math.round(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PayoffChart({
  chartData = [],
  currency = '₹',
  selectedStrategy = 'avalanche',
  isCompact = false
}) {
  const [showBaseline, setShowBaseline] = useState(true);
  const [showAvalanche, setShowAvalanche] = useState(true);
  const [showSnowball, setShowSnowball] = useState(true);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
        No schedule data to display. Add debts to visualize waterfall payoff curve.
      </div>
    );
  }

  const formatYAxis = (tick) => {
    if (tick >= 10000000) return `${currency}${(tick / 10000000).toFixed(1)}Cr`;
    if (tick >= 100000) return `${currency}${(tick / 100000).toFixed(1)}L`;
    if (tick >= 1000) return `${currency}${(tick / 1000).toFixed(0)}k`;
    return `${currency}${tick}`;
  };

  return (
    <div className="space-y-3">
      {/* Chart Controls / Legend (if not compact) */}
      {!isCompact && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
            Payoff Curves (Remaining Balance)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAvalanche(!showAvalanche)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                showAvalanche
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Avalanche
            </button>

            <button
              type="button"
              onClick={() => setShowSnowball(!showSnowball)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                showSnowball
                  ? 'bg-sky-950/40 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0EA5E9]" />
              Snowball
            </button>

            <button
              type="button"
              onClick={() => setShowBaseline(!showBaseline)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
                showBaseline
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F43F5E]" />
              Baseline (Min Only)
            </button>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className={`w-full ${isCompact ? 'h-56 sm:h-64' : 'h-72 sm:h-80'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAvalanche" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSnowball" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={formatYAxis}
            />

            <Tooltip content={<CustomTooltip currency={currency} />} />

            {(isCompact || showBaseline) && (
              <Area
                type="monotone"
                dataKey="baseline"
                name="Baseline (Min)"
                stroke="#F43F5E"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorBaseline)"
              />
            )}

            {(!isCompact && showSnowball) && (
              <Area
                type="monotone"
                dataKey="snowball"
                name="Snowball"
                stroke="#0EA5E9"
                strokeWidth={selectedStrategy === 'snowball' ? 3 : 1.5}
                fillOpacity={1}
                fill="url(#colorSnowball)"
              />
            )}

            {(isCompact || showAvalanche) && (
              <Area
                type="monotone"
                dataKey="avalanche"
                name="Avalanche"
                stroke="#10B981"
                strokeWidth={selectedStrategy === 'avalanche' ? 3 : 2}
                fillOpacity={1}
                fill="url(#colorAvalanche)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
