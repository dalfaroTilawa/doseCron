/**
 * Servicio para gestionar la API de feriados de Nager.Date
 * Incluye cache en localStorage y manejo de errores
 */

// Base URL de la API de Nager.Date
const API_BASE_URL = 'https://date.nager.at/api/v3'

// Tiempo de vida del cache (7 días en milisegundos)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

/**
 * Lista de países soportados con códigos ISO
 */
export const SUPPORTED_COUNTRIES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Bélgica' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brasil' },
  { code: 'CA', name: 'Canadá' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croacia' },
  { code: 'CZ', name: 'República Checa' },
  { code: 'DK', name: 'Dinamarca' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finlandia' },
  { code: 'FR', name: 'Francia' },
  { code: 'DE', name: 'Alemania' },
  { code: 'GR', name: 'Grecia' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungría' },
  { code: 'IS', name: 'Islandia' },
  { code: 'IE', name: 'Irlanda' },
  { code: 'IT', name: 'Italia' },
  { code: 'LV', name: 'Letonia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lituania' },
  { code: 'LU', name: 'Luxemburgo' },
  { code: 'MT', name: 'Malta' },
  { code: 'MX', name: 'México' },
  { code: 'MC', name: 'Mónaco' },
  { code: 'NL', name: 'Países Bajos' },
  { code: 'NZ', name: 'Nueva Zelanda' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NO', name: 'Noruega' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Perú' },
  { code: 'PL', name: 'Polonia' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Rumania' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SK', name: 'Eslovaquia' },
  { code: 'SI', name: 'Eslovenia' },
  { code: 'ZA', name: 'Sudáfrica' },
  { code: 'ES', name: 'España' },
  { code: 'SE', name: 'Suecia' },
  { code: 'CH', name: 'Suiza' },
  { code: 'UA', name: 'Ucrania' },
  { code: 'GB', name: 'Reino Unido' },
  { code: 'US', name: 'Estados Unidos' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VA', name: 'Ciudad del Vaticano' },
  { code: 'VE', name: 'Venezuela' }
]

/**
 * Genera la clave para el cache de localStorage
 * @param {string} countryCode - Código ISO del país
 * @param {number} year - Año
 * @returns {string} Clave para localStorage
 */
const getCacheKey = (countryCode, year) => {
  return `holidays_${countryCode}_${year}`
}

/**
 * Obtiene datos del cache de localStorage
 * @param {string} key - Clave del cache
 * @returns {Object|null} Datos del cache o null si no existe o está expirado
 */
const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null

    const data = JSON.parse(cached)
    const now = Date.now()

    // Verificar si el cache ha expirado
    if (now - data.timestamp > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }

    return data.holidays
  } catch (error) {
    console.warn('Error al leer cache:', error)
    localStorage.removeItem(key)
    return null
  }
}

/**
 * Guarda datos en el cache de localStorage
 * @param {string} key - Clave del cache
 * @param {Array} holidays - Array de feriados
 */
const setCachedData = (key, holidays) => {
  try {
    const data = {
      holidays,
      timestamp: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Error al guardar en cache:', error)
  }
}

/**
 * Realiza petición HTTP con timeout y manejo de errores
 * @param {string} url - URL de la petición
 * @param {number} timeout - Timeout en milisegundos (default: 10000)
 * @returns {Promise<any>} Respuesta de la API
 */
const fetchWithTimeout = async (url, timeout = 10000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new Error('La petición ha excedido el tiempo límite')
    }

    if (error instanceof TypeError) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.')
    }

    throw error
  }
}

/**
 * Obtiene la lista de países soportados
 * @returns {Array} Array de objetos con code y name
 */
export const getCountries = () => {
  return SUPPORTED_COUNTRIES.map(country => ({ ...country }))
}

/**
 * Obtiene los feriados de un país y año específicos
 * @param {number} year - Año (ej: 2025)
 * @param {string} countryCode - Código ISO del país (ej: 'ES')
 * @returns {Promise<Array>} Array de feriados
 */
export const getHolidays = async (year, countryCode) => {
  // Validar parámetros
  if (!year || year < 1900 || year > 2100) {
    throw new Error('Año inválido. Debe estar entre 1900 y 2100.')
  }

  if (!countryCode || typeof countryCode !== 'string') {
    throw new Error('Código de país inválido.')
  }

  const upperCountryCode = countryCode.toUpperCase()

  // Verificar si el país está soportado
  const supportedCountry = SUPPORTED_COUNTRIES.find(c => c.code === upperCountryCode)
  if (!supportedCountry) {
    throw new Error(`País "${countryCode}" no soportado.`)
  }

  // Intentar obtener desde cache
  const cacheKey = getCacheKey(upperCountryCode, year)
  const cachedHolidays = getCachedData(cacheKey)

  if (cachedHolidays) {
    console.log(`Feriados cargados desde cache: ${upperCountryCode} ${year}`)
    return cachedHolidays
  }

  // Si no hay cache, hacer petición a la API
  try {
    console.log(`Obteniendo feriados desde API: ${upperCountryCode} ${year}`)
    const url = `${API_BASE_URL}/PublicHolidays/${year}/${upperCountryCode}`
    const holidays = await fetchWithTimeout(url)

    // Validar respuesta
    if (!Array.isArray(holidays)) {
      throw new Error('Respuesta inválida de la API')
    }

    // Procesar y normalizar datos
    const processedHolidays = holidays.map(holiday => ({
      date: holiday.date,
      localName: holiday.localName || holiday.name,
      name: holiday.name,
      countryCode: holiday.countryCode || upperCountryCode,
      fixed: holiday.fixed || false,
      global: holiday.global || false,
      counties: holiday.counties || null,
      launchYear: holiday.launchYear || null
    }))

    // Guardar en cache
    setCachedData(cacheKey, processedHolidays)

    return processedHolidays
  } catch (error) {
    console.error('Error al obtener feriados:', error)

    // Proporcionar mensaje de error más específico
    if (error.message.includes('404')) {
      throw new Error(`No se encontraron feriados para ${supportedCountry.name} en ${year}`)
    }

    if (error.message.includes('500')) {
      throw new Error('Error del servidor. Intenta más tarde.')
    }

    throw new Error(`Error al obtener feriados: ${error.message}`)
  }
}

/**
 * Verifica si una fecha específica es feriado en un país
 * @param {string|Date} date - Fecha en formato 'YYYY-MM-DD' o objeto Date
 * @param {string} countryCode - Código ISO del país
 * @returns {Promise<Object|null>} Objeto del feriado o null si no es feriado
 */
export const isHoliday = async (date, countryCode) => {
  try {
    // Normalizar fecha
    let dateStr
    if (date instanceof Date) {
      dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
    } else if (typeof date === 'string') {
      // Validar formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Formato de fecha inválido. Use YYYY-MM-DD')
      }
      dateStr = date
    } else {
      throw new Error('Fecha debe ser string (YYYY-MM-DD) o objeto Date')
    }

    // Extraer año de la fecha
    const year = parseInt(dateStr.split('-')[0])

    // Obtener feriados del año
    const holidays = await getHolidays(year, countryCode)

    // Buscar la fecha específica
    const holiday = holidays.find(h => h.date === dateStr)

    return holiday || null
  } catch (error) {
    console.error('Error al verificar feriado:', error)
    throw error
  }
}

/**
 * Limpia el cache de feriados (útil para desarrollo y testing)
 * @param {string} countryCode - Código del país (opcional, si no se proporciona limpia todo)
 * @param {number} year - Año específico (opcional)
 */
export const clearHolidaysCache = (countryCode = null, year = null) => {
  try {
    if (countryCode && year) {
      // Limpiar cache específico
      const key = getCacheKey(countryCode.toUpperCase(), year)
      localStorage.removeItem(key)
      console.log(`Cache limpiado: ${key}`)
    } else if (countryCode) {
      // Limpiar todos los años de un país
      const prefix = `holidays_${countryCode.toUpperCase()}_`
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key)
          console.log(`Cache limpiado: ${key}`)
        }
      })
    } else {
      // Limpiar todo el cache de feriados
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('holidays_')) {
          localStorage.removeItem(key)
          console.log(`Cache limpiado: ${key}`)
        }
      })
    }
  } catch (error) {
    console.warn('Error al limpiar cache:', error)
  }
}

/**
 * Obtiene estadísticas del cache
 * @returns {Object} Estadísticas del cache
 */
export const getCacheStats = () => {
  const stats = {
    totalEntries: 0,
    countries: new Set(),
    years: new Set(),
    totalSize: 0
  }

  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('holidays_')) {
        stats.totalEntries++

        const parts = key.split('_')
        if (parts.length === 3) {
          stats.countries.add(parts[1])
          stats.years.add(parts[2])
        }

        const data = localStorage.getItem(key)
        if (data) {
          stats.totalSize += data.length
        }
      }
    })

    return {
      totalEntries: stats.totalEntries,
      countries: Array.from(stats.countries),
      years: Array.from(stats.years).sort(),
      totalSizeKB: Math.round(stats.totalSize / 1024)
    }
  } catch (error) {
    console.warn('Error al obtener estadísticas del cache:', error)
    return stats
  }
}

// Exportar como default para facilitar importación
export default {
  getCountries,
  getHolidays,
  isHoliday,
  clearHolidaysCache,
  getCacheStats,
  SUPPORTED_COUNTRIES
}
