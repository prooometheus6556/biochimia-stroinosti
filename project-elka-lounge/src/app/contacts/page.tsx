import Link from "next/link";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-graphite-base p-6">
      <Link 
        href="/" 
        className="inline-flex items-center text-on-surface-variant hover:text-primary-fixed mb-6 transition-colors"
      >
        <span className="material-symbols-outlined mr-2 text-xl">arrow_back</span>
        На главную
      </Link>

      <h1 className="text-3xl font-bold text-on-surface mb-8">Контакты</h1>

      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 p-5 bg-graphite-card rounded-2xl border border-graphite-border">
          <div className="w-12 h-12 bg-primary-fixed/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-primary-fixed" />
          </div>
          <div>
            <h3 className="text-on-surface font-semibold mb-1">Адрес</h3>
            <p className="text-on-surface">г. Новосибирск</p>
            <p className="text-on-surface font-medium">Красный проспект, 182/1</p>
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-primary-fixed/20 rounded-full">
              <span className="text-primary-fixed font-bold text-sm">12 этаж</span>
              <span className="text-primary-fixed text-sm">— rooftop-локация</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-graphite-card rounded-2xl border border-graphite-border">
          <div className="w-12 h-12 bg-primary-fixed/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-primary-fixed" />
          </div>
          <div>
            <h3 className="text-on-surface font-semibold mb-1">Режим работы</h3>
            <p className="text-on-surface-variant">Ежедневно с 12:00 до 02:00</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-5 bg-graphite-card rounded-2xl border border-graphite-border">
          <div className="w-12 h-12 bg-primary-fixed/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-primary-fixed" />
          </div>
          <div>
            <h3 className="text-on-surface font-semibold mb-1">Телефон</h3>
            <p className="text-primary-fixed font-bold text-lg">+7 (999) 999-99-99</p>
            <p className="text-on-surface-variant text-sm mt-1">Звоните для бронирования</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">Как нас найти</h2>
        
        <div className="rounded-2xl overflow-hidden border border-graphite-border">
          <iframe 
            src="https://yandex.ru/map-widget/v1/?um=constructor%3A44.0469%2C82.9237&amp;source=constructor&ll=82.9237,44.0469&z=16&pt=82.9237,44.0469,pm2blm"
            width="100%" 
            height="280" 
            frameBorder="0"
            className="w-full grayscale-[80%] contrast-110"
            title="Карта — Новосибирск, Красный проспект 182/1"
          />
        </div>

        <a 
          href="https://2gis.ru/novosibirsk/search/Красный%20проспект%20182%2F1"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-graphite-card rounded-2xl border-2 border-primary-fixed text-primary-fixed font-bold text-lg transition-all hover:bg-primary-fixed hover:text-on-primary-fixed active:scale-[0.98]"
        >
          <Navigation className="w-5 h-5" />
          Проложить маршрут в 2ГИС
        </a>
      </div>
    </div>
  );
}
