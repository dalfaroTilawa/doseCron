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

      // 10 días ÷ 15 días = 0.67 → Math.floor(0.67) = 0 fechas
      expect(result.length).toBe(0)
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

    describe('Cálculo corregido: intervalo 15 días + duración 1 mes', () => {
      it('debería generar 2 fechas: 13-ago y 28-ago', async () => {
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

        // 1 mes = 31 días, 31 ÷ 15 = 2.07 → Math.floor(2.07) = 2 fechas
        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-08-13')
        expect(result[1].dateString).toBe('2025-08-28')
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

        // 14 días ÷ 7 días = 2.0 → Math.floor(2) = 2 fechas
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

        // 20 días ÷ 5 días = 4.0 → Math.floor(4) = 4 fechas
        expect(result.length).toBe(4)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-06')
        expect(result[2].dateString).toBe('2025-01-11')
        expect(result[3].dateString).toBe('2025-01-16')
      })

      it('intervalo 10 días, duración 25 días → 2 fechas', async () => {
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

        // 25 días ÷ 10 días = 2.5 → Math.floor(2.5) = 2 fechas
        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-11')
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

      it('intervalo mayor a duración → 0 fechas', async () => {
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

        // 15 días ÷ 20 días = 0.75 → Math.floor(0.75) = 0 fechas
        expect(result.length).toBe(0)
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

      it('intervalo 10 días, duración 3 semanas → 2 fechas', async () => {
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

        // 3 semanas = 21 días, 21 ÷ 10 = 2.1 → Math.floor(2.1) = 2 fechas
        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2025-01-01')
        expect(result[1].dateString).toBe('2025-01-11')
      })

      it('intervalo 14 días, duración 1 semana → 0 fechas', async () => {
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

        // 1 semana = 7 días, 7 ÷ 14 = 0.5 → Math.floor(0.5) = 0 fechas
        expect(result.length).toBe(0)
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

        // 2 meses ≈ 59 días, 59 ÷ 30 = 1.97 → Math.floor(1.97) = 1 fecha
        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-01')
      })

      it('intervalo 20 días, duración 1 mes → 1 fecha', async () => {
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

        // 1 mes = 31 días, 31 ÷ 20 = 1.55 → Math.floor(1.55) = 1 fecha
        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-01')
      })

      it('intervalo 45 días, duración 1 mes → 0 fechas', async () => {
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

        // 1 mes = 31 días, 31 ÷ 45 = 0.69 → Math.floor(0.69) = 0 fechas
        expect(result.length).toBe(0)
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

        // 1 mes desde 31-ene hasta 28-feb = 28 días, 28 ÷ 15 = 1.87 → Math.floor(1.87) = 1 fecha
        expect(result.length).toBe(1)
        expect(result[0].dateString).toBe('2025-01-31')
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

        // 5 días ÷ 2 días = 2.5 → Math.floor(2.5) = 2 fechas
        expect(result.length).toBe(2)
        expect(result[0].dateString).toBe('2024-02-28')
        expect(result[1].dateString).toBe('2024-03-01')
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

        // 1 mes = 31 días, 31 ÷ 10 = 3.1 → Math.floor(3.1) = 3 fechas
        expect(result.length).toBe(3)
        expect(result[0].dateString).toBe('2024-12-20')
        expect(result[1].dateString).toBe('2024-12-30')
        expect(result[2].dateString).toBe('2025-01-09')
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

  // ========== TESTS PARA EL ALGORITMO CORREGIDO ==========
  describe('Algoritmo corregido: número exacto de fechas con cálculo matemático', () => {

    it('CASO CRÍTICO: 4 meses + 15 días intervalo = exactamente 8 fechas (122÷15=8.1→8)', async () => {
      const startDate = '2025-08-14' // Fecha fija para reproducibilidad

      // Calcular manualmente: 4 meses ≈ 122 días, 122 ÷ 15 = 8.13... → 8 fechas + inicial = 8 total
      const expectedDates = 8

      // SIN filtros
      await calculator.updateConfig({
        startDate,
        interval: 15,
        duration: 4,
        durationUnit: 'months',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      })

      await calculator.calculateDates()
      const withoutFilters = calculator.calculatedDates.value

      // Reset para el próximo test
      calculator.reset()

      // CON filtros
      await calculator.updateConfig({
        startDate,
        interval: 15,
        duration: 4,
        durationUnit: 'months',
        excludeWeekends: true,
        excludeHolidays: true,
        country: 'US'
      })

      await calculator.calculateDates()
      const withFilters = calculator.calculatedDates.value

      console.log(`Sin filtros: ${withoutFilters.length} fechas`)
      console.log(`Con filtros: ${withFilters.length} fechas`)
      console.log(`Esperadas: ${expectedDates} fechas`)

      // NUEVO COMPORTAMIENTO: El número de fechas debe ser EXACTAMENTE el mismo
      expect(withoutFilters.length).toBe(expectedDates)
      expect(withFilters.length).toBe(expectedDates)
      expect(withoutFilters.length).toBe(withFilters.length)

      // Verificar que las fechas pueden ser diferentes (por filtros) pero el número es igual
      const datesSinFiltros = withoutFilters.map(d => d.dateString)
      const datesConFiltros = withFilters.map(d => d.dateString)

      console.log('Fechas sin filtros:', datesSinFiltros)
      console.log('Fechas con filtros:', datesConFiltros)

      // El número debe ser idéntico
      expect(datesSinFiltros.length).toBe(datesConFiltros.length)
    })

    it('validación matemática: 30 días intervalo, 4 meses = exactamente 4 fechas', async () => {
      const startDate = '2025-01-01'

      // Sin filtros
      await calculator.updateConfig({
        startDate,
        interval: 30,
        duration: 4,
        durationUnit: 'months',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      })

      await calculator.calculateDates()
      const withoutFilters = calculator.calculatedDates.value

      calculator.reset()

      // Con filtros
      await calculator.updateConfig({
        startDate,
        interval: 30,
        duration: 4,
        durationUnit: 'months',
        excludeWeekends: true,
        excludeHolidays: true,
        country: 'US'
      })

      await calculator.calculateDates()
      const withFilters = calculator.calculatedDates.value

      // 4 meses ≈ 120 días, 120 ÷ 30 = 4.0 → exactamente 4 fechas
      expect(withoutFilters.length).toBe(4)
      expect(withFilters.length).toBe(4)
      expect(withoutFilters.length).toBe(withFilters.length)

      console.log('30 días intervalo - Sin filtros:', withoutFilters.map(d => d.dateString))
      console.log('30 días intervalo - Con filtros:', withFilters.map(d => d.dateString))
    })

    it('caso límite: 7 días intervalo, 2 semanas = exactamente 2 fechas', async () => {
      const startDate = '2025-01-01'

      // Sin filtros
      await calculator.updateConfig({
        startDate,
        interval: 7,
        duration: 2,
        durationUnit: 'weeks',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      })

      await calculator.calculateDates()
      const withoutFilters = calculator.calculatedDates.value

      calculator.reset()

      // Con filtros (usando fecha que cae en fin de semana)
      await calculator.updateConfig({
        startDate: '2025-08-16', // Sábado
        interval: 7,
        duration: 2,
        durationUnit: 'weeks',
        excludeWeekends: true,
        excludeHolidays: false,
        country: ''
      })

      await calculator.calculateDates()
      const withFilters = calculator.calculatedDates.value

      // 2 semanas = 14 días, 14 ÷ 7 = 2.0 → exactamente 2 fechas
      expect(withoutFilters.length).toBe(2)
      expect(withFilters.length).toBe(2)
      expect(withoutFilters.length).toBe(withFilters.length)

      // Con filtros, las fechas deben moverse pero ser la misma cantidad
      console.log('7 días intervalo - Sin filtros:', withoutFilters.map(d => d.dateString))
      console.log('7 días intervalo - Con filtros:', withFilters.map(d => `${d.dateString} (${d.dayNameShort})`))

      // Verificar que los filtros movieron las fechas
      expect(withFilters.every(d => !d.isWeekend)).toBe(true)
    })

    it('exclusiones deben generar MÁS fechas, no menos', async () => {
      // Usar fecha que sabemos que cae en fin de semana
      const startDate = '2025-08-16' // Es sábado

      // SIN exclusiones
      await calculator.updateConfig({
        startDate,
        interval: 7, // cada semana
        duration: 1,
        durationUnit: 'months',
        excludeWeekends: false,
        excludeHolidays: false,
        country: ''
      })

      await calculator.calculateDates()
      const withoutExclusions = calculator.calculatedDates.value

      calculator.reset()

      // CON exclusiones de fin de semana
      await calculator.updateConfig({
        startDate,
        interval: 7,
        duration: 1,
        durationUnit: 'months',
        excludeWeekends: true,
        excludeHolidays: false,
        country: ''
      })

      await calculator.calculateDates()
      const withExclusions = calculator.calculatedDates.value

      console.log('Sin exclusiones:', withoutExclusions.map(d => `${d.dateString} (${d.dayNameShort})`))
      console.log('Con exclusiones:', withExclusions.map(d => `${d.dateString} (${d.dayNameShort})`))

      // Con exclusiones debería tener igual o más fechas
      expect(withExclusions.length).toBeGreaterThanOrEqual(withoutExclusions.length)

      // Y todas las fechas con exclusiones NO deben ser fines de semana
      withExclusions.forEach(date => {
        expect(date.isWeekend).toBe(false)
      })
    })
  })

  describe('Tests de regresión para cálculo de intervalos con exclusiones', () => {
    it('REGRESIÓN: debería calcular intervalos correctamente desde primer día hábil cuando fecha inicial es feriado', async () => {
      // Caso específico reportado: 15 agosto 2025 (viernes, día de las madres Costa Rica)
      // Intervalo: 4 días, Duración: 2 semanas
      // Expected: 18-ago (lun) → 22-ago (vie) → 26-ago (mar), NO 18-ago → 19-ago
      
      await calculator.updateConfig({
        startDate: '2025-08-15', // Viernes, día de las madres en Costa Rica (feriado)
        interval: 4,
        duration: 2,
        durationUnit: 'weeks',
        country: 'CR',
        excludeWeekends: true,
        excludeHolidays: true
      })

      await calculator.calculateDates()
      const result = calculator.calculatedDates.value

      // Verificar que se generaron las fechas esperadas
      expect(result.length).toBeGreaterThan(0)

      // Verificar fechas específicas
      const dateStrings = result.map(d => d.dateString)
      
      // Primera fecha debe ser el primer día hábil (lunes 18 agosto)
      expect(dateStrings[0]).toBe('2025-08-18') // Lunes (primer día hábil después del feriado)
      
      // Segunda fecha debe ser 4 días hábiles después
      expect(dateStrings[1]).toBe('2025-08-22') // Viernes (18 + 4 = 22, NO 19)
      
      // Tercera fecha debe ser 4 días hábiles después (saltando fin de semana)
      expect(dateStrings[2]).toBe('2025-08-26') // Martes (22 + 4 = 26, saltando sáb-dom)

      // Verificar que las fechas mantienen el intervalo correcto
      const dates = result.map(d => new Date(d.dateString))
      
      for (let i = 1; i < dates.length; i++) {
        const daysDiff = Math.ceil((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24))
        
        // El intervalo debe ser exactamente 4 días o más (si salta fines de semana)
        // pero nunca menos de 4 días
        expect(daysDiff).toBeGreaterThanOrEqual(4)
        
        // Y nunca más de 6 días (4 días + máximo 2 días de fin de semana)
        expect(daysDiff).toBeLessThanOrEqual(6)
      }

      // Verificar propiedades específicas de las fechas
      result.forEach((dateInfo, index) => {
        // Ninguna fecha debe ser fin de semana
        expect(dateInfo.isWeekend).toBe(false)
        
        // Ninguna fecha debe ser feriado  
        expect(dateInfo.isHoliday).toBe(false)
        
        // La primera fecha debe estar marcada como filtrada (movida desde el feriado)
        if (index === 0) {
          expect(dateInfo.wasFiltered).toBe(true)
          expect(dateInfo.originalDate.toISOString().split('T')[0]).toBe('2025-08-15')
        }
      })

      console.log('📅 Test de regresión - Fechas calculadas:', dateStrings)
      console.log('✅ Intervalos verificados correctamente')
    })

    it('REGRESIÓN: debería mantener intervalos correctos con múltiples exclusiones consecutivas', async () => {
      // Caso edge: fecha inicial que cae en viernes antes de fin de semana largo
      await calculator.updateConfig({
        startDate: '2025-12-26', // Viernes después de Navidad
        interval: 3,
        duration: 2,
        durationUnit: 'weeks',
        country: 'CR',
        excludeWeekends: true,
        excludeHolidays: true
      })

      await calculator.calculateDates()
      const result = calculator.calculatedDates.value

      expect(result.length).toBeGreaterThan(0)

      // Verificar que todas las fechas son días hábiles
      result.forEach((dateInfo, index) => {
        expect(dateInfo.isWeekend).toBe(false)
        expect(dateInfo.isHoliday).toBe(false)
        
        console.log(`Fecha ${index + 1}: ${dateInfo.dateString} (${dateInfo.dayName})`)
      })

      // Verificar intervalos mínimos
      const dates = result.map(d => new Date(d.dateString))
      for (let i = 1; i < dates.length; i++) {
        const daysDiff = Math.ceil((dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24))
        expect(daysDiff).toBeGreaterThanOrEqual(3) // Nunca menos del intervalo especificado
      }
    })

    it('REGRESIÓN: debería calcular correctamente cuando todos los días teóricos son válidos', async () => {
      // Control: verificar que cuando no hay exclusiones, el comportamiento es el esperado
      await calculator.updateConfig({
        startDate: '2025-01-06', // Lunes (día hábil normal)
        interval: 3,
        duration: 2,
        durationUnit: 'weeks',
        country: 'CR',
        excludeWeekends: false, // Sin exclusiones
        excludeHolidays: false
      })

      await calculator.calculateDates()
      const result = calculator.calculatedDates.value

      // Con 14 días y intervalo de 3: 14÷3 = 4.67 → 4 fechas
      expect(result.length).toBe(4)

      const dateStrings = result.map(d => d.dateString)
      
      // Fechas deben ser exactamente cada 3 días
      expect(dateStrings[0]).toBe('2025-01-06') // Lunes (inicio)
      expect(dateStrings[1]).toBe('2025-01-09') // Jueves (6+3)
      expect(dateStrings[2]).toBe('2025-01-12') // Domingo (9+3)
      expect(dateStrings[3]).toBe('2025-01-15') // Miércoles (12+3)

      // Verificar que no hay filtrado cuando no hay exclusiones
      result.forEach(dateInfo => {
        expect(dateInfo.wasFiltered).toBe(false)
      })
    })
  })
})
