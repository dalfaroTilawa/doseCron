<template>
  <div id="app" :class="{ 'overflow-hidden': globalLoading }" class="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
    <!-- Loading overlay global -->
    <div v-if="globalLoading" class="fixed inset-0 bg-bg-primary/90 backdrop-blur-sm z-modal-backdrop flex items-center justify-center">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p class="text-lg font-medium text-text-primary">
          {{ loadingMessage || 'Procesando...' }}
        </p>
      </div>
    </div>


    <!-- Contenido principal -->
    <main class="flex-1 py-8 px-4">
      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Formulario principal -->
        <section>
          <ErrorBoundary @error="onFormError">
            <DateForm
              ref="mainFormRef"
              :allow-past-dates="true"
              :auto-calculate="false"
              :realtime-validation="true"
              @calculate="onFormCalculate"
              @reset="onFormReset"
              @config-change="onFormConfigChange"
              @export="onFormExport"
              @error="onFormError"
            />
          </ErrorBoundary>
        </section>

        <!-- Sección de resultados -->
        <section v-if="showResults" class="space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-surface-primary border border-border-primary rounded-lg">
            <h2 class="text-2xl font-bold text-text-primary flex items-center gap-3">
              <span class="text-2xl">📊</span>
              {{ t('results.calculationTitle') }}
            </h2>
            <div class="flex gap-3">
              <button
                class="inline-flex items-center gap-2 px-4 py-2 bg-surface-secondary text-text-primary border border-border-primary rounded-base font-medium text-sm transition-all duration-fast hover:bg-surface-tertiary hover:border-border-secondary hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed surface-hover"
                :title="t('results.copyTooltip')"
                :disabled="!showResults || calculationResults.length === 0"
                @click="copyResults"
              >
                <span>📋</span> {{ t('results.copyButton') }}
              </button>
              <button
                class="inline-flex items-center gap-2 px-4 py-2 bg-error-100 text-error-700 border border-error-200 rounded-base font-medium text-sm transition-all duration-fast hover:bg-error-200 hover:border-error-300 hover:-translate-y-0.5 surface-hover"
                :title="t('results.clearTooltip')"
                @click="clearResults"
              >
                <span>🗑️</span> {{ t('results.clearButton') }}
              </button>
            </div>
          </div>

          <div>
            <ErrorBoundary @error="onResultsError">
              <ResultsList
                :dates="calculationResults"
                :is-loading="isCalculating"
                :holidays="calculationHolidays"
                loading-text="Calculando fechas recurrentes..."
                empty-title="Sin resultados"
                empty-message="Configura los parámetros y presiona 'Calcular Fechas'."
                :filename="exportFilename"
                max-height="500px"
                show-summary
                @export="onResultsExport"
                @copy="onResultsCopy"
                @error="onResultsError"
              />
            </ErrorBoundary>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="mt-auto py-6 px-4 bg-surface-secondary border-t border-border-primary">
      <div class="max-w-6xl mx-auto">
        <div class="text-center space-y-2">
          <p class="text-sm text-text-primary font-medium">
            © 2024 <strong class="font-bold">DoseCron</strong> - Calculadora de fechas recurrentes
          </p>
          <p class="text-xs text-text-muted">
            Desarrollado con Vue.js 3 y date-fns
          </p>
        </div>
      </div>
    </footer>

    <!-- Notificaciones toast -->
    <div v-if="notifications.length > 0" class="fixed top-4 right-4 z-toast space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm animate-slideInRight', {
          'bg-success-50 border-success-200 text-success-800': notification.type === 'success',
          'bg-error-50 border-error-200 text-error-800': notification.type === 'error',
          'bg-warning-50 border-warning-200 text-warning-800': notification.type === 'warning',
          'bg-info-50 border-info-200 text-info-800': notification.type === 'info'
        }]"
      >
        <span class="text-lg flex-shrink-0">{{ getNotificationIcon(notification.type) }}</span>
        <span class="text-sm font-medium flex-1">{{ notification.message }}</span>
        <button
          class="text-current hover:opacity-70 font-bold text-lg leading-none p-1 transition-opacity"
          @click="removeNotification(notification.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Error global -->
    <div v-if="globalError" class="fixed top-4 left-1/2 -translate-x-1/2 z-toast max-w-md">
      <div class="flex items-center gap-3 p-4 bg-error-50 border border-error-200 text-error-800 rounded-lg shadow-lg animate-slideInDown">
        <span class="text-lg flex-shrink-0">⚠️</span>
        <span class="text-sm font-medium flex-1">{{ globalError }}</span>
        <button class="text-error-600 hover:text-error-700 font-bold text-lg leading-none p-1 transition-colors" @click="clearGlobalError">
          ✕
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { format } from 'date-fns'

// Importar componentes
import DateForm from './components/DateForm.vue'
import ResultsList from './components/ResultsList.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'

// Importar composables refactorizados
import { useI18n } from './composables/useI18n.js'
import { useDateLocale } from './composables/useDateLocale.js'
import { useDateFormatter } from './composables/useDateFormatter.js'
import { sanitizeErrorMessage } from './utils/validation.js'
import { createLoadingState } from './utils/componentHelpers.js'
import { NOTIFICATION_CONFIG, DATE_FORMATS } from './constants/index.js'

// Referencias
const mainFormRef = ref(null)

// Composables refactorizados
const { t } = useI18n()
// const { dateLocale } = useDateLocale() // Not used in this component
const formatter = useDateFormatter()

// Estado global usando helpers
const loadingState = createLoadingState()
const globalError = ref('')

// Estado de resultados
const showResults = ref(false)
const isCalculating = ref(false)
const calculationResults = ref([])
const calculationHolidays = ref([])

// Sistema de notificaciones
const notifications = ref([])
let notificationId = 0

// Extraer loading state
const globalLoading = computed(() => loadingState.isLoading)
const loadingMessage = computed(() => loadingState.message)

// Computed properties
const exportFilename = computed(() => {
  const date = format(new Date(), DATE_FORMATS.FILENAME_DATE)
  return `dosecron-fechas-${date}`
})

// Funciones de notificaciones refactorizadas
const addNotification = (type, message, duration = null) => {
  const id = ++notificationId

  // Usar duración de constantes según tipo
  const defaultDuration = duration || NOTIFICATION_CONFIG[`${type.toUpperCase()}_DURATION`] || NOTIFICATION_CONFIG.DEFAULT_DURATION

  notifications.value.push({
    id,
    type,
    message,
    timestamp: Date.now()
  })

  // Limitar número máximo de notificaciones
  if (notifications.value.length > NOTIFICATION_CONFIG.MAX_NOTIFICATIONS) {
    notifications.value.shift()
  }

  // Auto-remover después del tiempo especificado
  setTimeout(() => {
    removeNotification(id)
  }, defaultDuration)
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const getNotificationIcon = (type) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || 'ℹ️'
}


// Funciones de carga refactorizadas
const setLoading = (loading, message = '') => {
  loadingState.setLoading(loading, message)
}

// Handlers del formulario principal
const onFormCalculate = async (data) => {
  // logger.debug('Calculando fechas:', data)

  try {
    setLoading(true, 'Calculando fechas recurrentes...')
    isCalculating.value = true

    // Simular delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 500))

    // Actualizar resultados
    calculationResults.value = data.results.map(r => r.date)
    calculationHolidays.value = data.results.filter(r => r.isHoliday).map(r => r.date)

    showResults.value = true
    addNotification('success', `${data.results.length} fechas calculadas exitosamente`)

    // Scroll a resultados
    await nextTick()
    document.querySelector('.results-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

  } catch (error) {
    // Error handling managed by onFormError
    globalError.value = sanitizeErrorMessage(`Error al calcular fechas: ${error.message}`)
    addNotification('error', 'Error al calcular fechas')
  } finally {
    setLoading(false)
    isCalculating.value = false
  }
}

const onFormReset = () => {
  // logger.debug('Formulario reseteado')

  calculationResults.value = []
  calculationHolidays.value = []
  showResults.value = false

  clearGlobalError()
  addNotification('info', 'Formulario reseteado', 2000)
}

const onFormConfigChange = (config) => {
  // logger.debug('Configuración cambiada:', config)
}

const onFormExport = (exportData) => {
  // logger.debug('Exportación desde formulario:', exportData)
  addNotification('success', `Datos exportados como ${exportData.format.toUpperCase()}`)
}

const onFormError = (errorData) => {
  // Error already handled by error boundary
  globalError.value = sanitizeErrorMessage(`Error: ${errorData.error.message}`)
  addNotification('error', 'Error en el formulario')
}

// Handlers de ResultsList
const onResultsExport = (exportData) => {
  // logger.debug('Exportación de resultados:', exportData)
  addNotification('success', `${exportData.dates.length} fechas exportadas como ${exportData.format.toUpperCase()}`)
}

const onResultsCopy = (copyData) => {
  // logger.debug('Resultados copiados:', copyData)
  addNotification('success', `${copyData.dates.length} fechas copiadas al portapapeles`)
}

const onResultsError = (errorData) => {
  // Error already handled by error boundary
  addNotification('error', `Error en exportación: ${errorData.error.message}`)
}

// Funciones de acciones refactorizadas
const copyResults = async () => {
  if (calculationResults.value.length === 0) return

  try {
    // Usar formatter refactorizado para generar texto
    const formattedResults = formatter.formatDateResults(calculationResults.value, calculationHolidays.value)
    const text = formatter.generateCopyText(formattedResults.dates)

    await navigator.clipboard.writeText(text)
    addNotification('success', `📋 ${t('results.copySuccess')}`)

  } catch (error) {
    // Error already handled in UI
    // Usar notificación de error traducida específica para copy
    addNotification('error', `❌ ${t('results.copyError')}`)
  }
}

const clearResults = () => {
  if (confirm('¿Estás seguro de que quieres limpiar todos los resultados?')) {
    onFormReset()
  }
}

// Manejo de errores globales
const clearGlobalError = () => {
  globalError.value = ''
}

// Error handler para cleanup
const globalErrorHandler = (event) => {
  // Global error handler - this console.error can stay for debugging
  globalError.value = sanitizeErrorMessage('Ha ocurrido un error inesperado')
}

// Inicialización
onMounted(() => {
  // Configurar listeners para errores
  window.addEventListener('error', globalErrorHandler)

  // Notificación de bienvenida
  setTimeout(() => {
    addNotification('info', t('notifications.welcome'), 5000)
  }, 1000)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('error', globalErrorHandler)
})
</script>

<style scoped>
/* Animaciones personalizadas para notificaciones */
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

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-out;
}

.animate-slideInDown {
  animation: slideInDown 0.3s ease-out;
}
</style>
