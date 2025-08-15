<template>
  <div class="results-list">
    <!-- Botones de acción movidos a App.vue junto al botón Limpiar -->

    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner" />
      <p class="loading-text">
        {{ loadingText || t('results.loading') }}
      </p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="dates.length === 0" class="empty-state">
      <div class="empty-icon">
        📭
      </div>
      <h4 class="empty-title">
        {{ emptyTitle || t('results.empty.title') }}
      </h4>
      <p class="empty-message">
        {{ emptyMessage || t('results.empty.message') }}
      </p>
    </div>

    <!-- Lista de fechas -->
    <div v-else class="dates-container">
      <div class="dates-scroll-area" :style="{ maxHeight: maxHeight }">
        <div class="dates-list">
          <div
            v-for="(dateInfo, index) in formattedDates"
            :key="index"
            class="date-item"
            :class="{
              'is-weekend': dateInfo.isWeekend,
              'is-holiday': dateInfo.isHoliday,
              'is-today': dateInfo.isToday
            }"
          >
            <div class="date-number">
              {{ index + 1 }}
            </div>
            <div class="date-content">
              <div class="date-formatted">
                {{ dateInfo.formatted }}
              </div>
              <div class="date-meta">
                <span class="date-iso">{{ dateInfo.iso }}</span>
                <div class="date-badges">
                  <span v-if="dateInfo.isToday" class="badge badge-today">{{ t('results.badges.today') }}</span>
                  <span v-if="dateInfo.isWeekend" class="badge badge-weekend">{{ t('results.badges.weekend') }}</span>
                  <span v-if="dateInfo.isHoliday" class="badge badge-holiday">{{ t('results.badges.holiday') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información adicional al final -->
      <div v-if="showSummary" class="results-summary">
        <div class="summary-stats">
          <span class="stat-item">
            <span class="stat-icon">📅</span>
            <span class="stat-text">{{ t('results.summary.total') }} {{ dates.length }}</span>
          </span>
          <span v-if="weekendCount > 0" class="stat-item">
            <span class="stat-icon">🏖️</span>
            <span class="stat-text">{{ t('results.summary.weekends') }} {{ weekendCount }}</span>
          </span>
          <span v-if="holidayCount > 0" class="stat-item">
            <span class="stat-icon">🎉</span>
            <span class="stat-text">{{ t('results.summary.holidays') }} {{ holidayCount }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Feedback de exportación -->
    <div v-if="exportFeedback" class="export-feedback" :class="exportFeedback.type">
      {{ exportFeedback.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { format, parseISO, isWeekend, isSameDay, startOfDay } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useI18n } from '../composables/useI18n.js'

// Composables
const { t, currentLocale } = useI18n()

const props = defineProps({
  // Array de fechas (strings ISO o objetos Date)
  dates: {
    type: Array,
    default: () => []
  },

  // Estado de carga
  isLoading: {
    type: Boolean,
    default: false
  },

  // Texto durante la carga
  loadingText: {
    type: String,
    default: 'Calculando fechas...'
  },

  // Configuración del estado vacío
  emptyTitle: {
    type: String,
    default: 'No hay fechas para mostrar'
  },

  emptyMessage: {
    type: String,
    default: 'Configura los parámetros y presiona "Calcular" para generar fechas.'
  },

  // Altura máxima del área de scroll
  maxHeight: {
    type: String,
    default: '400px'
  },

  // Mostrar resumen estadístico
  showSummary: {
    type: Boolean,
    default: true
  },

  // Configuración de exportación
  filename: {
    type: String,
    default: 'fechas-calculadas'
  },

  // Array de feriados para detectarlos (opcional)
  holidays: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['export', 'error'])

// Estado interno
const isExporting = ref(false)
const exportFeedback = ref(null)

// Locale de date-fns según idioma actual
const dateLocale = computed(() => {
  return currentLocale.value === 'en' ? enUS : es
})

// Formatear fechas con información adicional
const formattedDates = computed(() => {
  const today = startOfDay(new Date())

  return props.dates.map(date => {
    // Convertir a objeto Date si es string
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dateStart = startOfDay(dateObj)

    // Formatear fecha según idioma actual
    const formatPattern = currentLocale.value === 'en'
      ? 'EEEE, MMMM d, yyyy'
      : "EEEE, d 'de' MMMM 'de' yyyy"
    const formatted = format(dateObj, formatPattern, { locale: dateLocale.value })

    // Información adicional
    const isWeekendDay = isWeekend(dateObj)
    const isToday = isSameDay(dateStart, today)
    const isHoliday = props.holidays.some(holiday => {
      const holidayDate = typeof holiday === 'string' ? parseISO(holiday) : holiday
      return isSameDay(dateObj, holidayDate)
    })

    return {
      original: date,
      dateObj,
      formatted: formatted.charAt(0).toUpperCase() + formatted.slice(1), // Capitalizar primer letra
      iso: format(dateObj, 'yyyy-MM-dd'),
      isWeekend: isWeekendDay,
      isHoliday,
      isToday
    }
  })
})

// Estadísticas
const weekendCount = computed(() =>
  formattedDates.value.filter(d => d.isWeekend).length
)

const holidayCount = computed(() =>
  formattedDates.value.filter(d => d.isHoliday).length
)


// Funcionalidad de copiado movida a App.vue

// Limpiar feedback cuando cambian las fechas
watch(() => props.dates, () => {
  exportFeedback.value = null
})

// Exponer funciones para uso externo
defineExpose({
  formattedDates,
  weekendCount,
  holidayCount
})
</script>

<style scoped>
.results-list {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface-primary);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

/* Botones de acción */
.results-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border-primary);
  background-color: var(--color-surface-secondary);
  max-width: 100%;
  box-sizing: border-box;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--color-primary-500);
  border: 1px solid var(--color-primary-500);
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.export-btn:hover:not(:disabled) {
  background-color: var(--color-primary-400);
  border-color: var(--color-primary-400);
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1rem;
  line-height: 1;
}

.btn-text {
  font-size: 0.8rem;
}

/* Estados */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-primary);
  border-top: 3px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.empty-title {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 400px;
}

/* Lista de fechas */
.dates-container {
  padding: 0;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.dates-scroll-area {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border-secondary) transparent;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.dates-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.dates-scroll-area::-webkit-scrollbar-track {
  background: transparent;
}

.dates-scroll-area::-webkit-scrollbar-thumb {
  background-color: var(--color-border-secondary);
  border-radius: 3px;
}

.dates-scroll-area::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-border-primary);
}

.dates-list {
  padding: 0 1.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.date-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border-light);
  transition: background-color 0.2s ease;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.date-item:last-child {
  border-bottom: none;
}

.date-item:hover {
  background-color: var(--color-surface-secondary);
}

.date-item.is-today {
  background-color: var(--color-success-light);
}

.date-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  background-color: var(--color-surface-secondary);
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.date-item.is-today .date-number {
  background-color: var(--color-success);
  color: white;
}

.date-content {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

.date-formatted {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.date-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-iso {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-family: 'Courier New', monospace;
}

.date-badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
}

.badge-today {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-weekend {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.badge-holiday {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

/* Resumen */
.results-summary {
  padding: 1rem 1.5rem;
  background-color: var(--color-surface-secondary);
  border-top: 1px solid var(--color-border-primary);
}

.summary-stats {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.stat-icon {
  font-size: 1rem;
}

.stat-text {
  font-weight: 500;
}

/* Feedback de exportación */
.export-feedback {
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}

.export-feedback.success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
  border-top: 2px solid var(--color-success);
}

.export-feedback.error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  border-top: 2px solid var(--color-error);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .results-actions {
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .export-btn {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }

  .date-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .summary-stats {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .results-list {
    border-radius: 8px;
  }

  .results-header {
    padding: 1rem;
  }

  .dates-list {
    padding: 0 1rem;
  }

  .date-item {
    gap: 0.75rem;
  }

  .export-btn .btn-text {
    display: none;
  }
}

/* Dark mode is handled by CSS variables */
</style>
