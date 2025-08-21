/**
 * Tests unitarios para VisitStats component
 * Verifica que el panel analytics sea privado solo para desarrollador
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VisitStats from '../src/components/VisitStats.vue'

// Mock del composable useAnalytics
const mockAnalytics = {
  stats: {
    visits: 5,
    calculations: 3,
    firstVisit: '2025-08-21T10:00:00.000Z',
    lastVisit: '2025-08-21T15:00:00.000Z'
  },
  daysActive: 1,
  clearStats: vi.fn()
}

vi.mock('../src/composables/useAnalytics.js', () => ({
  useAnalytics: () => mockAnalytics
}))

// Mock de i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => {
      const translations = {
        'analytics.devMode': 'Modo desarrollador',
        'analytics.visits': 'Visitas',
        'analytics.calculations': 'Cálculos',
        'analytics.daysActive': 'Días activos',
        'analytics.clearStats': 'Limpiar estadísticas'
      }
      return translations[key] || key
    }
  })
}))

// Mock de la configuración
vi.mock('../src/config/env.js', () => ({
  APP_CONFIG: {
    DEVELOPER_MODE: false,
    DEBUG_MODE: false
  }
}))

describe('VisitStats', () => {
  let originalLocation
  let originalWindow

  beforeEach(() => {
    // Guardar referencias originales
    originalLocation = window.location
    originalWindow = global.window

    // Mock de window global functions
    global.window = {
      ...window,
      showDevStats: undefined,
      hideDevStats: undefined,
      getDevStats: undefined,
      _dosecronDevMsgShown: undefined
    }

    // Limpiar console.log mocks
    vi.clearAllMocks()
    console.log = vi.fn()
  })

  afterEach(() => {
    // Restaurar window.location original
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    })

    // Limpiar funciones globales
    delete global.window.showDevStats
    delete global.window.hideDevStats  
    delete global.window.getDevStats
    delete global.window._dosecronDevMsgShown

    vi.restoreAllMocks()
  })

  describe('Visibilidad del panel', () => {
    it('debe estar OCULTO por defecto en producción', async () => {
      // Simular entorno de producción
      Object.defineProperty(window, 'location', {
        value: { hostname: 'dalfarotilawa.github.io' },
        writable: true
      })

      const wrapper = mount(VisitStats)
      await nextTick()

      // El componente no debe renderizar nada (v-if="isDeveloper" es false)
      expect(wrapper.find('.visit-stats').exists()).toBe(false)
      expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('debe estar VISIBLE en localhost con DEBUG_MODE', async () => {
      // Simular entorno local
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      })

      // Mock APP_CONFIG para localhost
      vi.doMock('../src/config/env.js', () => ({
        APP_CONFIG: {
          DEVELOPER_MODE: false,
          DEBUG_MODE: true
        }
      }))

      const wrapper = mount(VisitStats)
      await nextTick()

      expect(wrapper.find('.visit-stats').exists()).toBe(true)
      expect(wrapper.find('.dev-badge').text()).toBe('Modo desarrollador')
    })

    it('debe estar OCULTO en localhost sin DEBUG_MODE', async () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      })

      const wrapper = mount(VisitStats)
      await nextTick()

      expect(wrapper.find('.visit-stats').exists()).toBe(false)
    })
  })

  describe('Control manual via consola', () => {
    it('debe mostrarse cuando se llama showDevStats() en producción', async () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'dalfarotilawa.github.io' },
        writable: true
      })

      const wrapper = mount(VisitStats)
      await nextTick()

      // Inicialmente oculto
      expect(wrapper.find('.visit-stats').exists()).toBe(false)

      // Simular llamada desde consola
      global.window.showDevStats()
      await nextTick()

      // Ahora debe estar visible
      expect(wrapper.find('.visit-stats').exists()).toBe(true)
      expect(console.log).toHaveBeenCalledWith('📊 Panel de estadísticas activado')
    })

    it('debe ocultarse cuando se llama hideDevStats()', async () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'dalfarotilawa.github.io' },
        writable: true
      })

      const wrapper = mount(VisitStats)
      await nextTick()

      // Mostrar primero
      global.window.showDevStats()
      await nextTick()
      expect(wrapper.find('.visit-stats').exists()).toBe(true)

      // Luego ocultar
      global.window.hideDevStats()
      await nextTick()
      expect(wrapper.find('.visit-stats').exists()).toBe(false)
      expect(console.log).toHaveBeenCalledWith('📊 Panel de estadísticas oculto')
    })

    it('debe mostrar estadísticas en consola con getDevStats()', async () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'dalfarotilawa.github.io' },
        writable: true
      })

      mount(VisitStats)
      await nextTick()

      const result = global.window.getDevStats()

      expect(result).toEqual(mockAnalytics.stats)
      expect(console.log).toHaveBeenCalledWith('📊 Estadísticas de DoseCron:')
      expect(console.log).toHaveBeenCalledWith('   👥 Visitas: 5')
      expect(console.log).toHaveBeenCalledWith('   🧮 Cálculos: 3')
    })
  })

  describe('Funciones globales', () => {
    it('debe exponer funciones globales al montar', async () => {
      mount(VisitStats)
      await nextTick()

      expect(typeof global.window.showDevStats).toBe('function')
      expect(typeof global.window.hideDevStats).toBe('function')
      expect(typeof global.window.getDevStats).toBe('function')
    })

    it('debe mostrar mensaje de bienvenida solo una vez', async () => {
      // Montar primer componente
      const wrapper1 = mount(VisitStats)
      await nextTick()

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('%c📊 DoseCron Analytics'),
        expect.any(String)
      )

      // Limpiar mocks
      console.log.mockClear()

      // Montar segundo componente
      const wrapper2 = mount(VisitStats)
      await nextTick()

      // No debe mostrar mensaje de nuevo
      expect(console.log).not.toHaveBeenCalledWith(
        expect.stringContaining('%c📊 DoseCron Analytics'),
        expect.any(String)
      )
    })

    it('debe limpiar funciones globales al desmontar', async () => {
      const wrapper = mount(VisitStats)
      await nextTick()

      expect(global.window.showDevStats).toBeDefined()

      wrapper.unmount()
      await nextTick()

      expect(global.window.showDevStats).toBeUndefined()
      expect(global.window.hideDevStats).toBeUndefined()
      expect(global.window.getDevStats).toBeUndefined()
    })
  })

  describe('Mostrar estadísticas', () => {
    it('debe mostrar las estadísticas correctas', async () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      })

      vi.doMock('../src/config/env.js', () => ({
        APP_CONFIG: {
          DEVELOPER_MODE: true,
          DEBUG_MODE: false
        }
      }))

      const wrapper = mount(VisitStats)
      await nextTick()

      expect(wrapper.find('.visit-stats').exists()).toBe(true)
      
      const statNumbers = wrapper.findAll('.stat-number')
      expect(statNumbers[0].text()).toBe('5') // visits
      expect(statNumbers[1].text()).toBe('3') // calculations
      expect(statNumbers[2].text()).toBe('1') // daysActive
    })

    it('debe llamar clearStats cuando se hace clic en el botón', async () => {
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true
      })

      vi.doMock('../src/config/env.js', () => ({
        APP_CONFIG: {
          DEVELOPER_MODE: true,
          DEBUG_MODE: false
        }
      }))

      const wrapper = mount(VisitStats)
      await nextTick()

      await wrapper.find('.clear-button').trigger('click')

      expect(mockAnalytics.clearStats).toHaveBeenCalled()
    })
  })
})