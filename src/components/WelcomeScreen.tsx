import React, { useState } from 'react';
import { motion } from 'motion/react';
import { formatName } from '../utils/text';

interface WelcomeScreenProps {
  initialName?: string;
  senderName?: string;
  onStart: (recipientName: string, senderName?: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  initialName = '',
  senderName: initialSender = '',
  onStart,
}) => {
  const [name, setName] = useState(formatName(initialName));
  const [sender, setSender] = useState(formatName(initialSender));
  const [showSenderField, setShowSenderField] = useState(Boolean(initialSender));
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRecipient = formatName(name);
    if (!cleanRecipient) {
      setError(true);
      return;
    }
    const cleanSender = sender.trim() ? formatName(sender) : undefined;
    onStart(cleanRecipient, cleanSender);
  };

  return (
    <motion.div
      id="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-30 flex flex-col items-center justify-between w-full h-[100dvh] max-w-md mx-auto px-5 sm:px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] select-none overflow-hidden"
    >
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-emerald-600/10 blur-[80px] pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex flex-col items-center text-center pt-2"
      >
        <span className="font-serif-display italic text-amber-300/80 text-sm tracking-widest mb-1.5">
          Día de la Primavera
        </span>
        <h1 className="font-serif-display text-4xl sm:text-5xl text-amber-100 font-normal tracking-wide leading-tight">
          Flores <span className="italic text-yellow-300 font-semibold">Amarillas</span>
        </h1>
        <p className="font-serif-display italic text-amber-200/70 text-base mt-2 max-w-[280px]">
          Una flor matemática que despierta al tacto de tus manos.
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.9 }}
        className="relative my-auto flex items-center justify-center"
      >
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl animate-pulse" />
          <svg viewBox="0 0 100 100" className="w-24 h-24 filter drop-shadow-[0_0_16px_rgba(250,204,21,0.5)]">
            {Array.from({ length: 12 }).map((_, i) => (
              <ellipse
                key={i}
                cx="50"
                cy="22"
                rx="7"
                ry="18"
                fill="#facc15"
                opacity="0.88"
                transform={`rotate(${i * 30} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="16" fill="#78350f" />
            <circle cx="50" cy="50" r="10" fill="#451a03" />
            <circle cx="48" cy="48" r="3.5" fill="#fde047" opacity="0.9" />
          </svg>
        </div>
      </motion.div>

      <motion.form
        id="name-input-form"
        onSubmit={handleSubmit}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.8 }}
        className="w-full flex flex-col items-center gap-3.5 pb-2"
      >
        <div className="w-full">
          <label
            htmlFor="user-name-input"
            className="block text-center text-xs tracking-wider text-amber-200/70 uppercase font-sans-ui mb-2"
          >
            ¿Para quién es este regalo?
          </label>
          <div className="relative">
            <input
              id="user-name-input"
              type="text"
              autoFocus
              maxLength={30}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              onBlur={() => {
                if (name.trim()) setName(formatName(name));
              }}
              autoCapitalize="words"
              placeholder="¿Cuál es tu nombre?"
              className={`w-full px-5 py-3.5 text-center text-lg font-serif-display tracking-wide rounded-2xl bg-[#09150b]/90 border text-amber-100 placeholder:text-amber-100/30 placeholder:font-sans-ui placeholder:text-sm focus:outline-none transition-all duration-300 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] ${
                error
                  ? 'border-red-400/80 shadow-[0_0_15px_rgba(248,113,113,0.3)]'
                  : 'border-amber-500/35 focus:border-amber-400 focus:shadow-[0_0_20px_rgba(250,204,21,0.25)]'
              }`}
            />
            {error && (
              <p className="text-center text-xs text-amber-300/90 mt-1.5 font-sans-ui">
                Por favor, escribe un nombre para continuar.
              </p>
            )}
          </div>
        </div>

        {showSenderField ? (
          <div className="w-full">
            <label
              htmlFor="sender-name-input"
              className="block text-center text-[11px] tracking-wider text-amber-200/60 uppercase font-sans-ui mb-1.5"
            >
              ¿Quién lo envía? (Opcional)
            </label>
            <input
              id="sender-name-input"
              type="text"
              maxLength={30}
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              onBlur={() => {
                if (sender.trim()) setSender(formatName(sender));
              }}
              autoCapitalize="words"
              placeholder="Tu nombre (ej. Ramiro)"
              className="w-full px-4 py-2.5 text-center text-base font-serif-display tracking-wide rounded-xl bg-[#09150b]/80 border border-amber-500/25 text-amber-100 placeholder:text-amber-100/25 placeholder:font-sans-ui placeholder:text-xs focus:outline-none focus:border-amber-400 transition-all duration-200 shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSenderField(true)}
            className="text-[11px] text-amber-300/60 hover:text-amber-300 transition-colors uppercase tracking-widest font-sans-ui"
          >
            + Añadir quién lo envía (de parte de...)
          </button>
        )}

        <button
          id="submit-gift-button"
          type="submit"
          className="w-full relative group overflow-hidden py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-semibold font-sans-ui tracking-wide text-base shadow-[0_4px_25px_rgba(234,179,8,0.4)] active:scale-[0.98] transition-transform duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
        >
          <span className="relative z-10 font-medium">Ver mi regalo</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        </button>

        <div className="font-sans-ui pt-2">
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
      </motion.form>
    </motion.div>
  );
};
