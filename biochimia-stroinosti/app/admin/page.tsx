'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        localStorage.setItem('admin_auth', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Неверный пароль')
      }
    } catch {
      setError('Ошибка соединения')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
          <p className="text-secondary mt-2">Введите пароль для входа</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-soft-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full px-5 py-4 bg-warm-50 border-2 border-transparent rounded-2xl text-foreground placeholder:text-muted focus:outline-none focus:border-accent/30 transition-all"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-medium text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-gold to-gold-dark text-white font-semibold rounded-2xl shadow-soft hover:shadow-glow-gold transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Проверка...' : 'Войти'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-sm text-secondary hover:text-foreground transition-colors">
            ← На главную
          </a>
        </p>
      </div>
    </div>
  )
}
