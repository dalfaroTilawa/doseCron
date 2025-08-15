// Composable personalizado para internacionalización en DoseCron
import { computed } from 'vue'
import { useI18n as useVueI18n } from 'vue-i18n'
import { availableLocales, defaultLocale } from '../locales/index.js'

/**
 * Composable personalizado para manejo de internacionalización
 * Extiende vue-i18n con funcionalidades específicas de DoseCron
 */
export function useI18n() {
  const { t, locale, availableLocales: vueLocales } = useVueI18n()

  /**
   * Función de traducción mejorada con contexto específico
   * @param {string} key - Clave de traducción
   * @param {object} params - Parámetros para interpolación
   * @param {string} context - Contexto específico (form, validation, etc.)
   * @returns {string} Texto traducido
   */
  const translate = (key, params = {}, context = null) => {
    try {
      // Si se proporciona contexto, intentar primero con contexto
      if (context) {
        const contextKey = `${context}.${key}`
        const contextTranslation = t(contextKey, params)

        // Si la traducción no es igual a la clave, significa que existe
        if (contextTranslation !== contextKey) {
          return contextTranslation
        }
      }

      // Intentar traducción directa
      return t(key, params)
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`, error)
      return key
    }
  }

  /**
   * Traducción específica para validaciones
   * @param {string} key - Clave de validación
   * @param {object} params - Parámetros adicionales
   * @returns {string} Mensaje de validación traducido
   */
  const validateMessage = (key, params = {}) => {
    return translate(key, params, 'validation')
  }

  /**
   * Traducción específica para errores
   * @param {string} key - Clave de error
   * @param {object} params - Parámetros adicionales
   * @returns {string} Mensaje de error traducido
   */
  const errorMessage = (key, params = {}) => {
    return translate(key, params, 'errors')
  }

  /**
   * Traducción específica para advertencias
   * @param {string} key - Clave de advertencia
   * @param {object} params - Parámetros adicionales
   * @returns {string} Mensaje de advertencia traducido
   */
  const warningMessage = (key, params = {}) => {
    return translate(key, params, 'warnings')
  }

  /**
   * Traducción específica para campos del formulario
   * @param {string} fieldKey - Clave del campo
   * @param {string} property - Propiedad específica (label, helpText, etc.)
   * @returns {string} Texto del campo traducido
   */
  const fieldLabel = (fieldKey, property = 'label') => {
    return translate(`fields.${fieldKey}.${property}`, {}, 'form')
  }

  /**
   * Formatear unidades de tiempo con pluralización
   * @param {number} count - Cantidad
   * @param {string} unit - Unidad (day, week, month, year)
   * @returns {string} Unidad formateada
   */
  const formatTimeUnit = (count, unit) => {
    const isPlural = count !== 1
    const unitKey = isPlural ? `time.units.plural.${unit}s` : `time.units.singular.${unit}`
    return t(unitKey)
  }

  /**
   * Formatear intervalo con pluralización inteligente
   * @param {number} interval - Número de días
   * @returns {string} Intervalo formateado
   */
  const formatInterval = (interval) => {
    return t('time.formats.intervalDays', { count: interval }, interval)
  }

  /**
   * Obtener lista de idiomas disponibles
   */
  const locales = computed(() => availableLocales)

  /**
   * Idioma actual
   */
  const currentLocale = computed({
    get: () => locale.value,
    set: (newLocale) => {
      if (availableLocales.some(l => l.code === newLocale)) {
        locale.value = newLocale
        // Persistir en localStorage
        localStorage.setItem('dosecron-locale', newLocale)
      }
    }
  })

  /**
   * Información del idioma actual
   */
  const currentLocaleInfo = computed(() => {
    return availableLocales.find(l => l.code === currentLocale.value) ||
           availableLocales.find(l => l.code === defaultLocale)
  })

  /**
   * Cambiar idioma con persistencia
   * @param {string} newLocale - Código del nuevo idioma
   */
  const setLocale = (newLocale) => {
    currentLocale.value = newLocale
  }

  /**
   * Verificar si una clave de traducción existe
   * @param {string} key - Clave a verificar
   * @returns {boolean} True si existe la traducción
   */
  const hasTranslation = (key) => {
    try {
      const translation = t(key)
      return translation !== key
    } catch {
      return false
    }
  }

  return {
    // Funciones de traducción
    t: translate,
    translate,
    validateMessage,
    errorMessage,
    warningMessage,
    fieldLabel,

    // Formateo específico
    formatTimeUnit,
    formatInterval,

    // Estado del idioma
    locale: currentLocale,
    currentLocale,
    currentLocaleInfo,
    locales,

    // Utilidades
    setLocale,
    hasTranslation
  }
}
