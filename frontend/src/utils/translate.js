const AUTO_TRANSLATE_LANGS = new Set(['en', 'nl'])

export async function translateTextDirect(text, targetLang) {
  if (!text || !AUTO_TRANSLATE_LANGS.has(targetLang)) {
    return text
  }

  const sourceCandidates = ['fr', 'en', 'nl'].filter((lang) => lang !== targetLang)

  for (const sourceLang of sourceCandidates) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    const res = await fetch(url)

    if (!res.ok) continue

    const payload = await res.json()
    const translated = payload?.responseData?.translatedText

    if (translated && !translated.toLowerCase().includes('invalid source language')) {
      return translated
    }
  }

  throw new Error('Translation unavailable')
}

export function needsTranslation(show, field, lang) {
  if (!AUTO_TRANSLATE_LANGS.has(lang)) return false
  return !show[`${field}_${lang}`]
}
