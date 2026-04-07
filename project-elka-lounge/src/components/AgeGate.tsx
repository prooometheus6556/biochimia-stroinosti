"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AgeGate() {
  const [isAdult, setIsAdult] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("is_adult");
    if (stored !== null) {
      setIsAdult(stored === "true");
    }
  }, []);

  const handleConfirm = () => {
    localStorage.setItem("is_adult", "true");
    setIsAdult(true);
  };

  const handleDeny = () => {
    setIsAdult(false);
  };

  if (isAdult === true) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="space-y-4">
          <div className="relative w-[180px] h-[180px] mx-auto rounded-full overflow-hidden shadow-[0_0_40px_rgba(159,251,0,0.3)]">
            <Image
              src="/logo.jpg"
              alt="Elka Lounge Logo"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface">ЁЛКА LOUNGE</h1>
          <p className="text-lg text-on-surface-variant">Вам уже есть 18 лет?</p>
        </div>

        {isAdult === false ? (
          <div className="bg-error-container text-on-error-container rounded-xl p-6">
            <p className="text-lg">
              Извините, вход только для совершеннолетних
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleConfirm}
              className="w-full py-5 px-6 bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-bold text-lg rounded-xl transition-all shadow-lg shadow-primary-fixed/30 active:scale-95"
            >
              Да, мне есть 18
            </button>
            <button
              onClick={handleDeny}
              className="w-full py-5 px-6 bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-medium text-lg rounded-xl transition-colors"
            >
              Нет
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
