import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function parseRssXml(xmlText) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')
  const items = Array.from(doc.querySelectorAll('item'))

  return items.map((item) => {
    const title = item.querySelector('title')?.textContent || ''
    const description = item.querySelector('description')?.textContent || ''
    const pubDate = item.querySelector('pubDate')?.textContent || ''

    const lines = description.split('\n').reduce((acc, line) => {
      const [key, ...rest] = line.split(' : ')
      if (key && rest.length) acc[key.trim()] = rest.join(' : ').trim()
      return acc
    }, {})

    return {
      title,
      date: lines['Date'] || '',
      time: lines['Heure'] || '',
      location: lines['Lieu'] || '',
      bookable: lines['Réservable'] === 'Oui',
      excerpt: lines['Description'] || '',
      pubDate,
    }
  })
}

export default function RssFeed() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/rss/next-representations/', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Impossible de charger le flux RSS.')
        return res.text()
      })
      .then((xml) => setItems(parseRssXml(xml)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main style={{ background: '#111113', minHeight: '100vh', padding: '48px 20px', color: '#f8fafc' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{
            background: '#ef4444', color: '#fff', fontSize: '0.75rem',
            fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.05em'
          }}>
            RSS
          </span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            Prochaines représentations
          </h1>
        </div>
        <p style={{ color: '#94a3b8', marginBottom: 36 }}>
          Flux en direct — les 20 prochains spectacles à Bruxelles
        </p>

        {loading && <p style={{ color: '#94a3b8' }}>Chargement du flux...</p>}
        {error && <p style={{ color: '#f87171' }}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <p style={{ color: '#94a3b8' }}>Aucune représentation à venir.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((item, i) => (
            <article key={i} style={{
              background: '#1a1a1d',
              border: '1px solid #2a2a2e',
              borderLeft: '4px solid #d9911d',
              borderRadius: 12,
              padding: '20px 24px',
            }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 10px', color: '#f8fafc' }}>
                {item.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', fontSize: '0.88rem', color: '#94a3b8', marginBottom: 10 }}>
                {item.date && (
                  <span>📅 {item.date}{item.time ? ` à ${item.time}` : ''}</span>
                )}
                {item.location && (
                  <span>📍 {item.location}</span>
                )}
                <span style={{ color: item.bookable ? '#4ade80' : '#f87171' }}>
                  {item.bookable ? '✓ Réservable' : '✗ Non réservable'}
                </span>
              </div>

              {item.excerpt && (
                <p style={{ fontSize: '0.88rem', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
                  {item.excerpt}
                </p>
              )}
            </article>
          ))}
        </div>

        {!loading && items.length > 0 && (
          <p style={{ marginTop: 32, fontSize: '0.8rem', color: '#475569', textAlign: 'center' }}>
            Flux RSS généré automatiquement · {items.length} représentation(s) à venir
          </p>
        )}
      </div>
    </main>
  )
}
