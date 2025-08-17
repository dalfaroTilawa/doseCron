// Utilidades para manejo de formularios y validación
import { sanitizeErrorMessage } from './validation.js'

/**
 * Valida y prepara configuración del formulario
 * @param {object} formData - Datos del formulario
 * @param {function} validateForm - Función de validación
 * @param {function} t - Función de traducción
 * @returns {object} Resultado de validación
 */
export const validateAndPrepareConfig = (formData, validateForm, t) => {
  // Validar formulario
  if (!validateForm()) {
    return {
      isValid: false,
      error: t('form.errors.fixBeforeSubmit'),
      config: null
    }
  }

  // Preparar configuración
  const config = {
    startDate: formData.startDate,
    interval: formData.interval,
    intervalUnit: formData.intervalUnit, // ✅ AGREGADO: unidad del intervalo
    duration: formData.duration,
    durationUnit: formData.durationUnit,
    country: formData.country,
    excludeWeekends: formData.excludeWeekends,
    excludeHolidays: formData.excludeHolidays
  }

  return {
    isValid: true,
    error: null,
    config
  }
}

/**
 * Ejecuta el cálculo de fechas
 * @param {object} calculator - Instancia del calculador
 * @param {object} config - Configuración validada
 * @returns {Promise<object>} Resultado del cálculo
 */
export const executeCalculation = async (calculator, config) => {
  try {
    // Actualizar configuración del calculator
    await calculator.updateConfig(config)

    // Calcular fechas
    await calculator.calculateDates()

    return {
      success: true,
      results: calculator.calculatedDates.value,
      error: null
    }
  } catch (error) {
    console.error('Error al calcular fechas:', error)
    return {
      success: false,
      results: [],
      error: error
    }
  }
}

/**
 * Maneja el éxito del cálculo
 * @param {object} formData - Datos del formulario
 * @param {Array} results - Resultados del cálculo
 * @param {function} emit - Función emit del componente
 * @param {object} refs - Referencias reactivas
 */
export const handleCalculationSuccess = (formData, results, emit, refs) => {
  refs.hasCalculated.value = true

  emit('calculate', {
    config: { ...formData },
    results: results
  })
}

/**
 * Maneja errores del cálculo
 * @param {Error} error - Error ocurrido
 * @param {function} t - Función de traducción
 * @param {function} emit - Función emit del componente
 * @param {object} refs - Referencias reactivas
 */
export const handleCalculationError = (error, t, emit, refs) => {
  const sanitizedMessage = sanitizeErrorMessage(error.message)
  refs.globalError.value = `${t('form.errors.calculation')}: ${sanitizedMessage}`

  emit('error', { action: 'calculate', error })
}

/**
 * Función principal simplificada de envío de formulario
 * @param {object} params - Parámetros del formulario
 * @returns {Promise<void>}
 */
export const handleFormSubmit = async ({
  formData,
  validateForm,
  calculator,
  emit,
  t,
  refs // { isCalculating, globalError, hasCalculated }
}) => {
  // Paso 1: Validar y preparar
  const validation = validateAndPrepareConfig(formData, validateForm, t)
  if (!validation.isValid) {
    refs.globalError.value = validation.error
    return
  }

  // Paso 2: Configurar estado de loading
  refs.isCalculating.value = true
  refs.globalError.value = ''

  try {
    // Paso 3: Ejecutar cálculo
    const calculation = await executeCalculation(calculator, validation.config)

    if (calculation.success) {
      // Paso 4: Manejar éxito
      handleCalculationSuccess(formData, calculation.results, emit, refs)
    } else {
      // Paso 5: Manejar error de cálculo
      handleCalculationError(calculation.error, t, emit, refs)
    }
  } catch (error) {
    // Paso 6: Manejar error inesperado
    handleCalculationError(error, t, emit, refs)
  } finally {
    // Paso 7: Limpiar estado de loading
    refs.isCalculating.value = false
  }
}

/**
 * Genera datos por defecto para reseteo de formulario
 * @param {object} settings - Configuraciones del usuario
 * @param {function} loadSetting - Función para cargar configuraciones
 * @returns {object} Datos por defecto
 */
export const generateDefaultFormData = (settings, loadSetting) => {
  return {
    startDate: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
    interval: null, // Dejar vacío, requerido
    duration: null, // Dejar vacío, requerido
    durationUnit: 'months',
    country: settings.country || 'CR', // Mantener preferencia del usuario
    excludeWeekends: loadSetting('excludeWeekends', true), // Mantener preferencia del usuario
    excludeHolidays: loadSetting('excludeHolidays', true) // Mantener preferencia del usuario
  }
}

/**
 * Limpia errores de campos del formulario
 * @param {object} fieldErrors - Objeto de errores reactivo
 */
export const clearFieldErrors = (fieldErrors) => {
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key] = ''
  })
}
