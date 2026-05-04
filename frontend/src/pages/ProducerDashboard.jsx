import { useState, useEffect } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import './ProducerDashboard.css'

const BASE = '/api'

async function fetchStats() {
  const res = await fetch(`${BASE}/stats/shows/`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Impossible de charger les statistiques')
  return res.json()
}

function StatCard({ label, value, icon }) {
  return (
    <div className="pd-card">
      <span className="pd-card-icon">{icon}</span>
      <span className="pd-card-value">{value ?? '—'}</span>
      <span className="pd-card-label">{label}</span>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #FF4500',
        borderRadius: '8px',
        padding: '12px 16px',
        color: '#fff'
      }}>
        <p style={{ color: '#FF4500', fontWeight: 700, marginBottom: 8 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '4px 0', fontSize: '0.85rem' }}>
            {p.name} : <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProducerDashboard({ user }) {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const shows = Array.isArray(stats?.shows) ? stats.shows : []

  const totalShows    = stats?.total_shows ?? 0
  const totalRevenue  = stats?.total_revenue  ?? 0
  const ticketsSold   = stats?.tickets_sold   ?? 0
  const upcomingShows = stats?.upcoming_shows ?? 0

  const chartData = shows.map((s) => ({
    name:            s.title?.slice(0, 15) || `#${s.show_id}`,
    available_seats: s.total_available_seats ?? 0,
    tickets_sold:    s.tickets_sold          ?? 0,
  }))

  function exportJSON() {
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'statistiques.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV() {
    if (!chartData.length) return
    const header = 'Spectacle,Places disponibles,Billets vendus'
    const rows   = chartData.map((r) => `"${r.name}",${r.available_seats},${r.tickets_sold}`)
    const blob   = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a')
    a.href       = url
    a.download   = 'statistiques.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pd-page">
      <header className="pd-header">
        <div>
          <h1 className="pd-title">Espace Producteur</h1>
          <p className="pd-subtitle">
            Bonjour{user?.username ? ` ${user.username}` : ''} — voici vos statistiques
          </p>
        </div>
        <div className="pd-actions">
          <a href="/producer/shows/new" className="pd-btn pd-btn--primary">
            + Ajouter un spectacle
          </a>
          <button className="pd-btn pd-btn--outline" onClick={exportCSV} disabled={!chartData.length}>
            Exporter CSV
          </button>
          <button className="pd-btn pd-btn--outline" onClick={exportJSON} disabled={!stats}>
            Exporter JSON
          </button>
        </div>
      </header>

      {loading && <p className="pd-state">Chargement…</p>}
      {error   && <p className="pd-state pd-state--error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="pd-cards">
            <StatCard label="Spectacles au total" value={totalShows}                              icon="🎭" />
            <StatCard label="Revenu total"         value={`${Number(totalRevenue).toFixed(2)} €`} icon="💶" />
            <StatCard label="Billets vendus"       value={ticketsSold}                             icon="🎟️" />
            <StatCard label="Événements à venir"   value={upcomingShows}                           icon="📅" />
          </section>

          <section className="pd-chart-section">
            <h2 className="pd-section-title">Capacité &amp; performance par spectacle</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF4500" stopOpacity={1} />
                      <stop offset="100%" stopColor="#FF8C00" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" tick={{ fill: '#aaa', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#aaa', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#aaa', fontSize: 13, paddingTop: 16 }} />
                  <Bar
                    dataKey="available_seats"
                    name="Places disponibles"
                    fill="url(#orangeGradient)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                  />
                  <Line
                    type="monotone"
                    dataKey="tickets_sold"
                    name="Billets vendus"
                    stroke="#4a9eff"
                    strokeWidth={2}
                    dot={{ fill: '#4a9eff', r: 5 }}
                    isAnimationActive={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="pd-state">Aucune donnée disponible.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}