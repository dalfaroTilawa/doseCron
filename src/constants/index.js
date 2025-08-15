// Constantes centralizadas del proyecto DoseCron

/**
 * Constantes de tiempo y fechas
 */
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
  MILLISECONDS_PER_HOUR: 60 * 60 * 1000,
  MILLISECONDS_PER_MINUTE: 60 * 1000,
  DAYS_PER_WEEK: 7,
  MONTHS_PER_YEAR: 12,
  DEFAULT_TIMEZONE: 'UTC'
}

/**
 * Formatos de fecha estándar
 */
export const DATE_FORMATS = {
  ISO_DATE: 'yyyy-MM-dd',
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss",
  DISPLAY_DATE: 'dd/MM/yyyy',
  FILENAME_DATE: 'yyyy-MM-dd-HHmm'
}

/**
 * Límites de validación
 */
export const VALIDATION_LIMITS = {
  MIN_INTERVAL: 1,
  MAX_INTERVAL: 365,
  MIN_DURATION: 1,
  MAX_DURATION: 100,
  MAX_FUNCTION_LINES: 25,
  MAX_COMPONENT_PARAMS: 3
}

/**
 * Configuración de localStorage
 */
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'dosecron_preferences',
  COUNTRY_SETTING: 'dosecron_country',
  LOCALE_SETTING: 'dosecron-locale',
  THEME_SETTING: 'theme',
  HOLIDAYS_CACHE_PREFIX: 'holidays_',
  CACHE_META_PREFIX: 'meta_'
}

/**
 * Configuración de cache
 */
export const CACHE_CONFIG = {
  HOLIDAYS_TTL: 24 * 60 * 60 * 1000, // 24 horas
  DEFAULT_TTL: 60 * 60 * 1000, // 1 hora
  MAX_CACHE_SIZE: 50,
  CLEANUP_THRESHOLD: 40
}

/**
 * Configuración de notificaciones
 */
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 4000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 6000,
  WARNING_DURATION: 5000,
  MAX_NOTIFICATIONS: 5
}

/**
 * Configuración de tema
 */
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  STORAGE_KEY: 'theme'
}

/**
 * Configuración de idiomas
 */
export const LOCALE_CONFIG = {
  DEFAULT: 'es',
  SUPPORTED: ['es', 'en'],
  FALLBACK: 'es',
  STORAGE_KEY: 'dosecron-locale'
}

/**
 * Países soportados por defecto
 */
export const DEFAULT_COUNTRIES = {
  CR: 'Costa Rica',
  US: 'United States',
  ES: 'España',
  MX: 'México',
  AR: 'Argentina',
  CO: 'Colombia',
  CL: 'Chile',
  PE: 'Perú'
}

/**
 * Configuración de API
 */
export const API_CONFIG = {
  HOLIDAYS_BASE_URL: 'https://date.nager.at/api/v3',
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

/**
 * Configuración de archivos
 */
export const FILE_CONFIG = {
  EXPORT_FORMATS: ['txt', 'csv', 'json'],
  MAX_FILENAME_LENGTH: 100,
  DEFAULT_ENCODING: 'utf-8'
}

/**
 * Expresiones regulares comunes
 */
export const REGEX_PATTERNS = {
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  COUNTRY_CODE: /^[A-Z]{2}$/,
  LOCALE_CODE: /^[a-z]{2}$/
}

/**
 * Mensajes de error comunes
 */
export const ERROR_MESSAGES = {
  INVALID_DATE: 'Fecha inválida',
  INVALID_INTERVAL: 'Intervalo inválido',
  INVALID_DURATION: 'Duración inválida',
  NETWORK_ERROR: 'Error de conexión',
  STORAGE_ERROR: 'Error de almacenamiento',
  VALIDATION_ERROR: 'Error de validación'
}

/**
 * Configuración de desarrollo
 */
export const DEV_CONFIG = {
  LOG_LEVEL: 'debug',
  ENABLE_DEVTOOLS: true,
  MOCK_DELAYS: false,
  CACHE_DISABLED: false
}
