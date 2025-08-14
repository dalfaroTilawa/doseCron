/**
 * Utilidades de almacenamiento consolidadas
 * Centraliza manejo de localStorage y gestión de errores
 */

/**
 * Logger simple para storage operations
 */
const createLogger = (prefix = 'Storage') => ({
  info: (message, ...args) => console.info(`[${prefix}]`, message, ...args),
  warn: (message, ...args) => console.warn(`[${prefix}]`, message, ...args),
  error: (message, ...args) => console.error(`[${prefix}]`, message, ...args)
})

/**
 * Gestor de almacenamiento seguro
 */
export class StorageManager {
  constructor(logger = null) {
    this.logger = logger || createLogger('StorageManager')
    this._isAvailable = null // Cache del estado de disponibilidad
  }

  /**
   * Verifica si localStorage está disponible
   * @returns {boolean}
   */
  isLocalStorageAvailable() {
    // Cache del resultado para evitar múltiples verificaciones
    if (this._isAvailable !== null) {
      return this._isAvailable
    }

    try {
      const testKey = '__storage_test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      this._isAvailable = true
      return true
    } catch (error) {
      this.logger.warn('localStorage no está disponible:', error.message)
      this._isAvailable = false
      return false
    }
  }

  /**
   * Ejecuta una operación de storage de forma segura
   * @param {Function} operation - Operación a ejecutar
   * @param {string} context - Contexto para logging
   * @param {any} fallbackValue - Valor por defecto en caso de error
   * @returns {any} Resultado de la operación o fallbackValue
   */
  safeOperation(operation, context, fallbackValue = null) {
    try {
      if (!this.isLocalStorageAvailable()) {
        this.logger.warn(`localStorage no disponible para: ${context}`)
        return fallbackValue
      }

      return operation()
    } catch (error) {
      this.logger.error(`Error en ${context}:`, error)
      return fallbackValue
    }
  }

  /**
   * Obtiene un valor del localStorage
   * @param {string} key - Clave del valor
   * @param {any} defaultValue - Valor por defecto
   * @returns {any} Valor almacenado o defaultValue
   */
  getItem(key, defaultValue = null) {
    return this.safeOperation(
      () => {
        const value = localStorage.getItem(key)
        if (value === null) return defaultValue

        try {
          return JSON.parse(value)
        } catch {
          // Si no es JSON válido, devolver como string
          return value
        }
      },
      `getItem(${key})`,
      defaultValue
    )
  }

  /**
   * Almacena un valor en localStorage
   * @param {string} key - Clave del valor
   * @param {any} value - Valor a almacenar
   * @returns {boolean} true si se almacenó correctamente
   */
  setItem(key, value) {
    return this.safeOperation(
      () => {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
        localStorage.setItem(key, serializedValue)
        this.logger.info(`Valor almacenado: ${key}`)
        return true
      },
      `setItem(${key})`,
      false
    )
  }

  /**
   * Elimina un valor del localStorage
   * @param {string} key - Clave del valor a eliminar
   * @returns {boolean} true si se eliminó correctamente
   */
  removeItem(key) {
    return this.safeOperation(
      () => {
        localStorage.removeItem(key)
        this.logger.info(`Valor eliminado: ${key}`)
        return true
      },
      `removeItem(${key})`,
      false
    )
  }

  /**
   * Limpia completamente el localStorage
   * @returns {boolean} true si se limpió correctamente
   */
  clear() {
    return this.safeOperation(
      () => {
        localStorage.clear()
        this.logger.info('localStorage limpiado')
        return true
      },
      'clear()',
      false
    )
  }

  /**
   * Obtiene todas las claves del localStorage
   * @returns {string[]} Array de claves
   */
  getAllKeys() {
    return this.safeOperation(
      () => {
        const keys = []
        for (let i = 0; i < localStorage.length; i++) {
          keys.push(localStorage.key(i))
        }
        return keys
      },
      'getAllKeys()',
      []
    )
  }

  /**
   * Verifica si una clave existe
   * @param {string} key - Clave a verificar
   * @returns {boolean}
   */
  hasKey(key) {
    return this.safeOperation(
      () => localStorage.getItem(key) !== null,
      `hasKey(${key})`,
      false
    )
  }

  /**
   * Obtiene el tamaño aproximado usado en localStorage
   * @returns {number} Tamaño en bytes (aproximado)
   */
  getStorageSize() {
    return this.safeOperation(
      () => {
        let total = 0
        for (const key in localStorage) {
          if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            total += key.length + (localStorage[key]?.length || 0)
          }
        }
        return total
      },
      'getStorageSize()',
      0
    )
  }
}

/**
 * Cache manager con TTL (Time To Live)
 */
export class CacheManager extends StorageManager {
  constructor(prefix = 'cache_', defaultTTL = 3600000, logger = null) { // 1 hora por defecto
    super(logger || createLogger('CacheManager'))
    this.prefix = prefix
    this.defaultTTL = defaultTTL
  }

  /**
   * Genera clave de cache con prefijo
   * @param {string} key - Clave original
   * @returns {string} Clave con prefijo
   */
  _getCacheKey(key) {
    return `${this.prefix}${key}`
  }

  /**
   * Genera clave de metadata para TTL
   * @param {string} key - Clave original
   * @returns {string} Clave de metadata
   */
  _getMetaKey(key) {
    return `${this.prefix}meta_${key}`
  }

  /**
   * Almacena un valor en cache con TTL
   * @param {string} key - Clave del valor
   * @param {any} value - Valor a almacenar
   * @param {number} [ttl] - Tiempo de vida en milisegundos
   * @returns {boolean}
   */
  set(key, value, ttl = null) {
    const cacheKey = this._getCacheKey(key)
    const metaKey = this._getMetaKey(key)
    const expiresAt = Date.now() + (ttl || this.defaultTTL)

    const success = this.setItem(cacheKey, value)
    if (success) {
      this.setItem(metaKey, { expiresAt, createdAt: Date.now() })
    }

    return success
  }

  /**
   * Obtiene un valor del cache verificando TTL
   * @param {string} key - Clave del valor
   * @param {any} defaultValue - Valor por defecto
   * @returns {any}
   */
  get(key, defaultValue = null) {
    const cacheKey = this._getCacheKey(key)
    const metaKey = this._getMetaKey(key)

    const meta = this.getItem(metaKey)

    // Si no hay metadata o expiró, limpiar y devolver default
    if (!meta || Date.now() > meta.expiresAt) {
      this.delete(key)
      return defaultValue
    }

    return this.getItem(cacheKey, defaultValue)
  }

  /**
   * Elimina un valor del cache incluyendo metadata
   * @param {string} key - Clave del valor
   * @returns {boolean}
   */
  delete(key) {
    const cacheKey = this._getCacheKey(key)
    const metaKey = this._getMetaKey(key)

    const success1 = this.removeItem(cacheKey)
    const success2 = this.removeItem(metaKey)

    return success1 && success2
  }

  /**
   * Limpia cache expirado
   * @returns {number} Número de entradas eliminadas
   */
  cleanExpired() {
    let cleaned = 0
    const allKeys = this.getAllKeys()

    allKeys.forEach(fullKey => {
      if (fullKey.startsWith(`${this.prefix}meta_`)) {
        const meta = this.getItem(fullKey.replace(this.prefix, ''))
        if (meta && Date.now() > meta.expiresAt) {
          const originalKey = fullKey.replace(`${this.prefix}meta_`, '')
          this.delete(originalKey)
          cleaned++
        }
      }
    })

    this.logger.info(`Cache limpiado: ${cleaned} entradas eliminadas`)
    return cleaned
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {Object} Estadísticas del cache
   */
  getStats() {
    const allKeys = this.getAllKeys()
    const cacheKeys = allKeys.filter(key => key.startsWith(this.prefix) && !key.includes('meta_'))

    let totalSize = 0
    let expiredCount = 0
    let activeCount = 0

    cacheKeys.forEach(fullKey => {
      const key = fullKey.replace(this.prefix, '')
      const metaKey = `${this.prefix}meta_${key}`
      const meta = this.getItem(metaKey.replace(this.prefix, ''))

      totalSize += fullKey.length + (this.getItem(fullKey)?.length || 0)

      if (meta) {
        if (Date.now() > meta.expiresAt) {
          expiredCount++
        } else {
          activeCount++
        }
      }
    })

    return {
      totalEntries: cacheKeys.length,
      activeEntries: activeCount,
      expiredEntries: expiredCount,
      totalSize,
      storageAvailable: this.isLocalStorageAvailable()
    }
  }
}

/**
 * Instancia global del storage manager
 */
export const storage = new StorageManager(createLogger('GlobalStorage'))

/**
 * Instancia global del cache manager
 */
export const cache = new CacheManager('dosecron_cache_', 3600000, createLogger('GlobalCache')) // 1 hora TTL

/**
 * Factory para crear storage managers con configuración específica
 */
export const createStorageManager = (loggerPrefix = 'Storage') => {
  return new StorageManager(createLogger(loggerPrefix))
}

/**
 * Factory para crear cache managers con configuración específica
 */
export const createCacheManager = (prefix = 'cache_', ttl = 3600000, loggerPrefix = 'Cache') => {
  return new CacheManager(prefix, ttl, createLogger(loggerPrefix))
}
