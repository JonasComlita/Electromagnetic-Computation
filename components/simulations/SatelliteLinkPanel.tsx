'use client';

import { useState, useMemo } from 'react';
import { trackEvent } from '@/lib/analytics';
import {
  ORBIT_PARAMS,
  BAND_PARAMS,
  computeFullLinkBudget,
  type LinkBudget
} from '@/lib/math/satellite';
import {
  runSatelliteComparison,
  DEFAULT_SATELLITE_SCENARIO,
  type SatelliteArchitectureResult
} from '@/lib/simulators/satellite';
import { SatelliteGeometryView } from '@/components/simulations/SatelliteGeometryView';
import { useSessionStore } from '@/lib/store/useSessionStore';
import type { FrequencyBand, SatelliteLink, SatelliteOrbit } from '@/lib/types';

const ORBITS: SatelliteOrbit[]      = ['LEO', 'MEO', 'GEO', 'HEO'];
const BANDS:  FrequencyBand[]       = ['L', 'S', 'C', 'X', 'Ku', 'Ka'];

function dbColor(val: number, goodPositive = true): string {
  const ok = goodPositive ? val >= 0 : val <= 0;
  return ok ? 'text-emerald-300' : 'text-rose-300';
}

function BudgetRow({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between border-b border-white/5 py-1.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`mono-data font-medium ${color ?? 'text-accent'}`}>
        {value}{unit ? <span className="ml-1 text-xs text-slate-500">{unit}</span> : null}
      </span>
    </div>
  );
}

function BerBar({ ber, name }: { ber: number; name: string }): JSX.Element {
  const pct     = Math.min(100, ber * 100);
  const isGood  = ber < 0.01;
  const isBad   = ber > 0.1;
  const barColor = isGood ? 'bg-emerald-400' : isBad ? 'bg-rose-400' : 'bg-warm';
  const label   = ber < 1e-6 ? '< 1e-6' : ber.toExponential(2);

  return (
    <div className="mt-1">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-400">{name} BER proxy</span>
        <span className={`mono-data ${isGood ? 'text-emerald-300' : isBad ? 'text-rose-300' : 'text-warm'}`}>
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.max(1, pct)}%` }} />
      </div>
    </div>
  );
}

export function SatelliteLinkPanel(): JSX.Element {
  const tier    = useSessionStore((state) => state.tier);
  const emState = useSessionStore((state) => state.emState);
  const frame   = useSessionStore((state) => state.frame);

  const [orbit,   setOrbit]   = useState<SatelliteOrbit>('LEO');
  const [band,    setBand]    = useState<FrequencyBand>('Ka');
  const [eirp,    setEirp]    = useState(52);          // dBW — typical HTS ground terminal
  const [elev,    setElev]    = useState(45);          // elevation angle degrees
  const [results, setResults] = useState<SatelliteArchitectureResult[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const link: SatelliteLink = useMemo(
    () => ({ orbit, frequencyBand: band, eirpDbw: eirp, elevationDeg: elev }),
    [orbit, band, eirp, elev]
  );

  const budget: LinkBudget = useMemo(() => computeFullLinkBudget(link), [link]);

  function runComparison(): void {
    const scenario = {
      ...DEFAULT_SATELLITE_SCENARIO,
      initial: emState,
      frame
    };
    const { results: res } = runSatelliteComparison(scenario, link);
    setResults(res);
    trackEvent('scenario_run', {
      simulator: 'satellite',
      orbit,
      band,
      eirp,
      snrDb: budget.snrDb
    });
  }

  const orbitP = ORBIT_PARAMS[orbit];
  const bandP  = BAND_PARAMS[band];

  return (
    <section className="space-y-4">
      {/* Orbit selector */}
      <div className="panel rounded-2xl p-4">
        <h4 className="text-lg font-semibold text-white">Orbit</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {ORBITS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOrbit(o)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                o === orbit
                  ? 'border-accent/70 bg-accent/20 text-accent'
                  : 'border-white/20 text-slate-300 hover:bg-white/10'
              }`}
            >
              {ORBIT_PARAMS[o].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-400">{orbitP.description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Link controls */}
        <div className="panel rounded-2xl p-4 space-y-4">
          <div>
            <h4 className="text-lg font-semibold text-white">Frequency band</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {BANDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBand(b)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    b === band
                      ? 'border-warm/70 bg-warm/20 text-warm'
                      : 'border-white/20 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">{bandP.label} · {bandP.typicalUse}</p>
          </div>

          <div>
            <label className="block text-sm text-slate-300">
              EIRP: <span className="mono-data text-accent">{eirp} dBW</span>
            </label>
            <input
              type="range" className="mt-1 w-full" min={30} max={80} step={1}
              value={eirp} onChange={(e) => setEirp(Number(e.target.value))}
            />
            <p className="mt-0.5 text-xs text-slate-500">Effective isotropic radiated power. 52 dBW ≈ typical Ka-band VSAT terminal.</p>
          </div>

          {tier !== 'beginner' && (
            <div>
              <label className="block text-sm text-slate-300">
                Elevation: <span className="mono-data text-accent">{elev}°</span>
              </label>
              <input
                type="range" className="mt-1 w-full" min={5} max={90} step={1}
                value={elev} onChange={(e) => setElev(Number(e.target.value))}
              />
              <p className="mt-0.5 text-xs text-slate-500">Low elevation = longer slant range = more atmospheric losses.</p>
            </div>
          )}

          <button
            type="button"
            onClick={runComparison}
            className="mt-2 rounded-full border border-accent/70 bg-accent/15 px-5 py-2 text-sm text-accent hover:bg-accent/20"
          >
            Run all four architectures through this link
          </button>
        </div>

        {/* Geometry view */}
        <SatelliteGeometryView orbit={orbit} budget={budget} />
      </div>

      {/* Link budget */}
      <div className="panel rounded-2xl p-4">
        <h4 className="mb-3 text-lg font-semibold text-white">Link budget</h4>
        <div className="grid gap-x-8 sm:grid-cols-2">
          <div>
            <BudgetRow label="Slant range"           value={budget.slantRangeKm.toFixed(0)}      unit="km" />
            <BudgetRow label="Propagation delay"     value={budget.propagationDelayMs.toFixed(1)} unit="ms one-way" />
            <BudgetRow label="Round-trip time"       value={budget.rttMs.toFixed(1)}              unit="ms RTT" />
            <BudgetRow label="Free-space path loss"  value={budget.freeSpacePathLossDb.toFixed(1)} unit="dB" color="text-rose-300" />
            <BudgetRow label="Atmospheric loss"      value={budget.atmosphericLossDb.toFixed(2)}  unit="dB" color="text-rose-300" />
          </div>
          <div>
            <BudgetRow label="Received power"        value={budget.receivedPowerDbw.toFixed(1)}   unit="dBW" />
            <BudgetRow label="Noise floor"           value={budget.noiseFloorDbw.toFixed(1)}      unit="dBW" color="text-slate-400" />
            <BudgetRow label="SNR"                   value={budget.snrDb.toFixed(1)}              unit="dB"
              color={dbColor(budget.snrDb)} />
            <BudgetRow label="Link margin"           value={(budget.linkMarginDb >= 0 ? '+' : '') + budget.linkMarginDb.toFixed(1)} unit="dB"
              color={dbColor(budget.linkMarginDb)} />
            <BudgetRow label="Doppler shift"         value={(budget.dopplerShiftHz / 1e3).toFixed(1)} unit="kHz" color="text-warm" />
          </div>
        </div>
        {tier === 'advanced' && (
          <p className="mt-3 text-xs text-slate-500">
            Noise floor = kTB at 290 K, 36 MHz bandwidth ({budget.noiseFloorDbw.toFixed(1)} dBW).
            Antenna gain assumed {35} dBi. Rain fade {bandP.rainFadeDb} dB + ionospheric {bandP.ionosphericDb} dB.
          </p>
        )}
      </div>

      {/* Architecture results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white">Architecture results through this link</h4>
          <div className="grid gap-3 xl:grid-cols-2">
            {results.map((r) => (
              <article key={r.name} className="panel rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xl font-semibold text-white">{r.name}</h5>
                    <p className="mt-0.5 text-xs text-slate-400">{r.detail}</p>
                  </div>
                  <span className={`mono-data text-xs ${
                    r.metrics.bitErrorProxy < 0.01 ? 'text-emerald-300' :
                    r.metrics.bitErrorProxy > 0.1  ? 'text-rose-300' : 'text-warm'
                  }`}>
                    {r.metrics.bitErrorProxy < 1e-6 ? 'BER < 1e-6' : `BER ${r.metrics.bitErrorProxy.toExponential(2)}`}
                  </span>
                </div>

                <BerBar ber={r.metrics.bitErrorProxy} name={r.name} />

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <div>
                    delay<br />
                    <span className="mono-data text-slate-200">{r.metrics.propagationDelayMs.toFixed(1)} ms</span>
                  </div>
                  <div>
                    SNR<br />
                    <span className={`mono-data ${dbColor(r.metrics.snrDb)}`}>{r.metrics.snrDb.toFixed(1)} dB</span>
                  </div>
                  <div>
                    margin<br />
                    <span className={`mono-data ${dbColor(r.metrics.linkMarginDb)}`}>
                      {r.metrics.linkMarginDb >= 0 ? '+' : ''}{r.metrics.linkMarginDb.toFixed(1)} dB
                    </span>
                  </div>
                </div>

                {tier !== 'beginner' && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(expanded === r.name ? null : r.name)}
                      className="text-xs text-accent hover:underline"
                    >
                      {expanded === r.name ? 'Hide' : 'Show'} rationale
                    </button>
                    {expanded === r.name && (
                      <p className="mt-2 text-xs leading-relaxed text-slate-300">{r.rationale}</p>
                    )}
                  </div>
                )}

                {tier === 'advanced' && (
                  <div className="mt-3 rounded-lg border border-white/10 bg-black/25 p-2">
                    <p className="mb-1 text-xs uppercase tracking-[0.2em] text-slate-500">Trace</p>
                    <ul className="space-y-0.5 text-xs text-slate-400">
                      {r.trace.slice(-3).map((line, i) => (
                        <li key={`${r.name}-t-${i}`}>{line}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
