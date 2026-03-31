'use client';

import { useMemo, useState } from 'react';
import { simulateAnalogRc } from '@/lib/circuits/analogRc';
import { simulateBinaryCmos } from '@/lib/circuits/binaryCmos';
import { simulateTernaryCmos } from '@/lib/circuits/ternaryCmos';
import { CircuitTraceChart } from '@/components/simulations/CircuitTraceChart';

type CircuitMode = 'binary' | 'analog' | 'ternary';

export function CircuitLevelLab(): JSX.Element {
  const [mode, setMode] = useState<CircuitMode>('binary');

  const [dt, setDt] = useState(0.0015);
  const [steps, setSteps] = useState(850);
  const [frequency, setFrequency] = useState(6);

  const [rn, setRn] = useState(1);
  const [rp, setRp] = useState(1);
  const [vthN, setVthN] = useState(0.45);
  const [vthP, setVthP] = useState(0.45);
  const [leakage, setLeakage] = useState(0.002);

  const [resistance, setResistance] = useState(0.6);
  const [capacitance, setCapacitance] = useState(0.04);
  const [noise, setNoise] = useState(0.01);
  const [heat, setHeat] = useState(0.015);

  const [symbolRate, setSymbolRate] = useState(8);
  const [gHigh, setGHigh] = useState(1.2);
  const [gMid, setGMid] = useState(1.0);
  const [gLow, setGLow] = useState(1.2);
  const [sigma, setSigma] = useState(0.12);

  const binary = useMemo(
    () =>
      simulateBinaryCmos({
        dt,
        steps,
        inputFrequency: frequency,
        rn,
        rp,
        vthN,
        vthP,
        leakage
      }),
    [dt, frequency, leakage, rn, rp, steps, vthN, vthP]
  );

  const analog = useMemo(
    () =>
      simulateAnalogRc({
        dt,
        steps,
        inputFrequency: frequency,
        r: resistance,
        c: capacitance,
        noise,
        heat
      }),
    [capacitance, dt, frequency, heat, noise, resistance, steps]
  );

  const ternary = useMemo(
    () =>
      simulateTernaryCmos({
        dt,
        steps,
        symbolRate,
        gHigh,
        gMid,
        gLow,
        sigma
      }),
    [dt, gHigh, gLow, gMid, sigma, steps, symbolRate]
  );

  const transferPreview = useMemo(() => ternary.transfer.filter((_, index) => index % 4 === 0), [ternary.transfer]);

  return (
    <section className="space-y-4">
      <header className="panel rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-accent/75">Lesson 5 Lab</p>
        <h3 className="mt-1 text-2xl font-semibold text-white">Transistor and Circuit-Level Emulation</h3>
        <p className="mt-2 max-w-4xl text-slate-200">
          This lab goes below conceptual architecture comparison and simulates circuit behavior directly: CMOS switching for binary,
          RC dynamics for analog, and a multi-threshold ternary inverter model.
        </p>
      </header>

      <div className="panel rounded-2xl p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('binary')}
            className={
              mode === 'binary'
                ? 'rounded-full border border-accent/70 bg-accent/20 px-3 py-1.5 text-sm text-accent'
                : 'rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200'
            }
          >
            Binary CMOS
          </button>
          <button
            type="button"
            onClick={() => setMode('analog')}
            className={
              mode === 'analog'
                ? 'rounded-full border border-accent/70 bg-accent/20 px-3 py-1.5 text-sm text-accent'
                : 'rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200'
            }
          >
            Analog RC
          </button>
          <button
            type="button"
            onClick={() => setMode('ternary')}
            className={
              mode === 'ternary'
                ? 'rounded-full border border-accent/70 bg-accent/20 px-3 py-1.5 text-sm text-accent'
                : 'rounded-full border border-white/20 px-3 py-1.5 text-sm text-slate-200'
            }
          >
            Ternary Multi-Threshold
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="text-sm text-slate-300">
            dt: <span className="mono-data text-accent">{dt.toFixed(4)}</span>
            <input className="mt-1 w-full" type="range" min={0.0005} max={0.005} step={0.0005} value={dt} onChange={(event) => setDt(Number(event.target.value))} />
          </label>
          <label className="text-sm text-slate-300">
            steps: <span className="mono-data text-accent">{steps}</span>
            <input className="mt-1 w-full" type="range" min={400} max={1600} step={50} value={steps} onChange={(event) => setSteps(Number(event.target.value))} />
          </label>
          {mode !== 'ternary' && (
            <label className="text-sm text-slate-300">
              input frequency: <span className="mono-data text-accent">{frequency.toFixed(1)} Hz</span>
              <input className="mt-1 w-full" type="range" min={1} max={20} step={0.5} value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} />
            </label>
          )}
          {mode === 'ternary' && (
            <label className="text-sm text-slate-300">
              symbol rate: <span className="mono-data text-accent">{symbolRate.toFixed(1)} Hz</span>
              <input className="mt-1 w-full" type="range" min={2} max={20} step={0.5} value={symbolRate} onChange={(event) => setSymbolRate(Number(event.target.value))} />
            </label>
          )}
        </div>
      </div>

      {mode === 'binary' && (
        <div className="space-y-4">
          <div className="panel rounded-2xl p-4">
            <h4 className="text-lg font-semibold text-white">Binary CMOS Controls</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-slate-300">
                Rn <span className="mono-data text-accent">{rn.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.4} max={2} step={0.05} value={rn} onChange={(event) => setRn(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                Rp <span className="mono-data text-accent">{rp.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.4} max={2} step={0.05} value={rp} onChange={(event) => setRp(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                leakage <span className="mono-data text-accent">{leakage.toFixed(4)}</span>
                <input className="mt-1 w-full" type="range" min={0.0005} max={0.01} step={0.0005} value={leakage} onChange={(event) => setLeakage(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                Vth N <span className="mono-data text-accent">{vthN.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.2} max={0.8} step={0.01} value={vthN} onChange={(event) => setVthN(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                Vth P <span className="mono-data text-accent">{vthP.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.2} max={0.8} step={0.01} value={vthP} onChange={(event) => setVthP(Number(event.target.value))} />
              </label>
            </div>
          </div>

          <CircuitTraceChart
            title="CMOS inverter chain waveforms"
            traces={[
              { label: 'Vin', color: '#4dd9ff', data: binary.vin },
              { label: 'Inv1', color: '#ffba49', data: binary.inv1 },
              { label: 'Inv2', color: '#9dfc8f', data: binary.inv2 }
            ]}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="panel rounded-2xl p-4 text-sm text-slate-200">
              <p>
                Estimated propagation delay: <span className="mono-data text-accent">{binary.propagationDelayNs === null ? 'n/a' : binary.propagationDelayNs.toFixed(2) + ' ns'}</span>
              </p>
              <p className="mt-2">Two-inverter chain shows transistor switching delay and signal restoration behavior.</p>
            </div>
            <div className="panel rounded-2xl p-4">
              <p className="text-sm font-semibold text-white">CMOS NAND truth table (settled voltages)</p>
              <table className="mono-data mt-2 w-full text-sm text-slate-200">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th>A</th>
                    <th>B</th>
                    <th>Vout</th>
                    <th>Logic</th>
                  </tr>
                </thead>
                <tbody>
                  {binary.nandTruth.map((row) => (
                    <tr key={'nand-' + row.a + '-' + row.b}>
                      <td>{row.a}</td>
                      <td>{row.b}</td>
                      <td>{row.vout.toFixed(3)}</td>
                      <td>{row.logic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {mode === 'analog' && (
        <div className="space-y-4">
          <div className="panel rounded-2xl p-4">
            <h4 className="text-lg font-semibold text-white">Analog RC Controls</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="text-sm text-slate-300">
                R <span className="mono-data text-accent">{resistance.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.1} max={2} step={0.05} value={resistance} onChange={(event) => setResistance(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                C <span className="mono-data text-accent">{capacitance.toFixed(3)}</span>
                <input className="mt-1 w-full" type="range" min={0.005} max={0.2} step={0.005} value={capacitance} onChange={(event) => setCapacitance(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                noise <span className="mono-data text-accent">{noise.toFixed(3)}</span>
                <input className="mt-1 w-full" type="range" min={0} max={0.05} step={0.001} value={noise} onChange={(event) => setNoise(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                heat <span className="mono-data text-accent">{heat.toFixed(3)}</span>
                <input className="mt-1 w-full" type="range" min={0} max={0.05} step={0.001} value={heat} onChange={(event) => setHeat(Number(event.target.value))} />
              </label>
            </div>
          </div>

          <CircuitTraceChart
            title="RC low-pass response"
            traces={[
              { label: 'Vin', color: '#4dd9ff', data: analog.vin },
              { label: 'Vout', color: '#ffba49', data: analog.vout }
            ]}
          />

          <div className="panel rounded-2xl p-4 text-sm text-slate-200">
            <p>
              cutoff frequency: <span className="mono-data text-accent">{analog.cutoffHz.toFixed(2)} Hz</span>
            </p>
            <p>
              phase lag: <span className="mono-data text-accent">{analog.phaseLagSec === null ? 'n/a' : analog.phaseLagSec.toFixed(5) + ' s'}</span>
            </p>
            <p>
              attenuation ratio: <span className="mono-data text-accent">{analog.attenuation.toFixed(3)}</span>
            </p>
          </div>
        </div>
      )}

      {mode === 'ternary' && (
        <div className="space-y-4">
          <div className="panel rounded-2xl p-4">
            <h4 className="text-lg font-semibold text-white">Ternary Multi-Threshold Controls</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="text-sm text-slate-300">
                Ghigh <span className="mono-data text-accent">{gHigh.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.4} max={2.5} step={0.05} value={gHigh} onChange={(event) => setGHigh(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                Gmid <span className="mono-data text-accent">{gMid.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.2} max={2.5} step={0.05} value={gMid} onChange={(event) => setGMid(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                Glow <span className="mono-data text-accent">{gLow.toFixed(2)}</span>
                <input className="mt-1 w-full" type="range" min={0.4} max={2.5} step={0.05} value={gLow} onChange={(event) => setGLow(Number(event.target.value))} />
              </label>
              <label className="text-sm text-slate-300">
                sigma <span className="mono-data text-accent">{sigma.toFixed(3)}</span>
                <input className="mt-1 w-full" type="range" min={0.05} max={0.25} step={0.005} value={sigma} onChange={(event) => setSigma(Number(event.target.value))} />
              </label>
            </div>
          </div>

          <CircuitTraceChart
            title="Ternary inverter dynamics"
            traces={[
              { label: 'Vin', color: '#4dd9ff', data: ternary.vin },
              { label: 'Vout', color: '#ffba49', data: ternary.vout },
              { label: 'Decoded', color: '#9dfc8f', data: ternary.decoded }
            ]}
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="panel rounded-2xl p-4 text-sm text-slate-200">
              <p>
                decoded transitions: <span className="mono-data text-accent">{ternary.transitions}</span>
              </p>
              <p className="mt-2">Branch conductances determine how strongly output is pulled to low, mid, or high rails.</p>
            </div>
            <div className="panel rounded-2xl p-4">
              <p className="text-sm font-semibold text-white">Transfer sample (Vin to Vout to decoded)</p>
              <table className="mono-data mt-2 w-full text-sm text-slate-200">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th>Vin</th>
                    <th>Vout</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {transferPreview.map((row, index) => (
                    <tr key={'tf-' + index}>
                      <td>{row.vin.toFixed(2)}</td>
                      <td>{row.vout.toFixed(3)}</td>
                      <td>{row.decoded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
