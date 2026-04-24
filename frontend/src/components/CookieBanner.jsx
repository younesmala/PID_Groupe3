import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './CookieBanner.css';

const CookieBanner = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    setVisible(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookie_consent', 'necessary');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner__content">
        <h3>{t('cookies.title')}</h3>
        <p>{t('cookies.description')}</p>
        <div className="cookie-banner__buttons">
          <button onClick={acceptAll} className="cookie-btn cookie-btn--accept">
            {t('cookies.accept_all')}
          </button>
          <button onClick={acceptNecessary} className="cookie-btn cookie-btn--necessary">
            {t('cookies.necessary_only')}
          </button>
          <button onClick={decline} className="cookie-btn cookie-btn--decline">
            {t('cookies.decline')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;