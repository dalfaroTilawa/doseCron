import { describe, it, expect } from 'vitest'
import { addDays, addWeeks, addMonths, addYears, parseISO } from 'date-fns'
import { useDateCalculator } from '../src/composables/useDateCalculator.js'

/**
 * Función para calcular fechas estimadas usando la misma lógica que el resumen de configuración
 * Esta debe coincidir exactamente con el algoritmo real de useDateCalculator
 */
const calculateEstimatedDates = (startDate, interval, duration, durationUnit) => {
  const startDateObj = parseISO(startDate)
  let endDate

  switch (durationUnit) {
    case 'days':
      endDate = addDays(startDateObj, duration)
      break
    case 'weeks':
      endDate = addWeeks(startDateObj, duration)
      break
    case 'months':
      // Usar la misma lógica que useDateCalculator: más restrictivo para meses
      const monthEnd = addMonths(startDateObj, duration)
      endDate = addDays(monthEnd, -1)
      break
    case 'years':
      endDate = addYears(startDateObj, duration)
      break
  }

  // Cálculo correcto de fechas estimadas usando la misma lógica del algoritmo principal
  let estimatedDates = 0
  let currentDate = startDateObj
  let iterations = 0
  const maxIterations = 1000 // Prevenir bucles infinitos

  while (iterations < maxIterations && currentDate < endDate) {
    estimatedDates++
    currentDate = addDays(currentDate, interval)
    iterations++
  }

  return estimatedDates
}

describe('Estimación de fechas vs Algoritmo Real', () => {
  
  describe('Casos específicos del bug reportado', () => {
    it('intervalo 15 días + duración 2 meses debería estimar 4 fechas (no 5)', async () => {
      const config = {
        startDate: '2025-08-13',
        interval: 15,
        duration: 2,
        durationUnit: 'months',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      }

      // Calcular estimación
      const estimated = calculateEstimatedDates(
        config.startDate, 
        config.interval, 
        config.duration, 
        config.durationUnit
      )

      // Calcular fechas reales
      const calculator = useDateCalculator()
      await calculator.updateConfig(config)
      await calculator.calculateDates()
      const actualDates = calculator.calculatedDates.value

      // La estimación debe coincidir exactamente con la realidad
      expect(estimated).toBe(actualDates.length)
      expect(estimated).toBe(4) // Específicamente debe ser 4, no 5
    })
  })

  describe('Validación exhaustiva: estimación vs realidad', () => {
    const testCases = [
      // Casos con días
      { startDate: '2025-01-01', interval: 7, duration: 14, unit: 'days', description: '7 días cada 14 días' },
      { startDate: '2025-01-01', interval: 5, duration: 20, unit: 'days', description: '5 días cada 20 días' },
      { startDate: '2025-01-01', interval: 10, duration: 25, unit: 'days', description: '10 días cada 25 días' },
      
      // Casos con semanas
      { startDate: '2025-01-01', interval: 7, duration: 2, unit: 'weeks', description: '7 días cada 2 semanas' },
      { startDate: '2025-01-01', interval: 10, duration: 3, unit: 'weeks', description: '10 días cada 3 semanas' },
      { startDate: '2025-01-01', interval: 14, duration: 1, unit: 'weeks', description: '14 días cada 1 semana' },
      
      // Casos con meses (los más problemáticos)
      { startDate: '2025-01-01', interval: 30, duration: 2, unit: 'months', description: '30 días cada 2 meses' },
      { startDate: '2025-01-01', interval: 20, duration: 1, unit: 'months', description: '20 días cada 1 mes' },
      { startDate: '2025-01-01', interval: 45, duration: 1, unit: 'months', description: '45 días cada 1 mes' },
      { startDate: '2025-01-31', interval: 15, duration: 1, unit: 'months', description: 'fin de mes con febrero' },
      
      // Casos con años
      { startDate: '2025-01-01', interval: 90, duration: 1, unit: 'years', description: '90 días cada 1 año' },
      
      // Casos edge
      { startDate: '2024-02-28', interval: 2, duration: 5, unit: 'days', description: 'año bisiesto' },
      { startDate: '2024-12-20', interval: 10, duration: 1, unit: 'months', description: 'cambio de año' }
    ]

    testCases.forEach(({ startDate, interval, duration, unit, description }) => {
      it(`${description} - estimación debe coincidir con algoritmo real`, async () => {
        const config = {
          startDate,
          interval,
          duration,
          durationUnit: unit,
          excludeWeekends: false,
          excludeHolidays: false,
          country: ''
        }

        // Calcular estimación
        const estimated = calculateEstimatedDates(
          config.startDate, 
          config.interval, 
          config.duration, 
          config.durationUnit
        )

        // Calcular fechas reales
        const calculator = useDateCalculator()
        await calculator.updateConfig(config)
        await calculator.calculateDates()
        const actualDates = calculator.calculatedDates.value

        // Verificar que coincidan exactamente
        expect(estimated).toBe(actualDates.length)
        
        // Información adicional en caso de fallo
        if (estimated !== actualDates.length) {
          console.error(`Mismatch en caso: ${description}`)
          console.error(`Configuración:`, config)
          console.error(`Estimado: ${estimated}, Real: ${actualDates.length}`)
          console.error(`Fechas reales:`, actualDates.map(d => d.dateString))
        }
      })
    })
  })

  describe('Casos límite que pueden fallar', () => {
    it('intervalo igual a duración en días', async () => {
      const config = {
        startDate: '2025-01-01',
        interval: 15,
        duration: 15,
        durationUnit: 'days',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      }

      const estimated = calculateEstimatedDates(
        config.startDate, config.interval, config.duration, config.durationUnit
      )

      const calculator = useDateCalculator()
      await calculator.updateConfig(config)
      await calculator.calculateDates()
      const actualDates = calculator.calculatedDates.value

      expect(estimated).toBe(actualDates.length)
      expect(estimated).toBe(1) // Solo la fecha inicial
    })

    it('intervalo mayor a duración en días', async () => {
      const config = {
        startDate: '2025-01-01',
        interval: 20,
        duration: 15,
        durationUnit: 'days',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      }

      const estimated = calculateEstimatedDates(
        config.startDate, config.interval, config.duration, config.durationUnit
      )

      const calculator = useDateCalculator()
      await calculator.updateConfig(config)
      await calculator.calculateDates()
      const actualDates = calculator.calculatedDates.value

      expect(estimated).toBe(actualDates.length)
      expect(estimated).toBe(1) // Solo la fecha inicial
    })

    it('duración muy larga con intervalo pequeño', async () => {
      const config = {
        startDate: '2025-01-01',
        interval: 1,
        duration: 7,
        durationUnit: 'days',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      }

      const estimated = calculateEstimatedDates(
        config.startDate, config.interval, config.duration, config.durationUnit
      )

      const calculator = useDateCalculator()
      await calculator.updateConfig(config)
      await calculator.calculateDates()
      const actualDates = calculator.calculatedDates.value

      expect(estimated).toBe(actualDates.length)
      expect(estimated).toBe(7) // Cada día durante 7 días
    })
  })

  describe('Verificación de lógica específica de meses', () => {
    it('meses deben usar endDate restrictivo (addDays(monthEnd, -1))', () => {
      // Verificar que para meses usamos la lógica más restrictiva
      const startDate = '2025-08-13'
      const duration = 1
      const unit = 'months'

      const startDateObj = parseISO(startDate)
      const monthEnd = addMonths(startDateObj, duration) // 2025-09-13
      const endDate = addDays(monthEnd, -1) // 2025-09-12

      // endDate debe ser 2025-09-12, no 2025-09-13
      expect(endDate.toISOString().substring(0, 10)).toBe('2025-09-12')
      
      // Esto significa que fechas como 2025-09-12 están incluidas, pero 2025-09-13 no
      expect(startDateObj < endDate).toBe(true) // 2025-08-13 < 2025-09-12 ✓
      expect(addDays(startDateObj, 30) < endDate).toBe(false) // 2025-09-12 < 2025-09-12 ✗
    })
  })
})