import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SunflowerCanvas } from './SunflowerCanvas';
import { Volume2, VolumeX, RotateCcw, Share2, Check, Copy } from 'lucide-react';
import { isAudioEnabled, setAudioEnabled } from '../utils/audio';
import katex from 'katex';

interface GardenScreenProps {
  userName: string;
  senderName?: string;
  onReset: () => void;
}

export const GardenScreen: React.FC<GardenScreenProps> = ({
  userName,
  senderName,
  onReset,
}) => {
  const [audioOn, setAudioOn] = useState(isAudioEnabled());
  const [bloomProgress, setBloomProgress] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const isFullyBloomed = bloomProgress >= 0.98;

  const vogelEquationHtml = useMemo(() => {
    try {
      return katex.renderToString(
        String.raw`\begin{cases} r_n = c \sqrt{n} \\ \theta_n = n \cdot 137.508^\circ \end{cases}`,
        { displayMode: true, throwOnError: false }
      );
    } catch {
      return '';
    }
  }, []);

  const goldenRatioHtml = useMemo(() => {
    try {
      return katex.renderToString(
        String.raw`\varphi = \frac{1+\sqrt{5}}{2} \quad \Big|\quad n \in [1, 420]`,
        { displayMode: false, throwOnError: false }
      );
    } catch {
      return '';
    }
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !audioOn;
    setAudioOn(nextState);
    setAudioEnabled(nextState);
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBloomProgress(0);
    setTapCount(0);
    setReplayKey((k) => k + 1);
  };

  const getGiftUrl = (surpriseMode: boolean = false) => {
    try {
      const url = new URL(window.location.origin + '/gift');
      if (!surpriseMode && userName) {
        url.searchParams.set('para', userName);
      }
      if (senderName) {
        url.searchParams.set('de', senderName);
      }
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const giftUrl = getGiftUrl();
    const shareText = senderName
      ? `🌻 ¡Feliz Primavera, ${userName}! Te envié este regalo de flores amarillas para iluminar tu temporada.`
      : `🌻 ¡Feliz Primavera, ${userName}! Te regalo un girasol que florece con el tacto de tus manos.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `¡Feliz Día de la Primavera!`,
          text: shareText,
          url: giftUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${giftUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {}
  };

  const handleInteractionTap = useCallback(() => {
    setTapCount((prev) => prev + 1);
    setBloomProgress((prev) => {
      if (prev >= 1) return 1;
      if (prev === 0) return 0.10;
      return Math.min(1, prev + 0.10);
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    handleInteractionTap();
  };

  return (
    <motion.div
      id="garden-screen"
      onPointerDown={handlePointerDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="relative z-20 flex flex-col justify-between w-full h-[100dvh] max-w-lg mx-auto overflow-hidden select-none cursor-pointer"
    >
      <header className="relative z-30 flex items-center justify-between px-5 sm:px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        <button
          id="toggle-audio-button"
          onClick={toggleSound}
          aria-label={audioOn ? 'Silenciar música' : 'Activar música'}
          className="p-2 text-amber-300/80 hover:text-amber-100 transition-colors active:scale-90"
        >
          {audioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-stone-500" />}
        </button>

        <span className="font-serif-display italic text-amber-200/50 text-xs tracking-widest uppercase">
          21 de septiembre
        </span>

        <div className="flex items-center gap-1">
          <button
            id="replay-bloom-button"
            onClick={handleReplay}
            title="Volver a florecer"
            aria-label="Volver a florecer"
            className="p-2 text-amber-300/80 hover:text-amber-100 transition-colors active:scale-90"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            id="share-gift-button"
            onClick={handleShare}
            title="Compartir enlace de este regalo"
            aria-label="Compartir enlace de este regalo"
            className="p-2 text-amber-300/80 hover:text-amber-100 transition-colors active:scale-90 flex items-center gap-1"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="relative z-30 min-h-[72px] flex items-center justify-center text-center px-6 pt-1 pointer-events-none">
        <AnimatePresence mode="wait">
          {isFullyBloomed ? (
            <motion.div
              key="bloomed-greeting"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-serif-display text-3xl sm:text-4xl text-amber-100 font-semibold tracking-wide drop-shadow-[0_2px_14px_rgba(250,204,21,0.25)]">
                ¡Feliz Primavera,{' '}
                <span className="shimmer-text block sm:inline font-bold">
                  {userName}!
                </span>
              </h2>
              {senderName && (
                <p className="font-serif-display italic text-amber-300/90 text-sm mt-0.5">
                  De parte de {senderName}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="waiting-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <p className="font-serif-display italic text-amber-200/50 text-sm sm:text-base tracking-wider">
                Haz florecer el girasol para descubrir tu mensaje...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex-1 w-full my-auto flex items-center justify-center">
        <SunflowerCanvas
          progress={bloomProgress}
          replayTrigger={replayKey}
        />

        <AnimatePresence>
          {tapCount === 0 && (
            <motion.div
              key="math-formula-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.12, filter: 'blur(8px)' }}
              transition={{ duration: 0.55 }}
              className="absolute z-20 pointer-events-none flex flex-col items-center justify-center text-center px-4"
            >
              <div className="relative overflow-hidden px-4 sm:px-6 py-4 sm:py-5 rounded-3xl bg-[#07130a]/92 backdrop-blur-md border border-amber-500/35 shadow-[0_0_40px_rgba(250,204,21,0.2)] flex flex-col items-center gap-2 max-w-[325px] w-full">
                <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none stroke-amber-400">
                  <circle cx="130" cy="130" r="38" fill="none" strokeWidth="0.8" strokeDasharray="3 3" />
                  <circle cx="130" cy="130" r="76" fill="none" strokeWidth="0.8" strokeDasharray="4 4" />
                  <circle cx="130" cy="130" r="114" fill="none" strokeWidth="0.9" />
                  <line x1="16" y1="130" x2="244" y2="130" strokeWidth="0.7" strokeDasharray="3 3" />
                  <line x1="130" y1="16" x2="130" y2="244" strokeWidth="0.7" strokeDasharray="3 3" />
                  <line x1="130" y1="130" x2="48" y2="218" strokeWidth="1.5" stroke="#facc15" />
                  <path d="M 160 130 A 30 30 0 0 1 108 151" fill="none" strokeWidth="1.2" stroke="#fbbf24" strokeDasharray="2 2" />
                  <text x="165" y="125" fill="#fde047" fontSize="8" fontFamily="monospace" stroke="none">0°</text>
                  <text x="134" y="28" fill="#fde047" fontSize="8" fontFamily="monospace" stroke="none">90°</text>
                  <text x="32" y="234" fill="#facc15" fontSize="8" fontFamily="monospace" fontWeight="bold" stroke="none">θ≈137.5°</text>
                  <text x="232" y="142" fill="#fde047" fontSize="8" fontFamily="monospace" stroke="none">r</text>
                </svg>

                <div className="relative z-10 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono tracking-widest text-amber-300/80 uppercase">
                  <span>FILOTAXIS ÁUREA</span>
                  <span>•</span>
                  <span>MODELO DE VOGEL (1979)</span>
                </div>

                <div 
                  className="relative z-10 my-1 text-amber-100 [&_.katex]:text-amber-100 [&_.katex-display]:my-0 text-lg sm:text-2xl drop-shadow-[0_2px_12px_rgba(250,204,21,0.25)] select-none"
                  dangerouslySetInnerHTML={{ __html: vogelEquationHtml }}
                />

                <div 
                  className="relative z-10 border-t border-amber-500/25 pt-2 sm:pt-2.5 w-full text-center text-amber-300/85 text-[11px] sm:text-xs [&_.katex]:text-amber-300/85 select-none"
                  dangerouslySetInnerHTML={{ __html: goldenRatioHtml }}
                />

                <span className="relative z-10 text-[10px] sm:text-[11px] font-sans-ui text-amber-200/60 tracking-wider pt-0.5">
                  Toca la pantalla para resolver y florecer
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="relative z-30 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-2 px-5 sm:px-6 flex flex-col items-center gap-2">
        <div className="text-center transition-all duration-300 pointer-events-none">
          {!isFullyBloomed && (
            <div className="flex flex-col items-center gap-1.5">
              <p className="font-serif-display text-base text-amber-200/90 tracking-wide">
                Toca la pantalla para hacerla florecer
              </p>
              {tapCount > 0 && (
                <div className="w-24 h-0.5 bg-amber-950/60 rounded-full overflow-hidden mt-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300 ease-out"
                    style={{ width: `${Math.round(bloomProgress * 100)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {copied && (
          <div className="text-xs text-amber-200 font-sans-ui bg-stone-900/95 px-3.5 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-2 shadow-xl">
            <Copy className="w-3.5 h-3.5 text-yellow-400" />
            <span>¡Enlace personalizado para {userName} copiado!</span>
          </div>
        )}

        <div className="flex items-center gap-4 mt-2">
          <button
            id="share-link-pill-button"
            onClick={handleShare}
            className="text-[11px] text-amber-300/80 hover:text-amber-200 transition-colors uppercase tracking-widest font-sans-ui"
          >
            Copiar enlace para {userName}
          </button>
          <span className="text-amber-500/30 text-xs">•</span>
          <button
            id="change-name-button"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            className="text-[11px] text-amber-200/40 hover:text-amber-200/80 transition-colors uppercase tracking-widest font-sans-ui"
          >
            Dedicar a otra persona
          </button>
        </div>

        <div className="mt-2 font-sans-ui">
          <a
            href="https://quintana.dev.ar"
            rel="noopener noreferrer"
            target="_blank"
            style={{ textDecoration: 'none' }}
            className="hover:opacity-85 transition-opacity inline-block"
          >
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              quintana<span style={{ color: '#9f25f0' }}>.dev</span>
            </div>
          </a>
        </div>
      </footer>
    </motion.div>
  );
};
