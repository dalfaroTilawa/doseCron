<template>
  <div class="filter-options">
    <h4 v-if="title" class="filter-title">
      {{ title }}
    </h4>

    <div class="filter-group" :class="{ 'vertical': layout === 'vertical' }">
      <!-- Excluir fines de semana -->
      <label
        class="filter-option"
        :class="{ 'disabled': weekendsDisabled }"
        :for="weekendCheckboxId"
      >
        <input
          :id="weekendCheckboxId"
          type="checkbox"
          :checked="excludeWeekends"
          :disabled="weekendsDisabled"
          class="filter-checkbox"
          :aria-describedby="weekendsDisabled ? weekendHelpId : null"
          @change="handleWeekendsChange"
        >
        <span class="checkmark" aria-hidden="true" />
        <div class="filter-text">
          <span class="filter-icon">🏖️</span>
          <span class="filter-label">{{ t('form.fields.excludeWeekends.label') }}</span>
        </div>
      </label>

      <!-- Excluir días feriados -->
      <label
        class="filter-option"
        :class="{ 'disabled': holidaysDisabled }"
        :for="holidayCheckboxId"
      >
        <input
          :id="holidayCheckboxId"
          type="checkbox"
          :checked="excludeHolidays"
          :disabled="holidaysDisabled"
          class="filter-checkbox"
          :aria-describedby="holidaysDisabled ? holidayHelpId : null"
          @change="handleHolidaysChange"
        >
        <span class="checkmark" aria-hidden="true" />
        <div class="filter-text">
          <span class="filter-icon">🎉</span>
          <span class="filter-label">{{ t('form.fields.excludeHolidays.label') }}</span>
        </div>
      </label>
    </div>

    <!-- Texto de ayuda para fines de semana -->
    <div
      v-if="weekendsHelpText && excludeWeekends"
      :id="weekendHelpId"
      class="help-text weekends-help"
    >
      {{ weekendsHelpText }}
    </div>

    <!-- Texto de ayuda para feriados -->
    <div
      v-if="holidaysHelpText && excludeHolidays"
      :id="holidayHelpId"
      class="help-text holidays-help"
    >
      {{ holidaysHelpText }}
    </div>

    <!-- Información adicional cuando ambos están activos -->
    <div v-if="showSummary && (excludeWeekends || excludeHolidays)" class="filter-summary">
      <small>
        <span v-if="excludeWeekends && excludeHolidays">
          {{ t('exclusions.summary.both') }}
        </span>
        <span v-else-if="excludeWeekends">
          {{ t('exclusions.summary.weekendsOnly') }}
        </span>
        <span v-else-if="excludeHolidays">
          {{ t('exclusions.summary.holidaysOnly') }}
        </span>
      </small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n.js'

// Props
const props = defineProps({
  // Valores de los checkboxes
  excludeWeekends: {
    type: Boolean,
    default: false
  },

  excludeHolidays: {
    type: Boolean,
    default: false
  },

  // Título del grupo de filtros
  title: {
    type: String,
    default: ''
  },

  // Layout: 'horizontal' o 'vertical'
  layout: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },

  // Estados deshabilitados
  weekendsDisabled: {
    type: Boolean,
    default: false
  },

  holidaysDisabled: {
    type: Boolean,
    default: false
  },

  // Textos de ayuda
  weekendsHelpText: {
    type: String,
    default: ''
  },

  holidaysHelpText: {
    type: String,
    default: ''
  },

  // Mostrar resumen
  showSummary: {
    type: Boolean,
    default: false
  },

  // IDs personalizados (para múltiples instancias)
  customIdPrefix: {
    type: String,
    default: ''
  }
})

// Eventos
const emit = defineEmits([
  'update:excludeWeekends',
  'update:excludeHolidays',
  'change'
])

// Composables
const { t } = useI18n()

// IDs únicos para accesibilidad
const idPrefix = computed(() =>
  props.customIdPrefix || `filter-options-${Math.random().toString(36).substr(2, 9)}`
)

const weekendCheckboxId = computed(() => `${idPrefix.value}-weekends`)
const holidayCheckboxId = computed(() => `${idPrefix.value}-holidays`)
const weekendHelpId = computed(() => `${idPrefix.value}-weekends-help`)
const holidayHelpId = computed(() => `${idPrefix.value}-holidays-help`)

// Manejadores de eventos
const handleWeekendsChange = (event) => {
  const checked = event.target.checked

  // Emitir evento de actualización para v-model
  emit('update:excludeWeekends', checked)

  // Emitir evento de cambio con información completa
  emit('change', {
    type: 'weekends',
    excludeWeekends: checked,
    excludeHolidays: props.excludeHolidays,
    event
  })
}

const handleHolidaysChange = (event) => {
  const checked = event.target.checked

  // Emitir evento de actualización para v-model
  emit('update:excludeHolidays', checked)

  // Emitir evento de cambio con información completa
  emit('change', {
    type: 'holidays',
    excludeWeekends: props.excludeWeekends,
    excludeHolidays: checked,
    event
  })
}

// Función para obtener estado actual (expuesta)
const getState = () => ({
  excludeWeekends: props.excludeWeekends,
  excludeHolidays: props.excludeHolidays,
  bothActive: props.excludeWeekends && props.excludeHolidays,
  noneActive: !props.excludeWeekends && !props.excludeHolidays
})

// Función para establecer ambos valores (expuesta)
const setAll = (weekends, holidays) => {
  if (weekends !== props.excludeWeekends) {
    emit('update:excludeWeekends', weekends)
  }
  if (holidays !== props.excludeHolidays) {
    emit('update:excludeHolidays', holidays)
  }

  emit('change', {
    type: 'all',
    excludeWeekends: weekends,
    excludeHolidays: holidays
  })
}

// Función para resetear (expuesta)
const reset = () => {
  setAll(false, false)
}

// Función para activar todo (expuesta)
const selectAll = () => {
  setAll(true, true)
}

// Exponer funciones para acceso externo
defineExpose({
  getState,
  setAll,
  reset,
  selectAll
})
</script>

<style scoped>
.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.filter-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.filter-group {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.filter-group.vertical {
  flex-direction: column;
  gap: 1rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  min-height: 44px; /* Área de toque mínima */
  position: relative;
  width: 100%;
  min-width: 0; /* Permite que el flex-shrink funcione */
  border: 2px solid transparent;
}

.filter-option:hover:not(.disabled) {
  background-color: #f9fafb;
  transform: translateY(-1px);
}

.filter-option.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-checkbox {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.filter-checkbox:disabled {
  cursor: not-allowed;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  transition: all 0.2s ease-in-out;
  position: relative;
  flex-shrink: 0;
}

/* Estados del checkbox */
.filter-checkbox:checked + .checkmark {
  background-color: #667eea;
  border-color: #667eea;
}

.filter-checkbox:checked + .checkmark::after {
  content: '✓';
  color: white;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
}

/* Removed problematic focus rule that was hiding elements */

.filter-checkbox:focus + .checkmark {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

.filter-option:hover:not(.disabled) .checkmark {
  border-color: #9ca3af;
}

.filter-checkbox:disabled + .checkmark {
  background-color: #f9fafb;
  border-color: #e5e7eb;
}

.filter-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
  line-height: 1.4;
  flex: 1;
}

.filter-icon {
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
}

.filter-label {
  color: #1f2937;
  font-weight: 500;
}

.help-text {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  padding-left: 0.5rem;
  border-left: 3px solid #e5e7eb;
}

.help-text.weekends-help {
  border-left-color: #fbbf24;
}

.help-text.holidays-help {
  border-left-color: #f87171;
}

.filter-summary {
  padding: 0.75rem;
  background-color: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  text-align: center;
  color: #0369a1;
}

.filter-summary small {
  font-weight: 500;
}

/* Animaciones para los checkboxes */
@keyframes checkboxCheck {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.filter-checkbox:checked + .checkmark::after {
  animation: checkboxCheck 0.2s ease-out;
}

/* Responsive */
@media (max-width: 640px) {
  .filter-group {
    flex-direction: column;
    gap: 1rem;
  }

  .filter-option {
    padding: 0.75rem;
    min-height: 48px; /* Área de toque más grande en móvil */
  }

  .filter-text {
    font-size: 1.1rem;
  }

  .checkmark {
    width: 22px;
    height: 22px;
  }

  .filter-checkbox {
    width: 22px;
    height: 22px;
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .filter-title {
    color: #f9fafb;
  }

  .filter-option:hover:not(.disabled) {
    background-color: #374151;
  }

  .checkmark {
    background-color: #374151;
    border-color: #4b5563;
  }

  .filter-checkbox:checked + .checkmark {
    background-color: #667eea;
    border-color: #667eea;
  }

  .filter-checkbox:disabled + .checkmark {
    background-color: #1f2937;
    border-color: #374151;
  }

  .filter-text,
  .filter-label {
    color: #f9fafb;
  }

  .help-text {
    color: #9ca3af;
    border-left-color: #4b5563;
  }

  .filter-summary {
    background-color: #1e3a8a;
    border-color: #3b82f6;
    color: #bfdbfe;
  }
}

/* Accesibilidad mejorada */
@media (prefers-reduced-motion: reduce) {
  .filter-option,
  .checkmark,
  .filter-checkbox:checked + .checkmark::after {
    transition: none;
    animation: none;
  }
}

/* Focus visible para mejor accesibilidad */
.filter-checkbox:focus-visible + .checkmark {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Estados adicionales para mejor UX */
.filter-option:active:not(.disabled) {
  transform: translateY(0);
  background-color: #f3f4f6;
}

.filter-option:active:not(.disabled) .checkmark {
  transform: scale(0.95);
}

/* Estilos para cuando ambos están seleccionados */
/* Estilos adicionales para mejor accesibilidad */
.filter-option:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

/* Removed complex :has() selector that might cause issues */
</style>
