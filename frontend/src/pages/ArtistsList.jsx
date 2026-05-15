import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './AdminUsers.css'

function getArtistName(artist) {
  const fullName = [artist?.firstname, artist?.lastname].filter(Boolean).join(' ').trim()
  return fullName || artist?.name || '-'
}

function getArtistPhoto(artist) {
  return artist?.photo || artist?.picture || artist?.image || artist?.avatar || `https://i.pravatar.cc/80?u=${artist?.id}`
}

function getArtistLocality(artist) {
  if (artist?.locality && typeof artist.locality === 'object') {
    const postalCode = artist.locality.postal_code || ''
    const localityName = artist.locality.locality || artist.locality.name || ''
    const combined = `${postalCode} ${localityName}`.trim()
    return combined || '-'
  }

  return artist?.locality_name || artist?.locality || '-'
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function ensureCsrfToken(forceRefresh = false) {
  const cookieToken = getCookie('csrftoken')
  if (!forceRefresh && cookieToken) {
    localStorage.setItem('csrf_token', cookieToken)
    return cookieToken
  }

  const storedToken = localStorage.getItem('csrf_token')
  if (!forceRefresh && storedToken) return storedToken

  const response = await fetch('/api/auth/csrf/', {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await response.json().catch(() => ({}))
  const csrfToken = data?.csrf_token || getCookie('csrftoken') || ''

  if (csrfToken) {
    localStorage.setItem('csrf_token', csrfToken)
  }

  return csrfToken
}

async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = method === 'GET' ? '' : await ensureCsrfToken()

  const requestOptions = {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(method !== 'GET' ? { 'X-CSRFToken': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  }

  let response = await fetch(`/api${path}`, requestOptions)

  if (method !== 'GET' && response.status === 403) {
    const responseText = await response.clone().text().catch(() => '')
    const looksLikeCsrfError = /csrf/i.test(responseText)

    if (looksLikeCsrfError) {
      const refreshedToken = await ensureCsrfToken(true)
      response = await fetch(`/api${path}`, {
        ...requestOptions,
        headers: {
          ...(requestOptions.headers || {}),
          'X-CSRFToken': refreshedToken,
        },
      })
    }
  }

  return response
}

function ArtistsList() {
  const { t, i18n } = useTranslation()
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingArtistId, setDeletingArtistId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [localitiesById, setLocalitiesById] = useState({})
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    photoFile: null,
    photoName: '',
    address: '',
    locality: '',
    phone: '',
    email: '',
  })
  const [editingArtistId, setEditingArtistId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    firstname: '',
    lastname: '',
    photoFile: null,
    photoName: '',
    address: '',
    locality: '',
    phone: '',
    email: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const importInputRef = useRef(null)

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  const localities = Object.values(localitiesById).sort((a, b) => {
    const postalA = (a.postal_code || '').toString()
    const postalB = (b.postal_code || '').toString()
    if (postalA !== postalB) return postalA.localeCompare(postalB)
    return (a.locality || '').localeCompare(b.locality || '')
  })

  const formatLocality = (localityId) => {
    const locality = localitiesById[localityId]
    if (!locality) return localityId || '-'
    const postalCode = locality.postal_code || ''
    const localityName = locality.locality || ''
    return `${postalCode} ${localityName}`.trim() || '-'
  }

  async function loadArtists() {
    setLoading(true)
    setError('')

    try {
      const [artistsRes, localitiesRes] = await Promise.all([
        apiFetch('/artists/'),
        apiFetch('/localities/'),
      ])

      const artistsData = await artistsRes.json().catch(() => [])
      const localitiesData = await localitiesRes.json().catch(() => [])

      if (!artistsRes.ok) {
        throw new Error(artistsData?.detail || t('artists_page.error', { defaultValue: 'Unable to load artists.' }))
      }

      if (localitiesRes.ok && Array.isArray(localitiesData)) {
        const localitiesMap = localitiesData.reduce((acc, locality) => {
          acc[locality.id] = locality
          return acc
        }, {})
        setLocalitiesById(localitiesMap)
      }

      setArtists(sortByNewestId(Array.isArray(artistsData) ? artistsData : []))
    } catch (err) {
      setError(err?.message || t('artists_page.error', { defaultValue: 'Unable to load artists.' }))
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteArtist(artist) {
    const artistId = artist?.id
    if (!artistId) return

    const artistName = getArtistName(artist)
    const confirmDelete = window.confirm(
      t('artists_page.delete_confirm', {
        name: artistName,
        defaultValue: `Voulez-vous vraiment supprimer ${artistName} ?`,
      }),
    )

    if (!confirmDelete) return

    setError('')
    setCreateSuccess('')
    setDeletingArtistId(artistId)

    try {
      const res = await apiFetch(`/artists/${artistId}/`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || t('artists_page.delete_error', { defaultValue: 'Impossible de supprimer cet artiste.' }))
      }

      setArtists((prev) => prev.filter((item) => item.id !== artistId))
      setCreateSuccess(
        t('artists_page.delete_success', {
          defaultValue: 'Artiste supprime avec succes.',
        }),
      )
    } catch (err) {
      setError(err?.message || t('artists_page.delete_error', { defaultValue: 'Impossible de supprimer cet artiste.' }))
    } finally {
      setDeletingArtistId(null)
    }
  }

  function handleEditArtist(artist) {
    setEditingArtistId(artist.id)
    setEditFormData({
      firstname: artist.firstname || '',
      lastname: artist.lastname || '',
      photoFile: null,
      photoName: '',
      address: artist.address || '',
      locality: artist.locality || '',
      phone: artist.phone || '',
      email: artist.email || '',
    })
    setEditError('')
    setEditSuccess('')
  }

  function toggleEditForm() {
    setEditingArtistId(null)
    setEditFormData({
      firstname: '',
      lastname: '',
      photoFile: null,
      photoName: '',
      address: '',
      locality: '',
      phone: '',
      email: '',
    })
    setEditError('')
    setEditSuccess('')
  }

  function handleEditInputChange(event) {
    const { name, value, files, type } = event.target

    if (type === 'file') {
      const file = files?.[0] || null
      setEditFormData((prev) => ({
        ...prev,
        [name]: file,
        photoName: file?.name || '',
      }))
      return
    }

    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleUpdateArtist(event) {
    event.preventDefault()
    setEditError('')
    setEditSuccess('')

    if (!editFormData.firstname.trim() || !editFormData.lastname.trim()) {
      setEditError(t('artists_page.create_required', { defaultValue: 'Veuillez completer au moins le prenom et le nom.' }))
      return
    }

    setEditLoading(true)
    try {
      const payload = new FormData()
      payload.append('firstname', editFormData.firstname.trim())
      payload.append('lastname', editFormData.lastname.trim())

      if (editFormData.photoFile) {
        payload.append('photo_file', editFormData.photoFile)
      }

      if (editFormData.address.trim()) payload.append('address', editFormData.address.trim())
      if (editFormData.locality) payload.append('locality', String(Number(editFormData.locality)))
      if (editFormData.phone.trim()) payload.append('phone', editFormData.phone.trim())
      if (editFormData.email.trim()) payload.append('email', editFormData.email.trim())

      const res = await apiFetch(`/artists/${editingArtistId}/`, {
        method: 'PUT',
        body: payload,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const detail = data?.detail || Object.values(data || {}).flat?.().join(' ') || t('artists_page.update_error', { defaultValue: 'Impossible de modifier cet artiste.' })
        throw new Error(detail)
      }

      setArtists((prev) => prev.map((item) => (item.id === editingArtistId ? data : item)))
      toggleEditForm()
        setCreateSuccess(t('artists_page.update_success', { defaultValue: 'Artiste modifié avec succès.' }))
    } catch (err) {
      setEditError(err?.message || t('artists_page.update_error', { defaultValue: 'Impossible de modifier cet artiste.' }))
    } finally {
      setEditLoading(false)
    }
  }

  function toggleCreateForm() {
    setShowCreateForm((prev) => !prev)
    setCreateError('')
    setCreateSuccess('')
  }

  function handleInputChange(event) {
    const { name, value, files, type } = event.target

    if (type === 'file') {
      const file = files?.[0] || null
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        photoName: file?.name || '',
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreateArtist(event) {
    event.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    if (!formData.firstname.trim() || !formData.lastname.trim()) {
      setCreateError(t('artists_page.create_required', { defaultValue: 'Veuillez completer au moins le prenom et le nom.' }))
      return
    }

    setCreateLoading(true)
    try {
      const payload = new FormData()
      payload.append('firstname', formData.firstname.trim())
      payload.append('lastname', formData.lastname.trim())

      if (formData.photoFile) {
        payload.append('photo_file', formData.photoFile)
      }

      if (formData.address.trim()) payload.append('address', formData.address.trim())
      if (formData.locality) payload.append('locality', String(Number(formData.locality)))
      if (formData.phone.trim()) payload.append('phone', formData.phone.trim())
      if (formData.email.trim()) payload.append('email', formData.email.trim())

      const res = await apiFetch('/artists/', {
        method: 'POST',
        body: payload,
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const detail = data?.detail || Object.values(data || {}).flat?.().join(' ') || t('artists_page.create_error', { defaultValue: 'Impossible de creer cet artiste.' })
        throw new Error(detail)
      }

      setArtists((prev) => sortByNewestId([data, ...prev]))
      setFormData({
        firstname: '',
        lastname: '',
        photoFile: null,
        photoName: '',
        address: '',
        locality: '',
        phone: '',
        email: '',
      })
      setShowCreateForm(false)
      setCreateSuccess(t('artists_page.create_success', { defaultValue: 'Le nouvel artiste a ete ajoute avec succes.' }))
    } catch (err) {
      setCreateError(err?.message || t('artists_page.create_error', { defaultValue: 'Impossible de creer cet artiste.' }))
    } finally {
      setCreateLoading(false)
    }
  }

  useEffect(() => {
    loadArtists()
  }, [])

  const escapeCsvValue = (value) => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  const parseCsv = (text) => {
    const rows = []
    let row = []
    let field = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      const next = text[i + 1]

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field)
        field = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += char
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field)
      rows.push(row)
    }

    return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
  }

  const mapCsvToArtists = (csvRows) => {
    if (!csvRows.length) return []

    const header = csvRows[0].map((h) => String(h || '').trim().toLowerCase())
    const hasHeader = header.some((h) => ['id', 'firstname', 'lastname', 'name', 'nom'].includes(h))
    const dataRows = csvRows.slice(hasHeader ? 1 : 0)

    return dataRows
      .map((cells) => {
        const rawId = Number(cells[0])
        const first = String(cells[1] || '').trim()
        const last = String(cells[2] || '').trim()
        const photo = String(cells[3] || '').trim()
        const address = String(cells[4] || '').trim()
        const locality = String(cells[5] || '').trim()
        const phone = String(cells[6] || '').trim()
        const email = String(cells[7] || '').trim()

        if (!first && !last) return null

        return {
          id: Number.isFinite(rawId) && rawId > 0 ? rawId : null,
          firstname: first,
          lastname: last,
          photo: photo || '',
          address: address || '',
          locality: locality || '',
          phone: phone || '',
          email: email || '',
        }
      })
      .filter(Boolean)
  }

  const mapJsonToArtists = (items) => {
    if (!Array.isArray(items)) {
      throw new Error(t('artists_page.import_invalid', { defaultValue: 'Fichier invalide.' }))
    }

    return items
      .map((item) => {
        const first = String(item?.firstname || item?.first_name || '').trim()
        const last = String(item?.lastname || item?.last_name || '').trim()
        const rawId = Number(item?.id)

        if (!first && !last) return null

        return {
          id: Number.isFinite(rawId) && rawId > 0 ? rawId : null,
          firstname: first,
          lastname: last,
          photo: String(item?.photo || '').trim() || '',
          address: String(item?.address || '').trim() || '',
          locality: item?.locality || '',
          phone: String(item?.phone || '').trim() || '',
          email: String(item?.email || '').trim() || '',
        }
      })
      .filter(Boolean)
  }

  const handleExportCsv = () => {
    const headers = [
      t('artists_page.col_id', { defaultValue: 'ID' }),
      'firstname',
      'lastname',
      'photo',
      'address',
      'locality',
      'phone',
      'email',
    ]

    const rows = artists.map((artist) => [
      artist.id ?? '',
      artist.firstname ?? '',
      artist.lastname ?? '',
      artist.photo ?? '',
      artist.address ?? '',
      artist.locality ?? '',
      artist.phone ?? '',
      artist.email ?? '',
    ])

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `artists-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    const payload = artists.map((artist) => ({
      id: artist.id ?? null,
      firstname: artist.firstname ?? '',
      lastname: artist.lastname ?? '',
      photo: artist.photo ?? '',
      address: artist.address ?? '',
      locality: artist.locality ?? '',
      phone: artist.phone ?? '',
      email: artist.email ?? '',
    }))

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `artists-${date}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      let imported = []

      if (extension === 'csv') {
        imported = mapCsvToArtists(parseCsv(text))
      } else if (extension === 'json') {
        imported = mapJsonToArtists(JSON.parse(text))
      } else {
        throw new Error(t('artists_page.import_format', { defaultValue: 'Formats acceptes: CSV, JSON.' }))
      }

      if (!imported.length) {
        throw new Error(t('artists_page.import_empty', { defaultValue: 'Aucune donnee a importer.' }))
      }

      for (const artist of imported) {
        const payload = {
          firstname: artist.firstname,
          lastname: artist.lastname,
          photo: artist.photo || null,
          address: artist.address || null,
          locality: artist.locality ? Number(artist.locality) : null,
          phone: artist.phone || null,
          email: artist.email || null,
        }

        if (artist.id) {
          try {
            const res = await apiFetch(`/artists/${artist.id}/`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (res.ok) continue
          } catch {
            // Fall back to create when artist ID does not exist.
          }
        }

        await apiFetch('/artists/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      await loadArtists()
      setError('')
    } catch (err) {
      setError(err?.message || t('artists_page.import_error', { defaultValue: 'Impossible d importer ce fichier.' }))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="admin-users">
      <section>
        <header>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link to={`/${i18n.language}/producer/dashboard`} className="admin-luminous-action-btn">
              ← {t('back_to_dashboard')}
            </Link>
            <button type="button" onClick={loadArtists} className="admin-luminous-action-btn">
              {t('refresh_button', { defaultValue: 'Refresh' })}
            </button>
            <button
              type="button"
              onClick={toggleCreateForm}
              className="admin-luminous-action-btn"
            >
              {showCreateForm
                ? t('artists_page.form_close', { defaultValue: 'Fermer le formulaire' })
                : t('artists_page.form_open', { defaultValue: '+ Ajouter un artiste' })}
            </button>
          </div>

          <h1>{t('artists_page.title', { defaultValue: 'My artists' })}</h1>
        </header>

        {createSuccess && <p className="admin-locations-state admin-locations-state--success">{createSuccess}</p>}

        {editingArtistId && (
          <form className="location-form-card" onSubmit={handleUpdateArtist}>
            <div className="location-form-header">
              <h2>{t('artists_page.edit_title', { defaultValue: 'Modifier l artiste' })}</h2>
              <p>{t('artists_page.edit_subtitle', { defaultValue: 'Mettez a jour les informations de l artiste.' })}</p>
            </div>

            <div className="location-form-grid">
              <label className="location-form-field">
                <span>{t('artists_page.form_firstname', { defaultValue: 'Prenom *' })}</span>
                <input
                  type="text"
                  name="firstname"
                  value={editFormData.firstname}
                  onChange={handleEditInputChange}
                  placeholder={t('artists_page.form_firstname_placeholder', { defaultValue: 'Ex: Jean' })}
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_lastname', { defaultValue: 'Nom *' })}</span>
                <input
                  type="text"
                  name="lastname"
                  value={editFormData.lastname}
                  onChange={handleEditInputChange}
                  placeholder={t('artists_page.form_lastname_placeholder', { defaultValue: 'Ex: Dupont' })}
                  autoComplete="family-name"
                  required
                />
              </label>

              <div className="location-form-field">
                <span>{t('artists_page.form_photo', { defaultValue: 'Photo' })}</span>
                <div className="location-form-file-picker">
                  <label htmlFor="artist-edit-photo" className="location-form-btn location-form-btn--secondary">
                    {t('artists_page.form_choose_file', { defaultValue: 'Choose file' })}
                  </label>
                  <input
                    id="artist-edit-photo"
                    className="location-form-file-input"
                    type="file"
                    name="photoFile"
                    accept="image/*"
                    onChange={handleEditInputChange}
                  />
                  <small className="location-form-file-name">
                    {editFormData.photoName || t('artists_page.form_no_file', { defaultValue: 'No file selected' })}
                  </small>
                </div>
              </div>

              <label className="location-form-field">
                <span>{t('artists_page.form_address', { defaultValue: 'Adresse' })}</span>
                <input
                  type="text"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  placeholder={t('artists_page.form_address_placeholder', { defaultValue: 'Ex: 123 Rue de Berlin' })}
                  autoComplete="street-address"
                />
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_locality', { defaultValue: 'Localite' })}</span>
                <select
                  name="locality"
                  value={editFormData.locality}
                  onChange={handleEditInputChange}
                >
                  <option value="">{t('artists_page.form_locality_select', { defaultValue: 'Choisir une localite...' })}</option>
                  {localities.map((locality) => (
                    <option key={locality.id} value={locality.id}>
                      {locality.postal_code} {locality.locality}
                    </option>
                  ))}
                </select>
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_phone', { defaultValue: 'Telephone' })}</span>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditInputChange}
                  placeholder={t('artists_page.form_phone_placeholder', { defaultValue: '+32 2 1234 5678' })}
                  autoComplete="tel"
                />
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_email', { defaultValue: 'Email' })}</span>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  placeholder={t('artists_page.form_email_placeholder', { defaultValue: 'artiste@example.com' })}
                  autoComplete="email"
                />
              </label>
            </div>

            {editError && <p className="admin-locations-state admin-locations-state--error">{editError}</p>}

            <div className="location-form-actions">
              <button
                type="button"
                className="location-form-btn location-form-btn--secondary"
                onClick={toggleEditForm}
                disabled={editLoading}
              >
                {t('artists_page.form_cancel', { defaultValue: 'Annuler' })}
              </button>
              <button type="submit" className="location-form-btn location-form-btn--primary" disabled={editLoading}>
                {editLoading
                  ? t('artists_page.form_submitting', { defaultValue: 'Enregistrement...' })
                  : t('artists_page.form_update', { defaultValue: 'Enregistrer les modifications' })}
              </button>
            </div>
          </form>
        )}

        {showCreateForm && (
          <form className="location-form-card" onSubmit={handleCreateArtist}>
            <div className="location-form-header">
              <h2>{t('artists_page.form_title', { defaultValue: 'Nouvel artiste' })}</h2>
              <p>{t('artists_page.form_subtitle', { defaultValue: 'Renseignez les informations principales pour creer un nouvel artiste.' })}</p>
            </div>

            <div className="location-form-grid">
              <label className="location-form-field">
                <span>{t('artists_page.form_firstname', { defaultValue: 'Prenom *' })}</span>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder={t('artists_page.form_firstname_placeholder', { defaultValue: 'Ex: Jean' })}
                  autoComplete="given-name"
                  required
                />
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_lastname', { defaultValue: 'Nom *' })}</span>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder={t('artists_page.form_lastname_placeholder', { defaultValue: 'Ex: Dupont' })}
                  autoComplete="family-name"
                  required
                />
              </label>

              <div className="location-form-field">
                <span>{t('artists_page.form_photo', { defaultValue: 'Photo' })}</span>
                <div className="location-form-file-picker">
                  <label htmlFor="artist-create-photo" className="location-form-btn location-form-btn--secondary">
                    {t('artists_page.form_choose_file', { defaultValue: 'Choose file' })}
                  </label>
                  <input
                    id="artist-create-photo"
                    className="location-form-file-input"
                    type="file"
                    name="photoFile"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  <small className="location-form-file-name">
                    {formData.photoName || t('artists_page.form_no_file', { defaultValue: 'No file selected' })}
                  </small>
                </div>
              </div>

              <label className="location-form-field">
                <span>{t('artists_page.form_address', { defaultValue: 'Adresse' })}</span>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('artists_page.form_address_placeholder', { defaultValue: 'Ex: 123 Rue de Berlin' })}
                  autoComplete="street-address"
                />
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_locality', { defaultValue: 'Localite' })}</span>
                <select
                  name="locality"
                  value={formData.locality}
                  onChange={handleInputChange}
                >
                  <option value="">{t('artists_page.form_locality_select', { defaultValue: 'Choisir une localite...' })}</option>
                  {localities.map((locality) => (
                    <option key={locality.id} value={locality.id}>
                      {locality.postal_code} {locality.locality}
                    </option>
                  ))}
                </select>
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_phone', { defaultValue: 'Telephone' })}</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('artists_page.form_phone_placeholder', { defaultValue: '+32 2 1234 5678' })}
                  autoComplete="tel"
                />
              </label>

              <label className="location-form-field">
                <span>{t('artists_page.form_email', { defaultValue: 'Email' })}</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={t('artists_page.form_email_placeholder', { defaultValue: 'artiste@example.com' })}
                  autoComplete="email"
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
                {t('artists_page.form_cancel', { defaultValue: 'Annuler' })}
              </button>
              <button type="submit" className="location-form-btn location-form-btn--primary" disabled={createLoading}>
                {createLoading
                  ? t('artists_page.form_submitting', { defaultValue: 'Enregistrement...' })
                  : t('artists_page.form_submit', { defaultValue: 'Enregistrer l artiste' })}
              </button>
            </div>
          </form>
        )}

        {loading && <p>{t('artists_page.loading', { defaultValue: 'Loading artists...' })}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && artists.length === 0 && (
          <p>{t('artists_page.empty', { defaultValue: 'No artists found.' })}</p>
        )}

        {!loading && artists.length > 0 && (
          <>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>{t('artists_page.col_id', { defaultValue: 'ID' })}</th>
                    <th>{t('artists_page.col_photo', { defaultValue: 'Photo' })}</th>
                    <th>{t('artists_page.col_name', { defaultValue: 'Name' })}</th>
                    <th>{t('artists_page.col_address', { defaultValue: 'Address' })}</th>
                    <th>{t('artists_page.col_locality', { defaultValue: 'Locality' })}</th>
                    <th>{t('artists_page.col_phone', { defaultValue: 'Phone' })}</th>
                    <th>{t('artists_page.col_email', { defaultValue: 'Email address' })}</th>
                    <th>{t('artists_page.col_action', { defaultValue: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map((artist) => (
                    <tr key={artist.id}>
                      <td>{artist.id ?? '-'}</td>
                      <td>
                        <img
                          src={getArtistPhoto(artist)}
                          alt={getArtistName(artist)}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#f8fafc',
                          }}
                        />
                      </td>
                      <td>{getArtistName(artist)}</td>
                      <td>{artist?.address || artist?.street || '-'}</td>
                      <td>{getArtistLocality(artist)}</td>
                      <td>{artist?.phone || artist?.telephone || '-'}</td>
                      <td>{artist?.email || artist?.mail || '-'}</td>
                      <td>
                        <div className="table-actions-row table-actions-row--nowrap">
                          <button
                            type="button"
                            className="status-toggle-btn status-toggle-btn--info"
                            onClick={() => handleEditArtist(artist)}
                            disabled={editingArtistId !== null}
                          >
                            {t('artists_page.edit', { defaultValue: 'Modifier' })}
                          </button>
                          <button
                            type="button"
                            className="status-toggle-btn status-toggle-btn--danger"
                            onClick={() => handleDeleteArtist(artist)}
                            disabled={deletingArtistId === artist.id}
                          >
                            {deletingArtistId === artist.id
                              ? t('artists_page.deleting', { defaultValue: 'Suppression...' })
                              : t('artists_page.delete', { defaultValue: 'Supprimer' })}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button type="button" className="admin-luminous-action-btn" onClick={() => importInputRef.current?.click()}>
                {t('import_button', { defaultValue: 'Importer' })}
              </button>
              <button type="button" className="admin-luminous-action-btn" onClick={handleExportCsv}>
                {t('export_csv', { defaultValue: 'Export CSV' })}
              </button>
              <button type="button" className="admin-luminous-action-btn" onClick={handleExportJson}>
                {t('export_json', { defaultValue: 'Export JSON' })}
              </button>
            </div>
          </>
        )}

        {!loading && (
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
        )}
      </section>
    </main>
  )
}

export default ArtistsList
