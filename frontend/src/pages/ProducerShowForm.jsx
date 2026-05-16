import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_ROOT } from '../services/api'
import './ProducerShowForm.css'

const BASE = API_ROOT

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

function getPosterPreview(posterUrl, slug) {
  if (!posterUrl && slug) return `/show-posters/${slug}.png`
  if (!posterUrl) return null
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://') || posterUrl.startsWith('/')) {
    return posterUrl
  }
  return `/show-posters/${posterUrl}`
}

function flattenErrors(data) {
  const out = {}
  for (const [key, val] of Object.entries(data || {})) {
    if (Array.isArray(val)) out[key] = val.join(' ')
    else if (typeof val === 'string') out[key] = val
    else out[key] = JSON.stringify(val)
  }
  return out
}

export default function ProducerShowForm() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { slug } = useParams()
  const isEdit = !!slug
  const fileRef = useRef(null)

  const [artists, setArtists] = useState([])
  const genres = [
    { id: 6, type: 'Masculin' },
    { id: 7, type: 'Féminin' },
  ]
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [posterFile, setPosterFile] = useState(null)
  const [posterPreview, setPosterPreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    description_nl: '',
    description_en: '',
    artist: '',
    genre: '',
    duration: '',
    spoken_language: 'fr',
    created_in: String(new Date().getFullYear()),
  })

  useEffect(() => {
    async function loadOptions() {
      const opts = { credentials: 'include', headers: { Accept: 'application/json' } }
      const artistsRes = await fetch(`${BASE}/artists/`, opts)
      const artistsData = await artistsRes.json().catch(() => [])
      setArtists(Array.isArray(artistsData) ? artistsData : (artistsData.results ?? []))
    }

    loadOptions().catch(() => {
      setErrors((prev) => ({
        ...prev,
        _global: t('producer.load_options_error', { defaultValue: 'Impossible de charger les artistes et genres.' }),
      }))
    })
  }, [t])

  useEffect(() => {
    if (!isEdit) return

    fetch(`${BASE}/producer/shows/${slug}/`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.detail || 'Impossible de charger le spectacle.')
        }
        return response.json()
      })
      .then((data) => {
        setForm({
          title: data.title ?? '',
          description: data.description ?? '',
          description_nl: data.description_nl ?? '',
          description_en: data.description_en ?? '',
          artist: data.artist ? String(data.artist) : '',
          genre: data.artist_types?.[0] ? String(data.artist_types[0]) : '',
          duration: data.duration ? String(data.duration) : '',
          spoken_language: data.spoken_language || 'fr',
          created_in: data.created_in ? String(data.created_in) : String(new Date().getFullYear()),
        })
        setPosterPreview(getPosterPreview(data.poster_url, data.slug))
      })
      .catch((error) => {
        setErrors({ _global: error.message })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isEdit, slug])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  function handleFile(event) {
    const file = event.target.files?.[0] ?? null
    setPosterFile(file)
    setPosterPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})

    if (!form.title.trim()) {
      setErrors({ title: t('producer.required_title', { defaultValue: 'Le titre est obligatoire.' }) })
      return
    }

    setSubmitting(true)

    const payload = new FormData()
    payload.append('title', form.title.trim())
    payload.append('description', form.description.trim())
    if (form.description_nl.trim()) payload.append('description_nl', form.description_nl.trim())
    if (form.description_en.trim()) payload.append('description_en', form.description_en.trim())
    payload.append('created_in', form.created_in || String(new Date().getFullYear()))
    payload.append('spoken_language', form.spoken_language || 'fr')

    if (form.duration) payload.append('duration', form.duration)
    if (form.artist) payload.append('artist', form.artist)
    if (form.genre) payload.append('artist_types', form.genre)
    if (posterFile) payload.append('poster', posterFile)

    try {
      const response = await fetch(isEdit ? `${BASE}/producer/shows/${slug}/` : `${BASE}/producer/shows/`, {
        method: isEdit ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCookie('csrftoken') || localStorage.getItem('csrf_token') || '',
        },
        body: payload,
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const mapped = flattenErrors(body)
        setErrors(Object.keys(mapped).length ? mapped : { _global: `Erreur ${response.status}` })
        return
      }

      navigate('/producer/shows')
    } catch {
      setErrors({
        _global: t('producer.network_error', { defaultValue: 'Erreur reseau. Reessayez dans un instant.' }),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="psf-page">{t('producer.loading', { defaultValue: 'Chargement...' })}</div>
  }

  return (
    <div className="psf-page">
      <button className="psf-breadcrumb" onClick={() => navigate('/producer/shows')}>
        {t('producer.back_shows', { defaultValue: 'Mes spectacles' })}
      </button>

      <header className="psf-header">
        <h1 className="psf-title">
          {isEdit
            ? t('producer.edit_show_title', { defaultValue: 'Modifier le spectacle' })
            : t('producer.create_show_title', { defaultValue: 'Creer un spectacle' })}
        </h1>
      </header>

      <form className="psf-form" onSubmit={handleSubmit} noValidate>
        {errors._global && <p className="psf-error-global">{errors._global}</p>}

        <div className="psf-field">
          <label className="psf-label" htmlFor="title">
            {t('producer.title_label', { defaultValue: 'Titre' })} <span className="psf-required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`psf-input${errors.title ? ' psf-input--error' : ''}`}
            value={form.title}
            onChange={handleChange}
            placeholder={t('producer.title_placeholder', { defaultValue: 'Nom du spectacle' })}
          />
          {errors.title && <span className="psf-field-error">{errors.title}</span>}
        </div>

        <div className="psf-field">
          <label className="psf-label" htmlFor="description">
            {t('producer.description_label', { defaultValue: 'Description' })}
          </label>
          <textarea
            id="description"
            name="description"
            className={`psf-input psf-textarea${errors.description ? ' psf-input--error' : ''}`}
            value={form.description}
            onChange={handleChange}
            rows={5}
            placeholder={t('producer.description_placeholder', { defaultValue: 'Presentation du spectacle...' })}
          />
          {errors.description && <span className="psf-field-error">{errors.description}</span>}
        </div>

        <div className="psf-row">
          <div className="psf-field">
            <label className="psf-label" htmlFor="description_nl">
              {t('producer.description_nl_label', { defaultValue: 'Description (NL)' })}
            </label>
            <textarea
              id="description_nl"
              name="description_nl"
              className="psf-input psf-textarea"
              value={form.description_nl}
              onChange={handleChange}
              rows={3}
              placeholder={t('producer.description_nl_placeholder', { defaultValue: 'Beschrijving in het Nederlands...' })}
            />
          </div>
          <div className="psf-field">
            <label className="psf-label" htmlFor="description_en">
              {t('producer.description_en_label', { defaultValue: 'Description (EN)' })}
            </label>
            <textarea
              id="description_en"
              name="description_en"
              className="psf-input psf-textarea"
              value={form.description_en}
              onChange={handleChange}
              rows={3}
              placeholder={t('producer.description_en_placeholder', { defaultValue: 'Description in English...' })}
            />
          </div>
        </div>

        <div className="psf-row">
          <div className="psf-field">
            <label className="psf-label" htmlFor="artist">
              {t('producer.artist_label', { defaultValue: 'Artiste principal' })}
            </label>
            <select
              id="artist"
              name="artist"
              className={`psf-input${errors.artist ? ' psf-input--error' : ''}`}
              value={form.artist}
              onChange={handleChange}
            >
              <option value="">{t('producer.artist_placeholder', { defaultValue: 'Selectionner un artiste' })}</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.stage_name || artist.name || `${artist.firstname || ''} ${artist.lastname || ''}`.trim() || `Artiste #${artist.id}`}
                </option>
              ))}
            </select>
            {errors.artist && <span className="psf-field-error">{errors.artist}</span>}
          </div>

          <div className="psf-field">
            <label className="psf-label" htmlFor="genre">
              {t('producer.genre_label', { defaultValue: 'Genre' })}
            </label>
            <select
              id="genre"
              name="genre"
              className={`psf-input${errors.artist_types ? ' psf-input--error' : ''}`}
              value={form.genre}
              onChange={handleChange}
            >
              <option value="">{t('producer.genre_placeholder', { defaultValue: 'Selectionner un genre' })}</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.type || genre.name || `Genre #${genre.id}`}
                </option>
              ))}
            </select>
            {errors.artist_types && <span className="psf-field-error">{errors.artist_types}</span>}
          </div>
        </div>

        <div className="psf-row">
          <div className="psf-field">
            <label className="psf-label" htmlFor="duration">
              {t('producer.duration_label', { defaultValue: 'Duree (minutes)' })}
            </label>
            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              className={`psf-input${errors.duration ? ' psf-input--error' : ''}`}
              value={form.duration}
              onChange={handleChange}
              placeholder="90"
            />
            {errors.duration && <span className="psf-field-error">{errors.duration}</span>}
          </div>

          <div className="psf-field">
            <label className="psf-label" htmlFor="spoken_language">
              {t('producer.language_label', { defaultValue: 'Langue' })}
            </label>
            <select
              id="spoken_language"
              name="spoken_language"
              className={`psf-input${errors.spoken_language ? ' psf-input--error' : ''}`}
              value={form.spoken_language}
              onChange={handleChange}
            >
              <option value="fr">Francais</option>
              <option value="nl">Neerlandais</option>
              <option value="en">Anglais</option>
            </select>
            {errors.spoken_language && <span className="psf-field-error">{errors.spoken_language}</span>}
          </div>
        </div>

        <div className="psf-field">
          <label className="psf-label" htmlFor="created_in">
            {t('producer.created_in_label', { defaultValue: 'Annee de creation' })}
          </label>
          <input
            id="created_in"
            name="created_in"
            type="number"
            min="1900"
            max="2100"
            className={`psf-input${errors.created_in ? ' psf-input--error' : ''}`}
            value={form.created_in}
            onChange={handleChange}
          />
          {errors.created_in && <span className="psf-field-error">{errors.created_in}</span>}
        </div>

        <div className="psf-field">
          <label className="psf-label">
            {t('producer.poster_label', { defaultValue: 'Image du spectacle' })}
          </label>
          <div
            className={`psf-file-zone${errors.poster_url ? ' psf-file-zone--error' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {posterPreview ? (
              <img src={posterPreview} alt={form.title || 'Apercu'} className="psf-preview" />
            ) : (
              <div className="psf-file-placeholder">
                <span className="psf-file-icon">IMG</span>
                <span>{t('producer.poster_pick', { defaultValue: 'Cliquer pour choisir une image' })}</span>
                <span className="psf-file-hint">{t('producer.poster_hint', { defaultValue: 'PNG, JPG ou WEBP' })}</span>
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
              onClick={() => {
                setPosterFile(null)
                setPosterPreview(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              {t('producer.remove_image', { defaultValue: 'Supprimer l image' })}
            </button>
          )}
          {errors.poster_url && <span className="psf-field-error">{errors.poster_url}</span>}
        </div>

        <div className="psf-actions">
          <button type="button" className="psf-btn psf-btn--outline" onClick={() => navigate('/producer/shows')} disabled={submitting}>
            {t('producer.cancel', { defaultValue: 'Annuler' })}
          </button>
          <button type="submit" className="psf-btn psf-btn--primary" disabled={submitting}>
            {submitting
              ? t('producer.saving', { defaultValue: 'Enregistrement...' })
              : isEdit
                ? t('producer.save_show', { defaultValue: 'Mettre a jour' })
                : t('producer.create_show_cta', { defaultValue: 'Creer le spectacle' })}
          </button>
        </div>
      </form>
    </div>
  )
}
