'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { BufferAttribute, Points } from 'three';

type WaveFieldCanvasProps = {
  frequency: number;
  amplitude: number;
  velocityVc: number;
  phaseOffset: number;
  onPluck: () => void;
};

function WavePoints({
  frequency,
  amplitude,
  velocityVc,
  phaseOffset
}: Omit<WaveFieldCanvasProps, 'onPluck'>): JSX.Element {
  const count = 180;
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const pointsRef = useRef<Points>(null);
  const attributeRef = useRef<BufferAttribute>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const spread = 0.12;
    const phase = t * frequency * Math.PI * 2 + phaseOffset;

    for (let i = 0; i < count; i += 1) {
      const idx = i * 3;
      const x = (i - count / 2) * spread;
      const y = Math.sin(i * 0.24 - phase) * amplitude * 0.8;
      const z = Math.cos(i * 0.31 - phase + velocityVc * 2.6) * amplitude * 0.55;

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
    }

    if (attributeRef.current) {
      attributeRef.current.needsUpdate = true;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = Math.sin(t * 0.12) * 0.2;
      pointsRef.current.rotation.x = Math.cos(t * 0.1) * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute ref={attributeRef} attach="attributes-position" count={count} itemSize={3} array={positions} />
      </bufferGeometry>
      <pointsMaterial color="#4dd9ff" size={0.05} sizeAttenuation />
    </points>
  );
}

export function WaveFieldCanvas({
  frequency,
  amplitude,
  velocityVc,
  phaseOffset,
  onPluck
}: WaveFieldCanvasProps): JSX.Element {
  return (
    <div className="panel overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <p className="text-sm text-slate-200">Interactive Field Grid</p>
        <button
          type="button"
          onClick={onPluck}
          className="rounded-full border border-warm/70 bg-warm/15 px-3 py-1 text-xs text-warm hover:bg-warm/25"
        >
          Pluck Field
        </button>
      </div>
      <div className="h-[320px] w-full">
        <Canvas camera={{ position: [0, 1.4, 8], fov: 58 }}>
          <ambientLight intensity={0.55} />
          <directionalLight intensity={1.1} position={[1, 2, 4]} />
          <gridHelper args={[20, 20, '#2e5d79', '#1a3245']} />
          <WavePoints frequency={frequency} amplitude={amplitude} velocityVc={velocityVc} phaseOffset={phaseOffset} />
          <OrbitControls enablePan={false} maxDistance={12} minDistance={4} />
        </Canvas>
      </div>
    </div>
  );
}
