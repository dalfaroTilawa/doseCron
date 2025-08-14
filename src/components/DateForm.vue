<template>
  <div class="date-form">
    <!-- Header del formulario -->
    <div class="form-header">
      <h2 class="form-title">
        <span class="form-icon">📅</span>
        Calculadora de Fechas Recurrentes
      </h2>
      <p class="form-description">
        Genera una lista de fechas recurrentes con exclusión inteligente de fines de semana y feriados
      </p>
    </div>

    <!-- Formulario principal -->
    <form class="calculation-form" novalidate @submit.prevent="handleSubmit">
      <!-- Sección: Configuración Básica -->
      <div class="form-section">
        <h3 class="section-title">
          <span class="section-icon">⚙️</span>
          Configuración Básica
        </h3>

        <div class="form-grid">
          <!-- Fecha inicial -->
          <div class="form-field">
            <DatePicker
              v-model="formData.startDate"
              label="Fecha inicial *"
              :required="true"
              :allow-past-dates="allowPastDates"
              :allow-future-dates="true"
              :error-message="fieldErrors.startDate"
              help-text="Fecha de inicio para el cálculo de fechas recurrentes"
              show-date-info
              custom-id="start-date"
              @change="onStartDateChange"
              @error="onFieldError('startDate', $event)"
            />
          </div>

          <!-- Intervalo -->
          <div class="form-field">
            <label for="interval" class="field-label">
              Intervalo (días) *
              <span class="required-indicator">*</span>
            </label>
            <div class="input-wrapper">
              <input
                id="interval"
                v-model.number="formData.interval"
                type="number"
                min="1"
                max="365"
                step="1"
                :class="['form-input', { 'has-error': fieldErrors.interval }]"
                :aria-invalid="!!fieldErrors.interval"
                :aria-describedby="fieldErrors.interval ? 'interval-error' : 'interval-help'"
                placeholder="Ej: 15"
                required
                @input="onIntervalChange"
                @blur="validateInterval"
              >
              <span class="input-suffix">días</span>
            </div>
            <div
              v-if="fieldErrors.interval"
              id="interval-error"
              class="error-message"
              role="alert"
            >
              {{ fieldErrors.interval }}
            </div>
            <div v-else id="interval-help" class="help-text">
              Número de días entre cada fecha generada (1-365)
            </div>
          </div>

          <!-- Duración -->
          <div class="form-field">
            <label for="duration" class="field-label">
              Duración *
              <span class="required-indicator">*</span>
            </label>
            <div class="duration-inputs">
              <div class="input-wrapper">
                <input
                  id="duration"
                  v-model.number="formData.duration"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  :class="['form-input', { 'has-error': fieldErrors.duration }]"
                  :aria-invalid="!!fieldErrors.duration"
                  placeholder="Ej: 4"
                  required
                  @input="onDurationChange"
                  @blur="validateDuration"
                >
              </div>
              <select
                v-model="formData.durationUnit"
                :class="['form-select', { 'has-error': fieldErrors.durationUnit }]"
                @change="onDurationUnitChange"
              >
                <option value="days">
                  Días
                </option>
                <option value="weeks">
                  Semanas
                </option>
                <option value="months">
                  Meses
                </option>
                <option value="years">
                  Años
                </option>
              </select>
            </div>
            <div v-if="fieldErrors.duration || fieldErrors.durationUnit" class="error-message" role="alert">
              {{ fieldErrors.duration || fieldErrors.durationUnit }}
            </div>
            <div v-else class="help-text">
              Período total durante el cual generar fechas
            </div>
          </div>

          <!-- Opciones de exclusión (colapsables) -->
          <div class="form-field full-width">
            <div class="collapsible-section">
              <button
                type="button"
                class="collapsible-toggle"
                :aria-expanded="showExclusionOptions"
                @click="showExclusionOptions = !showExclusionOptions"
              >
                <div class="toggle-content">
                  <span class="toggle-icon">{{ showExclusionOptions ? '🔽' : '▶️' }}</span>
                  <span class="toggle-text">Opciones de exclusión</span>
                </div>
                <span class="toggle-hint">(fines de semana y feriados)</span>
              </button>

              <div v-show="showExclusionOptions" class="collapsible-content">
                <div class="exclusion-options">
                  <!-- Selector de país -->
                  <div class="exclusion-field">
                    <CountrySelector
                      v-model="formData.country"
                      label="País para feriados"
                      placeholder="Selecciona un país (opcional)"
                      :required="false"
                      :error-message="fieldErrors.country"
                      help-text="Selecciona un país para excluir automáticamente sus feriados oficiales"
                      show-selected-info
                      custom-id="country-selector"
                      @change="onCountryChange"
                      @error="onFieldError('country', $event)"
                    />
                  </div>

                  <!-- Filtros de exclusión -->
                  <div class="exclusion-field">
                    <FilterOptions
                      v-model:exclude-weekends="formData.excludeWeekends"
                      v-model:exclude-holidays="formData.excludeHolidays"
                      title="Filtros de exclusión"
                      layout="horizontal"
                      :holidays-disabled="!formData.country"
                      weekends-help-text="Los sábados y domingos serán omitidos del cálculo"
                      holidays-help-text="Los feriados del país seleccionado serán omitidos"
                      show-summary
                      custom-id-prefix="form-filters"
                      @change="onFiltersChange"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selector de tema (colapsable) -->
          <div class="form-field full-width">
            <div class="collapsible-section">
              <button
                type="button"
                class="collapsible-toggle"
                :aria-expanded="showThemeOptions"
                @click="showThemeOptions = !showThemeOptions"
              >
                <div class="toggle-content">
                  <span class="toggle-icon">{{ showThemeOptions ? '🔽' : '▶️' }}</span>
                  <span class="toggle-text">Tema de la aplicación</span>
                </div>
                <span class="toggle-hint">({{ isDarkMode ? 'oscuro' : 'claro' }})</span>
              </button>

              <div v-show="showThemeOptions" class="collapsible-content">
                <div class="theme-selector">
                  <div class="theme-options">
                    <button
                      type="button"
                      :class="['theme-option', { active: !isDarkMode }]"
                      title="Modo claro"
                      @click="setTheme('light')"
                    >
                      <span class="theme-option-icon">☀️</span>
                      <span class="theme-option-text">Claro</span>
                    </button>
                    <button
                      type="button"
                      :class="['theme-option', { active: isDarkMode }]"
                      title="Modo oscuro"
                      @click="setTheme('dark')"
                    >
                      <span class="theme-option-icon">🌙</span>
                      <span class="theme-option-text">Oscuro</span>
                    </button>
                  </div>
                  <div class="help-text">
                    Selecciona el tema visual de la aplicación
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Advertencias y validaciones -->
      <div v-if="formWarnings.length > 0" class="form-warnings">
        <div v-for="warning in formWarnings" :key="warning.type" class="warning-item">
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">{{ warning.message }}</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button
          type="submit"
          :disabled="isCalculating || !isFormValid"
          :class="['btn', 'btn-primary', 'btn-calculate', { 'loading': isCalculating }]"
        >
          <span v-if="isCalculating" class="btn-spinner" />
          <span class="btn-icon">{{ isCalculating ? '⏳' : '🔄' }}</span>
          <span class="btn-text">
            {{ isCalculating ? 'Calculando...' : 'Calcular Fechas' }}
          </span>
        </button>

        <button
          type="button"
          :disabled="isCalculating"
          class="btn btn-secondary"
          @click="resetForm"
        >
          <span class="btn-icon">🗑️</span>
          <span class="btn-text">Resetear</span>
        </button>
      </div>

      <!-- Resumen de configuración -->
      <div v-if="configSummary" class="config-summary">
        <h4 class="summary-title">
          📋 Resumen de configuración:
        </h4>
        <div class="summary-content">
          <div class="summary-item">
            <strong>Inicio:</strong> {{ configSummary.startDate }}
          </div>
          <div class="summary-item">
            <strong>Intervalo:</strong> {{ configSummary.interval }}
          </div>
          <div class="summary-item">
            <strong>Duración:</strong> {{ configSummary.duration }}
          </div>
          <div class="summary-item">
            <strong>País:</strong> {{ configSummary.country }}
          </div>
          <div class="summary-item">
            <strong>Exclusiones:</strong> {{ configSummary.exclusions }}
          </div>
        </div>
      </div>
    </form>


    <!-- Mensajes de error global -->
    <div v-if="globalError" class="global-error">
      <span class="error-icon">❌</span>
      <span class="error-text">{{ globalError }}</span>
      <button class="error-dismiss" @click="clearGlobalError">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

// Importar componentes
import DatePicker from './DatePicker.vue'
import CountrySelector from './CountrySelector.vue'
import FilterOptions from './FilterOptions.vue'

// Importar composables
import { useDateCalculator } from '../composables/useDateCalculator.js'
import { useSettings } from '../composables/useSettings.js'

// Importar servicios
import { getCountries } from '../services/holidayApi.js'

const props = defineProps({
  // Configuración inicial opcional
  initialConfig: {
    type: Object,
    default: () => ({})
  },

  // Permitir fechas pasadas
  allowPastDates: {
    type: Boolean,
    default: true
  },

  // Auto-calcular cuando cambien los parámetros
  autoCalculate: {
    type: Boolean,
    default: false
  },

  // Mostrar validaciones en tiempo real
  realtimeValidation: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits([
  'calculate',
  'reset',
  'config-change',
  'validation-change',
  'export',
  'error'
])

// Composables
const { settings, saveSetting, loadSetting, clearSettings } = useSettings()
const calculator = useDateCalculator()

// Estado del formulario
const formData = reactive({
  startDate: '',
  interval: null, // Iniciar vacío, será requerido
  duration: null, // Iniciar vacío, será requerido
  durationUnit: 'months',
  country: '',
  excludeWeekends: true,
  excludeHolidays: true
})

// Estado de validación
const fieldErrors = reactive({
  startDate: '',
  interval: '',
  duration: '',
  durationUnit: '',
  country: ''
})

const isCalculating = ref(false)
const globalError = ref('')

// Estado del tema
const isDarkMode = ref(false)

// Estado de expansión de secciones
const showExclusionOptions = ref(false)
const showThemeOptions = ref(false)
const hasCalculated = ref(false)

// Lista de países para resolver nombres
const countriesList = ref([])

// Cargar configuración inicial
const loadInitialConfig = () => {
  // Cargar configuración: props tienen prioridad, luego preferencias del usuario, luego defaults
  const config = {
    // Valores específicos del cálculo: usar props o iniciar vacíos (requeridos)
    startDate: props.initialConfig.startDate || format(new Date(), 'yyyy-MM-dd'),
    interval: props.initialConfig.interval || null, // Iniciar vacío, requerido
    duration: props.initialConfig.duration || null, // Iniciar vacío, requerido
    durationUnit: props.initialConfig.durationUnit || 'months', // Default razonable

    // Preferencias del usuario: usar props, luego localStorage, luego defaults
    country: props.initialConfig.country || settings.country || 'CR',
    excludeWeekends: props.initialConfig.excludeWeekends !== undefined ? props.initialConfig.excludeWeekends : loadSetting('excludeWeekends', true),
    excludeHolidays: props.initialConfig.excludeHolidays !== undefined ? props.initialConfig.excludeHolidays : loadSetting('excludeHolidays', true)
  }

  Object.assign(formData, config)
}

// Validaciones
const validateStartDate = () => {
  if (!formData.startDate) {
    fieldErrors.startDate = 'La fecha inicial es requerida'
    return false
  }

  const date = parseISO(formData.startDate)
  if (!isValid(date)) {
    fieldErrors.startDate = 'Formato de fecha inválido'
    return false
  }

  if (!props.allowPastDates && date < new Date()) {
    fieldErrors.startDate = 'No se permiten fechas pasadas'
    return false
  }

  fieldErrors.startDate = ''
  return true
}

const validateInterval = () => {
  if (!formData.interval || formData.interval === null || formData.interval === '') {
    fieldErrors.interval = 'El intervalo es requerido'
    return false
  }

  if (formData.interval < 1) {
    fieldErrors.interval = 'El intervalo debe ser mayor a 0'
    return false
  }

  if (formData.interval > 365) {
    fieldErrors.interval = 'El intervalo no puede ser mayor a 365 días'
    return false
  }

  fieldErrors.interval = ''
  return true
}

const validateDuration = () => {
  if (!formData.duration || formData.duration === null || formData.duration === '') {
    fieldErrors.duration = 'La duración es requerida'
    return false
  }

  if (formData.duration < 1) {
    fieldErrors.duration = 'La duración debe ser mayor a 0'
    return false
  }

  if (formData.duration > 100) {
    fieldErrors.duration = 'La duración no puede ser mayor a 100'
    return false
  }

  fieldErrors.duration = ''
  return true
}

const validateForm = () => {
  const validations = [
    validateStartDate(),
    validateInterval(),
    validateDuration()
  ]

  return validations.every(Boolean)
}

// Computed properties
const isFormValid = computed(() => {
  return validateForm() && !Object.values(fieldErrors).some(error => error)
})

const selectedCountryName = computed(() => {
  if (!formData.country) return 'No seleccionado'
  const country = countriesList.value.find(c => c.code === formData.country)
  return country ? country.name : formData.country
})

const formWarnings = computed(() => {
  const warnings = []

  if (formData.excludeHolidays && !formData.country) {
    warnings.push({
      type: 'no-country',
      message: 'Has seleccionado excluir feriados pero no hay país seleccionado'
    })
  }

  if (formData.interval > 30) {
    warnings.push({
      type: 'long-interval',
      message: 'Un intervalo muy largo puede generar pocas fechas'
    })
  }

  // Validación específica cuando duración está en días
  if (formData.durationUnit === 'days' && formData.duration < formData.interval) {
    warnings.push({
      type: 'duration-shorter-than-interval',
      message: `La duración (${formData.duration} días) es menor al intervalo (${formData.interval} días). Esto generará solo la fecha inicial sin recurrencias.`
    })
  }

  return warnings
})

const configSummary = computed(() => {
  if (!isFormValid.value) return null

  const startDateObj = parseISO(formData.startDate)
  const exclusionsList = []
  if (formData.excludeWeekends) exclusionsList.push('fines de semana')
  if (formData.excludeHolidays && formData.country) exclusionsList.push('feriados')

  return {
    startDate: format(startDateObj, "d 'de' MMMM 'de' yyyy", { locale: es }),
    interval: `Cada ${formData.interval} día${formData.interval !== 1 ? 's' : ''}`,
    duration: `${formData.duration} ${formData.durationUnit === 'days' ? 'días' : formData.durationUnit === 'weeks' ? 'semanas' : formData.durationUnit === 'months' ? 'meses' : 'años'}`,
    country: selectedCountryName.value,
    exclusions: exclusionsList.length > 0 ? exclusionsList.join(', ') : 'Ninguna'
  }
})


// Event handlers
const onStartDateChange = (changeData) => {
  if (props.realtimeValidation) {
    validateStartDate()
  }
  emitConfigChange()
}

const onIntervalChange = () => {
  if (props.realtimeValidation) {
    validateInterval()
  }
  emitConfigChange()
}

const onDurationChange = () => {
  if (props.realtimeValidation) {
    validateDuration()
  }
  emitConfigChange()
}

const onDurationUnitChange = () => {
  emitConfigChange()
}

const onCountryChange = (changeData) => {
  console.log('País cambiado:', changeData)
  emitConfigChange()
}

const onFiltersChange = (changeData) => {
  console.log('Filtros cambiados:', changeData)
  emitConfigChange()
}

const onFieldError = (fieldName, error) => {
  fieldErrors[fieldName] = error.message || 'Error de validación'
}

const handleSubmit = async () => {
  if (!validateForm()) {
    globalError.value = 'Por favor corrige los errores del formulario antes de continuar'
    return
  }

  isCalculating.value = true
  globalError.value = ''

  try {
    // Actualizar configuración del calculator
    await calculator.updateConfig({
      startDate: formData.startDate,
      interval: formData.interval,
      duration: formData.duration,
      durationUnit: formData.durationUnit,
      country: formData.country,
      excludeWeekends: formData.excludeWeekends,
      excludeHolidays: formData.excludeHolidays
    })

    // Calcular fechas
    await calculator.calculateDates()

    hasCalculated.value = true

    emit('calculate', {
      config: { ...formData },
      results: calculator.calculatedDates.value
    })

  } catch (error) {
    console.error('Error al calcular fechas:', error)
    globalError.value = `Error al calcular fechas: ${error.message}`
    emit('error', { action: 'calculate', error })
  } finally {
    isCalculating.value = false
  }
}

const resetForm = () => {
  // Resetear a valores por defecto
  Object.assign(formData, {
    startDate: format(new Date(), 'yyyy-MM-dd'),
    interval: null, // Dejar vacío, requerido
    duration: null, // Dejar vacío, requerido
    durationUnit: 'months',
    country: settings.country || 'CR', // Mantener preferencia del usuario
    excludeWeekends: loadSetting('excludeWeekends', true), // Mantener preferencia del usuario
    excludeHolidays: loadSetting('excludeHolidays', true) // Mantener preferencia del usuario
  })

  // Limpiar errores
  Object.keys(fieldErrors).forEach(key => {
    fieldErrors[key] = ''
  })

  // Resetear calculadora
  calculator.reset()

  globalError.value = ''
  hasCalculated.value = false

  emit('reset')
}


const saveUserPreferences = () => {
  // Solo guardar preferencias del usuario, NO valores específicos de cálculo
  saveSetting('country', formData.country)
  saveSetting('excludeWeekends', formData.excludeWeekends)
  saveSetting('excludeHolidays', formData.excludeHolidays)
  // Nota: NO guardamos startDate, interval, duration, durationUnit
}

const emitConfigChange = () => {
  emit('config-change', { ...formData })

  if (props.autoCalculate && isFormValid.value) {
    nextTick(() => {
      handleSubmit()
    })
  }
}

// Auto-guardar preferencias del usuario cuando cambien
watch(() => formData.country, (newCountry) => {
  if (newCountry) {
    saveSetting('country', newCountry)
  }
}, { immediate: false })

watch(() => formData.excludeWeekends, (newValue) => {
  saveSetting('excludeWeekends', newValue)
}, { immediate: false })

watch(() => formData.excludeHolidays, (newValue) => {
  saveSetting('excludeHolidays', newValue)
}, { immediate: false })

const clearGlobalError = () => {
  globalError.value = ''
}

// Funciones de tema
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDarkMode.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  document.documentElement.setAttribute('data-theme', isDarkMode.value ? 'dark' : 'light')
}

const setTheme = (theme) => {
  isDarkMode.value = theme === 'dark'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}


// Watch para auto-calcular si está habilitado
watch(
  () => [formData.startDate, formData.interval, formData.duration, formData.durationUnit, formData.country, formData.excludeWeekends, formData.excludeHolidays],
  () => {
    if (props.autoCalculate && isFormValid.value) {
      handleSubmit()
    }
  },
  { deep: true }
)

// Función para cargar países
const loadCountries = async () => {
  try {
    countriesList.value = await getCountries()
  } catch (error) {
    console.error('Error cargando países:', error)
  }
}

// Inicialización
onMounted(async () => {
  loadInitialConfig()
  initTheme()

  // Cargar lista de países
  await loadCountries()

  // Auto-calcular si está habilitado y el formulario es válido
  if (props.autoCalculate && isFormValid.value) {
    nextTick(() => {
      handleSubmit()
    })
  }
})

// Exponer funciones para uso externo
defineExpose({
  validate: validateForm,
  reset: resetForm,
  calculate: handleSubmit,
  getConfig: () => ({ ...formData }),
  setConfig: (config) => Object.assign(formData, config),
  isValid: isFormValid,
  isCalculating
})
</script>

<style scoped>
.date-form {
  width: 100%;
  background: transparent;
  padding: 2rem;
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border-primary);
}

.form-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.form-icon {
  font-size: 2rem;
}

.form-description {
  margin: 0;
  font-size: 1rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-width: 500px;
  margin: 0 auto;
}

/* Form sections - Estilo moderno */
.form-section {
  margin-bottom: 2.5rem;
  padding: 0;
}

.section-title {
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.025em;
}

.section-icon {
  font-size: 1.5rem;
}

/* Form grid */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

/* Form inputs */
.field-label {
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.required-indicator {
  color: var(--color-error);
  font-weight: bold;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border-primary);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background-color: var(--color-surface-primary);
  color: var(--color-text-primary);
}

/* Estilos específicos para inputs numéricos */
.form-input[type="number"] {
  padding-right: 3rem; /* Espacio extra para los spinners */
}

/* Ocultar spinners nativos en navegadores WebKit (Chrome, Safari, Edge) */
.form-input[type="number"]::-webkit-outer-spin-button,
.form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Ocultar spinners en Firefox */
.form-input[type="number"] {
  -moz-appearance: textfield;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-input.has-error {
  border-color: var(--color-error);
}

.input-suffix {
  position: absolute;
  right: 0.75rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  pointer-events: none;
}

.form-select {
  padding: 0.75rem;
  border: 2px solid var(--color-border-primary);
  border-radius: 8px;
  font-size: 1rem;
  background-color: var(--color-surface-primary);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: border-color 0.3s ease;
  min-width: 120px;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.duration-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.duration-inputs .input-wrapper {
  flex: 1;
}

/* Messages */
.error-message {
  color: var(--color-error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.help-text {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  line-height: 1.4;
}

/* Warnings */
.form-warnings {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--color-warning-light);
  border-radius: 8px;
  border-left: 4px solid var(--color-warning);
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-warning-dark);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.warning-item:last-child {
  margin-bottom: 0;
}

.warning-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* Buttons */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-400) 100%);
  color: white;
  box-shadow: 0 4px 12px var(--color-primary-200);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px var(--color-primary-300);
}

.btn-secondary {
  background-color: var(--color-surface-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-surface-tertiary);
  transform: translateY(-1px);
}

.btn-calculate {
  min-width: 180px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.btn-text {
  white-space: nowrap;
}

/* Config summary */
.config-summary {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--color-primary-50);
  border-radius: 12px;
  border: 1px solid var(--color-primary-200);
}

.summary-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary-500);
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.summary-item {
  font-size: 0.9rem;
  color: var(--color-text-primary);
  line-height: 1.4;
}


/* Global error */
.global-error {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-error);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 400px;
  z-index: 1000;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--color-error-dark);
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.error-dismiss:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .date-form {
    padding: 1rem;
    margin: 1rem;
    border-radius: 12px;
  }

  .form-header {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-section {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    justify-content: center;
  }

  .duration-inputs {
    flex-direction: column;
    gap: 0.75rem;
  }

  .summary-content {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .global-error {
    position: static;
    margin-bottom: 1rem;
  }
}

/* Dark mode is handled by CSS variables */

/* Collapsible sections */
.collapsible-section {
  display: flex;
  flex-direction: column;
}

.collapsible-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  color: var(--color-text-primary);
  text-align: left;
  width: 100%;
  border-radius: 4px;
}

.collapsible-toggle:hover .toggle-text {
  color: var(--color-primary-400);
}

.collapsible-toggle:hover .toggle-icon {
  color: var(--color-primary-400);
}

.collapsible-toggle:focus {
  outline: none;
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.toggle-icon {
  font-size: 0.875rem;
  line-height: 1;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  color: var(--color-text-muted);
}

.toggle-text {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 1rem;
}

.toggle-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 400;
  margin-left: auto;
}

.collapsible-content {
  margin-top: 1rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.exclusion-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.exclusion-field {
  width: 100%;
}

/* Theme selector */
.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.theme-icon {
  margin-right: 0.5rem;
}

.theme-options {
  display: flex;
  gap: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  color: var(--color-text-primary);
}

.theme-option:hover {
  background-color: var(--color-surface-tertiary);
  border-color: var(--color-border-secondary);
  transform: translateY(-1px);
}

.theme-option.active {
  background-color: var(--color-primary-500);
  border-color: var(--color-primary-500);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px var(--color-primary-200);
}

.theme-option-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.theme-option-text {
  font-weight: 500;
}
</style>
