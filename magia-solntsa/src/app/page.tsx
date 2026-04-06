"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import ServiceSelect from "@/components/ServiceSelect";
import TimeSelect from "@/components/TimeSelect";
import BoothSelect from "@/components/BoothSelect";
import ConfirmBooking from "@/components/ConfirmBooking";
import SuccessScreen from "@/components/SuccessScreen";

export default function Home() {
  const [step, setStep] = useState(0); // 0=home, 1=time, 2=booth, 3=confirm, 4=success
  const [service, setService] = useState<string | null>(null);
  const [servicePrice, setServicePrice] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedBooth, setSelectedBooth] = useState<string | null>(null);
  const [boothName, setBoothName] = useState<string | null>(null);

  const handleServiceSelect = (
    id: string,
    title: string,
    price: string,
  ) => {
    setService(title);
    setServicePrice(price);
    setStep(1);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedTime === time) {
      setStep(2);
    }
  };

  const handleBoothSelect = (id: string, name: string) => {
    setSelectedBooth(id);
    setBoothName(name);
    if (selectedBooth === id) {
      setStep(3);
    }
  };

  const handleConfirm = () => {
    setStep(4);
  };

  const handleReset = () => {
    setStep(0);
    setService(null);
    setServicePrice(null);
    setSelectedTime(null);
    setSelectedBooth(null);
    setBoothName(null);
  };

  return (
    <div className="min-h-screen pb-24">
      <TopNav />

      <main className="pt-16">
        {step === 0 && (
          <>
            {/* Hero Section */}
            <section className="relative h-[65vh] min-h-[500px] w-full overflow-hidden flex items-end">
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-amber-200 via-orange-200 to-amber-300">
                {/* Decorative sun circles */}
                <div className="absolute top-20 right-10 w-40 h-40 bg-primary-fixed-dim/40 rounded-full blur-3xl" />
                <div className="absolute bottom-40 left-5 w-32 h-32 bg-secondary-container/30 rounded-full blur-2xl" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-60 h-60 bg-primary-container/20 rounded-full blur-3xl" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent z-[1]" />
              <div className="relative z-10 p-8 pb-16 w-full">
                <h1 className="font-headline text-5xl font-bold text-surface leading-tight tracking-tight max-w-[280px] drop-shadow-md">
                  Магия Солнца
                </h1>
                <p className="font-body text-surface/90 text-lg mt-3 max-w-[300px]">
                  Онлайн-запись на загар
                </p>
                <p className="font-body text-surface/70 text-sm mt-1 max-w-[300px]">
                  Окунитесь в роскошь солнечного сияния.
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => {
                      document
                        .getElementById("services-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-gradient-to-br from-primary to-secondary-container text-on-primary px-10 py-4 rounded-xl font-bold shadow-[0_10px_20px_rgba(129,85,18,0.2)] active:scale-95 duration-200 uppercase tracking-wider text-sm"
                  >
                    ЗАПИСАТЬСЯ
                  </button>
                </div>
              </div>
            </section>

            {/* Promotions */}
            <section className="mt-10 px-6">
              <h2 className="font-headline text-2xl font-bold text-on-surface-variant mb-6">
                Эксклюзивные предложения
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 relative h-36 rounded-xl overflow-hidden bg-primary-container/20 p-6 flex flex-col justify-center">
                  <div className="absolute right-4 top-4 opacity-20">
                    <span
                      className="material-symbols-outlined text-6xl text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      brightness_7
                    </span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
                    Абонемент
                  </span>
                  <h3 className="font-headline text-xl font-bold text-on-primary-container max-w-[200px]">
                    Летний абонемент: Безлимит за 7500₽
                  </h3>
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        handleServiceSelect(
                          "subscription",
                          "Абонемент",
                          "7500₽",
                        )
                      }
                      className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase"
                    >
                      Получить
                    </button>
                  </div>
                </div>
                <div className="bg-secondary-container/10 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="material-symbols-outlined text-secondary">
                      group
                    </span>
                    <h3 className="font-headline font-bold text-on-secondary-container mt-2">
                      Скидка для друзей
                    </h3>
                  </div>
                  <p className="text-xs text-on-secondary-container/70 mt-2">
                    25% на совместное посещение.
                  </p>
                </div>
                <div className="bg-tertiary-container/10 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="material-symbols-outlined text-tertiary">
                      star
                    </span>
                    <h3 className="font-headline font-bold text-on-tertiary-container mt-2">
                      Первый визит
                    </h3>
                  </div>
                  <p className="text-xs text-on-tertiary-container/70 mt-2">
                    Бесплатный анализ кожи для новых гостей.
                  </p>
                </div>
              </div>
            </section>

            {/* Quote section */}
            <section className="mt-12 px-6">
              <div className="relative overflow-hidden rounded-xl bg-surface-container-high p-8 text-center">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-fixed-dim/20 rounded-full blur-2xl" />
                <h2 className="font-headline italic text-2xl text-amber-900 relative z-10">
                  &ldquo;Золотой час в любое время, когда вы этого пожелаете.&rdquo;
                </h2>
                <p className="mt-3 font-body text-xs uppercase tracking-widest text-primary-container font-bold relative z-10">
                  Философия студии
                </p>
              </div>
            </section>

            {/* Services */}
            <div id="services-section">
              <ServiceSelect
                onSelect={handleServiceSelect}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <TimeSelect
            selected={selectedTime}
            onSelect={handleTimeSelect}
            onBack={() => setStep(0)}
          />
        )}

        {step === 2 && (
          <BoothSelect
            selected={selectedBooth}
            onSelect={handleBoothSelect}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && service && servicePrice && selectedTime && boothName && (
          <ConfirmBooking
            service={service}
            servicePrice={servicePrice}
            time={selectedTime}
            booth={boothName}
            onConfirm={handleConfirm}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && service && selectedTime && boothName && (
          <SuccessScreen
            service={service}
            time={selectedTime}
            booth={boothName}
            onReset={handleReset}
          />
        )}
      </main>

      <BottomNav active={step === 0 ? "home" : "booking"} />
    </div>
  );
}
