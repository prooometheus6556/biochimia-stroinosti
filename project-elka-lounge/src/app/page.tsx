"use client";

import AgeGate from "@/components/AgeGate";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <AgeGate />
      <div className="fixed inset-0 z-[-1] bg-surface opacity-[0.02] pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}} />
      
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-3xl flex items-center px-6 h-16 justify-center">
        <div className="text-2xl font-black tracking-tighter text-on-surface">ЁЛКА</div>
      </header>

      <main className="min-h-screen pt-24 px-6 pb-32">
        <section className="mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/30 text-on-primary-container text-xs font-bold tracking-widest uppercase mb-4">
            LOUNGE BAR
          </div>
          <h1 className="text-[3.5rem] leading-[0.95] font-extrabold tracking-tight mb-6">
            Лучшие <span className="text-primary-fixed drop-shadow-[0_0_15px_rgba(159,251,0,0.4)]">вечера</span> в городе
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-[85%]">
            Премиальная кухня, lounge атмосфера и удобное онлайн-бронирование
          </p>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <Link href="/booking" className="col-span-1 row-span-2 group relative overflow-hidden mint-glow-bg rounded-xl neon-glow-card active:scale-95 transition-transform duration-300">
            <div className="relative z-10 p-6 flex flex-col h-full justify-between min-h-[280px]">
              <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-on-primary-fixed" style={{fontVariationSettings: "'FILL' 1"}}>calendar_today</span>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Бронирование</h3>
                <p className="text-xs text-on-surface-variant font-medium">Ваш стол ждет</p>
              </div>
            </div>
          </Link>

          <Link href="/menu" className="col-span-1 group relative overflow-hidden mint-glow-bg rounded-xl neon-glow-card active:scale-95 transition-transform duration-300">
            <div className="p-6 flex flex-col justify-between min-h-[160px]">
              <div className="w-10 h-10 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed" style={{fontVariationSettings: "'FILL' 1"}}>restaurant_menu</span>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Меню</h3>
              </div>
            </div>
          </Link>

          <div className="col-span-1 group relative overflow-hidden mint-glow-bg rounded-xl neon-glow-card active:scale-95 transition-transform duration-300 cursor-pointer">
            <div className="p-6 flex flex-col justify-between min-h-[160px]">
              <div className="w-10 h-10 rounded-full bg-primary-fixed/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary-fixed" style={{fontVariationSettings: "'FILL' 1"}}>shopping_bag</span>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Заказ</h3>
              </div>
            </div>
          </div>

          <Link href="/contacts" className="col-span-2 group relative overflow-hidden mint-glow-bg rounded-xl neon-glow-card active:scale-95 transition-transform duration-300">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface" style={{fontVariationSettings: "'FILL' 1"}}>explore</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">Контакты</h3>
                  <p className="text-sm text-zinc-500">Найти нас на карте</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary-fixed">arrow_forward_ios</span>
            </div>
          </Link>
        </section>
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md rounded-[3rem] z-50 bg-white/40 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex justify-around items-center h-20 px-8">
        <Link href="/" className="flex flex-col items-center justify-center text-primary-fixed drop-shadow-[0_0_8px_rgba(159,251,0,0.5)] active:scale-90 transition-transform duration-300">
          <span className="material-symbols-outlined text-2xl" style={{fontVariationSettings: "'FILL' 1"}}>home_max</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Главная</span>
        </Link>
        <Link href="/booking" className="flex flex-col items-center justify-center text-zinc-400 hover:text-primary-fixed transition-colors active:scale-90 transition-transform duration-300">
          <span className="material-symbols-outlined text-2xl">event_seat</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Бронь</span>
        </Link>
        <Link href="/menu" className="flex flex-col items-center justify-center text-zinc-400 hover:text-primary-fixed transition-colors active:scale-90 transition-transform duration-300">
          <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Меню</span>
        </Link>
        <Link href="/contacts" className="flex flex-col items-center justify-center text-zinc-400 hover:text-primary-fixed transition-colors active:scale-90 transition-transform duration-300">
          <span className="material-symbols-outlined text-2xl">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Контакты</span>
        </Link>
      </nav>
    </>
  );
}
