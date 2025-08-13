import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDateCalculator } from '../src/composables/useDateCalculator.js'
import { addDays, format, addMonths, addWeeks } from 'date-fns'

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

  // ========== TESTS COMPREHENSIVOS DEL ALGORITMO ==========
  describe('Algoritmo de cálculo de fechas - Tests exhaustivos', () => {
    
    describe('Bug específico: intervalo 15 días + duración 1 mes', () => {
      it('debería generar exactamente 2 fechas: 13-ago y 28-ago', async () => {
        await calculator.updateConfig({
          startDate: '2025-08-13',
          interval: 15,
          duration: 1,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false,
          country: ''
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-08-13')
        expect(result[1].dateString).toBe('2025-08-28')
        
        // Verificar que NO hay fecha en septiembre
        const septembreDates = result.filter(d => d.dateString.startsWith('2025-09'))
        expect(septembreDates.length).toBe(0)
      })
    })

    describe('Casos por duración en días', () => {
      it('intervalo 7 días, duración 14 días → 2 fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 7,
          duration: 14,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-08')
      })

      it('intervalo 5 días, duración 20 días → 4 fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 5,
          duration: 20,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(4)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-06')
        expect(result[2].dateString).toBe('2025-01-11')
        expect(result[3].dateString).toBe('2025-01-16')
      })

      it('intervalo 10 días, duración 25 días → 3 fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 10,
          duration: 25,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(3)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-11')
        expect(result[2].dateString).toBe('2025-01-21')
      })

      it('intervalo igual a duración → 1 fecha', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 15,
          duration: 15,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-01')
      })

      it('intervalo mayor a duración → 1 fecha', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 20,
          duration: 15,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-01')
      })
    })

    describe('Casos por duración en semanas', () => {
      it('intervalo 7 días, duración 2 semanas → 2 fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 7,
          duration: 2,
          durationUnit: 'weeks',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-08')
      })

      it('intervalo 10 días, duración 3 semanas → 3 fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 10,
          duration: 3,
          durationUnit: 'weeks',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(3)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-11')
        expect(result[2].dateString).toBe('2025-01-21')
        // 21 días = 3 semanas, la siguiente fecha sería 31-ene que está fuera del rango
      })

      it('intervalo 14 días, duración 1 semana → 1 fecha', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 14,
          duration: 1,
          durationUnit: 'weeks',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-01')
      })
    })

    describe('Casos por duración en meses', () => {
      it('intervalo 30 días, duración 2 meses → 2 fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 30,
          duration: 2,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-31')
      })

      it('intervalo 20 días, duración 1 mes → número correcto de fechas', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 20,
          duration: 1,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-21')
        // 1 mes desde 01-ene es 01-feb, la siguiente fecha sería 10-feb que está fuera
      })

      it('intervalo 45 días, duración 1 mes → 1 fecha', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 45,
          duration: 1,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-01')
      })

      it('caso límite: fin de mes con febrero', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-31',
          interval: 15,
          duration: 1,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-31')
        expect(result[1].dateString).toBe('2025-02-15')
        // 1 mes desde 31-ene es 28-feb (2025 no es bisiesto)
      })
    })

    describe('Casos extremos y edge cases', () => {
      it('intervalo muy pequeño (1 día) con duración larga', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 1,
          duration: 7,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(7)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[6].dateString).toBe('2025-01-07')
      })

      it('intervalo muy grande con duración muy larga', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 90,
          duration: 1,
          durationUnit: 'years',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBeGreaterThan(1)
        expect(result[0].dateString).toBe('2025-01-01')
        
        // Verificar que todas las fechas están dentro del año
        result.forEach(date => {
          const year = date.dateString.substring(0, 4)
          expect(year).toBe('2025')
        })
      })

      it('inicio en año bisiesto', async () => {
        await calculator.updateConfig({
          startDate: '2024-02-28',
          interval: 2,
          duration: 5,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(3)
        expect(result[0].dateString).toBe('2024-02-28')
        expect(result[1].dateString).toBe('2024-03-01')
        expect(result[2].dateString).toBe('2024-03-03')
      })

      it('cambio de año', async () => {
        await calculator.updateConfig({
          startDate: '2024-12-20',
          interval: 10,
          duration: 1,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2024-12-20')
        expect(result[1].dateString).toBe('2024-12-30')
        // 1 mes desde 20-dic es 20-ene 2025, por lo que no hay más fechas
      })

      it('duración 0 debería retornar array vacío', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 7,
          duration: 0,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(0)
      })

      it('intervalo 0 debería retornar array vacío', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 0,
          duration: 30,
          durationUnit: 'days',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        expect(result.length).toBe(0)
      })
    })

    describe('Verificación de límites de fechas', () => {
      it('todas las fechas generadas deben estar dentro del período', async () => {
        const testCases = [
          { interval: 7, duration: 1, unit: 'months' },
          { interval: 15, duration: 2, unit: 'months' },
          { interval: 10, duration: 3, unit: 'weeks' },
          { interval: 5, duration: 30, unit: 'days' }
        ]

        for (const testCase of testCases) {
          await calculator.updateConfig({
            startDate: '2025-01-15',
            interval: testCase.interval,
            duration: testCase.duration,
            durationUnit: testCase.unit,
            excludeWeekends: false,
            excludeHolidays: false
          })

          await calculator.calculateDates()
          const result = calculator.calculatedDates.value

          // Calcular fecha límite manualmente
          const startDate = new Date('2025-01-15')
          let endDate
          
          switch (testCase.unit) {
            case 'days':
              endDate = addDays(startDate, testCase.duration)
              break
            case 'weeks':
              endDate = addWeeks(startDate, testCase.duration)
              break
            case 'months':
              endDate = addMonths(startDate, testCase.duration)
              break
          }

          // Verificar que todas las fechas están antes de endDate
          result.forEach((dateInfo, index) => {
            const generatedDate = new Date(dateInfo.dateString)
            expect(generatedDate.getTime()).toBeLessThan(endDate.getTime())
          })
        }
      })

      it('secuencia de fechas debe tener intervalos correctos', async () => {
        await calculator.updateConfig({
          startDate: '2025-01-01',
          interval: 12,
          duration: 2,
          durationUnit: 'months',
          excludeWeekends: false,
          excludeHolidays: false
        })

        await calculator.calculateDates()
        const result = calculator.calculatedDates.value

        // Verificar intervalos entre fechas consecutivas
        for (let i = 1; i < result.length; i++) {
          const prevDate = new Date(result[i-1].dateString)
          const currDate = new Date(result[i].dateString)
          const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
          
          expect(diffDays).toBe(12)
        }
      })
    })
  })
})
