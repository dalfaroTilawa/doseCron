<template>
  <div class="bg-surface-primary border border-border-primary rounded-lg shadow-sm overflow-hidden transition-shadow duration-fast hover:shadow-md">
    <!-- Header del formulario -->
    <div class="p-3 sm:p-6 border-b border-border-primary bg-bg-secondary">
      <!-- Layout mobile: stack vertical, desktop: horizontal -->
      <div class="flex flex-col space-y-2 sm:space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0">
        <!-- Contenido principal del header -->
        <div class="flex-1 min-w-0 pr-2 md:pr-0 overflow-hidden">
          <!-- Título responsive con mejor scaling -->
          <h2 class="text-base sm:text-lg md:text-2xl font-extrabold text-text-primary mb-1 sm:mb-2 md:mb-3 flex items-center gap-1 sm:gap-2 md:gap-3">
            <span class="text-lg sm:text-xl md:text-3xl flex-shrink-0">📅</span>
            <span class="leading-tight break-words min-w-0">{{ t('app.subtitle') }}</span>
          </h2>

          <!-- Descripción optimizada para móvil -->
          <p class="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed max-w-none md:max-w-2xl">
            <span class="md:hidden">{{ t('app.descriptionShort') }}</span>
            <span class="hidden md:inline">{{ t('app.description') }}</span>
          </p>
        </div>

        <!-- Selector de idioma - posición responsive mejorada -->
        <div class="flex-shrink-0 self-center md:self-start md:ml-4 lg:ml-6">
          <div class="flex justify-center md:justify-start">
            <LanguageSwitcher :show-tooltip="false" size="small" class="scale-75 sm:scale-90 md:scale-100" />
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario principal -->
    <form class="p-4 sm:p-6 space-y-6 sm:space-y-8" novalidate @submit.prevent="handleSubmit">
      <!-- Sección: Configuración Básica -->
      <div class="space-y-6">
        <h3 class="text-xl font-bold text-text-primary flex items-center gap-3 mb-6">
          <span class="text-lg">⚙️</span>
          {{ t('form.basicConfig') }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Fecha inicial -->
          <div class="form-field">
            <DatePicker
              v-model="formData.startDate"
              :label="t('form.fields.startDate.required')"
              :required="true"
              :allow-past-dates="allowPastDates"
              :allow-future-dates="true"
              :error-message="fieldErrors.startDate"
              :help-text="t('form.fields.startDate.helpText')"
              show-date-info
              custom-id="start-date"
              @change="onStartDateChange"
              @error="onFieldError('startDate', $event)"
            />
          </div>

          <!-- Intervalo -->
          <div class="space-y-3">
            <label for="interval" class="block text-sm font-semibold text-text-primary mb-2">
              {{ t('form.fields.interval.label') }} *
              <span class="text-error-500">*</span>
            </label>
            <div class="relative">
              <input
                id="interval"
                v-model.number="formData.interval"
                type="number"
                min="1"
                max="365"
                step="1"
                :class="['w-full pr-20 py-3 px-4 border rounded-base bg-surface-primary text-text-primary placeholder-text-placeholder transition-all duration-fast focus:outline-none focus:ring-3 focus:ring-primary-500/10 focus:border-border-focus', { 'border-error-500': fieldErrors.interval, 'border-border-primary': !fieldErrors.interval }]"
                :aria-invalid="!!fieldErrors.interval"
                :aria-describedby="fieldErrors.interval ? 'interval-error' : 'interval-help'"
                :placeholder="t('form.fields.interval.placeholder')"
                required
                @input="onIntervalChange"
                @blur="validateInterval"
              >
              <span class="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-text-muted font-medium pointer-events-none">{{ t('form.texts.days') }}</span>
            </div>
            <div
              v-if="fieldErrors.interval"
              id="interval-error"
              class="text-sm text-error-600 mt-2 flex items-center gap-2"
              role="alert"
            >
              {{ fieldErrors.interval }}
            </div>
            <div v-else id="interval-help" class="text-sm text-text-muted mt-2 font-medium">
              {{ t('form.fields.interval.helpText') }}
            </div>
          </div>

          <!-- Duración -->
          <div class="space-y-3">
            <label for="duration" class="block text-sm font-semibold text-text-primary mb-2">
              {{ t('form.fields.duration.label') }} *
              <span class="text-error-500">*</span>
            </label>
            <div class="flex gap-3">
              <div class="flex-1">
                <input
                  id="duration"
                  v-model.number="formData.duration"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  :class="['w-full py-3 px-4 border rounded-base bg-surface-primary text-text-primary placeholder-text-placeholder transition-all duration-fast focus:outline-none focus:ring-3 focus:ring-primary-500/10 focus:border-border-focus', { 'border-error-500': fieldErrors.duration, 'border-border-primary': !fieldErrors.duration }]"
                  :aria-invalid="!!fieldErrors.duration"
                  :placeholder="t('form.fields.duration.placeholder')"
                  required
                  @input="onDurationChange"
                  @blur="validateDuration"
                >
              </div>
              <select
                v-model="formData.durationUnit"
                :class="['py-3 px-4 border rounded-base bg-surface-primary text-text-primary transition-all duration-fast focus:outline-none focus:ring-3 focus:ring-primary-500/10 focus:border-border-focus cursor-pointer', { 'border-error-500': fieldErrors.durationUnit, 'border-border-primary': !fieldErrors.durationUnit }]"
                @change="onDurationUnitChange"
              >
                <option value="days">
                  {{ t('form.fields.durationUnit.options.days') }}
                </option>
                <option value="weeks">
                  {{ t('form.fields.durationUnit.options.weeks') }}
                </option>
                <option value="months">
                  {{ t('form.fields.durationUnit.options.months') }}
                </option>
                <option value="years">
                  {{ t('form.fields.durationUnit.options.years') }}
                </option>
              </select>
            </div>
            <div v-if="fieldErrors.duration || fieldErrors.durationUnit" class="text-sm text-error-600 mt-2 flex items-center gap-2" role="alert">
              {{ fieldErrors.duration || fieldErrors.durationUnit }}
            </div>
            <div v-else class="text-sm text-text-muted mt-2 font-medium">
              {{ t('form.fields.duration.helpText') }}
            </div>
          </div>

          <!-- Mensaje de validación intervalo vs duración -->
          <div v-if="fieldErrors.intervalVsDuration" class="md:col-span-2">
            <div class="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
              <span class="text-lg flex-shrink-0 mt-0.5">⚠️</span>
              <div>
                <p class="text-error-700 font-medium">
                  {{ fieldErrors.intervalVsDuration }}
                </p>
                <p class="text-error-600 text-sm mt-2">
                  {{ t('form.texts.intervalVsDurationSuggestion') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Opciones de exclusión (colapsables) -->
          <div class="md:col-span-2 space-y-3">
            <div class="bg-surface-secondary border border-border-light rounded-lg p-4">
              <button
                type="button"
                class="w-full flex items-center justify-between py-2 px-3 text-left bg-transparent border-0 cursor-pointer transition-all duration-fast hover:bg-surface-hover rounded-base"
                :aria-expanded="showExclusionOptions"
                @click="showExclusionOptions = !showExclusionOptions"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm transition-transform duration-200" :class="{'rotate-90': showExclusionOptions}">{{ showExclusionOptions ? '🔽' : '▶️' }}</span>
                  <span class="font-semibold text-text-primary text-base">{{ t('form.exclusionOptions') }}</span>
                </div>
                <span class="text-sm text-text-muted font-medium">{{ t('form.exclusionSubtitle') }}</span>
              </button>

              <div v-show="showExclusionOptions" class="mt-4 animate-slideDown">
                <div class="flex flex-col gap-6">
                  <!-- Selector de país -->
                  <div class="w-full">
                    <CountrySelector
                      v-model="formData.country"
                      :label="t('form.fields.country.label')"
                      :placeholder="t('form.fields.country.placeholder')"
                      :required="false"
                      :error-message="fieldErrors.country"
                      :help-text="t('form.fields.country.helpText')"
                      show-selected-info
                      custom-id="country-selector"
                      @change="onCountryChange"
                      @error="onFieldError('country', $event)"
                    />
                  </div>

                  <!-- Exclusion filters -->
                  <div class="w-full">
                    <FilterOptions
                      v-model:exclude-weekends="formData.excludeWeekends"
                      v-model:exclude-holidays="formData.excludeHolidays"
                      :title="t('form.fields.filtersTitle')"
                      layout="horizontal"
                      :holidays-disabled="!formData.country"
                      :weekends-help-text="t('form.fields.excludeWeekends.helpText')"
                      :holidays-help-text="t('form.fields.excludeHolidays.helpText')"
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
          <div class="md:col-span-2 space-y-3">
            <div class="bg-surface-secondary border border-border-light rounded-lg p-4">
              <button
                type="button"
                class="w-full flex items-center justify-between py-2 px-3 text-left bg-transparent border-0 cursor-pointer transition-all duration-fast hover:bg-surface-hover rounded-base"
                :aria-expanded="showThemeOptions"
                @click="showThemeOptions = !showThemeOptions"
              >
                <div class="flex items-center gap-3">
                  <span class="text-sm transition-transform duration-200" :class="{'rotate-90': showThemeOptions}">{{ showThemeOptions ? '🔽' : '▶️' }}</span>
                  <span class="font-semibold text-text-primary text-base">{{ t('form.themeOptions') }}</span>
                </div>
                <span class="text-sm text-text-muted font-medium">{{ isDarkMode ? t('form.themeSubtitle.dark') : t('form.themeSubtitle.light') }}</span>
              </button>

              <div v-show="showThemeOptions" class="mt-4 animate-slideDown">
                <div class="flex flex-col gap-4">
                  <div class="flex gap-2">
                    <button
                      type="button"
                      :class="['flex items-center gap-2 py-3 px-4 bg-surface-secondary border border-border-primary rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-tertiary hover:border-border-secondary hover:-translate-y-0.5 text-sm text-text-primary font-medium', { 'bg-primary-500 border-primary-500 text-white -translate-y-0.5 shadow-primary-200': !isDarkMode }]"
                      :title="t('theme.lightTitle')"
                      @click="handleThemeChange('light')"
                    >
                      <span class="text-lg leading-none">☀️</span>
                      <span>{{ t('theme.light') }}</span>
                    </button>
                    <button
                      type="button"
                      :class="['flex items-center gap-2 py-3 px-4 bg-surface-secondary border border-border-primary rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-tertiary hover:border-border-secondary hover:-translate-y-0.5 text-sm text-text-primary font-medium', { 'bg-primary-500 border-primary-500 text-white -translate-y-0.5 shadow-primary-200': isDarkMode }]"
                      :title="t('theme.darkTitle')"
                      @click="handleThemeChange('dark')"
                    >
                      <span class="text-lg leading-none">🌙</span>
                      <span>{{ t('theme.dark') }}</span>
                    </button>
                  </div>
                  <div class="text-sm text-text-muted mt-2 font-medium">
                    {{ t('theme.description') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- Advertencias y validaciones -->
      <div v-if="formWarnings.length > 0" class="space-y-3">
        <div v-for="warning in formWarnings" :key="warning.type" class="flex items-center gap-3 p-4 bg-warning-50 border border-warning-200 rounded-lg">
          <span class="text-lg flex-shrink-0">⚠️</span>
          <span class="text-warning-700 font-medium">{{ warning.message }}</span>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="submit"
          :disabled="isCalculating || !isFormValid"
          :class="['inline-flex items-center justify-center gap-3 px-6 py-3 font-medium text-base text-white rounded-base transition-all duration-fast min-h-[44px] flex-1 sm:flex-none focus:outline-none focus:ring-3 focus:ring-primary-500/20', isCalculating ? 'bg-primary-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 hover:shadow-md hover:-translate-y-0.5 shadow-sm']"
        >
          <span v-if="isCalculating" class="animate-spin text-lg">⏳</span>
          <span v-else class="text-lg">{{ isCalculating ? '⏳' : '🔄' }}</span>
          <span>
            {{ isCalculating ? t('form.buttons.calculating') : t('form.buttons.calculate') }}
          </span>
        </button>

        <button
          type="button"
          :disabled="isCalculating"
          class="inline-flex items-center justify-center gap-3 px-6 py-3 font-medium text-base bg-surface-primary text-text-secondary border border-border-primary rounded-base transition-all duration-fast min-h-[44px] hover:bg-surface-hover hover:border-border-secondary hover:-translate-y-0.5 focus:outline-none focus:ring-3 focus:ring-border-focus/20 disabled:opacity-60 disabled:cursor-not-allowed"
          @click="resetForm"
        >
          <span class="text-lg">🗑️</span>
          <span>{{ t('form.buttons.reset') }}</span>
        </button>
      </div>

      <!-- Resumen de configuración -->
      <div v-if="configSummary" class="bg-surface-primary border border-border-primary rounded-lg p-6 shadow-sm">
        <h4 class="text-lg font-bold text-primary-600 mb-4 flex items-center gap-2">
          <span>📋</span> {{ t('form.summary.title') }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="text-sm">
            <span class="font-semibold text-text-primary">{{ t('form.summary.labels.startDate') }}</span> <span class="text-text-secondary font-medium">{{ configSummary.startDate }}</span>
          </div>
          <div class="text-sm">
            <span class="font-semibold text-text-primary">{{ t('form.summary.labels.interval') }}</span> <span class="text-text-secondary font-medium">{{ configSummary.interval }}</span>
          </div>
          <div class="text-sm">
            <span class="font-semibold text-text-primary">{{ t('form.summary.labels.duration') }}</span> <span class="text-text-secondary font-medium">{{ configSummary.duration }}</span>
          </div>
          <div class="text-sm">
            <span class="font-semibold text-text-primary">{{ t('form.summary.labels.country') }}</span> <span class="text-text-secondary font-medium">{{ configSummary.country }}</span>
          </div>
          <div class="text-sm">
            <span class="font-semibold text-text-primary">{{ t('form.summary.labels.exclusions') }}</span> <span class="text-text-secondary font-medium">{{ configSummary.exclusions }}</span>
          </div>
        </div>
      </div>
    </form>


    <!-- Mensajes de error global -->
    <div v-if="globalError" class="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-lg mt-4">
      <span class="text-lg flex-shrink-0">❌</span>
      <span class="text-error-700 font-medium flex-1">{{ globalError }}</span>
      <button class="text-error-600 hover:text-error-700 font-bold text-lg leading-none p-1" @click="clearGlobalError">
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { format, parseISO } from 'date-fns'

// Importar componentes
import DatePicker from './DatePicker.vue'
import CountrySelector from './CountrySelector.vue'
import FilterOptions from './FilterOptions.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

// Importar composables refactorizados
import { useDateCalculator } from '../composables/useDateCalculator.js'
import { useSettings } from '../composables/useSettings.js'
import { useI18n } from '../composables/useI18n.js'
import { useDateLocale } from '../composables/useDateLocale.js'
import { useTheme } from '../composables/useTheme.js'

// Importar helpers refactorizados
import { getCountries } from '../services/holidayApi.js'
import { DateValidator, ValidatorFactory, DurationValidator, setI18nInstance } from '../utils/validation.js'
import { handleFormSubmit, generateDefaultFormData, clearFieldErrors } from '../utils/formHelpers.js'
import { generateConfigSummary } from '../utils/configSummaryHelpers.js'
import { DATE_FORMATS } from '../constants/index.js'

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

// Composables refactorizados
const { settings, saveSetting, loadSetting } = useSettings()
const calculator = useDateCalculator()
const i18nInstance = useI18n()
const { t, validateMessage, errorMessage, formatInterval } = i18nInstance
const { dateLocale, localeCode } = useDateLocale()
const themeManager = useTheme()

// Configurar i18n en validaciones
setI18nInstance(i18nInstance)

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
  country: '',
  intervalVsDuration: '' // Nueva validación
})

const isCalculating = ref(false)
const globalError = ref('')

// Estado del tema (manejado por composable)
const { isDarkMode, setTheme } = themeManager

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
  const result = DateValidator.validateDate(formData.startDate, {
    required: true,
    fieldName: t('form.fields.startDate.label'),
    allowPast: props.allowPastDates,
    allowFuture: true
  })

  fieldErrors.startDate = result.error
  return result.isValid
}

const validateInterval = ValidatorFactory.createIntervalValidator()

const validateDuration = ValidatorFactory.createDurationValidator()

const validateIntervalVsDuration = () => {
  const result = DurationValidator.validateIntervalVsDuration(
    formData.interval,
    formData.duration,
    formData.durationUnit
  )

  fieldErrors.intervalVsDuration = result.error
  return result.isValid
}

const validateForm = () => {
  const startDateValid = validateStartDate()
  const intervalResult = validateInterval(formData.interval)
  const durationResult = validateDuration(formData.duration)
  const intervalDurationValid = validateIntervalVsDuration()

  fieldErrors.interval = intervalResult.error
  fieldErrors.duration = durationResult.error

  return startDateValid && intervalResult.isValid && durationResult.isValid && intervalDurationValid
}

// Computed properties
const isFormValid = computed(() => {
  return validateForm() && !Object.values(fieldErrors).some(error => error)
})

const selectedCountryName = computed(() => {
  if (!formData.country) return t('form.fields.country.noSelection')
  const country = countriesList.value.find(c => c.code === formData.country)
  return country ? country.name : formData.country
})

const formWarnings = computed(() => {
  const warnings = []

  if (formData.excludeHolidays && !formData.country) {
    warnings.push({
      type: 'no-country',
      message: t('warnings.noCountry')
    })
  }

  if (formData.interval > 30) {
    warnings.push({
      type: 'long-interval',
      message: t('warnings.longInterval')
    })
  }

  // Validación específica cuando duración está en días
  if (formData.durationUnit === 'days' && formData.duration < formData.interval) {
    warnings.push({
      type: 'duration-shorter-than-interval',
      message: t('warnings.durationShorterThanInterval', { duration: formData.duration, interval: formData.interval })
    })
  }

  return warnings
})

// Resumen de configuración usando helper refactorizado
const configSummary = computed(() => {
  return generateConfigSummary(formData, {
    localeCode: localeCode.value,
    dateLocale: dateLocale.value,
    countriesList: countriesList.value,
    t,
    isFormValid: isFormValid.value
  })
})


// Event handlers
const onStartDateChange = () => {
  if (props.realtimeValidation) {
    validateStartDate()
  }
  emitConfigChange()
}

const onIntervalChange = () => {
  if (props.realtimeValidation) {
    const result = validateInterval(formData.interval)
    fieldErrors.interval = result.error
    // También validar intervalo vs duración
    validateIntervalVsDuration()
  }
  emitConfigChange()
}

const onDurationChange = () => {
  if (props.realtimeValidation) {
    const result = validateDuration(formData.duration)
    fieldErrors.duration = result.error
    // También validar intervalo vs duración
    validateIntervalVsDuration()
  }
  emitConfigChange()
}

const onDurationUnitChange = () => {
  if (props.realtimeValidation) {
    // Validar intervalo vs duración cuando cambia la unidad
    validateIntervalVsDuration()
  }
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
  fieldErrors[fieldName] = error.message || t('validation.general')
}

// Función simplificada usando helper refactorizado
const handleSubmit = async () => {
  await handleFormSubmit({
    formData,
    validateForm,
    calculator,
    emit,
    t,
    refs: { isCalculating, globalError, hasCalculated }
  })
}

const resetForm = () => {
  // Resetear usando helper refactorizado
  const defaultData = generateDefaultFormData(settings, loadSetting)
  Object.assign(formData, defaultData)

  // Limpiar errores usando helper
  clearFieldErrors(fieldErrors)

  // Resetear calculadora
  calculator.reset()

  globalError.value = ''
  hasCalculated.value = false

  emit('reset')
}

// Funciones de tema simplificadas
const handleThemeChange = (theme) => {
  setTheme(theme)
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

// Funciones de tema ahora manejadas por useTheme() composable
// Ya no es necesario initTheme ni setTheme manuales


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
  // initTheme() ya no es necesario - manejado por useTheme()

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
/* Animación para contenido colapsable */
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

.animate-slideDown {
  animation: slideDown 0.3s ease-out;
}

/* Ocultar spinners nativos en inputs numéricos */
.form-input[type="number"]::-webkit-outer-spin-button,
.form-input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.form-input[type="number"] {
  -moz-appearance: textfield;
}
</style>
