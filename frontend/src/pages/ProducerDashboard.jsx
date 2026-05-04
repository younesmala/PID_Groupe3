import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

  const totalShows    = stats?.total_shows    ?? stats?.shows_count    ?? 0
  const totalRevenue  = stats?.total_revenue  ?? stats?.revenue        ?? 0
  const ticketsSold   = stats?.tickets_sold   ?? stats?.total_tickets  ?? 0
  const upcomingShows = stats?.upcoming_shows ?? stats?.upcoming       ?? 0

  const chartData = Array.isArray(stats?.shows)
    ? stats.shows.map((s) => ({
        name:    s.title?.slice(0, 18) || `#${s.id}`,
        billets: s.tickets_sold ?? 0,
        revenu:  Number(s.revenue ?? 0),
      }))
    : []

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
    const header = 'Spectacle,Billets vendus,Revenu (€)'
    const rows   = chartData.map((r) => `"${r.name}",${r.billets},${r.revenu}`)
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
            <StatCard label="Spectacles au total" value={totalShows}    icon="🎭" />
            <StatCard label="Revenu total"         value={`${Number(totalRevenue).toFixed(2)} €`} icon="💶" />
            <StatCard label="Billets vendus"       value={ticketsSold}  icon="🎟️" />
            <StatCard label="Événements à venir"   value={upcomingShows} icon="📅" />
          </section>

          <section className="pd-chart-section">
            <h2 className="pd-section-title">Performance des spectacles</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#aaa', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e1e1e', border: '1px solid #333', borderRadius: 6 }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#ccc' }}
                  />
                  <Bar dataKey="billets" name="Billets vendus" fill="#FF4500" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenu"  name="Revenu (€)"     fill="#4a9eff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="pd-state">Aucune donnée de performance disponible.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}