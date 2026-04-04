'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToStory = () => {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen overflow-hidden pb-20 md:pb-0">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-radial from-accent/10 via-accent/5 to-transparent rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-gold/10 via-gold/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-5 md:px-4 relative z-10 pt-20 md:pt-24 lg:pt-28">
        
        {/* Desktop Grid: Text Left, Photos Right */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center min-h-[calc(100vh-120px)]">
          
          {/* Left: Text Content */}
          <div className={`space-y-6 lg:space-y-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 bg-white/80 backdrop-blur-xl rounded-full shadow-soft border border-warm-200/50">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
              </span>
              <span className="text-xs md:text-sm font-medium text-secondary">Научный подход к снижению веса</span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight">
                Минус <span className="bg-gradient-to-r from-gold via-gold-light to-gold bg-clip-text text-transparent">29 кг</span>
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-foreground">
                без жестких диет
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-foreground">
                и срывов
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-sm md:text-base lg:text-xl text-secondary leading-relaxed max-w-lg">
              Научный подход к снижению веса через контроль инсулина и метаболическую гибкость
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3 md:gap-4">
              <div className="flex items-center gap-2 text-xs md:text-sm text-secondary">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-accent/15 flex items-center justify-center">
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Личная трансформация</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-secondary">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-accent/15 flex items-center justify-center">
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Научный подход</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-secondary">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-accent/15 flex items-center justify-center">
                  <svg className="w-3 md:w-3.5 h-3 md:h-3.5 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Без насилия</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2">
              <button
                onClick={scrollToForm}
                className="w-full sm:w-auto group relative inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-gold hover:-translate-y-1 shadow-lg"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]" />
                <span className="relative flex items-center gap-2 md:gap-3">
                  Получить гайд
                  <svg className="w-4 md:w-5 h-4 md:h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
              <button
                onClick={scrollToStory}
                className="w-full sm:w-auto group inline-flex items-center justify-center px-8 md:px-10 py-4 md:py-5 text-base md:text-lg font-bold text-foreground bg-white rounded-2xl border-2 border-warm-200 hover:border-accent hover:shadow-soft-md transition-all duration-300 hover:-translate-y-1"
              >
                <span className="flex items-center gap-2 md:gap-3">
                  Моя история
                  <svg className="w-4 md:w-5 h-4 md:h-5 text-accent transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Metric Badges */}
            <div className="flex flex-wrap gap-2 md:gap-3 pt-2">
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 bg-white/70 backdrop-blur-xl rounded-2xl shadow-soft border border-warm-200/50">
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-gold to-gold-dark bg-clip-text text-transparent">500+</span>
                <span className="text-xs md:text-sm text-secondary">скачиваний</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 bg-white/70 backdrop-blur-xl rounded-2xl shadow-soft border border-warm-200/50">
                <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-accent-dark to-accent bg-clip-text text-transparent">-29</span>
                <span className="text-xs md:text-sm text-secondary">кг</span>
              </div>
            </div>
          </div>

          {/* Right: Photos - Desktop Overlap, Mobile Stack */}
          <div className={`relative ${mounted ? 'animate-fade-in-up animation-delay-200' : 'opacity-0'}`}>
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-gold/10 to-transparent rounded-4xl blur-3xl animate-glow" />
              
              {/* Photos Container */}
              <div className="relative">
                
                {/* Desktop: Overlapping Photos */}
                <div className="hidden lg:flex items-center justify-center h-[600px]">
                  <div className="absolute w-72 h-[420px] -left-4 top-8 rounded-3xl overflow-hidden shadow-soft-xl transform -rotate-6 hover:rotate-[-4deg] transition-transform duration-500">
                    <div className="relative w-full h-full bg-gradient-to-br from-warm-200 to-warm-100">
                      <Image 
                        src="/images/before.jpg" 
                        alt="До трансформации" 
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </div>

                  <div className="absolute w-72 h-[420px] -right-4 top-16 rounded-3xl overflow-hidden shadow-soft-xl transform rotate-3 hover:rotate-[5deg] transition-transform duration-500 border-4 border-white">
                    <div className="relative w-full h-full">
                      <Image 
                        src="/images/after.jpg" 
                        alt="После трансформации" 
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-glow-gold flex items-center justify-center animate-float">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">-29</p>
                        <p className="text-xs text-white/80 font-medium">кг</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 left-4 glassmorphism rounded-2xl px-4 py-3 shadow-soft animate-float-slow">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-accent-dark">↓ инсулин</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 right-4 glassmorphism rounded-2xl px-4 py-3 shadow-soft animate-float-slow" style={{ animationDelay: '1s' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-gold-dark">↑ энергия</span>
                    </div>
                  </div>
                </div>

                {/* Mobile & Tablet: Stacked Photos */}
                <div className="lg:hidden">
                  {/* Center Badge */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark shadow-glow-gold flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-white">-29</p>
                        <p className="text-[10px] text-white/80 font-medium">кг</p>
                      </div>
                    </div>
                  </div>

                  {/* Photos Stack */}
                  <div className="space-y-4 max-w-xs mx-auto">
                    {/* Before */}
                    <div className="relative rounded-2xl overflow-hidden shadow-soft-lg bg-white">
                      <div className="aspect-[3/4] relative">
                        <Image 
                          src="/images/before.jpg" 
                          alt="До трансформации" 
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full">
                          <span className="text-xs font-semibold text-white">ДО</span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <p className="text-white font-bold text-base">114 кг</p>
                        </div>
                      </div>
                    </div>

                    {/* After */}
                    <div className="relative rounded-2xl overflow-hidden shadow-soft-lg bg-white border-2 border-accent/30">
                      <div className="aspect-[3/4] relative">
                        <Image 
                          src="/images/after.jpg" 
                          alt="После трансформации" 
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <div className="absolute top-3 right-3 px-3 py-1 bg-accent/80 backdrop-blur-sm rounded-full">
                          <span className="text-xs font-semibold text-white">ПОСЛЕ</span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <p className="text-white font-bold text-base">85 кг</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Info Cards */}
                  <div className="flex justify-center gap-4 mt-6">
                    <div className="glassmorphism rounded-xl px-4 py-2 shadow-soft">
                      <span className="text-sm font-semibold text-accent-dark">↓ инсулин</span>
                    </div>
                    <div className="glassmorphism rounded-xl px-4 py-2 shadow-soft">
                      <span className="text-sm font-semibold text-gold-dark">↑ энергия</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block">
        <button onClick={scrollToStory} className="flex flex-col items-center gap-2 text-muted hover:text-foreground transition-colors">
          <span className="text-xs font-medium tracking-wider uppercase">Листайте</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>
    </section>
  )
}
