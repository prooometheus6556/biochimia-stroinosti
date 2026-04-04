export default function Footer() {
  return (
    <footer className="relative py-12 bg-warm-100 border-t border-warm-200/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pearl/50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">Биохимия стройности</span>
              <p className="text-xs text-muted">Научный подход к похудению</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <a href="#lead-form" className="text-secondary hover:text-foreground transition-colors font-medium">
              Гайд
            </a>
            <a href="#story" className="text-secondary hover:text-foreground transition-colors font-medium">
              История
            </a>
          </div>

          <p className="text-sm text-muted">
            © {new Date().getFullYear()} Все права защищены
          </p>
        </div>
      </div>
    </footer>
  )
}
