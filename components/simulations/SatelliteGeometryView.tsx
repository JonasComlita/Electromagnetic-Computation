'use client';

import type { LinkBudget } from '@/lib/math/satellite';
import { ORBIT_PARAMS } from '@/lib/math/satellite';
import type { SatelliteOrbit } from '@/lib/types';

type SatelliteGeometryViewProps = {
  orbit: SatelliteOrbit;
  budget: LinkBudget | null;
};

/* Map orbit to a normalised 0–1 visual height in the SVG frame */
const ORBIT_VISUAL_Y: Record<SatelliteOrbit, number> = {
  LEO: 0.72,
  MEO: 0.42,
  GEO: 0.20,
  HEO: 0.12
};

const W = 560;
const H = 260;
const EARTH_CX = W / 2;
const EARTH_CY = H + 54;      // centre far below the frame so only the arc is visible
const EARTH_R  = 160;

function satY(orbit: SatelliteOrbit): number {
  return H * (1 - ORBIT_VISUAL_Y[orbit]);
}

function fmt(n: number, dp = 1): string {
  return n.toFixed(dp);
}

export function SatelliteGeometryView({ orbit, budget }: SatelliteGeometryViewProps): JSX.Element {
  const sy  = satY(orbit);
  const sx  = W * 0.62;
  const gsx = W * 0.35;   // ground station x
  const gsy = H - 22;     // ground station y (on the arc)

  const orbitLabel  = ORBIT_PARAMS[orbit].label;
  const delayLabel  = budget ? fmt(budget.propagationDelayMs) + ' ms one-way' : '—';
  const rangeLabel  = budget ? fmt(budget.slantRangeKm, 0) + ' km' : '—';
  const dopplerLabel = budget ? '+' + fmt(budget.dopplerShiftHz / 1e3, 1) + ' kHz Doppler' : '—';
  const marginLabel = budget
    ? (budget.linkMarginDb >= 0 ? '+' : '') + fmt(budget.linkMarginDb, 1) + ' dB margin'
    : '—';
  const marginOk = budget ? budget.linkMarginDb >= 0 : true;

  return (
    <div className="panel overflow-hidden rounded-2xl">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        aria-label={`Satellite link geometry for ${orbitLabel}`}
        role="img"
      >
        {/* Earth arc */}
        <circle
          cx={EARTH_CX}
          cy={EARTH_CY}
          r={EARTH_R}
          fill="none"
          stroke="rgba(77,217,255,0.25)"
          strokeWidth="2"
        />
        {/* Earth fill hint at bottom */}
        <path
          d={`M 0 ${H} L ${W} ${H} L ${W} ${H - 10} Q ${W / 2} ${H - 32} 0 ${H - 10} Z`}
          fill="rgba(77,217,255,0.07)"
        />
        <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="rgba(77,217,255,0.4)">
          Earth surface
        </text>

        {/* Orbit arc (dashed) */}
        <circle
          cx={EARTH_CX}
          cy={EARTH_CY}
          r={EARTH_R + (H - 22 - sy) * 1.08}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Link line */}
        <line
          x1={gsx} y1={gsy}
          x2={sx}  y2={sy + 8}
          stroke={marginOk ? 'rgba(77,217,255,0.55)' : 'rgba(255,100,100,0.55)'}
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />

        {/* Uplink / downlink arrows at midpoint */}
        {budget && (
          <>
            <line
              x1={(gsx + sx) / 2 - 6} y1={(gsy + sy) / 2 + 3}
              x2={(gsx + sx) / 2 + 6} y2={(gsy + sy) / 2 - 3}
              stroke="rgba(77,217,255,0.5)"
              strokeWidth="1"
              markerEnd="url(#arrowUp)"
            />
          </>
        )}

        {/* Ground station */}
        <polygon
          points={`${gsx},${gsy - 14} ${gsx - 9},${gsy} ${gsx + 9},${gsy}`}
          fill="rgba(77,217,255,0.18)"
          stroke="rgba(77,217,255,0.6)"
          strokeWidth="1.2"
        />
        {/* Dish */}
        <ellipse
          cx={gsx} cy={gsy - 16} rx={9} ry={4}
          fill="none"
          stroke="rgba(77,217,255,0.55)"
          strokeWidth="1.2"
        />
        <text x={gsx} y={gsy + 12} textAnchor="middle" fontSize="10" fill="rgba(220,237,255,0.6)">
          Ground station
        </text>

        {/* Satellite body */}
        <rect x={sx - 10} y={sy} width={20} height={14} rx="2"
          fill="rgba(255,186,73,0.2)" stroke="rgba(255,186,73,0.7)" strokeWidth="1.2" />
        {/* Solar panels */}
        <rect x={sx - 26} y={sy + 3} width={14} height={7} rx="1"
          fill="rgba(255,186,73,0.15)" stroke="rgba(255,186,73,0.45)" strokeWidth="1" />
        <rect x={sx + 12} y={sy + 3} width={14} height={7} rx="1"
          fill="rgba(255,186,73,0.15)" stroke="rgba(255,186,73,0.45)" strokeWidth="1" />
        {/* Antenna stub */}
        <line x1={sx} y1={sy + 14} x2={sx - 4} y2={sy + 22}
          stroke="rgba(255,186,73,0.5)" strokeWidth="1" />
        <text x={sx + 28} y={sy + 8} textAnchor="start" fontSize="10" fill="rgba(255,186,73,0.8)">
          {orbitLabel}
        </text>

        {/* Metrics overlay */}
        <text x={12} y={20} fontSize="10" fill="rgba(220,237,255,0.55)">
          Range: {rangeLabel}
        </text>
        <text x={12} y={34} fontSize="10" fill="rgba(220,237,255,0.55)">
          Delay: {delayLabel}
        </text>
        <text x={12} y={48} fontSize="10" fill="rgba(220,237,255,0.45)">
          {dopplerLabel}
        </text>
        <text
          x={12} y={62} fontSize="10"
          fill={marginOk ? 'rgba(100,220,150,0.8)' : 'rgba(255,120,100,0.8)'}
        >
          {marginLabel}
        </text>
      </svg>
    </div>
  );
}
