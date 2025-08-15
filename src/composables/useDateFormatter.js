// Composable especializado para formateo de fechas y resultados
import { computed } from 'vue'
import { format, isToday, isWeekend } from 'date-fns'
import { useDateLocale } from './useDateLocale.js'
import { formatDateWithLocale, formatInterval, formatDuration } from '../utils/dateHelpers.js'

/**
 * Composable para formateo consistente de fechas y resultados
 * Centraliza toda la lógica de presentación de fechas
 */
export function useDateFormatter() {
  const { dateLocale, localeCode, isEnglish } = useDateLocale()

  /**
   * Formatea una fecha individual con información adicional
   * @param {string|Date} date - Fecha a formatear
   * @param {Array} holidays - Lista de feriados
   * @returns {object} Objeto con fecha formateada e información
   */
  const formatDateResult = (date, holidays = []) => {
    if (!date) return null

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      const dateString = typeof date === 'string' ? date : format(dateObj, 'yyyy-MM-dd')

      // Información base de la fecha
      const isToday_ = isToday(dateObj)
      const isWeekend_ = isWeekend(dateObj)

      // Buscar si es feriado
      const holiday = holidays.find(h => h.date === dateString)
      const isHoliday = !!holiday

      // Formateo según locale actual
      const formattedFull = formatDateWithLocale(dateObj, localeCode.value, 'full', dateLocale.value)
      const formattedShort = formatDateWithLocale(dateObj, localeCode.value, 'short', dateLocale.value)

      // Día de la semana
      const dayOfWeek = format(dateObj, 'EEEE', { locale: dateLocale.value })

      // Badges informativos
      const badges = []
      if (isToday_) badges.push({ type: 'today', text: isEnglish.value ? 'Today' : 'Hoy' })
      if (isWeekend_) badges.push({ type: 'weekend', text: isEnglish.value ? 'Weekend' : 'Fin de semana' })
      if (isHoliday) badges.push({ type: 'holiday', text: isEnglish.value ? 'Holiday' : 'Feriado' })

      return {
        originalDate: dateString,
        dateObject: dateObj,
        formatted: {
          full: formattedFull,
          short: formattedShort,
          dayOfWeek: dayOfWeek
        },
        info: {
          isToday: isToday_,
          isWeekend: isWeekend_,
          isHoliday: isHoliday,
          holidayName: holiday?.name || holiday?.localName || '',
          badges: badges
        }
      }
    } catch (error) {
      console.error('Error formateando fecha:', error)
      return null
    }
  }

  /**
   * Formatea una lista completa de fechas con estadísticas
   * @param {Array} dates - Array de fechas en string
   * @param {Array} holidays - Lista de feriados
   * @returns {object} Objeto con fechas formateadas y estadísticas
   */
  const formatDateResults = (dates = [], holidays = []) => {
    const formattedDates = dates
      .map(date => formatDateResult(date, holidays))
      .filter(Boolean) // Filtrar resultados nulos

    // Calcular estadísticas
    const stats = {
      total: formattedDates.length,
      weekends: formattedDates.filter(d => d.info.isWeekend).length,
      holidays: formattedDates.filter(d => d.info.isHoliday).length,
      today: formattedDates.filter(d => d.info.isToday).length
    }

    return {
      dates: formattedDates,
      stats: stats,
      isEmpty: formattedDates.length === 0
    }
  }

  /**
   * Formatea configuración de resumen
   * @param {object} config - Configuración del formulario
   * @param {string} countryName - Nombre del país
   * @returns {object} Configuración formateada
   */
  const formatConfigSummary = (config, countryName = '') => {
    if (!config || !config.startDate) return null

    try {
      const startDate = new Date(config.startDate)

      // Formatear fecha de inicio
      const formattedStartDate = formatDateWithLocale(
        startDate,
        localeCode.value,
        'full',
        dateLocale.value
      )

      // Formatear intervalo
      const intervalText = formatInterval(config.interval, localeCode.value)

      // Formatear duración
      const durationText = formatDuration(config.duration, config.durationUnit, localeCode.value)

      // Formatear exclusiones
      const exclusions = []
      if (config.excludeWeekends) {
        exclusions.push(isEnglish.value ? 'weekends' : 'fines de semana')
      }
      if (config.excludeHolidays && config.country) {
        exclusions.push(isEnglish.value ? 'holidays' : 'feriados')
      }

      const exclusionsText = exclusions.length > 0
        ? exclusions.join(', ')
        : (isEnglish.value ? 'None' : 'Ninguna')

      return {
        startDate: formattedStartDate,
        interval: intervalText,
        duration: durationText,
        country: countryName || (isEnglish.value ? 'Not selected' : 'No seleccionado'),
        exclusions: exclusionsText
      }
    } catch (error) {
      console.error('Error formateando resumen de configuración:', error)
      return null
    }
  }

  /**
   * Genera texto para copiar al portapapeles
   * @param {Array} formattedDates - Array de fechas formateadas
   * @returns {string} Texto formateado para copiar
   */
  const generateCopyText = (formattedDates = []) => {
    if (!formattedDates.length) return ''

    return formattedDates
      .map((dateResult, index) => {
        const number = index + 1
        const formatted = dateResult.formatted.full
        return `${number}. ${formatted}`
      })
      .join('\n')
  }

  /**
   * Genera datos para exportar
   * @param {Array} formattedDates - Array de fechas formateadas
   * @param {string} format - Formato de exportación ('csv', 'json', 'txt')
   * @returns {string} Datos formateados para exportar
   */
  const generateExportData = (formattedDates = [], format = 'txt') => {
    if (!formattedDates.length) return ''

    switch (format.toLowerCase()) {
      case 'csv':
        return generateCSVExport(formattedDates)
      case 'json':
        return generateJSONExport(formattedDates)
      default:
        return generateCopyText(formattedDates)
    }
  }

  /**
   * Genera exportación en formato CSV
   * @param {Array} formattedDates - Fechas formateadas
   * @returns {string} Contenido CSV
   */
  const generateCSVExport = (formattedDates) => {
    const headers = isEnglish.value
      ? ['Number', 'Date', 'Day of Week', 'Is Holiday', 'Holiday Name']
      : ['Número', 'Fecha', 'Día de la Semana', 'Es Feriado', 'Nombre del Feriado']

    const rows = formattedDates.map((dateResult, index) => [
      index + 1,
      dateResult.formatted.full,
      dateResult.formatted.dayOfWeek,
      dateResult.info.isHoliday ? (isEnglish.value ? 'Yes' : 'Sí') : (isEnglish.value ? 'No' : 'No'),
      dateResult.info.holidayName || ''
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  /**
   * Genera exportación en formato JSON
   * @param {Array} formattedDates - Fechas formateadas
   * @returns {string} Contenido JSON
   */
  const generateJSONExport = (formattedDates) => {
    const exportData = {
      generatedAt: new Date().toISOString(),
      locale: localeCode.value,
      totalDates: formattedDates.length,
      dates: formattedDates.map((dateResult, index) => ({
        number: index + 1,
        date: dateResult.originalDate,
        formatted: dateResult.formatted.full,
        dayOfWeek: dateResult.formatted.dayOfWeek,
        isHoliday: dateResult.info.isHoliday,
        holidayName: dateResult.info.holidayName,
        isWeekend: dateResult.info.isWeekend,
        isToday: dateResult.info.isToday
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  return {
    // Métodos principales
    formatDateResult,
    formatDateResults,
    formatConfigSummary,
    generateCopyText,
    generateExportData,

    // Estado
    localeCode: localeCode.value,
    isEnglish: isEnglish.value
  }
}
