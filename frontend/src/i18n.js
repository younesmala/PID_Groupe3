import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import fr from './locales/fr/translation.json'
import nl from './locales/nl/translation.json'
import en from './locales/en/translation.json'

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    nl: { translation: nl },
    en: { translation: en },
  },
  lng: localStorage.getItem('language')?.toLowerCase() || 'fr',
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
