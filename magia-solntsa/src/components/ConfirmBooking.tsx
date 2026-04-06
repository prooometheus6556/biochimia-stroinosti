"use client";

import { useState } from "react";

interface ConfirmBookingProps {
  service: string;
  servicePrice: string;
  time: string;
  booth: string;
  onConfirm: (name: string, phone: string) => void;
  onBack: () => void;
}

export default function ConfirmBooking({
  service,
  servicePrice,
  time,
  booth,
  onConfirm,
  onBack,
}: ConfirmBookingProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mt-6 px-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-primary font-semibold text-sm mb-6 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Назад
      </button>

      <h2 className="font-headline text-2xl font-bold text-on-surface-variant mb-2">
        Подтверждение записи
      </h2>
      <p className="text-on-surface-variant/70 text-sm mb-8">
        Проверьте детали и заполните контактные данные
      </p>

      {/* Booking summary card */}
      <div className="bg-primary/5 rounded-3xl p-6 border border-primary-container/10 mb-8">
        <h3 className="font-headline font-bold text-primary text-sm mb-4 uppercase tracking-widest">
          Детали записи
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Услуга</span>
            <span className="font-semibold text-on-surface">{service}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Дата</span>
            <span className="font-semibold text-on-surface">{today}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Время</span>
            <span className="font-semibold text-on-surface">{time}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">Кабинка</span>
            <span className="font-semibold text-on-surface">{booth}</span>
          </div>
          <div className="border-t border-outline-variant/15 pt-3 flex justify-between items-center">
            <span className="text-on-surface-variant text-sm font-medium">Итого</span>
            <span className="font-headline text-xl font-bold text-primary">
              {servicePrice}
            </span>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Ваше имя
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Елена"
            className="w-full h-14 bg-surface-container-lowest rounded-2xl px-5 border border-outline-variant/15 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
            Телефон
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 (999) 123-45-67"
            className="w-full h-14 bg-surface-container-lowest rounded-2xl px-5 border border-outline-variant/15 text-on-surface font-medium placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>

      <button
        onClick={() => onConfirm(name, phone)}
        disabled={!name.trim() || !phone.trim()}
        className="w-full h-16 rounded-full bg-gradient-to-br from-primary to-secondary-container text-white font-headline font-bold text-lg shadow-[0_10px_30px_rgba(129,85,18,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-3 disabled:opacity-40 disabled:active:scale-100"
      >
        Подтвердить запись
        <span className="material-symbols-outlined">check_circle</span>
      </button>
    </section>
  );
}
