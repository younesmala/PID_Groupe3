import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Search.css';

const Search = () => {
  const { t } = useTranslation();
  const [shows, setShows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterBookable, setFilterBookable] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/shows/')
      .then(res => res.json())
      .then(data => {
        setShows(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...shows];

    // Recherche par titre
    if (search) {
      result = result.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtre réservable
    if (filterBookable === 'yes') {
      result = result.filter(s => s.bookable);
    } else if (filterBookable === 'no') {
      result = result.filter(s => !s.bookable);
    }

    // Tri
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'price') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    setFiltered(result);
  }, [search, filterBookable, sortBy, shows]);

  return (
    <div className="search-page">
      <h1>{t('search.title')}</h1>

      <div className="search-filters">
        <input
          type="text"
          placeholder={t('search.placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={filterBookable}
          onChange={e => setFilterBookable(e.target.value)}
          className="search-select"
        >
          <option value="all">{t('search.all')}</option>
          <option value="yes">{t('search.bookable')}</option>
          <option value="no">{t('search.not_bookable')}</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="search-select"
        >
          <option value="title">{t('search.sort_title')}</option>
          <option value="date">{t('search.sort_date')}</option>
          <option value="price">{t('search.sort_price')}</option>
        </select>
      </div>

      {loading ? (
        <p>{t('search.loading')}</p>
      ) : filtered.length === 0 ? (
        <p>{t('search.no_results')}</p>
      ) : (
        <div className="search-results">
          <p>{t('search.results_count', { count: filtered.length })}</p>
          <div className="search-grid">
            {filtered.map(show => (
              <div key={show.id} className="search-card">
                <h3>{show.title}</h3>
                <p>{show.description?.substring(0, 100)}...</p>
                <span className={`badge ${show.bookable ? 'badge--green' : 'badge--red'}`}>
                  {show.bookable ? t('search.bookable') : t('search.not_bookable')}
                </span>
                <Link to={`/shows/${show.slug}`} className="search-card__link">
                  {t('search.view')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;