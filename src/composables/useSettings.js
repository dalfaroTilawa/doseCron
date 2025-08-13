/**
 * Composable para manejo de configuraciones y persistencia en localStorage
 * Maneja preferencias del usuario como país seleccionado, tema, etc.
 */

import { ref, reactive, computed, watch } from 'vue'
import { STORAGE_KEYS, DEFAULT_USER_PREFERENCES, logger } from '../config/env.js'

// Configuración por defecto desde variables de entorno
const DEFAULT_SETTINGS = {
  country: DEFAULT_USER_PREFERENCES.COUNTRY,
  theme: DEFAULT_USER_PREFERENCES.THEME,
  language: DEFAULT_USER_PREFERENCES.LANGUAGE,
  excludeWeekends: DEFAULT_USER_PREFERENCES.EXCLUDE_WEEKENDS,
  excludeHolidays: DEFAULT_USER_PREFERENCES.EXCLUDE_HOLIDAYS,
  // NOTA: Removidas defaultInterval y defaultDuration ya que los campos inician vacíos
  defaultDurationUnit: DEFAULT_USER_PREFERENCES.DURATION_UNIT
}

// Estado global compartido (singleton)
let globalSettings = null

/**
 * Composable principal para manejo de configuraciones
 * Implementa patrón singleton para compartir estado entre componentes
 * @returns {Object} API del composable
 */
export function useSettings() {
  // Si ya existe una instancia global, devolverla (singleton)
  if (globalSettings) {
    return globalSettings
  }

  // Estado reactivo para las configuraciones
  const settings = reactive({ ...DEFAULT_SETTINGS })
  const isLoaded = ref(false)
  const error = ref('')

  /**
   * Verifica si localStorage está disponible
   * @returns {boolean} Si localStorage es accesible
   */
  const isLocalStorageAvailable = () => {
    try {
      const test = '__dosecron_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }

  /**
   * Maneja errores de localStorage de forma segura
   * @param {Function} operation - Operación a ejecutar
   * @param {string} context - Contexto del error para logging
   * @returns {any} Resultado de la operación o null en caso de error
   */
  const safeStorageOperation = (operation, context) => {
    try {
      if (!isLocalStorageAvailable()) {
        logger.warn(`localStorage no disponible para: ${context}`)
        return null
      }
      return operation()
    } catch (err) {
      logger.error(`Error en ${context}:`, err)
      error.value = `Error de almacenamiento: ${err.message}`
      return null
    }
  }

  /**
   * Guarda el país seleccionado en localStorage
   * @param {string} country - Código ISO del país (ej: 'CR', 'ES')
   * @returns {boolean} Éxito de la operación
   */
  const saveCountry = (country) => {
    if (!country || typeof country !== 'string') {
      logger.warn('País inválido:', country)
      return false
    }

    const result = safeStorageOperation(() => {
      localStorage.setItem(STORAGE_KEYS.COUNTRY, country.toUpperCase())
      settings.country = country.toUpperCase()
      return true
    }, 'saveCountry')

    return result || false
  }

  /**
   * Carga el país desde localStorage
   * @returns {string|null} Código del país o null si no existe
   */
  const loadCountry = () => {
    const result = safeStorageOperation(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.COUNTRY)
      if (stored) {
        settings.country = stored
        return stored
      }
      return null
    }, 'loadCountry')

    return result
  }

  /**
   * Guarda todas las preferencias del usuario
   * @param {Object} preferences - Objeto con las preferencias
   * @returns {boolean} Éxito de la operación
   */
  const savePreferences = (preferences = {}) => {
    const result = safeStorageOperation(() => {
      const prefsToSave = {
        ...settings,
        ...preferences,
        lastUpdated: new Date().toISOString()
      }

      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(prefsToSave))
      Object.assign(settings, preferences)
      return true
    }, 'savePreferences')

    return result || false
  }

  /**
   * Carga todas las preferencias desde localStorage
   * @returns {Object|null} Preferencias cargadas o null
   */
  const loadPreferences = () => {
    const result = safeStorageOperation(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.assign(settings, { ...DEFAULT_SETTINGS, ...parsed })
        return parsed
      }
      return null
    }, 'loadPreferences')

    return result
  }

  /**
   * Guarda una configuración específica
   * @param {string} key - Clave de la configuración
   * @param {any} value - Valor a guardar
   * @returns {boolean} Éxito de la operación
   */
  const saveSetting = (key, value) => {
    if (!key || value === undefined) {
      logger.warn('Clave o valor inválido:', { key, value })
      return false
    }

    const result = safeStorageOperation(() => {
      // Actualizar configuración local
      if (key in settings) {
        settings[key] = value
      }

      // Guardar en localStorage específico si es una clave conocida
      if (STORAGE_KEYS[key.toUpperCase()]) {
        localStorage.setItem(STORAGE_KEYS[key.toUpperCase()], JSON.stringify(value))
      }

      // Siempre actualizar las preferencias generales
      return savePreferences({ [key]: value })
    }, `saveSetting(${key})`)

    return result || false
  }

  /**
   * Carga una configuración específica
   * @param {string} key - Clave de la configuración
   * @param {any} defaultValue - Valor por defecto si no existe
   * @returns {any} Valor cargado o valor por defecto
   */
  const loadSetting = (key, defaultValue = null) => {
    const result = safeStorageOperation(() => {
      // Intentar cargar desde localStorage específico
      if (STORAGE_KEYS[key.toUpperCase()]) {
        const stored = localStorage.getItem(STORAGE_KEYS[key.toUpperCase()])
        if (stored) {
          try {
            return JSON.parse(stored)
          } catch {
            return stored // Si no es JSON, devolver como string
          }
        }
      }

      // Intentar cargar desde preferencias generales
      const prefs = loadPreferences()
      if (prefs && key in prefs) {
        return prefs[key]
      }

      // Usar valor por defecto
      return defaultValue !== null ? defaultValue : DEFAULT_SETTINGS[key]
    }, `loadSetting(${key})`)

    return result !== null ? result : defaultValue
  }

  /**
   * Limpia todas las configuraciones guardadas
   * @returns {boolean} Éxito de la operación
   */
  const clearSettings = () => {
    const result = safeStorageOperation(() => {
      // Limpiar claves específicas
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })

      // Resetear configuración local
      Object.assign(settings, DEFAULT_SETTINGS)

      return true
    }, 'clearSettings')

    return result || false
  }

  /**
   * Exporta las configuraciones actuales
   * @returns {Object} Configuraciones en formato JSON
   */
  const exportSettings = () => {
    return {
      ...settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }

  /**
   * Importa configuraciones desde un objeto
   * @param {Object} importedSettings - Configuraciones a importar
   * @returns {boolean} Éxito de la operación
   */
  const importSettings = (importedSettings) => {
    try {
      if (!importedSettings || typeof importedSettings !== 'object') {
        throw new Error('Configuraciones inválidas para importar')
      }

      // Validar y filtrar configuraciones válidas
      const validSettings = {}
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (key in importedSettings) {
          validSettings[key] = importedSettings[key]
        }
      })

      // Aplicar configuraciones válidas
      Object.assign(settings, validSettings)

      // Guardar en localStorage
      return savePreferences(validSettings)
    } catch (err) {
      logger.error('Error importando configuraciones:', err)
      error.value = `Error al importar: ${err.message}`
      return false
    }
  }

  /**
   * Inicializa las configuraciones cargando desde localStorage
   * @returns {Promise<boolean>} Éxito de la inicialización
   */
  const initializeSettings = async () => {
    try {
      error.value = ''

      // Cargar preferencias generales
      const loadedPrefs = loadPreferences()

      // Si no hay preferencias guardadas, usar valores por defecto
      if (!loadedPrefs) {
        logger.info('No hay preferencias guardadas, usando valores por defecto')
        // Guardar configuración por defecto
        savePreferences(DEFAULT_SETTINGS)
      } else {
        logger.debug('Preferencias cargadas:', loadedPrefs)
      }

      isLoaded.value = true
      return true
    } catch (err) {
      logger.error('Error inicializando configuraciones:', err)
      error.value = `Error de inicialización: ${err.message}`
      isLoaded.value = false
      return false
    }
  }

  /**
   * Resetea las configuraciones a valores por defecto
   * @returns {boolean} Éxito de la operación
   */
  const resetToDefaults = () => {
    try {
      Object.assign(settings, DEFAULT_SETTINGS)
      return savePreferences(DEFAULT_SETTINGS)
    } catch (err) {
      logger.error('Error reseteando configuraciones:', err)
      error.value = `Error al resetear: ${err.message}`
      return false
    }
  }

  // Computed properties
  const currentCountry = computed(() => settings.country)
  const currentTheme = computed(() => settings.theme)
  const isDefaultCountry = computed(() => settings.country === DEFAULT_SETTINGS.country)

  // Watchers para auto-guardar cambios importantes
  watch(() => settings.country, (newCountry) => {
    if (isLoaded.value && newCountry) {
      saveCountry(newCountry)
    }
  }, { immediate: false })

  // API pública del composable
  const api = {
    // Estado reactivo
    settings,
    isLoaded: computed(() => isLoaded.value),
    error: computed(() => error.value),

    // Computed properties
    currentCountry,
    currentTheme,
    isDefaultCountry,

    // Funciones específicas (compatibilidad)
    saveCountry,
    loadCountry,
    clearSettings,

    // Funciones generales
    saveSetting,
    loadSetting,
    savePreferences,
    loadPreferences,

    // Funciones de utilidad
    exportSettings,
    importSettings,
    resetToDefaults,
    initializeSettings,

    // Constantes
    DEFAULT_SETTINGS: { ...DEFAULT_SETTINGS },
    STORAGE_KEYS: { ...STORAGE_KEYS }
  }

  // Guardar referencia global (singleton)
  globalSettings = api

  // Inicializar automáticamente
  initializeSettings()

  return api
}

// Export por defecto para facilitar importación
export default useSettings
