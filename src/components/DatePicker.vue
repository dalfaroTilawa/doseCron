<template>
  <div class="date-picker">
    <label v-if="label" :for="inputId" class="date-label">
      {{ label }}
      <span v-if="required" class="required-indicator" aria-label="Campo requerido">*</span>
    </label>

    <div class="date-input-wrapper">
      <input
        :id="inputId"
        type="date"
        :value="modelValue"
        class="date-input"
        :class="{
          'has-error': hasError,
          'is-focused': isFocused
        }"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
        :aria-describedby="errorId"
        :aria-invalid="hasError"
        :placeholder="placeholder"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
      >

      <!-- Icono de calendario -->
      <div class="calendar-icon" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            stroke-width="2"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="6"
            stroke="currentColor"
            stroke-width="2"
          />
          <line
            x1="8"
            y1="2"
            x2="8"
            y2="6"
            stroke="currentColor"
            stroke-width="2"
          />
          <line
            x1="3"
            y1="10"
            x2="21"
            y2="10"
            stroke="currentColor"
            stroke-width="2"
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

    <!-- Texto de ayuda -->
    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>

    <!-- Información adicional de la fecha -->
    <div v-if="showDateInfo && modelValue && isValidDate" class="date-info">
      <small>{{ formattedDateInfo }}</small>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, isValid, isToday, isFuture, isPast } from 'date-fns'
import { DateValidator } from '../utils/validation.js'
import { useI18n } from '../composables/useI18n.js'
import { useDateLocale } from '../composables/useDateLocale.js'
import { generateComponentId } from '../utils/componentHelpers.js'

// Props
const props = defineProps({
  // Valor del v-model (fecha en formato YYYY-MM-DD)
  modelValue: {
    type: String,
    default: ''
  },

  // Etiqueta del campo
  label: {
    type: String,
    default: ''
  },

  // Placeholder del input
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

  // Fecha mínima permitida (YYYY-MM-DD)
  min: {
    type: String,
    default: ''
  },

  // Fecha máxima permitida (YYYY-MM-DD)
  max: {
    type: String,
    default: ''
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

  // Mostrar información adicional de la fecha
  showDateInfo: {
    type: Boolean,
    default: false
  },

  // ID personalizado para el input
  customId: {
    type: String,
    default: ''
  },

  // Validación automática al perder el foco
  validateOnBlur: {
    type: Boolean,
    default: true
  },

  // Permitir fechas pasadas
  allowPastDates: {
    type: Boolean,
    default: true
  },

  // Permitir fechas futuras
  allowFutureDates: {
    type: Boolean,
    default: true
  }
})

// Eventos
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'error'])

// Composables refactorizados
const { t } = useI18n()
const { dateLocale, localeCode } = useDateLocale()

// Estado reactivo
const isFocused = ref(false)
const internalError = ref('')
const hasBeenTouched = ref(false)

// IDs únicos usando helper
const inputId = computed(() => generateComponentId('date-picker', props.customId))
const errorId = computed(() => `${inputId.value}-error`)

// Validación
const isValidDate = computed(() => {
  if (!props.modelValue) return false

  try {
    const date = parseISO(props.modelValue)
    return isValid(date)
  } catch {
    return false
  }
})

const parsedDate = computed(() => {
  if (!isValidDate.value) return null
  return parseISO(props.modelValue)
})

// Validación de reglas de fecha usando utilidad centralizada
const dateValidationError = computed(() => {
  const result = DateValidator.validateDate(props.modelValue, {
    required: props.required,
    fieldName: props.label || t('datePicker.label'),
    min: props.min,
    max: props.max,
    allowPast: props.allowPastDates,
    allowFuture: props.allowFutureDates
  })

  return result.error
})

// Error combinado (externo + interno + validación)
const hasError = computed(() => {
  return !!(props.errorMessage || internalError.value || (hasBeenTouched.value && dateValidationError.value))
})

// Información formateada de la fecha
const formattedDateInfo = computed(() => {
  if (!parsedDate.value) return ''

  try {
    const date = parsedDate.value
    const dayName = format(date, 'EEEE', { locale: dateLocale.value })

    const formatPattern = localeCode.value === 'en'
      ? 'EEEE, MMMM d, yyyy'
      : "EEEE, dd 'de' MMMM 'de' yyyy"

    const formatted = format(date, formatPattern, { locale: dateLocale.value })

    let info = formatted

    if (isToday(date)) {
      info += ` (${t('datePicker.dateInfo.today')})`
    } else if (isFuture(date)) {
      info += ` (${t('datePicker.dateInfo.future')})`
    } else if (isPast(date)) {
      info += ` (${t('datePicker.dateInfo.past')})`
    }

    return info
  } catch {
    return t('datePicker.dateInfoNotAvailable') || 'Date information not available'
  }
})

const validateDate = () => {
  internalError.value = ''

  if (dateValidationError.value) {
    internalError.value = dateValidationError.value
    emit('error', new Error(dateValidationError.value))
    return false
  }

  return true
}

// Manejadores de eventos
const handleInput = (event) => {
  const value = event.target.value

  // Emitir actualización inmediata para v-model
  emit('update:modelValue', value)

  // Limpiar errores internos en input
  internalError.value = ''
}

const handleChange = (event) => {
  const value = event.target.value
  hasBeenTouched.value = true

  // Validar la fecha
  const isValid = validateDate()

  // Emitir evento de cambio con información completa
  emit('change', {
    value,
    date: parsedDate.value,
    isValid,
    formatted: parsedDate.value ? formattedDateInfo.value : '',
    event
  })
}

const handleBlur = (event) => {
  isFocused.value = false
  hasBeenTouched.value = true

  if (props.validateOnBlur) {
    validateDate()
  }

  emit('blur', {
    value: props.modelValue,
    date: parsedDate.value,
    isValid: isValidDate.value && !dateValidationError.value,
    event
  })
}

const handleFocus = (event) => {
  isFocused.value = true

  emit('focus', {
    value: props.modelValue,
    event
  })
}

// Watchers
watch(() => props.modelValue, () => {
  if (hasBeenTouched.value && props.validateOnBlur) {
    validateDate()
  }
})

// Función para establecer fecha actual (expuesta)
const setToday = () => {
  const today = format(new Date(), 'yyyy-MM-dd')
  emit('update:modelValue', today)
  hasBeenTouched.value = true
  validateDate()
}

// Función para limpiar fecha (expuesta)
const clear = () => {
  emit('update:modelValue', '')
  internalError.value = ''
  hasBeenTouched.value = false
}

// Función para validación manual (expuesta)
const validate = () => {
  hasBeenTouched.value = true
  return validateDate()
}

// Exponer funciones para acceso externo
defineExpose({
  setToday,
  clear,
  validate,
  isValid: computed(() => isValidDate.value && !dateValidationError.value),
  hasError,
  parsedDate,
  formattedDateInfo
})
</script>

<style scoped>
.date-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.date-label {
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

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  color: #374151;
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.date-input:hover:not(:disabled) {
  border-color: #9ca3af;
}

.date-input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.date-input.has-error {
  border-color: #ef4444;
}

.date-input.has-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.date-input.is-focused {
  border-color: #667eea;
}

/* Estilizar el picker nativo */
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 20px;
  height: 20px;
  cursor: pointer;
  position: absolute;
  right: 0.75rem;
}

.date-input::-webkit-datetime-edit-fields-wrapper {
  padding: 0;
}

.date-input::-webkit-datetime-edit {
  line-height: 1.5;
}

.date-input::-webkit-datetime-edit-text {
  color: #6b7280;
  padding: 0 0.25rem;
}

.date-input::-webkit-datetime-edit-month-field,
.date-input::-webkit-datetime-edit-day-field,
.date-input::-webkit-datetime-edit-year-field {
  background-color: transparent;
  color: #374151;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  border: none;
}

.date-input::-webkit-datetime-edit-month-field:focus,
.date-input::-webkit-datetime-edit-day-field:focus,
.date-input::-webkit-datetime-edit-year-field:focus {
  background-color: #667eea;
  color: white;
  outline: none;
}

.calendar-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #6b7280;
  transition: color 0.2s ease-in-out;
}

.date-input:focus + .calendar-icon,
.date-input.is-focused + .calendar-icon {
  color: #667eea;
}

.date-input.has-error + .calendar-icon {
  color: #ef4444;
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

.date-info {
  padding: 0.5rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  color: #0369a1;
}

/* Estados del input para diferentes navegadores */
.date-input:invalid {
  border-color: #ef4444;
}

.date-input:valid {
  border-color: #d1d5db;
}

.date-input:valid:focus {
  border-color: #667eea;
}

/* Responsive */
@media (max-width: 640px) {
  .date-input {
    font-size: 16px; /* Previene zoom en iOS */
    padding: 0.875rem 2.5rem 0.875rem 0.875rem;
  }

  .date-label {
    font-size: 1rem;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .date-label {
    color: #f9fafb;
  }

  .date-input {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .date-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .date-input:disabled {
    background-color: #1f2937;
    color: #6b7280;
  }

  .date-input::-webkit-datetime-edit-text {
    color: #9ca3af;
  }

  .date-input::-webkit-datetime-edit-month-field,
  .date-input::-webkit-datetime-edit-day-field,
  .date-input::-webkit-datetime-edit-year-field {
    color: #f9fafb;
  }

  .calendar-icon {
    color: #9ca3af;
  }

  .help-text {
    color: #9ca3af;
  }

  .date-info {
    background-color: #1e3a8a;
    border-color: #3b82f6;
    color: #bfdbfe;
  }
}

/* Accesibilidad mejorada */
@media (prefers-reduced-motion: reduce) {
  .date-input,
  .calendar-icon {
    transition: none;
  }
}

/* Focus visible para mejor accesibilidad */
.date-input:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Estilos específicos para Firefox */
@-moz-document url-prefix() {
  .date-input {
    padding-right: 0.75rem;
  }

  .calendar-icon {
    display: none;
  }
}
</style>
