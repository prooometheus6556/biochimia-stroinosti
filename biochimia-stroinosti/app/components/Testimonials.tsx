'use client'

import { useEffect, useRef, useState } from 'react'

const testimonials = [
  {
    name: 'Анна',
    age: 34,
    result: '-18 кг за 3 месяца',
    text: 'Всю жизнь боролась с весом. Перепробовала все диеты — результат один: срывы и ещё больший набор. Этот гайд изменил мое понимание питания. Впервые за 10 лет вес не вернулся!',
    avatar: '👩',
  },
  {
    name: 'Михаил',
    age: 42,
    result: '-24 кг за 4 месяца',
    text: 'Скептически отнесся к "научному подходу", но решил попробовать. Через месяц — минус 5 кг без чувства голода. Через три — стабильный результат. Рекомендую всем мужчинам после 40.',
    avatar: '👨',
  },
  {
    name: 'Елена',
    age: 28,
    result: '-12 кг за 2 месяца',
    text: 'Ожидала очередную "волшебную" диету, а получила реальные знания о своем теле. Поняла, почему previous диеты не работали. Энергия бьет ключом, вес уходит сам собой.',
    avatar: '👱‍♀️',
  },
]

export default function Testimonials() {
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
      <div className="absolute inset-0 bg-gradient-to-b from-pearl via-background to-warm-100" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-radial from-accent/10 via-transparent to-transparent rounded-full" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className={`max-w-3xl mx-auto text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-6">
            <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-sm font-medium text-accent-dark">Результаты</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Истории успеха
          </h2>
          <p className="text-lg text-secondary leading-relaxed">
            Реальные результаты реальных людей
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl p-8 shadow-soft-lg hover:shadow-soft-xl transition-all duration-500 hover:-translate-y-2 border border-warm-200/30 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-secondary leading-relaxed mb-8 text-base italic">
                &quot;{testimonial.text}&quot;
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-warm-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}, {testimonial.age}</p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">{testimonial.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`mt-20 text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ transitionDelay: '500ms' }}>
          <div className="inline-flex items-center gap-10 px-12 py-6 bg-white rounded-3xl shadow-soft-lg border border-warm-200/30">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">500+</p>
              <p className="text-sm text-secondary mt-1">скачиваний</p>
            </div>
            <div className="w-px h-16 bg-warm-200" />
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">98%</p>
              <p className="text-sm text-secondary mt-1">довольных</p>
            </div>
            <div className="w-px h-16 bg-warm-200" />
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">-20</p>
              <p className="text-sm text-secondary mt-1">средний результат кг</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
