// Utilidades compartidas para componentes

/**
 * Genera un ID único para componentes
 * @param {string} prefix - Prefijo del ID
 * @param {string} customId - ID personalizado opcional
 * @returns {string} ID único generado
 */
export const generateComponentId = (prefix = 'component', customId = '') => {
  if (customId) return customId

  const randomSuffix = Math.random().toString(36).substr(2, 9)
  return `${prefix}-${randomSuffix}`
}

/**
 * Genera ID para campo de formulario con sufijo de error
 * @param {string} baseId - ID base del campo
 * @param {string} suffix - Sufijo ('error', 'help', etc.)
 * @returns {string} ID con sufijo
 */
export const generateFieldId = (baseId, suffix = '') => {
  return suffix ? `${baseId}-${suffix}` : baseId
}

/**
 * Genera clases CSS condicionales
 * @param {object} classMap - Mapa de clases condicionales
 * @returns {string} String de clases CSS
 */
export const generateConditionalClasses = (classMap) => {
  return Object.entries(classMap)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ')
}

/**
 * Combina clases CSS base con clases condicionales
 * @param {string|array} baseClasses - Clases base
 * @param {object} conditionalClasses - Clases condicionales
 * @returns {string} String de clases combinadas
 */
export const combineClasses = (baseClasses, conditionalClasses = {}) => {
  const base = Array.isArray(baseClasses) ? baseClasses.join(' ') : baseClasses
  const conditional = generateConditionalClasses(conditionalClasses)

  return [base, conditional].filter(Boolean).join(' ')
}

/**
 * Utilidad para manejar estados de loading de forma consistente
 * @param {object} state - Estado reactivo que contiene isLoading
 * @param {string} message - Mensaje de loading opcional
 */
export const createLoadingState = () => {
  return {
    isLoading: false,
    message: '',

    setLoading(loading, message = '') {
      this.isLoading = loading
      this.message = message
    },

    clearLoading() {
      this.isLoading = false
      this.message = ''
    }
  }
}
