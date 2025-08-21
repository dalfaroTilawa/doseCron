// Utilidades centralizadas para formateo de fechas
import { format } from 'date-fns'

/**
 * Patrones de formateo por tipo y locale
 */
const FORMAT_PATTERNS = {
  en: {
    full: 'EEEE, MMMM d, yyyy',
    short: 'MMM d, yyyy',
    basic: 'yyyy-MM-dd',
    dateTime: 'MMMM d, yyyy \'at\' h:mm a'
  },
  es: {
    full: "EEEE, dd 'de' MMMM 'de' yyyy",
    short: 'dd MMM yyyy',
    basic: 'yyyy-MM-dd',
    dateTime: "dd 'de' MMMM 'de' yyyy 'a las' HH:mm"
  }
}

/**
 * Obtiene el patrón de formateo según locale y tipo
 * @param {string} localeCode - Código de locale ('en' o 'es')
 * @param {string} type - Tipo de formato ('full', 'short', 'basic', 'dateTime')
 * @returns {string} Patrón de formateo
 */
export const getDateFormatPattern = (localeCode = 'es', type = 'full') => {
  const patterns = FORMAT_PATTERNS[localeCode] || FORMAT_PATTERNS.es
  return patterns[type] || patterns.full
}

/**
 * Formatea una fecha usando el patrón y locale especificados
 * @param {Date|string} date - Fecha a formatear
 * @param {string} localeCode - Código de locale
 * @param {string} type - Tipo de formato
 * @param {object} dateLocale - Objeto locale de date-fns
 * @returns {string} Fecha formateada
 */
export const formatDateWithLocale = (date, localeCode, type, dateLocale) => {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const pattern = getDateFormatPattern(localeCode, type)

    return format(dateObj, pattern, { locale: dateLocale })
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return ''
  }
}

/**
 * Formatea un intervalo en formato legible
 * @param {number} interval - Número del intervalo
 * @param {string} intervalUnit - Unidad del intervalo (days, weeks, months)
 * @param {string} localeCode - Código de locale
 * @returns {string} Intervalo formateado
 */
export const formatInterval = (interval, intervalUnit = 'days', localeCode = 'es') => {
  if (!interval || interval <= 0) return ''

  const unitText = formatTimeUnit(interval, intervalUnit, localeCode)

  if (localeCode === 'en') {
    return `Every ${interval} ${unitText}`
  } else {
    return `Cada ${interval} ${unitText}`
  }
}

/**
 * Formatea unidades de tiempo con pluralización
 * @param {number} count - Cantidad
 * @param {string} unit - Unidad (days, weeks, months, years)
 * @param {string} localeCode - Código de locale
 * @returns {string} Unidad formateada
 */
export const formatTimeUnit = (count, unit, localeCode = 'es') => {
  if (!count || count <= 0) return ''

  const units = {
    en: {
      days: count === 1 ? 'day' : 'days',
      weeks: count === 1 ? 'week' : 'weeks',
      months: count === 1 ? 'month' : 'months',
      years: count === 1 ? 'year' : 'years'
    },
    es: {
      days: count === 1 ? 'día' : 'días',
      weeks: count === 1 ? 'semana' : 'semanas',
      months: count === 1 ? 'mes' : 'meses',
      years: count === 1 ? 'año' : 'años'
    }
  }

  const localeUnits = units[localeCode] || units.es
  return localeUnits[unit] || unit
}

/**
 * Crea texto de duración formateado
 * @param {number} duration - Duración numérica
 * @param {string} unit - Unidad de duración
 * @param {string} localeCode - Código de locale
 * @returns {string} Duración formateada
 */
export const formatDuration = (duration, unit, localeCode = 'es') => {
  if (!duration || duration <= 0) return ''

  const unitText = formatTimeUnit(duration, unit, localeCode)
  return `${duration} ${unitText}`
}
