import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import './ProducerStats.css'

const BASE = '/api'

function StatCard({ label, value, sub }) {
  return (
    <div className="pst-card">
      <span className="pst-card-value">{value ?? '—'}</span>
      <span className="pst-card-label">{label}</span>
      {sub && <span className="pst-card-sub">{sub}</span>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="pst-tooltip">
      <p className="pst-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name} : <strong>{p.value?.toLocaleString('fr-BE')}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ProducerStats() {
  const navigate = useNavigate()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BASE}/stats/shows/`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`Impossible de charger les statistiques (${res.status})`)
        setStats(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const shows       = Array.isArray(stats?.shows) ? stats.shows : []
  const totalShows  = stats?.total_shows ?? 0
  const totalReps   = shows.reduce((acc, s) => acc + (s.total_representations ?? 0), 0)
  const totalSeats  = shows.reduce((acc, s) => acc + (s.total_available_seats  ?? 0), 0)
  const bookable    = shows.filter((s) => s.bookable).length

  const chartData = shows
    .filter((s) => s.total_available_seats > 0 || s.total_representations > 0)
    .map((s) => ({
      name:    s.title?.length > 22 ? s.title.slice(0, 22) + '…' : (s.title || `#${s.show_id}`),
      places:  s.total_available_seats ?? 0,
      séances: s.total_representations ?? 0,
    }))
    .sort((a, b) => b.places - a.places)
    .slice(0, 12)

  const chartHeight = Math.max(180, chartData.length * 44)

  return (
    <div className="pst-page">
      <button className="pst-breadcrumb" onClick={() => navigate('/producer/dashboard')}>
        ← Tableau de bord
      </button>

      <header className="pst-header">
        <h1 className="pst-title">Mes statistiques</h1>
      </header>

      {loading && <p className="pst-state">Chargement…</p>}
      {error   && <p className="pst-state pst-state--error">{error}</p>}

      {!loading && !error && (
        <>
          {/* ── Cartes ── */}
          <section className="pst-cards">
            <StatCard label="Spectacles"         value={totalShows} />
            <StatCard label="Représentations"    value={totalReps} />
            <StatCard
              label="Places disponibles"
              value={totalSeats.toLocaleString('fr-BE')}
            />
            <StatCard
              label="Taux de remplissage"
              value="—"
              sub="données non disponibles"
            />
          </section>

          {/* ── Graphique horizontal ── */}
          <section className="pst-chart-section">
            <h2 className="pst-section-title">Places disponibles par spectacle</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#aaa', fontSize: 12 }}
                    tickFormatter={(v) => v.toLocaleString('fr-BE')}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tick={{ fill: '#e0e0e0', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="places"
                    name="Places disponibles"
                    fill="#FF4500"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="pst-state">Aucune donnée disponible.</p>
            )}
          </section>

          {/* ── Tableau détaillé ── */}
          <section className="pst-table-section">
            <h2 className="pst-section-title">Détail par spectacle</h2>
            {shows.length === 0 ? (
              <p className="pst-state">Aucun spectacle enregistré.</p>
            ) : (
              <div className="pst-table-wrapper">
                <table className="pst-table">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th className="pst-th--num">Représentations</th>
                      <th className="pst-th--num">Places totales</th>
                      <th className="pst-th--num">Places vendues</th>
                      <th className="pst-th--num">Taux de remplissage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((s) => (
                      <tr key={s.show_id} className={s.bookable ? '' : 'pst-row--inactive'}>
                        <td className="pst-td--title">
                          {s.title}
                          {!s.bookable && <span className="pst-badge">Inactif</span>}
                        </td>
                        <td className="pst-td--num">{s.total_representations}</td>
                        <td className="pst-td--num">
                          {s.total_available_seats?.toLocaleString('fr-BE') ?? '—'}
                        </td>
                        <td className="pst-td--num pst-td--muted">—</td>
                        <td className="pst-td--num pst-td--muted">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}