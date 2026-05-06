import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './ProducerShowForm.css'

const BASE = '/api'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

export default function ProducerShowForm() {
  const navigate   = useNavigate()
  const { slug }   = useParams()
  const isEdit     = !!slug
  const fileRef    = useRef(null)

  const [types,      setTypes]      = useState([])
  const [localities, setLocalities] = useState([])
  const [form,       setForm]       = useState({
    title:       '',
    description: '',
    genre:       '',
    duration:    '',
    created_in:  '',
  })
  const [posterFile,   setPosterFile]   = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    fetch(`${BASE}/shows/${slug}/`, { credentials: 'include', headers: { Accept: 'application/json' } })
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((data) => {
        setForm({
          title:       data.title       ?? '',
          description: data.description ?? '',
          genre:       data.artist_types?.[0] ?? '',
          duration:    data.duration    ?? '',
          created_in:  data.created_in  ?? '',
        })
        if (data.poster_url) setPosterPreview(data.poster_url)
      })
      .catch(() => setErrors({ _global: 'Impossible de charger le spectacle.' }))
      .finally(() => setLoading(false))
  }, [slug, isEdit])

  useEffect(() => {
    const opts = { credentials: 'include', headers: { Accept: 'application/json' } }
    fetch(`${BASE}/types/`, opts)
      .then((r) => r.json())
      .then((data) => setTypes(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
    fetch(`${BASE}/localities/`, opts)
      .then((r) => r.json())
      .then((data) => setLocalities(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
  }

  function handleFile(e) {
    const file = e.target.files?.[0] ?? null
    setPosterFile(file)
    setPosterPreview(file ? URL.createObjectURL(file) : null)
    if (errors.poster_url) setErrors((prev) => { const n = { ...prev }; delete n.poster_url; return n })
  }

  function flattenErrors(data) {
    const out = {}
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val))           out[key] = val.join(' ')
      else if (typeof val === 'string') out[key] = val
      else                              out[key] = JSON.stringify(val)
    }
    return out
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setErrors({ title: 'Le titre est obligatoire.' })
      return
    }

    if (!form.created_in) {
      setErrors({ created_in: 'La ville de création est obligatoire.' })
      return
    }

    setSubmitting(true)
    setErrors({})

    const fd = new FormData()
    fd.append('title', form.title.trim())
    if (form.description.trim()) fd.append('description', form.description.trim())
    fd.append('created_in', Number(form.created_in))
    if (form.duration)           fd.append('duration', Number(form.duration))
    if (form.genre)              fd.append('artist_types', form.genre)
    if (posterFile)              fd.append('poster', posterFile)

    try {
      const res = await fetch(isEdit ? `${BASE}/shows/${slug}/` : `${BASE}/shows/`, {
        method:      isEdit ? 'PATCH' : 'POST',
        credentials: 'include',
        headers:     { 'X-CSRFToken': getCookie('csrftoken') || localStorage.getItem('csrf_token') || '' },
        body:        fd,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const mapped = flattenErrors(data)
        setErrors(Object.keys(mapped).length ? mapped : { _global: `Erreur ${res.status}` })
        return
      }

      navigate('/producer/shows')
    } catch {
      setErrors({ _global: 'Erreur réseau. Vérifiez votre connexion.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="psf-page">Chargement…</div>

  return (
    <div className="psf-page">
      <button className="psf-breadcrumb" onClick={() => navigate('/producer/shows')}>
        ← Mes spectacles
      </button>

      <header className="psf-header">
        <h1 className="psf-title">{isEdit ? 'Modifier le spectacle' : 'Ajouter un spectacle'}</h1>
      </header>

      <form className="psf-form" onSubmit={handleSubmit} noValidate>

        {errors._global && (
          <p className="psf-error-global">{errors._global}</p>
        )}

        {/* Titre */}
        <div className="psf-field">
          <label className="psf-label" htmlFor="title">
            Titre <span className="psf-required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`psf-input${errors.title ? ' psf-input--error' : ''}`}
            value={form.title}
            onChange={handleChange}
            placeholder="Nom du spectacle"
            required
          />
          {errors.title && <span className="psf-field-error">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="psf-field">
          <label className="psf-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className="psf-input psf-textarea"
            value={form.description}
            onChange={handleChange}
            placeholder="Présentation du spectacle…"
            rows={5}
          />
          {errors.description && <span className="psf-field-error">{errors.description}</span>}
        </div>

        {/* Ville de création */}
        <div className="psf-field">
          <label className="psf-label" htmlFor="created_in">
            Ville de création <span className="psf-required">*</span>
          </label>
          <select
            id="created_in"
            name="created_in"
            className={`psf-input${errors.created_in ? ' psf-input--error' : ''}`}
            value={form.created_in}
            onChange={handleChange}
            required
          >
            <option value="">— Sélectionner une localité —</option>
            {localities.map((l) => (
              <option key={l.id} value={l.id}>{l.locality}</option>
            ))}
          </select>
          {errors.created_in && <span className="psf-field-error">{errors.created_in}</span>}
        </div>

        {/* Deux colonnes : Genre + Durée */}
        <div className="psf-row">
          <div className="psf-field">
            <label className="psf-label" htmlFor="genre">Genre</label>
            <select
              id="genre"
              name="genre"
              className={`psf-input${errors.artist_types ? ' psf-input--error' : ''}`}
              value={form.genre}
              onChange={handleChange}
            >
              <option value="">— Sélectionner —</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.type}</option>
              ))}
            </select>
            {errors.artist_types && <span className="psf-field-error">{errors.artist_types}</span>}
          </div>

          <div className="psf-field">
            <label className="psf-label" htmlFor="duration">Durée (minutes)</label>
            <input
              id="duration"
              name="duration"
              type="number"
              className={`psf-input${errors.duration ? ' psf-input--error' : ''}`}
              value={form.duration}
              onChange={handleChange}
              placeholder="ex. 90"
              min={1}
            />
            {errors.duration && <span className="psf-field-error">{errors.duration}</span>}
          </div>
        </div>

        {/* Affiche */}
        <div className="psf-field">
          <label className="psf-label">Affiche</label>
          <div
            className={`psf-file-zone${errors.poster_url ? ' psf-file-zone--error' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {posterPreview ? (
              <img src={posterPreview} alt="Aperçu affiche" className="psf-preview" />
            ) : (
              <div className="psf-file-placeholder">
                <span className="psf-file-icon">🖼️</span>
                <span>Cliquer pour choisir une image</span>
                <span className="psf-file-hint">JPG, PNG, WEBP — max 5 Mo</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="psf-file-hidden"
            onChange={handleFile}
          />
          {posterPreview && (
            <button
              type="button"
              className="psf-file-remove"
              onClick={() => { setPosterFile(null); setPosterPreview(null); fileRef.current.value = '' }}
            >
              Supprimer l'image
            </button>
          )}
          {errors.poster_url && <span className="psf-field-error">{errors.poster_url}</span>}
        </div>

        {/* Actions */}
        <div className="psf-actions">
          <button
            type="button"
            className="psf-btn psf-btn--outline"
            onClick={() => navigate('/producer/shows')}
            disabled={submitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="psf-btn psf-btn--primary"
            disabled={submitting}
          >
            {submitting
              ? (isEdit ? 'Mise à jour…' : 'Enregistrement…')
              : (isEdit ? 'Mettre à jour' : 'Enregistrer')}
          </button>
        </div>
      </form>
    </div>
  )
}