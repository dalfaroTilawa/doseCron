/**
 * Composable refactorizado para cálculo de fechas recurrentes
 * Versión simplificada que sigue principios de Single Responsibility
 */

import { ref, computed, reactive } from 'vue'
import { addDays, addWeeks, addMonths, addYears, format, isWeekend, parseISO, isValid } from 'date-fns'
import { useSettings } from './useSettings.js'
import { useHolidayManager } from './useHolidayManager.js'
import { useDateFormatter } from './useDateFormatter.js'
import { TIME_CONSTANTS, VALIDATION_LIMITS, DATE_FORMATS } from '../constants/index.js'

/**
 * Composable principal para cálculo de fechas recurrentes
 * Responsabilidad única: coordinar el cálculo de fechas
 */
export function useDateCalculator(initialConfig = {}) {
  // Dependencias
  const { settings, loadSetting } = useSettings()
  const holidayManager = useHolidayManager()
  const formatter = useDateFormatter()

  // Estados reactivos
  const isCalculating = ref(false)
  const calculationError = ref('')
  const calculatedDates = ref([])
  const calculatedHolidays = ref([])

  // Configuración reactiva
  const config = reactive({
    startDate: initialConfig.startDate || format(new Date(), DATE_FORMATS.ISO_DATE),
    interval: initialConfig.interval || loadSetting('defaultInterval', 15),
    duration: initialConfig.duration || loadSetting('defaultDuration', 4),
    durationUnit: initialConfig.durationUnit || loadSetting('defaultDurationUnit', 'months'),
    excludeWeekends: initialConfig.excludeWeekends !== undefined ? initialConfig.excludeWeekends : loadSetting('excludeWeekends', true),
    excludeHolidays: initialConfig.excludeHolidays !== undefined ? initialConfig.excludeHolidays : loadSetting('excludeHolidays', true),
    country: initialConfig.country || settings.country
  })

  /**
   * Valida la configuración de entrada
   * @returns {object} Resultado de validación
   */
  const validateConfiguration = () => {
    const errors = []

    // Validar fecha de inicio
    if (!config.startDate) {
      errors.push('Fecha inicial es requerida')
    } else {
      const startDate = parseISO(config.startDate)
      if (!isValid(startDate)) {
        errors.push('Fecha inicial inválida')
      }
    }

    // Validar intervalo
    if (!config.interval || config.interval < VALIDATION_LIMITS.MIN_INTERVAL || config.interval > VALIDATION_LIMITS.MAX_INTERVAL) {
      errors.push(`Intervalo debe estar entre ${VALIDATION_LIMITS.MIN_INTERVAL} y ${VALIDATION_LIMITS.MAX_INTERVAL} días`)
    }

    // Validar duración
    if (!config.duration || config.duration < VALIDATION_LIMITS.MIN_DURATION || config.duration > VALIDATION_LIMITS.MAX_DURATION) {
      errors.push(`Duración debe estar entre ${VALIDATION_LIMITS.MIN_DURATION} y ${VALIDATION_LIMITS.MAX_DURATION}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Calcula el período total en días
   * @returns {number} Días totales del período
   */
  const calculatePeriodDays = () => {
    const startDate = parseISO(config.startDate)
    let endDate

    switch (config.durationUnit) {
      case 'days':
        endDate = addDays(startDate, config.duration)
        break
      case 'weeks':
        endDate = addWeeks(startDate, config.duration)
        break
      case 'months':
        endDate = addMonths(startDate, config.duration)
        break
      case 'years':
        endDate = addYears(startDate, config.duration)
        break
      default:
        throw new Error(`Unidad de duración inválida: ${config.durationUnit}`)
    }

    return Math.floor((endDate.getTime() - startDate.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_DAY)
  }

  /**
   * Genera las fechas base sin filtros
   * @returns {Array} Array de fechas en formato string
   */
  const generateBaseDates = () => {
    const totalDays = calculatePeriodDays()
    const numberOfDates = Math.floor(totalDays / config.interval)

    if (numberOfDates <= 0) {
      return []
    }

    const startDate = parseISO(config.startDate)
    const dates = []

    for (let i = 0; i < numberOfDates; i++) {
      const calculatedDate = addDays(startDate, i * config.interval)
      dates.push(format(calculatedDate, DATE_FORMATS.ISO_DATE))
    }

    return dates
  }

  /**
   * Aplica filtros de exclusión a las fechas
   * @param {Array} baseDates - Fechas base sin filtrar
   * @param {Array} holidays - Lista de feriados
   * @returns {Array} Fechas filtradas
   */
  const applyExclusionFilters = (baseDates, holidays = []) => {
    if (!config.excludeWeekends && !config.excludeHolidays) {
      return baseDates
    }

    return baseDates.map(dateString => {
      let currentDate = parseISO(dateString)
      let adjustmentDays = 0
      const maxAdjustments = 10 // Prevenir loops infinitos

      while (adjustmentDays < maxAdjustments) {
        const isCurrentWeekend = config.excludeWeekends && isWeekend(currentDate)
        const isCurrentHoliday = config.excludeHolidays &&
          holidays.some(holiday => holiday.date === format(currentDate, DATE_FORMATS.ISO_DATE))

        if (!isCurrentWeekend && !isCurrentHoliday) {
          break
        }

        currentDate = addDays(currentDate, 1)
        adjustmentDays++
      }

      return format(currentDate, DATE_FORMATS.ISO_DATE)
    })
  }

  /**
   * Carga feriados para el año de cálculo
   * @returns {Promise<Array>} Lista de feriados
   */
  const loadRequiredHolidays = async () => {
    if (!config.excludeHolidays || !config.country) {
      return []
    }

    try {
      const startYear = new Date(config.startDate).getFullYear()
      const holidays = await holidayManager.getHolidays(config.country, startYear)

      // También cargar el año siguiente por si el período se extiende
      const nextYear = startYear + 1
      const nextYearHolidays = await holidayManager.getHolidays(config.country, nextYear)

      return [...holidays, ...nextYearHolidays]
    } catch (error) {
      console.warn('Error cargando feriados:', error)
      return []
    }
  }

  /**
   * Función principal de cálculo
   * @returns {Promise<void>}
   */
  const calculateDates = async () => {
    try {
      isCalculating.value = true
      calculationError.value = ''

      // Validar configuración
      const validation = validateConfiguration()
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Cargar feriados si es necesario
      const holidays = await loadRequiredHolidays()
      calculatedHolidays.value = holidays

      // Generar fechas base
      const baseDates = generateBaseDates()

      // Aplicar filtros de exclusión
      const filteredDates = applyExclusionFilters(baseDates, holidays)

      // Guardar resultados
      calculatedDates.value = filteredDates

    } catch (error) {
      console.error('Error en calculateDates:', error)
      calculationError.value = error.message
      calculatedDates.value = []
      throw error
    } finally {
      isCalculating.value = false
    }
  }

  /**
   * Actualiza la configuración y recalcula
   * @param {object} newConfig - Nueva configuración
   */
  const updateConfig = async (newConfig) => {
    Object.assign(config, newConfig)

    // Limpiar resultados previos
    calculatedDates.value = []
    calculationError.value = ''

    // Recalcular automáticamente
    await calculateDates()
  }

  /**
   * Resetea el calculador
   */
  const reset = () => {
    calculatedDates.value = []
    calculatedHolidays.value = []
    calculationError.value = ''
    isCalculating.value = false

    // Limpiar cache de feriados si se especifica país
    if (config.country) {
      holidayManager.clearHolidaysCache(config.country)
    }
  }

  /**
   * Obtiene resultados formateados
   */
  const formattedResults = computed(() => {
    if (!calculatedDates.value.length) {
      return { dates: [], stats: { total: 0, weekends: 0, holidays: 0 }, isEmpty: true }
    }

    return formatter.formatDateResults(calculatedDates.value, calculatedHolidays.value)
  })

  /**
   * Estadísticas de cálculo
   */
  const calculationStats = computed(() => ({
    totalDates: calculatedDates.value.length,
    configIsValid: validateConfiguration().isValid,
    hasHolidays: calculatedHolidays.value.length > 0,
    isCalculating: isCalculating.value,
    hasError: !!calculationError.value
  }))

  return {
    // Estado
    config,
    calculatedDates,
    calculatedHolidays,
    isCalculating,
    calculationError,
    formattedResults,
    calculationStats,

    // Métodos
    calculateDates,
    updateConfig,
    reset,
    validateConfiguration,

    // Utilidades
    generateBaseDates,
    calculatePeriodDays
  }
}
