// Utilidades para generar resumen de configuración
import { format, parseISO } from 'date-fns'
import { formatInterval, formatDuration } from './dateHelpers.js'

/**
 * Formatea la fecha de inicio según el locale
 * @param {string} startDateString - Fecha en formato ISO
 * @param {string} localeCode - Código de locale
 * @param {object} dateLocale - Locale de date-fns
 * @returns {string} Fecha formateada
 */
export const formatStartDate = (startDateString, localeCode, dateLocale) => {
  try {
    const startDateObj = parseISO(startDateString)

    const formatPattern = localeCode === 'en'
      ? 'MMMM d, yyyy'
      : "d 'de' MMMM 'de' yyyy"

    return format(startDateObj, formatPattern, { locale: dateLocale })
  } catch (error) {
    console.error('Error formateando fecha de inicio:', error)
    return startDateString
  }
}

/**
 * Genera texto de intervalo localizado
 * @param {number} interval - Número del intervalo
 * @param {string} intervalUnit - Unidad del intervalo
 * @param {string} localeCode - Código de locale
 * @returns {string} Texto de intervalo
 */
export const generateIntervalText = (interval, intervalUnit, localeCode) => {
  return formatInterval(interval, intervalUnit, localeCode)
}

/**
 * Genera texto de duración localizado
 * @param {number} duration - Duración numérica
 * @param {string} durationUnit - Unidad de duración
 * @param {string} localeCode - Código de locale
 * @returns {string} Texto de duración
 */
export const generateDurationText = (duration, durationUnit, localeCode) => {
  return formatDuration(duration, durationUnit, localeCode)
}

/**
 * Genera lista de exclusiones localizadas
 * @param {boolean} excludeWeekends - Si excluir fines de semana
 * @param {boolean} excludeHolidays - Si excluir feriados
 * @param {string} country - Código del país
 * @param {function} t - Función de traducción
 * @returns {string} Texto de exclusiones
 */
export const generateExclusionsText = (excludeWeekends, excludeHolidays, country, t) => {
  const exclusionsList = []

  if (excludeWeekends) {
    exclusionsList.push(t('exclusions.weekends'))
  }

  if (excludeHolidays && country) {
    exclusionsList.push(t('exclusions.holidays'))
  }

  return exclusionsList.length > 0
    ? exclusionsList.join(', ')
    : t('exclusions.none')
}

/**
 * Resuelve el nombre del país seleccionado
 * @param {string} countryCode - Código del país
 * @param {Array} countriesList - Lista de países disponibles
 * @param {function} t - Función de traducción
 * @returns {string} Nombre del país
 */
export const resolveCountryName = (countryCode, countriesList, t) => {
  if (!countryCode) {
    return t('form.fields.country.noSelection')
  }

  const country = countriesList.find(c => c.code === countryCode)
  return country ? country.name : countryCode
}

/**
 * Genera el resumen completo de configuración
 * @param {object} formData - Datos del formulario
 * @param {object} options - Opciones de formateo
 * @returns {object|null} Resumen de configuración
 */
export const generateConfigSummary = (formData, options) => {
  const {
    localeCode,
    dateLocale,
    countriesList = [],
    t,
    isFormValid = true
  } = options

  // Solo generar resumen si el formulario es válido
  if (!isFormValid || !formData.startDate) {
    return null
  }

  try {
    return {
      startDate: formatStartDate(formData.startDate, localeCode, dateLocale),
      interval: generateIntervalText(formData.interval, formData.intervalUnit, localeCode),
      duration: generateDurationText(formData.duration, formData.durationUnit, localeCode),
      country: resolveCountryName(formData.country, countriesList, t),
      exclusions: generateExclusionsText(
        formData.excludeWeekends,
        formData.excludeHolidays,
        formData.country,
        t
      )
    }
  } catch (error) {
    console.error('Error generando resumen de configuración:', error)
    return null
  }
}

/**
 * Valida si se puede generar un resumen
 * @param {object} formData - Datos del formulario
 * @param {boolean} isFormValid - Si el formulario es válido
 * @returns {boolean} Si se puede generar resumen
 */
export const canGenerateSummary = (formData, isFormValid) => {
  return isFormValid &&
         formData.startDate &&
         formData.interval &&
         formData.duration
}
