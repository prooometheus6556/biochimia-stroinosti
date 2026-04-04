'use client'

import { useState, useEffect, useRef } from 'react'

const goalOptions = [
  { value: 'weight_loss', label: 'Похудение' },
  { value: 'energy', label: 'Повышение энергии' },
  { value: 'nutrition', label: 'Здоровое питание' },
  { value: 'health', label: 'Общее здоровье' },
]

export default function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    telegram: '',
    email: '',
    goal: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Введите ваше имя (минимум 2 символа)'
    }
    
    if (!formData.telegram || formData.telegram.length < 3) {
      newErrors.telegram = 'Введите Telegram (@username)'
    } else if (!/^@?[a-zA-Z0-9_]{3,32}$/.test(formData.telegram)) {
      newErrors.telegram = 'Некорректный формат Telegram'
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }
    
    if (!formData.goal) {
      newErrors.goal = 'Выберите вашу цель'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit')
      }
      
      // Save to localStorage for admin dashboard
      const newLead = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        name: formData.name,
        telegram: formData.telegram,
        email: formData.email || '',
        goal: formData.goal,
        status: 'new',
        notes: '',
      }
      const existingLeads = JSON.parse(localStorage.getItem('leads') || '[]')
      localStorage.setItem('leads', JSON.stringify([newLead, ...existingLeads]))
      
      setIsSuccess(true)
      localStorage.setItem('leadSubmitted', 'true')
    } catch (error) {
      setErrors({ general: 'Что-то пошло не так. Попробуйте ещё раз.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <section id="lead-form" ref={sectionRef} className="relative py-16 md:py-24 lg:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-warm-100 via-pearl to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-gold/10 via-gold/5 to-transparent rounded-full" />
      
      <div className="container mx-auto px-5 md:px-4 relative z-10">
        <div className={`max-w-lg mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full mb-4 md:mb-6">
              <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-sm font-medium text-accent-dark">Получить гайд</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 tracking-tight">
              Начните свой путь
            </h2>
            <p className="text-secondary text-base md:text-lg">
              Заполните форму и получите гайд с персональными рекомендациями
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-accent/10 to-transparent rounded-3xl blur-xl" />
            
            <div className="relative bg-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-soft-xl border border-warm-200/30">
              {isSuccess ? (
                <div className="text-center py-8 animate-scale-in">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-dark rounded-full opacity-20 animate-glow" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-3">
                    Спасибо, {formData.name}!
                  </h3>
                  <p className="text-secondary text-lg mb-6">
                    Спасибо! Материалы скоро придут вам
                  </p>
                  
                  <a
                    href="/guide.pdf"
                    download="Биохимия стройности - Гайд.pdf"
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 mb-4"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                    <span className="relative flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Скачать гайд PDF
                    </span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Как вас зовут?"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-warm-50 rounded-2xl text-foreground placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        errors.name ? 'border-2 border-red-400 focus:border-red-400' : 'border-2 border-transparent focus:border-accent/30'
                      }`}
                    />
                    {errors.name && <p className="text-sm text-red-500 font-medium">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Telegram
                    </label>
                    <input
                      type="text"
                      name="telegram"
                      placeholder="@username"
                      value={formData.telegram}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-warm-50 rounded-2xl text-foreground placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        errors.telegram ? 'border-2 border-red-400 focus:border-red-400' : 'border-2 border-transparent focus:border-accent/30'
                      }`}
                    />
                    {errors.telegram && <p className="text-sm text-red-500 font-medium">{errors.telegram}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Email <span className="text-muted font-normal">(необязательно)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-warm-50 rounded-2xl text-foreground placeholder:text-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        errors.email ? 'border-2 border-red-400 focus:border-red-400' : 'border-2 border-transparent focus:border-accent/30'
                      }`}
                    />
                    {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Ваша цель
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className={`w-full px-5 py-4 bg-warm-50 rounded-2xl text-foreground transition-all duration-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30 ${
                        errors.goal ? 'border-2 border-red-400 focus:border-red-400' : 'border-2 border-transparent focus:border-accent/30'
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238A8A8A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '20px',
                      }}
                    >
                      <option value="" disabled>Выберите цель</option>
                      {goalOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.goal && <p className="text-sm text-red-500 font-medium">{errors.goal}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full px-8 py-5 text-lg font-semibold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-gold hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Отправка...
                        </>
                      ) : (
                        <>
                          Получить гайд
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                  
                  {errors.general && (
                    <p className="text-sm text-red-500 text-center font-medium">{errors.general}</p>
                  )}

                  <p className="text-xs text-center text-muted">
                    Нажимая кнопку, вы соглашаетесь получать полезные материалы
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 lg:hidden z-40 animate-fade-in-up" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => sectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full px-6 py-4 text-lg font-bold text-white rounded-2xl shadow-glow-gold flex items-center justify-center gap-3 min-h-[56px]"
          style={{ background: 'linear-gradient(to right, #D99A2B, #E8B84A)' }}
        >
          Получить гайд
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  )
}
