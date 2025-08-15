// Configuración de Vue I18n para DoseCron
import { createI18n } from 'vue-i18n'
import { messages, defaultLocale, getBrowserLocale } from '../locales/index.js'

// Configurar i18n con opciones optimizadas para producción
const i18n = createI18n({
  // Usar Composition API mode para mejor compatibilidad con Vue 3
  legacy: false,

  // Idioma inicial (español por defecto)
  locale: defaultLocale,

  // Idioma de respaldo
  fallbackLocale: defaultLocale,

  // Mensajes de traducción
  messages,

  // Configuraciones adicionales
  globalInjection: true, // Permite usar $t en templates
  silentTranslationWarn: true, // Silenciar warnings en producción
  silentFallbackWarn: true,

  // Formatters personalizados para números, fechas, etc.
  numberFormats: {
    'es': {
      currency: {
        style: 'currency',
        currency: 'EUR',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    },
    'en': {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    }
  },

  // Formatos de fecha (aunque usamos date-fns principalmente)
  datetimeFormats: {
    'es': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric'
      }
    },
    'en': {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      },
      long: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }
    }
  }
})

export default i18n
