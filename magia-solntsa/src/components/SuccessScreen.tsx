"use client";

interface SuccessScreenProps {
  service: string;
  time: string;
  booth: string;
  onReset: () => void;
}

export default function SuccessScreen({
  service,
  time,
  booth,
  onReset,
}: SuccessScreenProps) {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="mt-6 px-6 flex flex-col items-center text-center min-h-[60vh] justify-center">
      {/* Sun animation */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-fixed to-primary-container flex items-center justify-center shadow-[0_0_60px_rgba(213,158,85,0.4)] animate-pulse">
          <span className="text-5xl">☀️</span>
        </div>
        <div className="absolute -inset-4 rounded-full border-2 border-primary-fixed-dim/30 animate-ping" />
      </div>

      <h1 className="font-headline text-3xl font-bold text-primary mb-2">
        Запись подтверждена ☀️
      </h1>
      <p className="text-on-surface-variant text-sm mb-10 max-w-[280px]">
        Мы с нетерпением ждём вас! Ваш идеальный загар уже близко.
      </p>

      {/* Confirmation card */}
      <div className="w-full bg-surface-container-low rounded-3xl p-6 editorial-shadow mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">spa</span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Услуга
              </p>
              <p className="font-semibold text-on-surface">{service}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">
                calendar_today
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Дата и время
              </p>
              <p className="font-semibold text-on-surface">
                {today}, {time}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">
                door_open
              </span>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                Кабинка
              </p>
              <p className="font-semibold text-on-surface">{booth}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full h-14 rounded-full border-2 border-primary text-primary font-headline font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2 hover:bg-primary hover:text-white duration-300"
      >
        <span className="material-symbols-outlined">home</span>
        На главную
      </button>
    </section>
  );
}
