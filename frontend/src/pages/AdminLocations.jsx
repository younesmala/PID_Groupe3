import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './AdminUsers.css'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token') || ''

  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(method !== 'GET' ? { 'X-CSRFToken': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  return response
}

export default function AdminLocations() {
  const { t, i18n } = useTranslation()
  const [locations, setLocations] = useState([])
  const [localitiesById, setLocalitiesById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [formData, setFormData] = useState({
    designation: '',
    address: '',
    locality: '',
    phone: '',
    website: '',
  })

  const topActionStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '18px',
    border: '1px solid rgba(217, 119, 6, 0.26)', background: '#d9911d',
    color: '#0f172a', textDecoration: 'none', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)'
  }

  useEffect(() => {
    loadLocations()
  }, [])

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  const localities = Object.values(localitiesById).sort((a, b) => {
    const postalA = (a.postal_code || '').toString()
    const postalB = (b.postal_code || '').toString()
    if (postalA !== postalB) return postalA.localeCompare(postalB)
    return (a.locality || '').localeCompare(b.locality || '')
  })

  const slugify = (value) =>
    (value || '')
      .toString()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const formatLocality = (localityId) => {
    const locality = localitiesById[localityId]
    if (!locality) return localityId || '-'
    const postalCode = locality.postal_code || ''
    const localityName = locality.locality || ''
    return `${postalCode} ${localityName}`.trim() || '-'
  }

  function toggleCreateForm() {
    setShowCreateForm((prev) => !prev)
    setCreateError('')
    setCreateSuccess('')
  }

  async function loadLocations() {
    setLoading(true)
    setError('')
    try {
      const [locationsRes, localitiesRes] = await Promise.all([
        apiFetch('/locations/'),
        apiFetch('/localities/'),
      ])

      const locationsData = await locationsRes.json().catch(() => [])
      const localitiesData = await localitiesRes.json().catch(() => [])

      if (!locationsRes.ok) {
        throw new Error(
          locationsData?.detail || t('admin.locations_error_load', { defaultValue: 'Erreur lors du chargement des lieux.' }),
        )
      }

      if (localitiesRes.ok && Array.isArray(localitiesData)) {
        const localitiesMap = localitiesData.reduce((acc, locality) => {
          acc[locality.id] = locality
          return acc
        }, {})
        setLocalitiesById(localitiesMap)
      }

      setLocations(sortByNewestId(Array.isArray(locationsData) ? locationsData : []))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreateLocation(event) {
    event.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    if (!formData.designation.trim() || !formData.address.trim() || !formData.locality) {
      setCreateError(t('admin.locations_validation_required', { defaultValue: 'Please complete at least: name, address and locality.' }))
      return
    }

    const baseSlug = slugify(formData.designation) || 'nouveau-lieu'
    const payload = {
      slug: `${baseSlug}-${Date.now()}`,
      designation: formData.designation.trim(),
      address: formData.address.trim(),
      locality: Number(formData.locality),
      phone: formData.phone.trim() || null,
      website: formData.website.trim() || null,
    }

    setCreateLoading(true)
    try {
      const res = await apiFetch('/locations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const detail = data?.detail || Object.values(data || {}).flat?.().join(' ') || t('admin.locations_error_create', { defaultValue: 'Error while creating location.' })
        throw new Error(detail)
      }

      setLocations((prev) => sortByNewestId([data, ...prev]))
      setFormData({ designation: '', address: '', locality: '', phone: '', website: '' })
      setShowCreateForm(false)
      setCreateSuccess(t('admin.locations_success_create', { defaultValue: 'The new location has been added successfully.' }))
    } catch (err) {
      setCreateError(err.message || t('admin.locations_error_create', { defaultValue: 'Error while creating location.' }))
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <main className="admin-users">
      <section>
        <header>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link to={`/${i18n.language}/admin/dashboard`} style={topActionStyle}>
              ← {t('back_to_dashboard')}
            </Link>
            <button type="button" onClick={loadLocations} style={topActionStyle}>
              {t('refresh_button', { defaultValue: 'Rafraîchir' })}
            </button>
            <button
              type="button"
              onClick={toggleCreateForm}
              style={topActionStyle}
            >
              {showCreateForm
                ? t('admin.locations_form_close', { defaultValue: 'Close form' })
                : t('admin.locations_form_open', { defaultValue: '+ Add location' })}
            </button>
          </div>
          <h1>{t('navbar.admin_locations', { defaultValue: 'Lieux' })}</h1>
        </header>

        {createSuccess && <p className="admin-locations-state admin-locations-state--success">{createSuccess}</p>}

        {showCreateForm && (
          <form className="location-form-card" onSubmit={handleCreateLocation}>
            <div className="location-form-header">
              <h2>{t('admin.locations_form_title', { defaultValue: 'New production location' })}</h2>
              <p>{t('admin.locations_form_subtitle', { defaultValue: 'Fill in the main information. Fields marked with * are required.' })}</p>
            </div>

            <div className="location-form-grid">
              <label className="location-form-field">
                <span>{t('admin.locations_form_name', { defaultValue: 'Location name *' })}</span>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder={t('admin.locations_form_name_placeholder', { defaultValue: 'Ex: Theatre des Galeries' })}
                  autoComplete="organization"
                  required
                />
              </label>

              <label className="location-form-field">
                <span>{t('admin.locations_form_address', { defaultValue: 'Address *' })}</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('admin.locations_form_address_placeholder', { defaultValue: 'Ex: Galerie du Roi 32' })}
                  autoComplete="street-address"
                  required
                />
              </label>

              <label className="location-form-field">
                <span>{t('admin.locations_form_locality', { defaultValue: 'Locality *' })}</span>
                <select
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">{t('admin.locations_form_choose_locality', { defaultValue: 'Choose a locality' })}</option>
                  {localities.map((locality) => (
                    <option key={locality.id} value={locality.id}>
                      {(locality.postal_code || '').toString()} {locality.locality || ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="location-form-field">
                <span>{t('admin.locations_form_phone', { defaultValue: 'Phone' })}</span>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('admin.locations_form_phone_placeholder', { defaultValue: 'Ex: +32 2 555 55 55' })}
                  autoComplete="tel"
                />
              </label>

              <label className="location-form-field location-form-field--full">
                <span>{t('admin.locations_form_website', { defaultValue: 'Website' })}</span>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder={t('admin.locations_form_website_placeholder', { defaultValue: 'https://www.example.com' })}
                  autoComplete="url"
                />
              </label>
            </div>

            {createError && <p className="admin-locations-state admin-locations-state--error">{createError}</p>}

            <div className="location-form-actions">
              <button
                type="button"
                className="location-form-btn location-form-btn--secondary"
                onClick={toggleCreateForm}
                disabled={createLoading}
              >
                {t('admin.locations_form_cancel', { defaultValue: 'Cancel' })}
              </button>
              <button type="submit" className="location-form-btn location-form-btn--primary" disabled={createLoading}>
                {createLoading
                  ? t('admin.locations_form_submitting', { defaultValue: 'Saving...' })
                  : t('admin.locations_form_submit', { defaultValue: 'Save location' })}
              </button>
            </div>
          </form>
        )}

        {loading && <p>{t('loading', { defaultValue: 'Chargement…' })}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && locations.length === 0 && (
          <p>{t('admin.locations_empty', { defaultValue: 'Aucun lieu trouvé.' })}</p>
        )}

        {!loading && locations.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('admin.locations_col_id', { defaultValue: 'ID' })}</th>
                  <th>{t('admin.locations_col_name', { defaultValue: 'Nom' })}</th>
                  <th>{t('admin.locations_col_address', { defaultValue: 'Adresse' })}</th>
                  <th>{t('admin.locations_col_locality', { defaultValue: 'Localité' })}</th>
                  <th>{t('admin.locations_col_phone', { defaultValue: 'Téléphone' })}</th>
                  <th>{t('admin.locations_col_website', { defaultValue: 'Site web' })}</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((loc) => (
                  <tr key={loc.id}>
                    <td>{loc.id}</td>
                    <td>{loc.designation || '-'}</td>
                    <td>{loc.address || '-'}</td>
                    <td>{formatLocality(loc.locality)}</td>
                    <td>{loc.phone || '-'}</td>
                    <td>
                      {loc.website ? (
                        <a href={loc.website} target="_blank" rel="noopener noreferrer">
                          {loc.website}
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
