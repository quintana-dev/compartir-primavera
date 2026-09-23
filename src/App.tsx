import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MysteryGiftScreen } from './components/MysteryGiftScreen';
import { GardenScreen } from './components/GardenScreen';
import { TouchFlowerBurst } from './components/TouchFlowerBurst';
import { formatName } from './utils/text';

export default function App() {
  const [screen, setScreen] = useState<'welcome' | 'garden'>('welcome');
  const [userName, setUserName] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [isGiftRoute, setIsGiftRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase().startsWith('/gift');
    }
    return false;
  });

  useEffect(() => {
    try {
      const isGift = window.location.pathname.toLowerCase().startsWith('/gift');
      setIsGiftRoute(isGift);

      const params = new URLSearchParams(window.location.search);
      const recipientParam =
        params.get('para') ||
        params.get('name') ||
        params.get('nombre') ||
        params.get('to');

      const senderParam =
        params.get('de') ||
        params.get('from') ||
        params.get('remitente');

      if (senderParam && senderParam.trim()) {
        setSenderName(formatName(senderParam.trim()));
      }

      if (recipientParam && recipientParam.trim()) {
        const cleanRecipient = formatName(recipientParam.trim());
        setUserName(cleanRecipient);
        setScreen('garden');
      }
    } catch {}
  }, []);

  const handleStart = (recipient: string, sender?: string) => {
    const formattedRecipient = formatName(recipient);
    const formattedSender = sender ? formatName(sender) : '';

    setUserName(formattedRecipient);
    if (formattedSender) {
      setSenderName(formattedSender);
    }
    setScreen('garden');

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('para', formattedRecipient);
      if (formattedSender) {
        url.searchParams.set('de', formattedSender);
      }
      url.searchParams.delete('name');
      url.searchParams.delete('nombre');
      url.searchParams.delete('to');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  const handleReset = () => {
    setScreen('welcome');
    setUserName('');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('para');
      url.searchParams.delete('name');
      url.searchParams.delete('nombre');
      url.searchParams.delete('to');
      window.history.replaceState({}, '', url.toString());
    } catch {}
  };

  return (
    <main
      id="spring-yellow-flowers-app"
      className="relative w-full h-[100dvh] overflow-hidden bg-[#050b06] text-amber-50"
    >
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, #0d2818 0%, #050b06 70%, #020603 100%)',
        }}
        aria-hidden="true"
      />

      <TouchFlowerBurst />

      <AnimatePresence mode="wait">
        {screen === 'welcome' ? (
          isGiftRoute ? (
            <MysteryGiftScreen
              key="mystery-gift"
              senderName={senderName}
              onStart={handleStart}
            />
          ) : (
            <WelcomeScreen
              key="welcome"
              initialName={userName}
              senderName={senderName}
              onStart={handleStart}
            />
          )
        ) : (
          <GardenScreen
            key="garden"
            userName={userName}
            senderName={senderName}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
