// Composable especializado para manejo de feriados
import { ref, computed } from 'vue'
import { STORAGE_KEYS, CACHE_CONFIG } from '../constants/index.js'

/**
 * Composable para gestión de feriados y cache
 * Separado del calculador principal para mejor responsabilidad única
 */
export function useHolidayManager() {
  // Estado reactivo
  const holidays = ref(new Map())
  const isLoadingHolidays = ref(false)
  const holidayError = ref('')

  /**
   * Obtiene feriados para un país y año específicos
   * @param {string} countryCode - Código ISO del país
   * @param {number} year - Año para obtener feriados
   * @returns {Promise<Array>} Lista de feriados
   */
  const getHolidays = async (countryCode, year) => {
    if (!countryCode || !year) return []

    const cacheKey = `${countryCode}_${year}`

    // Verificar cache primero
    if (holidays.value.has(cacheKey)) {
      return holidays.value.get(cacheKey)
    }

    // Verificar localStorage cache
    const cachedData = getCachedHolidays(countryCode, year)
    if (cachedData) {
      holidays.value.set(cacheKey, cachedData)
      return cachedData
    }

    // Cargar desde API
    return await loadHolidaysFromAPI(countryCode, year)
  }

  /**
   * Carga feriados desde la API
   * @param {string} countryCode - Código del país
   * @param {number} year - Año
   * @returns {Promise<Array>} Lista de feriados
   */
  const loadHolidaysFromAPI = async (countryCode, year) => {
    const cacheKey = `${countryCode}_${year}`

    try {
      isLoadingHolidays.value = true
      holidayError.value = ''

      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const holidaysData = await response.json()

      // Procesar y formatear feriados
      const processedHolidays = holidaysData.map(holiday => ({
        date: holiday.date,
        name: holiday.name,
        localName: holiday.localName,
        countryCode: holiday.countryCode,
        type: holiday.type || 'Public'
      }))

      // Guardar en cache
      holidays.value.set(cacheKey, processedHolidays)
      setCachedHolidays(countryCode, year, processedHolidays)

      return processedHolidays

    } catch (error) {
      console.error(`Error cargando feriados para ${countryCode} ${year}:`, error)
      holidayError.value = error.message
      return []
    } finally {
      isLoadingHolidays.value = false
    }
  }

  /**
   * Obtiene feriados del cache de localStorage
   * @param {string} countryCode - Código del país
   * @param {number} year - Año
   * @returns {Array|null} Feriados cacheados o null
   */
  const getCachedHolidays = (countryCode, year) => {
    try {
      const cacheKey = `${STORAGE_KEYS.HOLIDAYS_CACHE_PREFIX}${countryCode}_${year}`
      const metaKey = `${STORAGE_KEYS.CACHE_META_PREFIX}${countryCode}_${year}`

      const cached = localStorage.getItem(cacheKey)
      const meta = localStorage.getItem(metaKey)

      if (!cached || !meta) return null

      const metaData = JSON.parse(meta)
      const now = Date.now()

      // Verificar si el cache ha expirado
      if (now > metaData.expires) {
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(metaKey)
        return null
      }

      return JSON.parse(cached)
    } catch (error) {
      console.error('Error leyendo cache de feriados:', error)
      return null
    }
  }

  /**
   * Guarda feriados en el cache de localStorage
   * @param {string} countryCode - Código del país
   * @param {number} year - Año
   * @param {Array} holidaysData - Datos de feriados
   */
  const setCachedHolidays = (countryCode, year, holidaysData) => {
    try {
      const cacheKey = `${STORAGE_KEYS.HOLIDAYS_CACHE_PREFIX}${countryCode}_${year}`
      const metaKey = `${STORAGE_KEYS.CACHE_META_PREFIX}${countryCode}_${year}`

      const metaData = {
        cached: Date.now(),
        expires: Date.now() + CACHE_CONFIG.HOLIDAYS_TTL,
        country: countryCode,
        year: year,
        count: holidaysData.length
      }

      localStorage.setItem(cacheKey, JSON.stringify(holidaysData))
      localStorage.setItem(metaKey, JSON.stringify(metaData))

    } catch (error) {
      console.error('Error guardando cache de feriados:', error)
    }
  }

  /**
   * Verifica si una fecha es feriado
   * @param {string} dateString - Fecha en formato YYYY-MM-DD
   * @param {string} countryCode - Código del país
   * @param {number} year - Año
   * @returns {Promise<object|null>} Información del feriado o null
   */
  const isHoliday = async (dateString, countryCode, year) => {
    if (!countryCode || !dateString) return null

    const holidaysList = await getHolidays(countryCode, year)
    return holidaysList.find(holiday => holiday.date === dateString) || null
  }

  /**
   * Limpia el cache de feriados
   * @param {string} countryCode - Código específico del país (opcional)
   */
  const clearHolidaysCache = (countryCode = null) => {
    try {
      if (countryCode) {
        // Limpiar cache específico del país
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes(`${STORAGE_KEYS.HOLIDAYS_CACHE_PREFIX}${countryCode}`) ||
              key.includes(`${STORAGE_KEYS.CACHE_META_PREFIX}${countryCode}`)) {
            localStorage.removeItem(key)
          }
        })

        // Limpiar cache en memoria
        for (const [key] of holidays.value) {
          if (key.startsWith(`${countryCode}_`)) {
            holidays.value.delete(key)
          }
        }
      } else {
        // Limpiar todo el cache de feriados
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith(STORAGE_KEYS.HOLIDAYS_CACHE_PREFIX) ||
              key.startsWith(STORAGE_KEYS.CACHE_META_PREFIX)) {
            localStorage.removeItem(key)
          }
        })

        holidays.value.clear()
      }
    } catch (error) {
      console.error('Error limpiando cache de feriados:', error)
    }
  }

  /**
   * Estado del manager de feriados
   */
  const holidayStats = computed(() => ({
    totalCachedCountries: holidays.value.size,
    isLoading: isLoadingHolidays.value,
    hasError: !!holidayError.value,
    errorMessage: holidayError.value
  }))

  return {
    // Estado
    holidays: holidays.value,
    isLoadingHolidays,
    holidayError,
    holidayStats,

    // Métodos
    getHolidays,
    isHoliday,
    clearHolidaysCache,
    loadHolidaysFromAPI
  }
}
