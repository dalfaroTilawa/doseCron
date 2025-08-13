/**
 * Composable para calcular fechas recurrentes
 * Maneja exclusión de fines de semana y feriados
 * Integra con holidayApi y date-fns
 */

import { ref, computed, reactive } from 'vue'
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  format,
  isWeekend,
  parseISO,
  isBefore,
  isAfter,
  isEqual,
  startOfDay,
  isSameDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { getHolidays, isHoliday } from '../services/holidayApi.js'
import { useSettings } from './useSettings.js'

/**
 * Composable principal para cálculo de fechas recurrentes
 * @param {Object} initialConfig - Configuración inicial opcional
 * @returns {Object} - Estados reactivos y funciones
 */
export function useDateCalculator(initialConfig = {}) {
  // Obtener configuraciones guardadas
  const { settings, loadSetting, saveSetting } = useSettings()

  // Estados reactivos
  const loading = ref(false)
  const error = ref('')
  const calculatedDates = ref([])
  const holidaysCache = ref(new Map()) // Cache interno para feriados

  // Configuración reactiva usando valores guardados o por defecto
  const config = reactive({
    startDate: initialConfig.startDate || format(new Date(), 'yyyy-MM-dd'),
    interval: initialConfig.interval || loadSetting('defaultInterval', 15),
    duration: initialConfig.duration || loadSetting('defaultDuration', 4),
    durationUnit: initialConfig.durationUnit || loadSetting('defaultDurationUnit', 'months'),
    excludeWeekends: initialConfig.excludeWeekends !== undefined ? initialConfig.excludeWeekends : loadSetting('excludeWeekends', true),
    excludeHolidays: initialConfig.excludeHolidays !== undefined ? initialConfig.excludeHolidays : loadSetting('excludeHolidays', true),
    country: initialConfig.country || settings.country
  })

  // Computed properties
  const isConfigValid = computed(() => {
    return config.startDate &&
           config.interval > 0 &&
           config.duration > 0 &&
           ['days', 'weeks', 'months', 'years'].includes(config.durationUnit)
  })

  const totalDatesCalculated = computed(() => calculatedDates.value.length)

  const datesSummary = computed(() => {
    const dates = calculatedDates.value
    if (dates.length === 0) return null

    const weekendCount = dates.filter(d => d.isWeekend).length
    const holidayCount = dates.filter(d => d.isHoliday).length
    const workingDays = dates.filter(d => !d.isWeekend && !d.isHoliday).length

    return {
      total: dates.length,
      workingDays,
      weekends: weekendCount,
      holidays: holidayCount,
      firstDate: dates[0]?.date,
      lastDate: dates[dates.length - 1]?.date
    }
  })

  /**
   * Calcula la fecha final basada en duración y unidad
   * @param {Date} startDate - Fecha inicial
   * @returns {Date} Fecha final
   */
  const calculateEndDate = (startDate) => {
    const start = startOfDay(startDate)

    switch (config.durationUnit) {
      case 'days':
        return addDays(start, config.duration)
      case 'weeks':
        return addWeeks(start, config.duration)
      case 'months':
        return addMonths(start, config.duration)
      case 'years':
        return addYears(start, config.duration)
      default:
        return addDays(start, config.duration)
    }
  }

  /**
   * Obtiene y cachea los feriados necesarios para el rango de fechas
   * @param {Date} startDate - Fecha inicial
   * @param {Date} endDate - Fecha final
   * @returns {Promise<Map>} Mapa de fechas de feriados
   */
  const loadHolidays = async (startDate, endDate) => {
    if (!config.excludeHolidays || !config.country) {
      return new Map()
    }

    try {
      const startYear = startDate.getFullYear()
      const endYear = endDate.getFullYear()
      const years = []

      // Recopilar todos los años necesarios
      for (let year = startYear; year <= endYear; year++) {
        years.push(year)
      }

      const allHolidays = new Map()

      // Cargar feriados para cada año
      for (const year of years) {
        const cacheKey = `${config.country}_${year}`

        // Verificar cache interno primero
        if (holidaysCache.value.has(cacheKey)) {
          const yearHolidays = holidaysCache.value.get(cacheKey)
          yearHolidays.forEach(holiday => {
            allHolidays.set(holiday.date, holiday)
          })
          continue
        }

        // Cargar desde API/localStorage
        const yearHolidays = await getHolidays(year, config.country)
        holidaysCache.value.set(cacheKey, yearHolidays)

        yearHolidays.forEach(holiday => {
          allHolidays.set(holiday.date, holiday)
        })
      }

      return allHolidays
    } catch (err) {
      console.warn('Error cargando feriados:', err.message)
      return new Map()
    }
  }

  /**
   * Verifica si una fecha debe ser excluida
   * @param {Date} date - Fecha a verificar
   * @param {Map} holidaysMap - Mapa de feriados
   * @returns {Object} Información sobre exclusiones
   */
  const checkExclusions = (date, holidaysMap) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const weekend = isWeekend(date)
    const holiday = holidaysMap.get(dateStr) || null

    return {
      isWeekend: weekend,
      isHoliday: !!holiday,
      holiday,
      shouldExclude:
        (config.excludeWeekends && weekend) ||
        (config.excludeHolidays && holiday)
    }
  }

  /**
   * Encuentra el siguiente día válido (no excluido)
   * @param {Date} date - Fecha inicial
   * @param {Map} holidaysMap - Mapa de feriados
   * @returns {Date} Siguiente día válido
   */
  const getNextValidDate = (date, holidaysMap) => {
    let currentDate = startOfDay(date)
    let attempts = 0
    const maxAttempts = 30 // Prevenir bucles infinitos

    while (attempts < maxAttempts) {
      const exclusionInfo = checkExclusions(currentDate, holidaysMap)

      if (!exclusionInfo.shouldExclude) {
        return currentDate
      }

      currentDate = addDays(currentDate, 1)
      attempts++
    }

    // Si no encontramos día válido en 30 intentos, devolver la fecha original
    console.warn('No se pudo encontrar día válido después de 30 intentos')
    return date
  }

  /**
   * Función principal para calcular fechas recurrentes
   * @returns {Promise<Array>} Array de objetos de fecha
   */
  const calculateDates = async () => {
    if (!isConfigValid.value) {
      error.value = 'Configuración inválida'
      return []
    }

    loading.value = true
    error.value = ''
    calculatedDates.value = []

    try {
      // Parsear fecha inicial
      const startDate = parseISO(config.startDate)
      if (isNaN(startDate.getTime())) {
        throw new Error('Fecha inicial inválida')
      }

      // Calcular fecha final
      const endDate = calculateEndDate(startDate)

      // Cargar feriados necesarios
      const holidaysMap = await loadHolidays(startDate, endDate)

      // Array para almacenar las fechas calculadas
      const dates = []
      let currentDate = startOfDay(startDate)
      let iterationCount = 0
      const maxIterations = 1000 // Prevenir bucles infinitos

      // Bucle principal de cálculo
      while (
        isBefore(currentDate, endDate) &&
        iterationCount < maxIterations
      ) {
        // Obtener el siguiente día válido si es necesario
        const validDate = getNextValidDate(currentDate, holidaysMap)
        const exclusionInfo = checkExclusions(validDate, holidaysMap)

        // Crear objeto de fecha
        const dateInfo = {
          date: validDate,
          dateString: format(validDate, 'yyyy-MM-dd'),
          formatted: format(validDate, 'dd/MM/yyyy'),
          dayName: format(validDate, 'EEEE', { locale: es }),
          dayNameShort: format(validDate, 'EEE', { locale: es }),
          dayOfWeek: validDate.getDay(),
          isWeekend: exclusionInfo.isWeekend,
          isHoliday: exclusionInfo.isHoliday,
          holiday: exclusionInfo.holiday,
          intervalNumber: dates.length + 1
        }

        dates.push(dateInfo)

        // Calcular siguiente fecha según el intervalo
        currentDate = addDays(validDate, config.interval)
        iterationCount++
      }

      if (iterationCount >= maxIterations) {
        console.warn('Cálculo detenido: se alcanzó el máximo de iteraciones')
      }

      calculatedDates.value = dates
      return dates

    } catch (err) {
      error.value = err.message || 'Error al calcular fechas'
      console.error('Error en calculateDates:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza la configuración y recalcula si es necesario
   * @param {Object} newConfig - Nueva configuración
   * @param {boolean} autoCalculate - Si debe recalcular automáticamente
   */
  const updateConfig = async (newConfig, autoCalculate = true) => {
    // Guardar configuraciones importantes en localStorage
    if (newConfig.country && newConfig.country !== config.country) {
      saveSetting('country', newConfig.country)
    }
    if (newConfig.excludeWeekends !== undefined) {
      saveSetting('excludeWeekends', newConfig.excludeWeekends)
    }
    if (newConfig.excludeHolidays !== undefined) {
      saveSetting('excludeHolidays', newConfig.excludeHolidays)
    }
    if (newConfig.interval && newConfig.interval !== config.interval) {
      saveSetting('defaultInterval', newConfig.interval)
    }
    if (newConfig.duration && newConfig.duration !== config.duration) {
      saveSetting('defaultDuration', newConfig.duration)
    }
    if (newConfig.durationUnit && newConfig.durationUnit !== config.durationUnit) {
      saveSetting('defaultDurationUnit', newConfig.durationUnit)
    }

    Object.assign(config, newConfig)

    if (autoCalculate && isConfigValid.value) {
      await calculateDates()
    }
  }

  /**
   * Resetea el estado del calculador
   */
  const reset = () => {
    loading.value = false
    error.value = ''
    calculatedDates.value = []
    holidaysCache.value.clear()
  }

  /**
   * Obtiene información detallada de una fecha específica
   * @param {Date|string} date - Fecha a consultar
   * @returns {Object|null} Información de la fecha o null si no se encuentra
   */
  const getDateInfo = (date) => {
    const searchDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
    return calculatedDates.value.find(d => d.dateString === searchDate) || null
  }

  /**
   * Filtra fechas por criterios específicos
   * @param {Object} filters - Filtros a aplicar
   * @returns {Array} Fechas filtradas
   */
  const filterDates = (filters = {}) => {
    return calculatedDates.value.filter(dateInfo => {
      if (filters.onlyWeekends && !dateInfo.isWeekend) return false
      if (filters.onlyHolidays && !dateInfo.isHoliday) return false
      if (filters.onlyWorkingDays && (dateInfo.isWeekend || dateInfo.isHoliday)) return false
      if (filters.excludeWeekends && dateInfo.isWeekend) return false
      if (filters.excludeHolidays && dateInfo.isHoliday) return false

      if (filters.startDate) {
        const filterStart = typeof filters.startDate === 'string'
          ? parseISO(filters.startDate)
          : filters.startDate
        if (isBefore(dateInfo.date, filterStart)) return false
      }

      if (filters.endDate) {
        const filterEnd = typeof filters.endDate === 'string'
          ? parseISO(filters.endDate)
          : filters.endDate
        if (isAfter(dateInfo.date, filterEnd)) return false
      }

      return true
    })
  }

  // Retornar API pública del composable
  return {
    // Estados reactivos
    config,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    calculatedDates: computed(() => calculatedDates.value),

    // Computed properties
    isConfigValid,
    totalDatesCalculated,
    datesSummary,

    // Funciones
    calculateDates,
    updateConfig,
    reset,
    getDateInfo,
    filterDates,

    // Funciones utilitarias (para testing/debugging)
    _internal: {
      calculateEndDate,
      loadHolidays,
      checkExclusions,
      getNextValidDate,
      holidaysCache: computed(() => holidaysCache.value)
    }
  }
}

// Export por defecto para facilitar importación
export default useDateCalculator
