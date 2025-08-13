import { describe, it, expect, beforeEach } from 'vitest'
import { useDateCalculator } from '../src/composables/useDateCalculator.js'
import { addDays, format } from 'date-fns'

describe('useDateCalculator', () => {
  let calculator

  beforeEach(() => {
    calculator = useDateCalculator()
  })

  describe('configuración básica', () => {
    it('debería inicializar con configuración por defecto', () => {
      expect(calculator.config).toBeDefined()
      expect(calculator.calculatedDates.value).toEqual([])
      expect(calculator.loading.value).toBe(false)
    })

    it('debería actualizar configuración correctamente', async () => {
      const newConfig = {
        startDate: '2025-01-15',
        interval: 7,
        duration: 2,
        durationUnit: 'weeks'
      }

      await calculator.updateConfig(newConfig)

      expect(calculator.config.startDate).toBe('2025-01-15')
      expect(calculator.config.interval).toBe(7)
      expect(calculator.config.duration).toBe(2)
      expect(calculator.config.durationUnit).toBe('weeks')
    })
  })

  describe('validación de intervalo vs duración', () => {
    it('debería detectar cuando duración en días es menor al intervalo', async () => {
      await calculator.updateConfig({
        startDate: '2025-01-15',
        interval: 15,
        duration: 10,
        durationUnit: 'days'
      })

      await calculator.calculateDates()
      const result = calculator.calculatedDates.value

      // Debería generar solo la fecha inicial
      expect(result.length).toBe(1)
      expect(result[0].dateString).toBe('2025-01-15')
    })

    it('debería generar fechas correctamente cuando duración > intervalo', async () => {
      await calculator.updateConfig({
        startDate: '2025-01-15',
        interval: 7,
        duration: 21,
        durationUnit: 'days'
      })

      await calculator.calculateDates()
      const result = calculator.calculatedDates.value

      // Debería generar: 15, 22, 29 de enero (o próximas fechas válidas)
      expect(result.length).toBeGreaterThan(1)
      expect(result[0].dateString).toBe('2025-01-15')
    })

    it('debería funcionar correctamente con duraciones en semanas/meses', async () => {
      await calculator.updateConfig({
        startDate: '2025-01-15',
        interval: 15,
        duration: 2,
        durationUnit: 'months'
      })

      await calculator.calculateDates()
      const result = calculator.calculatedDates.value

      // 2 meses = ~60 días, intervalo 15 días = ~4 fechas
      expect(result.length).toBeGreaterThan(1)
      expect(result[0].dateString).toBe('2025-01-15')
    })
  })

  describe('manejo de errores', () => {
    it('debería manejar fechas inválidas', async () => {
      await calculator.updateConfig({
        startDate: 'fecha-invalida',
        interval: 7,
        duration: 2,
        durationUnit: 'weeks'
      })

      await calculator.calculateDates()

      // El composable maneja errores internamente y retorna array vacío
      expect(calculator.calculatedDates.value).toEqual([])
      expect(calculator.error.value).toBeTruthy()
    })

    it('debería validar intervalos negativos', async () => {
      await calculator.updateConfig({
        startDate: '2025-01-15',
        interval: -5,
        duration: 2,
        durationUnit: 'weeks'
      })

      await calculator.calculateDates()

      // El composable maneja errores internamente
      expect(calculator.calculatedDates.value).toEqual([])
    })
  })

  describe('reset', () => {
    it('debería limpiar resultados y configuración', () => {
      calculator.reset()

      expect(calculator.calculatedDates.value).toEqual([])
      expect(calculator.loading.value).toBe(false)
    })
  })
})
