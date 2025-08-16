<template>
  <div class="country-selector">
    <label v-if="label" :for="selectId" class="country-label">
      {{ label }}
      <span v-if="required" class="required-indicator" :aria-label="t('form.texts.requiredIndicator')">*</span>
    </label>

    <div class="country-select-wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        class="country-select"
        :class="{
          'has-error': hasError,
          'is-loading': isLoading
        }"
        :disabled="disabled || isLoading"
        :required="required"
        :aria-describedby="errorId"
        :aria-invalid="hasError"
        @change="handleChange"
      >
        <option value="" :disabled="required">
          {{ placeholder }}
        </option>
        <option
          v-for="country in countries"
          :key="country.code"
          :value="country.code"
        >
          {{ country.name }} ({{ country.code }})
        </option>
      </select>

      <!-- Icono de carga -->
      <div v-if="isLoading" class="loading-spinner" aria-hidden="true">
        <div class="spinner" />
      </div>

      <!-- Icono de dropdown -->
      <div v-else class="dropdown-icon" aria-hidden="true">
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L6 6L11 1"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="hasError && errorMessage"
      :id="errorId"
      class="error-message"
      role="alert"
      aria-live="polite"
    >
      {{ errorMessage }}
    </div>

    <!-- Información adicional -->
    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>

    <!-- País seleccionado (para debug/desarrollo) -->
    <div v-if="showSelectedInfo && selectedCountry" class="selected-info">
      <small>{{ t('countrySelector.selected') }}: {{ selectedCountry.name }} ({{ selectedCountry.code }})</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getCountries } from '../services/holidayApi.js'
import { useI18n } from '../composables/useI18n.js'
import { generateComponentId } from '../utils/componentHelpers.js'

// Props
const props = defineProps({
  // Valor del v-model
  modelValue: {
    type: String,
    default: ''
  },

  // Etiqueta del campo
  label: {
    type: String,
    default: ''
  },

  // Texto del placeholder
  placeholder: {
    type: String,
    default: ''
  },

  // Si el campo es requerido
  required: {
    type: Boolean,
    default: false
  },

  // Si el campo está deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },

  // Mensaje de error externo
  errorMessage: {
    type: String,
    default: ''
  },

  // Texto de ayuda
  helpText: {
    type: String,
    default: ''
  },

  // Mostrar información del país seleccionado (para desarrollo)
  showSelectedInfo: {
    type: Boolean,
    default: false
  },

  // ID personalizado para el select
  customId: {
    type: String,
    default: ''
  }
})

// Eventos
const emit = defineEmits(['update:modelValue', 'change', 'error'])

// Composables
const { t } = useI18n()

// Estado reactivo
const countries = ref([])
const isLoading = ref(true)
const internalError = ref('')

// IDs únicos para accesibilidad
const selectId = computed(() => generateComponentId('country-select', props.customId))
const errorId = computed(() => `${selectId.value}-error`)

// Computed properties
const hasError = computed(() => !!(props.errorMessage || internalError.value))

const selectedCountry = computed(() => {
  if (!props.modelValue) return null
  return countries.value.find(country => country.code === props.modelValue) || null
})

// Función para cargar países
const loadCountries = async () => {
  try {
    isLoading.value = true
    internalError.value = ''

    const countriesList = getCountries()

    if (!Array.isArray(countriesList) || countriesList.length === 0) {
      throw new Error(t('countrySelector.error'))
    }

    // Ordenar países alfabéticamente por nombre
    countries.value = countriesList.sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    )

  } catch (error) {
    // Error already emitted and shown in UI
    internalError.value = t('countrySelector.error')
    emit('error', error)
  } finally {
    isLoading.value = false
  }
}

// Manejo del cambio de selección
const handleChange = (event) => {
  const selectedCode = event.target.value

  // Emitir evento de actualización para v-model
  emit('update:modelValue', selectedCode)

  // Emitir evento de cambio con información completa
  const selectedCountryData = selectedCode
    ? countries.value.find(country => country.code === selectedCode)
    : null

  emit('change', {
    code: selectedCode,
    country: selectedCountryData,
    event
  })
}

// Validación del valor del modelo
const validateModelValue = () => {
  if (props.modelValue && countries.value.length > 0) {
    const isValid = countries.value.some(country => country.code === props.modelValue)
    if (!isValid) {
      // Invalid country code - already handled by component state
      internalError.value = `${t('countrySelector.invalidCode')}: ${props.modelValue}`
    } else {
      internalError.value = ''
    }
  }
}

// Watchers
watch(() => props.modelValue, validateModelValue)
watch(countries, validateModelValue)

// Lifecycle
onMounted(() => {
  loadCountries()
})

// Función para recargar países (expuesta para uso externo)
const reload = () => {
  loadCountries()
}

// Función para obtener país por código (expuesta para uso externo)
const getCountryByCode = (code) => {
  return countries.value.find(country => country.code === code) || null
}

// Exponer funciones para acceso externo
defineExpose({
  reload,
  getCountryByCode,
  countries: computed(() => countries.value),
  selectedCountry,
  isLoading: computed(() => isLoading.value),
  hasError
})
</script>

<style scoped>
.country-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.country-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required-indicator {
  color: #ef4444;
  font-weight: 700;
}

.country-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.country-select {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
  appearance: none;
  cursor: pointer;
}

.country-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.country-select:hover:not(:disabled) {
  border-color: #9ca3af;
}

.country-select:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.country-select.has-error {
  border-color: #ef4444;
}

.country-select.has-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.country-select.is-loading {
  color: #9ca3af;
}

.dropdown-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  transition: transform 0.2s ease-in-out;
}

.country-select:focus + .dropdown-icon {
  transform: translateY(-50%) rotate(180deg);
}

.loading-spinner {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message::before {
  content: '⚠️';
  font-size: 0.75rem;
}

.help-text {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
}

.selected-info {
  padding: 0.5rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0369a1;
}

/* Estados de hover para opciones */
.country-select option:hover {
  background-color: #f3f4f6;
}

/* Responsive */
@media (max-width: 640px) {
  .country-select {
    font-size: 16px; /* Previene zoom en iOS */
    padding: 0.875rem 2.5rem 0.875rem 0.875rem;
  }

  .country-label {
    font-size: 1rem;
  }
}

/* Modo oscuro (opcional) */
@media (prefers-color-scheme: dark) {
  .country-label {
    color: #f9fafb;
  }

  .country-select {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .country-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .country-select:disabled {
    background-color: #1f2937;
    color: #6b7280;
  }

  .dropdown-icon {
    color: #9ca3af;
  }

  .help-text {
    color: #9ca3af;
  }

  .selected-info {
    background-color: #1e3a8a;
    border-color: #3b82f6;
    color: #bfdbfe;
  }
}

/* Accesibilidad mejorada */
@media (prefers-reduced-motion: reduce) {
  .country-select,
  .dropdown-icon,
  .spinner {
    transition: none;
    animation: none;
  }
}

/* Focus visible para mejor accesibilidad */
.country-select:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
