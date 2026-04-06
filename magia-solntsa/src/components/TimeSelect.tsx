"use client";

import { TIME_SLOTS } from "@/store/booking";

interface TimeSelectProps {
  selected: string | null;
  onSelect: (time: string) => void;
  onBack: () => void;
}

export default function TimeSelect({ selected, onSelect, onBack }: TimeSelectProps) {
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
        Выберите время
      </h2>
      <p className="text-on-surface-variant/70 text-sm mb-8">
        Доступные слоты на сегодня
      </p>

      <div className="grid grid-cols-2 gap-4">
        {TIME_SLOTS.map((time) => (
          <button
            key={time}
            onClick={() => onSelect(time)}
            className={`h-24 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 ${
              selected === time
                ? "bg-gradient-to-br from-primary to-secondary-container text-white shadow-lg"
                : "bg-surface-container-lowest border border-outline-variant/10 shadow-sm text-on-surface-variant"
            }`}
          >
            <span className="text-2xl font-bold tracking-tight">{time}</span>
            <span
              className={`text-[10px] font-medium mt-1 uppercase tracking-wider ${
                selected === time ? "text-white/80" : "text-on-surface-variant/60"
              }`}
            >
              свободно
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-8">
          <button
            onClick={() => onSelect(selected)}
            className="w-full h-14 rounded-full bg-gradient-to-br from-primary to-secondary-container text-white font-headline font-bold text-lg shadow-[0_10px_30px_rgba(129,85,18,0.2)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            Далее
            <span className="material-symbols-outlined">arrow_forward_ios</span>
          </button>
        </div>
      )}
    </section>
  );
}
