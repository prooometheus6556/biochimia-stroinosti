'use client'

import { useEffect, useRef, useState } from 'react'

const timeline = [
  {
    year: 'Начало',
    title: '114 кг и отчаяние',
    description: 'Годы борьбы с весом, жесткие диеты, постоянные срывы и чувство безысходности. Классический путь, который не приводит к результату.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    year: 'Открытие',
    title: 'Изучение биохимии',
    description: 'Погружение в науку о метаболизме. Инсулин, кортизол, гормоны голода — как они работают и почему традиционные диеты терпят крах.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    year: 'Эксперимент',
    title: 'Новый подход',
    description: 'Вместо подсчета калорий — понимание гормонального фона. Стабилизация инсулина, устранение скрытых сахаров, восстановление метаболической гибкости.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    year: 'Результат',
    title: '-29 кг и новая жизнь',
    description: 'Потеря веса без голодания и истощения. Устойчивый результат, который сохраняется. Энергия, ясность мышления, уверенность в себе.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

export default function Story() {
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
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="story" ref={sectionRef} className="relative py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-pearl via-background to-warm-100" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-3xl mx-auto text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
            <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium text-accent-dark">Личная история</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Мой путь к трансформации
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Каждый килограмм потерян осознанно, каждый результат закреплен навсегда
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-accent/30 to-accent/10" />

          <div className="space-y-10">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`relative pl-20 lg:pl-0 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`relative ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className={`${index % 2 === 1 ? 'lg:pl-16' : 'lg:pr-16'}`}>
                      <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-dark shadow-glow-gold flex items-center justify-center text-white">
                        {item.icon}
                      </div>

                      <div className="bg-white rounded-3xl p-8 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 border border-warm-200/50">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full text-xs font-semibold text-accent-dark mb-4">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          {item.year}
                        </span>
                        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4">
                          {item.title}
                        </h3>
                        <p className="text-secondary leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`hidden lg:block ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
