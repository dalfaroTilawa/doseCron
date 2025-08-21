/**
 * Composable minimalista para tracking básico de visitas
 * Versión ultra-ligera con mínimo impacto en recursos
 */

import { ref, computed, onMounted } from 'vue'
import { CACHE_CONFIG } from '../config/env.js'

// Clave única para localStorage
const ANALYTICS_KEY = `${CACHE_CONFIG.STORAGE_PREFIX}_stats`

// Estado global singleton
let globalAnalytics = null

/**
 * Hook minimalista para analytics básico
 * @returns {Object} API del composable
 */
export function useAnalytics() {
  if (globalAnalytics) {
    return globalAnalytics
  }

  // Estado reactivo mínimo
  const stats = ref({
    visits: 0,
    calculations: 0,
    firstVisit: null,
    lastVisit: null
  })

  const isLoaded = ref(false)

  /**
   * Carga stats desde localStorage
   */
  const loadStats = () => {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY)
      if (stored) {
        stats.value = { ...stats.value, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Error cargando analytics:', error)
    }
  }

  /**
   * Guarda stats en localStorage
   */
  const saveStats = () => {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(stats.value))
    } catch (error) {
      console.warn('Error guardando analytics:', error)
    }
  }

  /**
   * Registra una nueva visita
   */
  const recordVisit = () => {
    const now = new Date().toISOString()
    
    stats.value.visits += 1
    stats.value.lastVisit = now
    
    if (!stats.value.firstVisit) {
      stats.value.firstVisit = now
    }
    
    saveStats()
  }

  /**
   * Registra un cálculo realizado
   */
  const recordCalculation = () => {
    stats.value.calculations += 1
    saveStats()
  }

  /**
   * Limpia todas las estadísticas
   */
  const clearStats = () => {
    stats.value = {
      visits: 0,
      calculations: 0,
      firstVisit: null,
      lastVisit: null
    }
    localStorage.removeItem(ANALYTICS_KEY)
  }

  /**
   * Inicializa el sistema
   */
  const initialize = () => {
    loadStats()
    recordVisit()
    isLoaded.value = true
  }

  // Computed para métricas básicas
  const daysActive = computed(() => {
    if (!stats.value.firstVisit || !stats.value.lastVisit) return 0
    const first = new Date(stats.value.firstVisit)
    const last = new Date(stats.value.lastVisit)
    return Math.ceil((last - first) / (1000 * 60 * 60 * 24)) + 1
  })

  // API mínima
  const api = {
    stats: computed(() => stats.value),
    daysActive,
    isLoaded: computed(() => isLoaded.value),
    recordCalculation,
    clearStats
  }

  globalAnalytics = api

  // Auto-inicializar
  onMounted(initialize)

  return api
}

export default useAnalytics