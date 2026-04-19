'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FrequencyBand } from '@/lib/types';
import { BAND_PARAMS } from '@/lib/math/satellite';

interface SpectrumBandLocatorProps {
  selectedBand?: FrequencyBand;
  onBandSelect?: (band: FrequencyBand) => void;
  readOnly?: boolean;
  showLabels?: boolean;
  className?: string;
}

const LN = -12; // Log min (gamma rays)
const SP = 16;  // Log span (up to radio)
const C_LIGHT = 299792458;

const REGIONS = [
  { l: 'Gamma', s: -12, e: -11 },
  { l: 'X-ray', s: -11, e: -8 },
  { l: 'UV', s: -8, e: -6.42 },
  { l: 'Visible', s: -6.42, e: -6.155 },
  { l: 'Infrared', s: -6.155, e: -3 },
  { l: 'Microwave', s: -3, e: -1 },
  { l: 'Radio', s: -1, e: 4 }
];

const HUES: [number, string][] = [
  [270, 'violet'], [250, 'indigo'], [220, 'blue'], [185, 'cyan'],
  [160, 'teal'], [140, 'green'], [115, 'lime'], [90, 'yellow'],
  [55, 'amber'], [30, 'orange'], [10, 'red']
];

const SATELLITE_BANDS: FrequencyBand[] = ['L', 'S', 'C', 'X', 'Ku', 'Ka'];

function posFromLog(l: number) { return (l - LN) / SP; }
function hueFromLog(l: number) { return 270 * (1 - posFromLog(l)); }
function nameFromHue(h: number) {
  const r = HUES.find((t) => h >= t[0]);
  return r ? r[1] : 'red';
}

function fmtLambda(m: number) {
  if (m < 1e-9) return (m * 1e12).toFixed(0) + ' pm';
  if (m < 1e-6) return (m * 1e9).toFixed(2) + ' nm';
  if (m < 1e-3) return (m * 1e6).toFixed(2) + ' µm';
  if (m < 1) return (m * 1e3).toFixed(2) + ' mm';
  if (m < 1e3) return m.toFixed(2) + ' m';
  return (m / 1e3).toFixed(0) + ' km';
}

function fmtFreq(f: number) {
  if (f >= 1e18) return (f / 1e18).toFixed(2) + ' EHz';
  if (f >= 1e15) return (f / 1e15).toFixed(2) + ' PHz';
  if (f >= 1e12) return (f / 1e12).toFixed(2) + ' THz';
  if (f >= 1e9) return (f / 1e9).toFixed(2) + ' GHz';
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
  return f.toFixed(0) + ' Hz';
}

function oklchStr(H: number) {
  return `oklch(0.68 0.32 ${H.toFixed(4)})`;
}

export function SpectrumBandLocator({
  selectedBand,
  onBandSelect,
  readOnly = false,
  showLabels = true,
  className = ''
}: SpectrumBandLocatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [colorSpace, setColorSpace] = useState<'srgb' | 'display-p3' | 'rec2020'>('srgb');
  const [pixelFormat, setPixelFormat] = useState<'uint8' | 'float16'>('uint8');

  // Map satellite bands to log wavelength
  const bandLogs = useMemo(() => {
    const logs: Record<string, number> = {};
    SATELLITE_BANDS.forEach(b => {
      const f = BAND_PARAMS[b].carrierHz;
      logs[b] = Math.log10(C_LIGHT / f);
    });
    return logs;
  }, []);

  useEffect(() => {
    // Detect color space
    const tryContext = (cs: string, pf?: string) => {
      try {
        const t = document.createElement('canvas');
        t.width = 1; t.height = 1;
        const opts: any = { colorSpace: cs };
        if (pf) opts.pixelFormat = pf;
        const ctx = t.getContext('2d', opts) as CanvasRenderingContext2D | null;
        if (!ctx) return false;
        if (ctx.getContextAttributes) {
          const a = ctx.getContextAttributes();
          if (a.colorSpace !== cs) return false;
        }
        return true;
      } catch (e) { return false; }
    };

    if (tryContext('rec2020', 'float16')) {
      setColorSpace('rec2020'); setPixelFormat('float16');
    } else if (tryContext('rec2020')) {
      setColorSpace('rec2020');
    } else if (tryContext('display-p3')) {
      setColorSpace('display-p3');
    }
  }, []);

  const draw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const R = cv.getBoundingClientRect();
    const W = R.width;
    const H = R.height;

    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);

    const opts: any = { colorSpace };
    if (pixelFormat !== 'uint8') opts.pixelFormat = pixelFormat;
    const ctx = cv.getContext('2d', opts) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // 1. Draw Spectrum
    for (let x = 0; x < W; x++) {
      const logL = LN + (x / W) * SP;
      ctx.fillStyle = oklchStr(hueFromLog(logL));
      ctx.fillRect(x, 0, 1, H);
    }

    // 2. Visible window bracket (eyes)
    const vx1 = posFromLog(-6.42) * W;
    const vx2 = posFromLog(-6.155) * W;
    const vcx = (vx1 + vx2) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.fillRect(vx1, 1, vx2 - vx1, H - 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vx1 + 0.75, 1.75, vx2 - vx1 - 1.5, H - 3.5);

    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('eyes', vcx, H / 2);

    // 3. Highlight Selected Band
    if (selectedBand) {
      const logL = bandLogs[selectedBand];
      const bx = posFromLog(logL) * W;
      
      // Draw bracket
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 10, 4);
      ctx.lineTo(bx, 4);
      ctx.lineTo(bx, H - 4);
      ctx.lineTo(bx - 10, H - 4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx + 10, 4);
      ctx.lineTo(bx, 4);
      ctx.lineTo(bx, H - 4);
      ctx.lineTo(bx + 10, H - 4);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px mono';
      ctx.textAlign = 'center';
      ctx.fillText(selectedBand, bx, H / 2);
    }

    // 4. Hover Crosshair
    if (hoverX !== null) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, H);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedBand, hoverX, colorSpace, pixelFormat]);

  const handleInteraction = (clientX: number) => {
    if (readOnly) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const R = cv.getBoundingClientRect();
    const x = Math.max(0, Math.min(R.width, clientX - R.left));
    setHoverX(x);

    // If clicking or near a band, we could select it.
    // However, usually we want to see what's under the cursor.
  };

  const handleClick = (clientX: number) => {
    if (readOnly || !onBandSelect) return;
    const cv = canvasRef.current;
    if (!cv) return;
    const R = cv.getBoundingClientRect();
    const x = Math.max(0, Math.min(R.width, clientX - R.left));
    const logL = LN + (x / R.width) * SP;

    // Find closest satellite band
    let closestBand: FrequencyBand = 'Ka';
    let minDist = Infinity;
    SATELLITE_BANDS.forEach(b => {
      const d = Math.abs(bandLogs[b] - logL);
      if (d < minDist) {
        minDist = d;
        closestBand = b;
      }
    });

    // Only select if within a reasonable distance (e.g. 0.5 log units)
    if (minDist < 0.5) {
      onBandSelect(closestBand);
    }
  };

  const currentLogL = hoverX !== null ? LN + (hoverX / (canvasRef.current?.getBoundingClientRect().width || 1)) * SP : null;
  const currentLambda = currentLogL !== null ? Math.pow(10, currentLogL) : null;
  const currentFreq = currentLambda !== null ? C_LIGHT / currentLambda : null;
  const currentHue = currentLogL !== null ? hueFromLog(currentLogL) : null;
  const currentReg = currentLogL !== null ? (REGIONS.find(r => currentLogL >= r.s && currentLogL < r.e) || REGIONS[REGIONS.length - 1]) : null;

  return (
    <div className={`w-full ${className}`} ref={containerRef}>
      {showLabels && (
        <div className="flex mb-1.5 font-sans text-[10px] uppercase tracking-wider text-slate-500">
          {REGIONS.map(r => {
            const w = (posFromLog(r.e) - posFromLog(r.s)) * 100;
            return (
              <div key={r.l} style={{ width: `${w}%` }} className="text-center overflow-hidden whitespace-nowrap px-0.5">
                {w > 3 ? r.l : ''}
              </div>
            );
          })}
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="h-16 w-full cursor-crosshair rounded-lg"
        onMouseMove={(e) => handleInteraction(e.clientX)}
        onTouchMove={(e) => {
          e.preventDefault();
          handleInteraction(e.touches[0].clientX);
        }}
        onMouseLeave={() => setHoverX(null)}
        onClick={(e) => handleClick(e.clientX)}
      />

      <div className="relative mt-2 h-6 font-mono text-[10px] text-slate-400">
        {[-12, -9, -6, -3, 0, 3].map((log) => {
          const pct = posFromLog(log) * 100;
          return (
            <span
              key={log}
              className="absolute whitespace-nowrap"
              style={{
                left: `${pct}%`,
                transform: `translateX(${pct < 5 ? '0' : pct > 95 ? '-100%' : '-50%'})`
              }}
            >
              {fmtLambda(Math.pow(10, log))}
            </span>
          );
        })}
      </div>

      {hoverX !== null && currentLambda && currentFreq && currentHue && (
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 animate-in fade-in slide-in-from-top-1">
          <div 
            className="h-10 w-10 shrink-0 rounded-lg border border-white/20"
            style={{ backgroundColor: oklchStr(currentHue) }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-white">{currentReg?.l}</span>
              <span className="text-xs text-slate-400" style={{ color: oklchStr(currentHue) }}>
                {nameFromHue(currentHue)}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>λ <strong className="text-slate-200">{fmtLambda(currentLambda)}</strong></span>
              <span>f <strong className="text-slate-200">{fmtFreq(currentFreq)}</strong></span>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[10px] uppercase tracking-tighter text-slate-500">Color Space</div>
            <div className="text-xs font-mono text-slate-300">{colorSpace} {pixelFormat === 'float16' ? 'HDR' : ''}</div>
          </div>
        </div>
      )}
    </div>
  );
}
