'use client'

import { useEffect, useRef, useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Получите гайд',
    description: 'Скачайте PDF с пошаговой инструкцией и практическими рекомендациями для запуска метаболизма.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Примените знания',
    description: 'Начните с простых шагов: уберете скрытые сахара, стабилизируете инсулин, восстановите метаболическую гибкость.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.432-5.432a4.683 4.683 0 016.252-6.33l.484.484a6 6 0 01-6.252 6.33l-.484-.484a4.683 4.683 0 01-1.32-4.774l.816-.816a4.683 4.683 0 014.774 1.32l.816.816a4.683 4.683 0 01-1.32 4.774z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.54 8.46a4.683 4.683 0 00-4.774 1.32l-.816.816a4.683 4.683 0 001.32 4.774l.484.484a6 6 0 006.252-6.33l-.484-.484a4.683 4.683 0 00-4.774-1.32l-.484.484z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Достигните результата',
    description: 'Похудейте без голода и срывов. Получите устойчивый результат и новый уровень энергии.',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-warm-100 to-pearl" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-gold/10 via-transparent to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-3xl mx-auto text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
            <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-accent-dark">Как это работает</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Три простых шага к результату
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Никаких сложных диет и изнуряющих тренировок
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="relative bg-white rounded-3xl p-10 h-full text-center shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 border border-warm-200/30 group">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-glow-gold flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{step.number}</span>
                </div>

                <div className="relative inline-flex mt-4 mb-8">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 flex items-center justify-center text-accent-dark group-hover:from-accent group-hover:to-accent-dark group-hover:text-white transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>

                <p className="text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-6 transform -translate-y-1/2 z-10">
                  <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center border-2 border-warm-200">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
