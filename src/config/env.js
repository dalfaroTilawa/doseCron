/**
 * Configuración centralizada de variables de entorno
 * Maneja todas las variables de entorno de la aplicación con valores por defecto seguros
 */

/**
 * Obtiene una variable de entorno con valor por defecto
 * @param {string} key - Nombre de la variable de entorno
 * @param {any} defaultValue - Valor por defecto
 * @param {string} type - Tipo esperado (string, number, boolean)
 * @returns {any} Valor de la variable o el valor por defecto
 */
const getEnvVar = (key, defaultValue, type = 'string') => {
  const value = import.meta.env[key]

  if (value === undefined || value === null || value === '') {
    return defaultValue
  }

  switch (type) {
    case 'number': {
      const numValue = Number(value)
      return isNaN(numValue) ? defaultValue : numValue
    }
    case 'boolean':
      return value === 'true' || value === true
    default:
      return value
  }
}

// =============================================================================
// API CONFIGURATION
// =============================================================================
export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_API_BASE_URL', 'https://date.nager.at/api/v3'),
  TIMEOUT: getEnvVar('VITE_API_TIMEOUT', 10000, 'number')
}

// =============================================================================
// CACHE CONFIGURATION
// =============================================================================
export const CACHE_CONFIG = {
  TTL: getEnvVar('VITE_CACHE_TTL', 30 * 24 * 60 * 60 * 1000, 'number'), // 30 días
  STORAGE_PREFIX: getEnvVar('VITE_STORAGE_PREFIX', 'dosecron')
}

// =============================================================================
// APP CONFIGURATION
// =============================================================================
export const APP_CONFIG = {
  MAX_ITERATIONS: getEnvVar('VITE_MAX_ITERATIONS', 1000, 'number'),
  MAX_ATTEMPTS: getEnvVar('VITE_MAX_ATTEMPTS', 30, 'number'),
  DEBUG_MODE: getEnvVar('VITE_DEBUG_MODE', false, 'boolean'),
  LOG_LEVEL: getEnvVar('VITE_LOG_LEVEL', 'warn'),
  DEVELOPER_MODE: getEnvVar('VITE_DEVELOPER_MODE', false, 'boolean')
}

// =============================================================================
// DEFAULT USER PREFERENCES
// =============================================================================
export const DEFAULT_USER_PREFERENCES = {
  COUNTRY: getEnvVar('VITE_DEFAULT_COUNTRY', 'CR'),
  THEME: getEnvVar('VITE_DEFAULT_THEME', 'light'),
  LANGUAGE: getEnvVar('VITE_DEFAULT_LANGUAGE', 'es'),
  DURATION_UNIT: getEnvVar('VITE_DEFAULT_DURATION_UNIT', 'months'),
  EXCLUDE_WEEKENDS: getEnvVar('VITE_DEFAULT_EXCLUDE_WEEKENDS', true, 'boolean'),
  EXCLUDE_HOLIDAYS: getEnvVar('VITE_DEFAULT_EXCLUDE_HOLIDAYS', true, 'boolean')
}

// =============================================================================
// STORAGE KEYS (usando prefix configurable)
// =============================================================================
export const STORAGE_KEYS = {
  COUNTRY: `${CACHE_CONFIG.STORAGE_PREFIX}_country`,
  THEME: `${CACHE_CONFIG.STORAGE_PREFIX}_theme`,
  LANGUAGE: `${CACHE_CONFIG.STORAGE_PREFIX}_language`,
  USER_PREFERENCES: `${CACHE_CONFIG.STORAGE_PREFIX}_preferences`
}

// =============================================================================
// UTILIDADES DE DEBUG
// =============================================================================
export const logger = {
  error: (message, ...args) => {
    if (['error', 'warn', 'info', 'debug'].includes(APP_CONFIG.LOG_LEVEL)) {
      console.error(`[DoseCron] ERROR: ${message}`, ...args)
    }
  },

  warn: (message, ...args) => {
    if (['warn', 'info', 'debug'].includes(APP_CONFIG.LOG_LEVEL)) {
      console.warn(`[DoseCron] WARN: ${message}`, ...args)
    }
  },

  info: (message, ...args) => {
    if (['info', 'debug'].includes(APP_CONFIG.LOG_LEVEL)) {
      console.info(`[DoseCron] INFO: ${message}`, ...args)
    }
  },

  debug: (message, ...args) => {
    if (APP_CONFIG.DEBUG_MODE && APP_CONFIG.LOG_LEVEL === 'debug') {
      console.debug(`[DoseCron] DEBUG: ${message}`, ...args)
    }
  }
}

// =============================================================================
// INFORMACIÓN DE CONFIGURACIÓN (para debugging)
// =============================================================================
export const getConfigSummary = () => {
  if (!APP_CONFIG.DEBUG_MODE) {
    return 'Debug mode disabled'
  }

  return {
    api: API_CONFIG,
    cache: CACHE_CONFIG,
    app: APP_CONFIG,
    defaults: DEFAULT_USER_PREFERENCES,
    storageKeys: STORAGE_KEYS,
    environment: import.meta.env.MODE
  }
}

// Mostrar configuración en modo debug
if (APP_CONFIG.DEBUG_MODE) {
  logger.debug('Configuración cargada:', getConfigSummary())
}
