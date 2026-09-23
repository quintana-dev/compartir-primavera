import React, { useEffect, useRef, useState, useCallback } from 'react';
import { playBloomChord } from '../utils/audio';

interface SunflowerCanvasProps {
  progress: number;
  onBloomComplete?: () => void;
  replayTrigger?: number;
}

export const SunflowerCanvas: React.FC<SunflowerCanvasProps> = ({
  progress,
  onBloomComplete,
  replayTrigger = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const GOLDEN_ANGLE = (137.5 * Math.PI) / 180;
  const MAX_SEEDS = 420;
  const NUM_PETALS_TIER1 = 34;
  const NUM_PETALS_TIER2 = 34;
  const NUM_PETALS_TIER3 = 21;
  const TOTAL_PETALS = NUM_PETALS_TIER1 + NUM_PETALS_TIER2 + NUM_PETALS_TIER3;

  const targetProgressRef = useRef<number>(progress);
  useEffect(() => {
    targetProgressRef.current = progress;
  }, [progress]);

  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
    }>
  >([]);

  const initParticles = useCallback((w: number, h: number) => {
    const pts = [];
    for (let i = 0; i < 35; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.25 - Math.random() * 0.45,
        size: 1 + Math.random() * 2.2,
        alpha: 0.15 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = pts;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth || 360;
    let height = container.clientHeight || 500;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    let scaleFactor = Math.min(Math.min(width, height) / 410, 1.25);
    let cConstant = 5.35 * scaleFactor;
    let maxCoreRadius = cConstant * Math.sqrt(MAX_SEEDS);
    let petalLength = 78 * scaleFactor;
    let petalWidth = 22 * scaleFactor;
    let cx = width / 2;
    let cy = height * 0.51;

    const handleResize = () => {
      if (!canvas || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      width = w;
      height = h;
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      const minDim = Math.min(w, h);
      scaleFactor = Math.min(minDim / 410, 1.25);
      cConstant = 5.35 * scaleFactor;
      maxCoreRadius = cConstant * Math.sqrt(MAX_SEEDS);
      petalLength = 78 * scaleFactor;
      petalWidth = 22 * scaleFactor;
      cx = w / 2;
      cy = h * 0.51;
    };

    handleResize();
    initParticles(width, height);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let currentAnimProgress = targetProgressRef.current;
    let time = 0;
    let hasTriggeredCompletion = false;

    const drawPetal = (
      angle: number,
      pLength: number,
      pWidth: number,
      growth: number,
      tier: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      const baseR = maxCoreRadius * 0.88 + tier * 3.5;
      const actualLength = pLength * growth;
      const actualWidth = pWidth * growth;

      const grad = ctx.createLinearGradient(0, baseR, 0, baseR + actualLength);
      if (tier === 0) {
        grad.addColorStop(0, '#b45309');
        grad.addColorStop(0.25, '#d97706');
        grad.addColorStop(0.65, '#eab308');
        grad.addColorStop(1, '#fde047');
      } else if (tier === 1) {
        grad.addColorStop(0, '#d97706');
        grad.addColorStop(0.35, '#eab308');
        grad.addColorStop(0.75, '#facc15');
        grad.addColorStop(1, '#fef08a');
      } else {
        grad.addColorStop(0, '#ca8a04');
        grad.addColorStop(0.4, '#facc15');
        grad.addColorStop(0.85, '#fef08a');
        grad.addColorStop(1, '#ffffff');
      }

      ctx.beginPath();
      ctx.moveTo(0, baseR);
      ctx.bezierCurveTo(
        -actualWidth * 0.85,
        baseR + actualLength * 0.35,
        -actualWidth * 0.65,
        baseR + actualLength * 0.75,
        0,
        baseR + actualLength
      );
      ctx.bezierCurveTo(
        actualWidth * 0.65,
        baseR + actualLength * 0.75,
        actualWidth * 0.85,
        baseR + actualLength * 0.35,
        0,
        baseR
      );
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, baseR + 2);
      ctx.lineTo(0, baseR + actualLength * 0.88);
      ctx.strokeStyle =
        tier === 0 ? 'rgba(120, 53, 15, 0.28)' : 'rgba(202, 138, 4, 0.32)';
      ctx.lineWidth = 1 * scaleFactor;
      ctx.shadowBlur = 0;
      ctx.stroke();

      ctx.restore();
    };

    const drawSeed = (n: number, maxDrawn: number) => {
      const r = cConstant * Math.sqrt(n);
      const theta = n * GOLDEN_ANGLE;
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);

      const spawnFactor = Math.min(1, Math.max(0.2, (maxDrawn - n) / 8));
      const floretR = Math.max(1.3, 1.2 + (r / maxCoreRadius) * 2.3) * scaleFactor * spawnFactor;

      const norm = r / maxCoreRadius;
      let fill = '#261105';
      if (norm < 0.2) fill = '#2b1307';
      else if (norm < 0.45) fill = '#451a03';
      else if (norm < 0.7) fill = '#78350f';
      else if (norm < 0.88) fill = '#92400e';
      else fill = '#ca8a04';

      ctx.beginPath();
      ctx.arc(x, y, floretR, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();

      if (norm > 0.3 && norm < 0.95) {
        ctx.beginPath();
        ctx.arc(x - floretR * 0.3, y - floretR * 0.3, floretR * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
        ctx.fill();
      }
    };

    const animate = () => {
      time += 0.016;

      const target = Math.min(1, Math.max(0.02, targetProgressRef.current));
      currentAnimProgress += (target - currentAnimProgress) * 0.09;

      ctx.clearRect(0, 0, width, height);

      particlesRef.current.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(time + p.phase) * 0.2;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        const currentAlpha =
          p.alpha * (0.65 + 0.35 * Math.sin(time * 2 + p.phase));

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${currentAlpha})`;
        ctx.fill();
        ctx.restore();
      });

      const auraGradient = ctx.createRadialGradient(
        cx,
        cy,
        maxCoreRadius * 0.3,
        cx,
        cy,
        maxCoreRadius + petalLength * (0.4 + 0.9 * currentAnimProgress)
      );
      const auraPulse = (0.08 + 0.12 * currentAnimProgress) + 0.03 * Math.sin(time * 1.5);
      auraGradient.addColorStop(0, `rgba(250, 204, 21, ${auraPulse * 1.3})`);
      auraGradient.addColorStop(0.5, `rgba(217, 119, 6, ${auraPulse * 0.7})`);
      auraGradient.addColorStop(1, 'rgba(5, 11, 6, 0)');

      ctx.save();
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, maxCoreRadius + petalLength * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const seedProgressNorm = Math.min(1, currentAnimProgress / 0.7);
      const seedsDrawn = Math.floor(seedProgressNorm * MAX_SEEDS);

      const petalProgressNorm = Math.max(0, Math.min(1, (currentAnimProgress - 0.35) / 0.65));
      const petalIndex = petalProgressNorm * TOTAL_PETALS;

      if (currentAnimProgress >= 0.98 && !hasTriggeredCompletion) {
        hasTriggeredCompletion = true;
        playBloomChord();
        if (onBloomComplete) onBloomComplete();
      }

      const isFullyGrown = currentAnimProgress >= 0.98;
      const breathScale = isFullyGrown ? 1 + 0.012 * Math.sin(time * 1.8) : 1;
      const subtleSway = isFullyGrown ? 0.008 * Math.sin(time * 1.2) : 0;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(subtleSway);
      ctx.scale(breathScale, breathScale);
      ctx.translate(-cx, -cy);

      const tier1Drawn = Math.min(NUM_PETALS_TIER1, Math.floor(petalIndex));
      for (let i = 0; i < tier1Drawn; i++) {
        const angle = (i * (Math.PI * 2)) / NUM_PETALS_TIER1;
        const growth = Math.min(1, Math.max(0, petalIndex - i));
        drawPetal(angle, petalLength * 0.94, petalWidth * 0.9, growth, 0);
      }

      if (petalIndex > NUM_PETALS_TIER1 * 0.35) {
        const offsetTier2 = Math.PI / NUM_PETALS_TIER2;
        const tier2Progress = petalIndex - NUM_PETALS_TIER1 * 0.35;
        const tier2Drawn = Math.min(NUM_PETALS_TIER2, Math.floor(tier2Progress));
        for (let i = 0; i < tier2Drawn; i++) {
          const angle = (i * (Math.PI * 2)) / NUM_PETALS_TIER2 + offsetTier2;
          const growth = Math.min(1, Math.max(0, tier2Progress - i));
          drawPetal(angle, petalLength * 1.05, petalWidth * 1.0, growth, 1);
        }
      }

      if (petalIndex > NUM_PETALS_TIER1 * 0.75) {
        const offsetTier3 = (Math.PI * 2) / (NUM_PETALS_TIER3 * 2);
        const tier3Progress = petalIndex - NUM_PETALS_TIER1 * 0.75;
        const tier3Drawn = Math.min(NUM_PETALS_TIER3, Math.floor(tier3Progress));
        for (let i = 0; i < tier3Drawn; i++) {
          const angle = (i * (Math.PI * 2)) / NUM_PETALS_TIER3 + offsetTier3;
          const growth = Math.min(1, Math.max(0, tier3Progress - i));
          drawPetal(angle, petalLength * 1.15, petalWidth * 0.95, growth, 2);
        }
      }

      for (let n = 0; n < seedsDrawn; n++) {
        drawSeed(n, seedsDrawn);
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initParticles, onBloomComplete, replayTrigger]);

  return (
    <div
      ref={containerRef}
      id="sunflower-canvas-wrapper"
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        id="sunflower-canvas"
        className="block w-full h-full"
      />
    </div>
  );
};
