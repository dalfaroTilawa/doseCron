<template>
  <div class="results-list">
    <!-- Botones de acción movidos a App.vue junto al botón Limpiar -->

    <!-- Estado de carga -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner" />
      <p class="loading-text">
        {{ loadingText }}
      </p>
    </div>

    <!-- Estado vacío -->
    <div v-else-if="dates.length === 0" class="empty-state">
      <div class="empty-icon">
        📭
      </div>
      <h4 class="empty-title">
        {{ emptyTitle }}
      </h4>
      <p class="empty-message">
        {{ emptyMessage }}
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
                  <span v-if="dateInfo.isToday" class="badge badge-today">Hoy</span>
                  <span v-if="dateInfo.isWeekend" class="badge badge-weekend">Fin de semana</span>
                  <span v-if="dateInfo.isHoliday" class="badge badge-holiday">Feriado</span>
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
            <span class="stat-text">Total: {{ dates.length }}</span>
          </span>
          <span v-if="weekendCount > 0" class="stat-item">
            <span class="stat-icon">🏖️</span>
            <span class="stat-text">Fines de semana: {{ weekendCount }}</span>
          </span>
          <span v-if="holidayCount > 0" class="stat-item">
            <span class="stat-icon">🎉</span>
            <span class="stat-text">Feriados: {{ holidayCount }}</span>
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
import { es } from 'date-fns/locale'

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

// Formatear fechas con información adicional
const formattedDates = computed(() => {
  const today = startOfDay(new Date())

  return props.dates.map(date => {
    // Convertir a objeto Date si es string
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dateStart = startOfDay(dateObj)

    // Formatear fecha en español
    const formatted = format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })

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
  background-color: white;
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
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
  max-width: 100%;
  box-sizing: border-box;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background-color: #667eea;
  border: 1px solid #667eea;
  border-radius: 6px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.export-btn:hover:not(:disabled) {
  background-color: #5a67d8;
  border-color: #5a67d8;
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
  border: 3px solid #e1e5e9;
  border-top: 3px solid #667eea;
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
  color: #6b7280;
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
  color: #374151;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-message {
  margin: 0;
  color: #6b7280;
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
  scrollbar-color: #cbd5e1 transparent;
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
  background-color: #cbd5e1;
  border-radius: 3px;
}

.dates-scroll-area::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
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
  border-bottom: 1px solid #f1f5f9;
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
  background-color: #f8fafc;
}

.date-item.is-today {
  background-color: rgba(16, 185, 129, 0.05);
}

.date-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  background-color: #f1f5f9;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  flex-shrink: 0;
}

.date-item.is-today .date-number {
  background-color: #10b981;
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
  color: #1f2937;
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
  color: #6b7280;
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
  background-color: #dcfce7;
  color: #166534;
}

.badge-weekend {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-holiday {
  background-color: #fecaca;
  color: #991b1b;
}

/* Resumen */
.results-summary {
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
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
  color: #475569;
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
  background-color: #dcfce7;
  color: #166534;
  border-top: 2px solid #22c55e;
}

.export-feedback.error {
  background-color: #fecaca;
  color: #991b1b;
  border-top: 2px solid #ef4444;
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

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .results-list {
    background-color: #1f2937;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .results-actions {
    background-color: #374151;
    border-bottom-color: #4b5563;
  }

  .date-item:hover {
    background-color: #374151;
  }

  .date-item.is-today {
    background-color: rgba(16, 185, 129, 0.1);
  }

  .date-number {
    background-color: #374151;
    color: #d1d5db;
  }

  .date-formatted {
    color: #f9fafb;
  }

  .date-iso {
    color: #9ca3af;
  }

  .empty-title {
    color: #f9fafb;
  }

  .empty-message {
    color: #9ca3af;
  }

  .loading-text {
    color: #9ca3af;
  }

  .results-summary {
    background-color: #374151;
    border-top-color: #4b5563;
  }

  .stat-item {
    color: #d1d5db;
  }
}
</style>
