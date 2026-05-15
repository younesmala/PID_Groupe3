import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { API_ROOT } from '../services/api'
import './ProducerDashboard.css'

const BASE = API_ROOT

async function fetchStats() {
  const response = await fetch(`${BASE}/stats/shows/`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('Impossible de charger les statistiques')
  return response.json()
}

function StatCard({ label, value, icon }) {
  return (
    <div className="pd-card">
      <span className="pd-card-icon">{icon}</span>
      <span className="pd-card-value">{value ?? '-'}</span>
      <span className="pd-card-label">{label}</span>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid #FF4500',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#fff',
        }}
      >
        <p style={{ color: '#FF4500', fontWeight: 700, marginBottom: 8 }}>{label}</p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.color, margin: '4px 0', fontSize: '0.85rem' }}>
            {item.name} : <strong>{item.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ProducerDashboard({ user }) {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((fetchError) => setError(fetchError.message))
      .finally(() => setLoading(false))
  }, [])

  const shows = Array.isArray(stats?.shows) ? stats.shows : []
  const totalShows = stats?.total_shows ?? 0
  const totalRevenue = stats?.total_revenue ?? 0
  const ticketsSold = stats?.tickets_sold ?? 0
  const upcomingShows = stats?.upcoming_shows ?? 0

  const chartData = shows.map((show) => ({
    name: show.title?.slice(0, 15) || `#${show.show_id}`,
    available_seats: show.total_available_seats ?? 0,
    tickets_sold: show.tickets_sold ?? 0,
  }))

  function exportJSON() {
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'statistiques.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function exportCSV() {
    if (!chartData.length) return
    const header = [
      t('producer.col_title', { defaultValue: 'Titre' }),
      t('producer.chart_available', { defaultValue: 'Places disponibles' }),
      t('producer.chart_sold', { defaultValue: 'Billets vendus' }),
    ].join(',')
    const rows = chartData.map((row) => `"${row.name}",${row.available_seats},${row.tickets_sold}`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'statistiques.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pd-page">
      <header className="pd-header">
        <div>
          <h1 className="pd-title">{t('producer.title', { defaultValue: 'Tableau de bord' })}</h1>
          <p className="pd-subtitle">
            {t('producer.greeting', {
              username: user?.username || '',
              defaultValue: 'Bonjour {{username}} - voici vos statistiques',
            })}
          </p>
        </div>
        <div className="pd-actions">
          <a href="/producer/shows/new" className="pd-btn pd-btn--primary">
            {t('producer.add_show', { defaultValue: 'Ajouter un spectacle' })}
          </a>
          <button className="pd-btn pd-btn--outline" onClick={exportCSV} disabled={!chartData.length}>
            {t('producer.export_csv', { defaultValue: 'Exporter en CSV' })}
          </button>
          <button className="pd-btn pd-btn--outline" onClick={exportJSON} disabled={!stats}>
            {t('producer.export_json', { defaultValue: 'Exporter en JSON' })}
          </button>
        </div>
      </header>

      {loading && <p className="pd-state">{t('producer.loading', { defaultValue: 'Chargement...' })}</p>}
      {error && <p className="pd-state pd-state--error">{error}</p>}

      {!loading && !error && (
        <>
          <section className="pd-cards">
            <StatCard label={t('producer.stats.total_shows', { defaultValue: 'Spectacles au total' })} value={totalShows} icon="SH" />
            <StatCard label={t('producer.stats.total_revenue', { defaultValue: 'Revenus totaux' })} value={`${Number(totalRevenue).toFixed(2)} EUR`} icon="EU" />
            <StatCard label={t('producer.stats.tickets_sold', { defaultValue: 'Billets vendus' })} value={ticketsSold} icon="TK" />
            <StatCard label={t('producer.stats.upcoming', { defaultValue: 'Evenements a venir' })} value={upcomingShows} icon="EV" />
          </section>

          <section className="pd-chart-section">
            <h2 className="pd-section-title">
              {t('producer.chart_title', { defaultValue: 'Capacite et performance par spectacle' })}
            </h2>
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
                    name={t('producer.chart_available', { defaultValue: 'Places disponibles' })}
                    fill="url(#orangeGradient)"
                    radius={[6, 6, 0, 0]}
                    isAnimationActive
                  />
                  <Line
                    type="monotone"
                    dataKey="tickets_sold"
                    name={t('producer.chart_sold', { defaultValue: 'Billets vendus' })}
                    stroke="#4a9eff"
                    strokeWidth={2}
                    dot={{ fill: '#4a9eff', r: 5 }}
                    isAnimationActive
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <p className="pd-state">{t('producer.no_data', { defaultValue: 'Aucune donnee disponible.' })}</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
