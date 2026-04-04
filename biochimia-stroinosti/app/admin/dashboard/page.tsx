'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface Lead {
  id: string
  created_at: string
  name: string
  telegram: string
  email: string
  goal: string
  status: 'new' | 'contacted' | 'closed'
  notes: string
}

const goalLabels: Record<string, string> = {
  weight_loss: 'Похудение',
  energy: 'Энергия',
  nutrition: 'Питание',
  health: 'Здоровье',
}

const statusLabels: Record<string, string> = {
  new: 'Новая',
  contacted: 'В работе',
  closed: 'Закрыта',
}

export default function Dashboard() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const checkAuth = useCallback(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth !== 'true') {
      router.push('/admin')
    }
  }, [router])

  useEffect(() => {
    checkAuth()
    loadLeads()
  }, [checkAuth])

  const loadLeads = () => {
    const stored = localStorage.getItem('leads')
    if (stored) {
      setLeads(JSON.parse(stored))
    }
    setIsLoading(false)
  }

  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads)
    localStorage.setItem('leads', JSON.stringify(newLeads))
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    router.push('/admin')
  }

  const handleDelete = (id: string) => {
    if (confirm('Удалить заявку?')) {
      const newLeads = leads.filter(l => l.id !== id)
      saveLeads(newLeads)
    }
  }

  const handleStatusChange = (id: string, status: string) => {
    const newLeads = leads.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l)
    saveLeads(newLeads)
  }

  const handleNotesChange = (id: string, notes: string) => {
    const newLeads = leads.map(l => l.id === id ? { ...l, notes } : l)
    saveLeads(newLeads)
  }

  const exportCSV = () => {
    const headers = ['Дата', 'Имя', 'Telegram', 'Email', 'Цель', 'Статус', 'Заметки']
    const rows = filteredLeads.map(l => [
      new Date(l.created_at).toLocaleString('ru-RU'),
      l.name,
      l.telegram,
      l.email || '-',
      goalLabels[l.goal] || l.goal,
      statusLabels[l.status],
      l.notes || '-',
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) || 
                         lead.telegram.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Заявки</h1>
              <p className="text-sm text-secondary">{leads.length} всего</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportCSV}
                className="px-4 py-2 bg-warm-100 text-foreground rounded-xl font-medium hover:bg-warm-200 transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-secondary hover:text-foreground transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <p className="text-sm text-secondary mb-1">Всего</p>
            <p className="text-3xl font-bold text-foreground">{leads.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <p className="text-sm text-secondary mb-1">Новые</p>
            <p className="text-3xl font-bold text-accent-dark">{leads.filter(l => l.status === 'new').length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft">
            <p className="text-sm text-secondary mb-1">Сегодня</p>
            <p className="text-3xl font-bold text-gold">{leads.filter(l => {
              const today = new Date()
              const leadDate = new Date(l.created_at)
              return leadDate.toDateString() === today.toDateString()
            }).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-soft mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Поиск по имени или Telegram..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-3 bg-warm-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-accent/30"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-warm-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-accent/30"
            >
              <option value="all">Все статусы</option>
              <option value="new">Новые</option>
              <option value="contacted">В работе</option>
              <option value="closed">Закрытые</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="text-left text-xs font-medium text-secondary uppercase px-4 py-3">Дата</th>
                  <th className="text-left text-xs font-medium text-secondary uppercase px-4 py-3">Имя</th>
                  <th className="text-left text-xs font-medium text-secondary uppercase px-4 py-3">Telegram</th>
                  <th className="text-left text-xs font-medium text-secondary uppercase px-4 py-3 hidden sm:table-cell">Цель</th>
                  <th className="text-left text-xs font-medium text-secondary uppercase px-4 py-3">Статус</th>
                  <th className="text-left text-xs font-medium text-secondary uppercase px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-secondary">
                      Заявки не найдены
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-warm-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm text-secondary whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-foreground">
                        {lead.name}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <a href={`https://t.me/${lead.telegram.replace('@', '')}`} target="_blank" className="text-accent-dark hover:underline">
                          {lead.telegram}
                        </a>
                      </td>
                      <td className="px-4 py-4 text-sm text-secondary hidden sm:table-cell">
                        {goalLabels[lead.goal] || lead.goal}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                            lead.status === 'new' ? 'bg-accent/20 text-accent-dark' :
                            lead.status === 'contacted' ? 'bg-gold/20 text-gold-dark' :
                            'bg-warm-200 text-secondary'
                          }`}
                        >
                          <option value="new">Новая</option>
                          <option value="contacted">В работе</option>
                          <option value="closed">Закрыта</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-2 text-secondary hover:text-foreground transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 text-secondary hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-soft-xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Редактирование</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Заметки</label>
                <textarea
                  value={editingLead.notes}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="Добавьте заметки..."
                  className="w-full px-4 py-3 bg-warm-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-accent/30 resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setEditingLead(null)}
                className="flex-1 py-3 bg-warm-100 text-foreground rounded-xl font-medium hover:bg-warm-200 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  handleNotesChange(editingLead.id, editingLead.notes)
                  setEditingLead(null)
                }}
                className="flex-1 py-3 bg-gradient-to-r from-gold to-gold-dark text-white rounded-xl font-medium hover:shadow-glow-gold transition-all"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
