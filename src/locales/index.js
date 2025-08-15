// Exportar todas las localizaciones disponibles
import es from './es.js'
import en from './en.js'

// Configuración de idiomas disponibles
export const availableLocales = [
  {
    code: 'es',
    name: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }
]

// Idioma por defecto (español siempre como default)
export const defaultLocale = 'es'

// Detectar idioma del navegador con soporte limitado
export const getBrowserLocale = () => {
  const browserLang = navigator.language || navigator.userLanguage
  const shortLang = browserLang.split('-')[0]

  // Verificar si tenemos soporte para el idioma detectado
  const supportedLang = availableLocales.find(locale => locale.code === shortLang)
  return supportedLang ? shortLang : defaultLocale
}

// Mensajes de todos los idiomas
export const messages = {
  es,
  en
}

// Exportar por defecto para importación fácil
export default {
  messages,
  availableLocales,
  defaultLocale,
  getBrowserLocale
}
