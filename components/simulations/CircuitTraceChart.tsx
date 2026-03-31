'use client';

import { useMemo } from 'react';
import type { TracePoint } from '@/lib/circuits/common';

type TraceSeries = {
  label: string;
  color: string;
  data: TracePoint[];
};

type CircuitTraceChartProps = {
  title: string;
  traces: TraceSeries[];
  yMin?: number;
  yMax?: number;
};

const WIDTH = 900;
const HEIGHT = 240;
const PAD_X = 42;
const PAD_Y = 18;

export function CircuitTraceChart({ title, traces, yMin = 0, yMax = 1 }: CircuitTraceChartProps): JSX.Element {
  const maxTime = useMemo(() => {
    let tMax = 1;
    for (const series of traces) {
      const last = series.data[series.data.length - 1];
      if (last) {
        tMax = Math.max(tMax, last.t);
      }
    }
    return tMax;
  }, [traces]);

  const pathData = useMemo(
    () =>
      traces.map((series) => {
        const points = series.data;
        if (points.length === 0) {
          return { ...series, d: '' };
        }

        const d = points
          .map((point, index) => {
            const x = PAD_X + (point.t / maxTime) * (WIDTH - PAD_X * 2);
            const normalized = (point.value - yMin) / Math.max(yMax - yMin, 1e-6);
            const y = HEIGHT - PAD_Y - normalized * (HEIGHT - PAD_Y * 2);
            return (index === 0 ? 'M ' : 'L ') + x.toFixed(2) + ' ' + y.toFixed(2);
          })
          .join(' ');

        return { ...series, d };
      }),
    [maxTime, traces, yMax, yMin]
  );

  return (
    <div className="panel rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {traces.map((trace) => (
            <span key={trace.label} className="inline-flex items-center gap-1 text-slate-300">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: trace.color }} />
              {trace.label}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT} className="h-[240px] w-full rounded border border-white/10 bg-[#050d16]">
        <line x1={PAD_X} y1={PAD_Y} x2={PAD_X} y2={HEIGHT - PAD_Y} stroke="rgba(255,255,255,0.25)" />
        <line
          x1={PAD_X}
          y1={HEIGHT - PAD_Y}
          x2={WIDTH - PAD_X}
          y2={HEIGHT - PAD_Y}
          stroke="rgba(255,255,255,0.25)"
        />

        <text x={10} y={PAD_Y + 4} fill="rgba(220,236,255,0.8)" fontSize="11">
          {yMax.toFixed(2)}
        </text>
        <text x={10} y={HEIGHT - PAD_Y + 4} fill="rgba(220,236,255,0.8)" fontSize="11">
          {yMin.toFixed(2)}
        </text>
        <text x={WIDTH - PAD_X - 14} y={HEIGHT - 4} fill="rgba(220,236,255,0.8)" fontSize="11">
          t
        </text>

        {pathData.map((series) => (
          <path key={series.label} d={series.d} fill="none" stroke={series.color} strokeWidth={2.2} strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
}
