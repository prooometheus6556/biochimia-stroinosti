"use client";

import { BOOTHS, BoothStatus } from "@/store/booking";

interface BoothSelectProps {
  selected: string | null;
  onSelect: (id: string, name: string) => void;
  onBack: () => void;
}

const statusConfig: Record<BoothStatus, { label: string; color: string; bg: string }> = {
  free: { label: "Свободна", color: "text-green-700", bg: "bg-green-100" },
  busy: { label: "Занята", color: "text-red-700", bg: "bg-red-100" },
  soon: { label: "Скоро освободится", color: "text-amber-700", bg: "bg-amber-100" },
};

export default function BoothSelect({ selected, onSelect, onBack }: BoothSelectProps) {
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
        Выберите кабинку
      </h2>
      <p className="text-on-surface-variant/70 text-sm mb-8">
        Доступность кабинок в реальном времени
      </p>

      <div className="grid grid-cols-2 gap-4">
        {BOOTHS.map((booth) => {
          const status = statusConfig[booth.status];
          const isBusy = booth.status === "busy";
          const isSelected = selected === booth.id;

          return (
            <button
              key={booth.id}
              disabled={isBusy}
              onClick={() => onSelect(booth.id, booth.name)}
              className={`rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all active:scale-95 min-h-[140px] ${
                isBusy
                  ? "bg-surface-dim/50 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "bg-gradient-to-br from-primary to-secondary-container text-white shadow-lg"
                  : "bg-surface-container-lowest border border-outline-variant/10 shadow-sm"
              }`}
            >
              <span
                className={`material-symbols-outlined text-3xl mb-2 ${
                  isSelected ? "text-white" : "text-primary"
                }`}
                style={
                  booth.id === "booth-premium"
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {booth.id === "booth-premium" ? "auto_awesome" : "door_open"}
              </span>
              <h3
                className={`font-headline font-bold text-base ${
                  isSelected ? "text-white" : "text-on-surface"
                }`}
              >
                {booth.name}
              </h3>
              <p
                className={`text-[11px] mt-1 ${
                  isSelected ? "text-white/70" : "text-on-surface-variant/70"
                }`}
              >
                {booth.type}
              </p>
              <span
                className={`mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : `${status.bg} ${status.color}`
                }`}
              >
                {status.label}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-8">
          <button
            onClick={() => {
              const booth = BOOTHS.find((b) => b.id === selected);
              if (booth) onSelect(booth.id, booth.name);
            }}
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
