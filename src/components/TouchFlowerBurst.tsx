import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlowerTouch } from '../types';
import { playChime } from '../utils/audio';

export const TouchFlowerBurst: React.FC = () => {
  const [flowers, setFlowers] = useState<FlowerTouch[]>([]);
  const lastTouchTimeRef = useRef<number>(0);

  const spawnFlower = useCallback((x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    const size = 32 + Math.floor(Math.random() * 26);
    const rotation = Math.floor(Math.random() * 360);
    const petals = [8, 10, 12][Math.floor(Math.random() * 3)];
    const colors = ['#fde047', '#facc15', '#fbbf24', '#f59e0b'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const newFlower: FlowerTouch = {
      id,
      x,
      y,
      size,
      rotation,
      petals,
      color,
    };

    setFlowers((prev) => [...prev.slice(-8), newFlower]);
    playChime();

    setTimeout(() => {
      setFlowers((prev) => prev.filter((f) => f.id !== id));
    }, 1300);
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      lastTouchTimeRef.current = Date.now();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        spawnFlower(touch.clientX, touch.clientY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (Date.now() - lastTouchTimeRef.current < 450) {
        return;
      }
      spawnFlower(e.clientX, e.clientY);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('click', handleClick);
    };
  }, [spawnFlower]);

  return (
    <div
      id="touch-flower-overlay"
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      {flowers.map((f) => (
        <div
          key={f.id}
          className="absolute animate-flower-burst"
          style={{
            left: `${f.x}px`,
            top: `${f.y}px`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            transformOrigin: 'center center',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            style={{ transform: `rotate(${f.rotation}deg)` }}
          >
            {Array.from({ length: f.petals }).map((_, i) => {
              const angle = (i * 360) / f.petals;
              return (
                <g key={i} transform={`rotate(${angle} 50 50)`}>
                  <ellipse
                    cx="50"
                    cy="22"
                    rx="9"
                    ry="20"
                    fill={f.color}
                    opacity="0.95"
                  />
                  <path
                    d="M 50 10 Q 50 32 50 42"
                    stroke="#d97706"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </g>
              );
            })}

            <circle cx="50" cy="50" r="16" fill="#92400e" />
            <circle cx="50" cy="50" r="12" fill="#451a03" />

            <circle cx="48" cy="48" r="4" fill="#facc15" opacity="0.85" />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <span
                key={deg}
                className="absolute w-1.5 h-1.5 rounded-full bg-yellow-200"
                style={{
                  transform: `rotate(${deg}deg) translate(0, -${f.size * 0.75}px)`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
