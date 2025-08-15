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
import { es, enUS } from 'date-fns/locale'

// Importar componentes
import DateForm from './components/DateForm.vue'
import ResultsList from './components/ResultsList.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { useI18n } from './composables/useI18n.js'
import { sanitizeErrorMessage } from './utils/validation.js'

// Referencias
const mainFormRef = ref(null)

// Composables
const { t, currentLocale } = useI18n()

// Estado global
const globalLoading = ref(false)
const globalError = ref('')
const loadingMessage = ref('')


// Estado de resultados
const showResults = ref(false)
const isCalculating = ref(false)
const calculationResults = ref([])
const calculationHolidays = ref([])

// Sistema de notificaciones
const notifications = ref([])
let notificationId = 0

// Computed properties
const exportFilename = computed(() => {
  const date = format(new Date(), 'yyyy-MM-dd')
  return `dosecron-fechas-${date}`
})

// Locale de date-fns según idioma actual
const dateLocale = computed(() => {
  return currentLocale.value === 'en' ? enUS : es
})

// Funciones de notificaciones
const addNotification = (type, message, duration = 4000) => {
  const id = ++notificationId
  notifications.value.push({ id, type, message })

  if (duration > 0) {
    setTimeout(() => removeNotification(id), duration)
  }

  return id
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


// Funciones de carga
const setLoading = (loading, message = '') => {
  globalLoading.value = loading
  loadingMessage.value = message
}

// Handlers del formulario principal
const onFormCalculate = async (data) => {
  console.log('Calculando fechas:', data)

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
    console.error('Error al calcular:', error)
    globalError.value = sanitizeErrorMessage(`Error al calcular fechas: ${error.message}`)
    addNotification('error', 'Error al calcular fechas')
  } finally {
    setLoading(false)
    isCalculating.value = false
  }
}

const onFormReset = () => {
  console.log('Formulario reseteado')

  calculationResults.value = []
  calculationHolidays.value = []
  showResults.value = false

  clearGlobalError()
  addNotification('info', 'Formulario reseteado', 2000)
}

const onFormConfigChange = (config) => {
  console.log('Configuración cambiada:', config)
}

const onFormExport = (exportData) => {
  console.log('Exportación desde formulario:', exportData)
  addNotification('success', `Datos exportados como ${exportData.format.toUpperCase()}`)
}

const onFormError = (errorData) => {
  console.error('Error en formulario:', errorData)
  globalError.value = sanitizeErrorMessage(`Error: ${errorData.error.message}`)
  addNotification('error', 'Error en el formulario')
}

// Handlers de ResultsList
const onResultsExport = (exportData) => {
  console.log('Exportación de resultados:', exportData)
  addNotification('success', `${exportData.dates.length} fechas exportadas como ${exportData.format.toUpperCase()}`)
}

const onResultsCopy = (copyData) => {
  console.log('Resultados copiados:', copyData)
  addNotification('success', `${copyData.dates.length} fechas copiadas al portapapeles`)
}

const onResultsError = (errorData) => {
  console.error('Error en resultados:', errorData)
  addNotification('error', `Error en exportación: ${errorData.error.message}`)
}

// Funciones de acciones
const copyResults = async () => {
  if (calculationResults.value.length === 0) return

  try {
    // Formatear fechas para copiar según idioma actual
    const text = calculationResults.value.map((dateString, index) => {
      const date = new Date(dateString)

      // Usar formato diferente según idioma
      const formatPattern = currentLocale.value === 'en'
        ? 'EEEE, MMMM d, yyyy'
        : "EEEE, dd 'de' MMMM 'de' yyyy"

      const formatted = format(date, formatPattern, { locale: dateLocale.value })
      return `${index + 1}. ${formatted}`
    }).join('\n')

    await navigator.clipboard.writeText(text)

    // Usar notificación traducida específica para copy
    addNotification('success', `📋 ${t('results.copySuccess')}`)

  } catch (error) {
    console.error('Error al copiar:', error)
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
  console.error('Error no manejado:', event.error)
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
