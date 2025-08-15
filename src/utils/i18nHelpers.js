// Utilidades helpers para internacionalización
import { useI18n } from '../composables/useI18n.js'

/**
 * Helper para crear mensajes de validación localizados
 * Usado en las clases de validación existentes
 */
export class I18nValidationHelpers {
  static {
    this.i18n = null
  }

  // Inicializar helpers con instancia de i18n
  static init() {
    if (!this.i18n) {
      this.i18n = useI18n()
    }
    return this.i18n
  }

  /**
   * Mensaje de campo requerido
   * @param {string} fieldName - Nombre del campo
   * @returns {string} Mensaje localizado
   */
  static requiredField(fieldName) {
    const { t } = this.init()
    return t('validation.required')
  }

  /**
   * Mensaje de fecha inválida
   * @param {string} fieldName - Nombre del campo
   * @returns {string} Mensaje localizado
   */
  static invalidDate(fieldName) {
    const { t } = this.init()
    return t('validation.invalidDate')
  }

  /**
   * Mensaje de fecha mínima
   * @param {string} minDate - Fecha mínima formateada
   * @returns {string} Mensaje localizado
   */
  static minDate(minDate) {
    const { t } = this.init()
    return t('validation.minDate', { min: minDate })
  }

  /**
   * Mensaje de fecha máxima
   * @param {string} maxDate - Fecha máxima formateada
   * @returns {string} Mensaje localizado
   */
  static maxDate(maxDate) {
    const { t } = this.init()
    return t('validation.maxDate', { max: maxDate })
  }

  /**
   * Mensaje de número mínimo
   * @param {number} min - Valor mínimo
   * @returns {string} Mensaje localizado
   */
  static minNumber(min) {
    const { t } = this.init()
    return t('validation.minNumber', { min })
  }

  /**
   * Mensaje de número máximo
   * @param {number} max - Valor máximo
   * @returns {string} Mensaje localizado
   */
  static maxNumber(max) {
    const { t } = this.init()
    return t('validation.maxNumber', { max })
  }

  /**
   * Mensaje de número inválido
   * @returns {string} Mensaje localizado
   */
  static invalidNumber() {
    const { t } = this.init()
    return t('validation.invalidNumber')
  }

  /**
   * Mensaje de fecha pasada no permitida
   * @returns {string} Mensaje localizado
   */
  static pastDateNotAllowed() {
    const { t } = this.init()
    return t('validation.pastDateNotAllowed')
  }

  /**
   * Mensaje de fecha futura no permitida
   * @returns {string} Mensaje localizado
   */
  static futureDateNotAllowed() {
    const { t } = this.init()
    return t('validation.futureDateNotAllowed')
  }

  /**
   * Mensaje específico para duración vs intervalo
   * @param {number} duration - Duración en días
   * @param {number} interval - Intervalo en días
   * @returns {string} Mensaje localizado
   */
  static durationShorterThanInterval(duration, interval) {
    const { t } = this.init()
    return t('validation.intervalVsDuration.shorterThanInterval', { duration, interval })
  }
}

/**
 * Helper para crear mensajes de error localizados
 */
export class I18nErrorHelpers {
  static {
    this.i18n = null
  }

  static init() {
    if (!this.i18n) {
      this.i18n = useI18n()
    }
    return this.i18n
  }

  /**
   * Error de cálculo
   * @returns {string} Mensaje localizado
   */
  static calculationError() {
    const { t } = this.init()
    return t('errors.calculation')
  }

  /**
   * Error de red
   * @returns {string} Mensaje localizado
   */
  static networkError() {
    const { t } = this.init()
    return t('errors.network')
  }

  /**
   * Error genérico
   * @returns {string} Mensaje localizado
   */
  static genericError() {
    const { t } = this.init()
    return t('errors.generic')
  }

  /**
   * Error al cargar países
   * @returns {string} Mensaje localizado
   */
  static loadingCountriesError() {
    const { t } = this.init()
    return t('errors.loadingCountries')
  }

  /**
   * Error de configuración inválida
   * @returns {string} Mensaje localizado
   */
  static invalidConfigurationError() {
    const { t } = this.init()
    return t('errors.invalidConfiguration')
  }
}

/**
 * Helper para crear mensajes de advertencia localizados
 */
export class I18nWarningHelpers {
  static {
    this.i18n = null
  }

  static init() {
    if (!this.i18n) {
      this.i18n = useI18n()
    }
    return this.i18n
  }

  /**
   * Advertencia de país no seleccionado
   * @returns {string} Mensaje localizado
   */
  static noCountrySelected() {
    const { t } = this.init()
    return t('warnings.noCountry')
  }

  /**
   * Advertencia de intervalo largo
   * @returns {string} Mensaje localizado
   */
  static longInterval() {
    const { t } = this.init()
    return t('warnings.longInterval')
  }

  /**
   * Advertencia de duración menor al intervalo
   * @param {number} duration - Duración en días
   * @param {number} interval - Intervalo en días
   * @returns {string} Mensaje localizado
   */
  static durationShorterThanInterval(duration, interval) {
    const { t } = this.init()
    return t('warnings.durationShorterThanInterval', { duration, interval })
  }
}

/**
 * Exportar todas las clases para uso fácil
 */
export default {
  Validation: I18nValidationHelpers,
  Error: I18nErrorHelpers,
  Warning: I18nWarningHelpers
}
