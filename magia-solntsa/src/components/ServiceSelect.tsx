"use client";

import { SERVICES } from "@/store/booking";

interface ServiceSelectProps {
  onSelect: (id: string, title: string, price: string, duration: string) => void;
}

export default function ServiceSelect({ onSelect }: ServiceSelectProps) {
  return (
    <section className="mt-6">
      <div className="px-6 mb-6">
        <h2 className="font-headline text-2xl font-bold text-on-surface-variant">
          Выберите услугу
        </h2>
        <p className="text-on-surface-variant/70 text-sm mt-1">
          Подберите идеальный сеанс для вашей кожи
        </p>
      </div>
      <div className="px-6 grid grid-cols-1 gap-4">
        {SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() =>
              onSelect(service.id, service.title, service.price, service.duration)
            }
            className="bg-surface-container-low rounded-xl p-5 flex items-start gap-4 text-left transition-all active:scale-[0.98] hover:bg-surface-container-high editorial-shadow group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-container/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">
                {service.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-headline text-lg font-bold text-primary">
                  {service.title}
                </h3>
                <span className="font-bold text-on-surface text-lg ml-2 flex-shrink-0">
                  {service.price}
                </span>
              </div>
              <p className="text-on-surface-variant/80 text-sm mt-1">
                {service.description}
              </p>
              <div className="mt-3 flex items-center text-xs font-bold text-secondary uppercase tracking-tighter">
                <span className="material-symbols-outlined text-sm mr-1">
                  schedule
                </span>
                {service.duration}
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
