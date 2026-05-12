import React, { useState, useEffect } from 'react';
import { getStoredUsername } from '../services/authService';
import './ReviewSection.css';

async function fetchApprovedComments(slug) {
  const res = await fetch(`/api/shows/${slug}/comments/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Erreur chargement commentaires');
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'));
  return match ? match.pop() : '';
}

async function postComment(slug, content) {
  const res = await fetch(`/api/shows/${slug}/comments/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken') || localStorage.getItem('csrf_token') || '',
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Erreur ${res.status}`);
  }
  return res.json();
}

export default function CommentSection({ showSlug }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const isLoggedIn = !!getStoredUsername();

  useEffect(() => {
    if (!showSlug) return;
    setIsLoading(true);
    fetchApprovedComments(showSlug)
      .then(setComments)
      .catch(() => setStatusMsg({ type: 'error', text: 'Impossible de charger les commentaires.' }))
      .finally(() => setIsLoading(false));
  }, [showSlug]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await postComment(showSlug, content.trim());
      setStatusMsg({ type: 'success', text: 'Votre commentaire a été soumis et sera visible après validation.' });
      setShowForm(false);
      setContent('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  }

  return (
    <div className="review-section" id="comments-section" style={{ marginTop: '2rem' }}>
      <h3>Commentaires</h3>

      <div className="reviews-list">
        {isLoading ? (
          <p className="loading-text">Chargement…</p>
        ) : comments.length > 0 ? (
          comments.map(c => (
            <div key={c.id} className="review-item">
              <div className="review-header">
                <strong>{c.username}</strong>
                <small>{new Date(c.created_at).toLocaleDateString()}</small>
              </div>
              <p>{c.content}</p>
            </div>
          ))
        ) : !statusMsg.text ? (
          <p className="no-reviews">Aucun commentaire pour le moment.</p>
        ) : null}
      </div>

      {statusMsg.text && (
        <p className={`status-msg ${statusMsg.type}`}>{statusMsg.text}</p>
      )}

      {!showForm && !statusMsg.text && (
        <div className="review-actions" style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            className="btn-write-review"
            onClick={() =>
              isLoggedIn
                ? setShowForm(true)
                : window.dispatchEvent(new Event('open-login-modal'))
            }
          >
            Laisser un commentaire
          </button>
        </div>
      )}

      {showForm && isLoggedIn && (
        <form onSubmit={handleSubmit} className="review-form">
          <textarea
            required
            placeholder="Votre commentaire…"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
          />
          <div className="form-actions">
            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-submit">
              Envoyer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
