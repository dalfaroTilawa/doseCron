/**
 * Utilidades de validación compartidas
 * Centraliza lógica de validación para evitar duplicación
 */

import { isValid, parseISO, isPast, isFuture, isToday } from 'date-fns'

/**
 * Resultado de validación
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Si la validación pasó
 * @property {string} error - Mensaje de error si falló
 */

/**
 * Validador de fechas reutilizable
 */
export class DateValidator {
  /**
   * Valida que un campo sea requerido
   * @param {any} value - Valor a validar
   * @param {string} fieldName - Nombre del campo para mensajes de error
   * @returns {ValidationResult}
   */
  static validateRequired(value, fieldName = 'campo') {
    if (!value || value === null || value === '') {
      return {
        isValid: false,
        error: `${fieldName} es requerido`
      }
    }
    return { isValid: true, error: '' }
  }

  /**
   * Valida formato de fecha ISO
   * @param {string} dateString - Fecha en formato string
   * @returns {ValidationResult}
   */
  static validateDateFormat(dateString) {
    if (!dateString) {
      return { isValid: false, error: 'Fecha no proporcionada' }
    }

    try {
      const date = parseISO(dateString)
      if (!isValid(date)) {
        return { isValid: false, error: 'Formato de fecha inválido' }
      }
      return { isValid: true, error: '' }
    } catch {
      return { isValid: false, error: 'Formato de fecha inválido' }
    }
  }

  /**
   * Valida rango de fechas
   * @param {string} dateString - Fecha a validar
   * @param {string} [min] - Fecha mínima permitida
   * @param {string} [max] - Fecha máxima permitida
   * @returns {ValidationResult}
   */
  static validateDateRange(dateString, min = null, max = null) {
    const formatResult = this.validateDateFormat(dateString)
    if (!formatResult.isValid) {
      return formatResult
    }

    if (min && dateString < min) {
      return {
        isValid: false,
        error: `La fecha debe ser posterior a ${this.formatDateForDisplay(min)}`
      }
    }

    if (max && dateString > max) {
      return {
        isValid: false,
        error: `La fecha debe ser anterior a ${this.formatDateForDisplay(max)}`
      }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Valida restricciones de fechas pasadas/futuras
   * @param {string} dateString - Fecha a validar
   * @param {boolean} allowPast - Permitir fechas pasadas
   * @param {boolean} allowFuture - Permitir fechas futuras
   * @returns {ValidationResult}
   */
  static validateDateRestrictions(dateString, allowPast = true, allowFuture = true) {
    const formatResult = this.validateDateFormat(dateString)
    if (!formatResult.isValid) {
      return formatResult
    }

    const date = parseISO(dateString)

    if (!allowPast && isPast(date) && !isToday(date)) {
      return {
        isValid: false,
        error: 'No se permiten fechas pasadas'
      }
    }

    if (!allowFuture && isFuture(date)) {
      return {
        isValid: false,
        error: 'No se permiten fechas futuras'
      }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Validación completa de fecha
   * @param {string} dateString - Fecha a validar
   * @param {Object} options - Opciones de validación
   * @param {boolean} options.required - Si el campo es requerido
   * @param {string} options.fieldName - Nombre del campo
   * @param {string} [options.min] - Fecha mínima
   * @param {string} [options.max] - Fecha máxima
   * @param {boolean} [options.allowPast=true] - Permitir fechas pasadas
   * @param {boolean} [options.allowFuture=true] - Permitir fechas futuras
   * @returns {ValidationResult}
   */
  static validateDate(dateString, options = {}) {
    const {
      required = false,
      fieldName = 'fecha',
      min = null,
      max = null,
      allowPast = true,
      allowFuture = true
    } = options

    // Validar requerido
    if (required) {
      const requiredResult = this.validateRequired(dateString, fieldName)
      if (!requiredResult.isValid) {
        return requiredResult
      }
    }

    // Si no es requerido y está vacío, es válido
    if (!required && (!dateString || dateString === '')) {
      return { isValid: true, error: '' }
    }

    // Validar formato
    const formatResult = this.validateDateFormat(dateString)
    if (!formatResult.isValid) {
      return formatResult
    }

    // Validar rango
    const rangeResult = this.validateDateRange(dateString, min, max)
    if (!rangeResult.isValid) {
      return rangeResult
    }

    // Validar restricciones
    const restrictionsResult = this.validateDateRestrictions(dateString, allowPast, allowFuture)
    if (!restrictionsResult.isValid) {
      return restrictionsResult
    }

    return { isValid: true, error: '' }
  }

  /**
   * Formatea fecha para mostrar en mensajes de error
   * @param {string} dateString - Fecha ISO
   * @returns {string} Fecha formateada
   */
  static formatDateForDisplay(dateString) {
    try {
      const date = parseISO(dateString)
      return date.toLocaleDateString('es-ES')
    } catch {
      return dateString
    }
  }
}

/**
 * Validador de números
 */
export class NumberValidator {
  /**
   * Valida rango numérico
   * @param {number} value - Valor a validar
   * @param {number} min - Valor mínimo
   * @param {number} max - Valor máximo
   * @param {string} fieldName - Nombre del campo
   * @returns {ValidationResult}
   */
  static validateRange(value, min, max, fieldName = 'valor') {
    if (value === null || value === undefined || value === '') {
      return {
        isValid: false,
        error: `${fieldName} es requerido`
      }
    }

    const numValue = Number(value)
    if (isNaN(numValue)) {
      return {
        isValid: false,
        error: `${fieldName} debe ser un número válido`
      }
    }

    if (numValue < min) {
      return {
        isValid: false,
        error: `${fieldName} debe ser mayor a ${min - 1}`
      }
    }

    if (numValue > max) {
      return {
        isValid: false,
        error: `${fieldName} no puede ser mayor a ${max}`
      }
    }

    return { isValid: true, error: '' }
  }

  /**
   * Valida que un número sea entero positivo
   * @param {number} value - Valor a validar
   * @param {string} fieldName - Nombre del campo
   * @returns {ValidationResult}
   */
  static validatePositiveInteger(value, fieldName = 'valor') {
    const rangeResult = this.validateRange(value, 1, Number.MAX_SAFE_INTEGER, fieldName)
    if (!rangeResult.isValid) {
      return rangeResult
    }

    const numValue = Number(value)
    if (!Number.isInteger(numValue)) {
      return {
        isValid: false,
        error: `${fieldName} debe ser un número entero`
      }
    }

    return { isValid: true, error: '' }
  }
}

/**
 * Factory para crear validadores con configuración específica
 */
export class ValidatorFactory {
  /**
   * Crea validador de fechas con configuración predeterminada
   * @param {Object} defaultOptions - Opciones por defecto
   * @returns {Function} Función validadora
   */
  static createDateValidator(defaultOptions = {}) {
    return (dateString, options = {}) => {
      const mergedOptions = { ...defaultOptions, ...options }
      return DateValidator.validateDate(dateString, mergedOptions)
    }
  }

  /**
   * Crea validador de intervalos
   * @returns {Function} Función validadora de intervalos
   */
  static createIntervalValidator() {
    return (value) => NumberValidator.validateRange(value, 1, 365, 'El intervalo')
  }

  /**
   * Crea validador de duración
   * @returns {Function} Función validadora de duración
   */
  static createDurationValidator() {
    return (value) => NumberValidator.validateRange(value, 1, 100, 'La duración')
  }
}
