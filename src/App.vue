<template>
  <div id="app" :class="{ 'loading': globalLoading }">
    <!-- Loading overlay global -->
    <div v-if="globalLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner" />
        <p class="loading-text">
          {{ loadingMessage || 'Procesando...' }}
        </p>
      </div>
    </div>


    <!-- Contenido principal -->
    <main class="app-main">
      <div class="main-container">
        <!-- Formulario principal -->
        <section class="form-section">
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
        </section>

        <!-- Sección de resultados -->
        <section v-if="showResults" class="results-section">
          <div class="results-header">
            <h2 class="results-title">
              <span class="results-icon">📊</span>
              Resultados del Cálculo
            </h2>
            <div class="results-actions">
              <button
                class="clear-btn"
                title="Limpiar resultados"
                @click="clearResults"
              >
                🗑️ Limpiar
              </button>
            </div>
          </div>

          <div class="results-content">
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
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-container">
        <div class="footer-content">
          <p class="footer-text">
            © 2024 <strong>DoseCron</strong> - Calculadora de fechas recurrentes
          </p>
          <p class="footer-meta">
            Desarrollado con Vue.js 3 y date-fns
          </p>
        </div>
      </div>
    </footer>

    <!-- Notificaciones toast -->
    <div v-if="notifications.length > 0" class="notifications-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification', `notification-${notification.type}`]"
      >
        <span class="notification-icon">{{ getNotificationIcon(notification.type) }}</span>
        <span class="notification-message">{{ notification.message }}</span>
        <button
          class="notification-close"
          @click="removeNotification(notification.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Error global -->
    <div v-if="globalError" class="error-banner">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">{{ globalError }}</span>
        <button class="error-close" @click="clearGlobalError">
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { format } from 'date-fns'

// Importar componentes
import DateForm from './components/DateForm.vue'
import ResultsList from './components/ResultsList.vue'

// Referencias
const mainFormRef = ref(null)

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
    globalError.value = `Error al calcular fechas: ${error.message}`
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
  globalError.value = `Error: ${errorData.error.message}`
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
const clearResults = () => {
  if (confirm('¿Estás seguro de que quieres limpiar todos los resultados?')) {
    onFormReset()
  }
}

// Manejo de errores globales
const clearGlobalError = () => {
  globalError.value = ''
}

// Inicialización
onMounted(() => {

  // Configurar listeners para errores
  window.addEventListener('error', (event) => {
    console.error('Error no manejado:', event.error)
    globalError.value = 'Ha ocurrido un error inesperado'
  })

  // Notificación de bienvenida
  setTimeout(() => {
    addNotification('info', '¡Bienvenido a DoseCron! Configura tus parámetros para empezar.', 5000)
  }, 1000)
})
</script>

<style scoped>
/* Variables CSS - Diseño Moderno */
:root {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --secondary: #6366f1;
  --accent: #8b5cf6;

  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #06b6d4;

  --bg-primary: #ffffff;
  --bg-secondary: #fafbfc;
  --bg-tertiary: #f1f5f9;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;

  --border: #e2e8f0;
  --border-light: #f1f5f9;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-xl: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  --radius: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #0f172a;
  --bg-tertiary: #1e293b;
  --bg-card: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #e2e8f0;
  --text-muted: #94a3b8;
  --border: #334155;
  --border-light: #1e293b;
}

/* Reset base */
* {
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, #f8fafc 100%);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  transition: all 0.3s ease;
  padding: 2rem 1rem;
}


/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

[data-theme="dark"] .loading-overlay {
  background: rgba(15, 23, 42, 0.9);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}


/* Main content */
.app-main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.main-container {
  display: grid;
  gap: 2rem;
  width: 100%;
}

/* Secciones - Estilo moderno */
.form-section,
.results-section {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-light);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 2rem 1rem 2rem;
  background: transparent;
}

.results-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.results-icon {
  font-size: 1.5rem;
}

.clear-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn:hover {
  background: var(--error);
  color: white;
  border-color: var(--error);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.results-content {
  padding: 0;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}

/* Footer */
.app-footer {
  text-align: center;
  padding: 3rem 0 2rem 0;
  margin-top: 4rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.footer-content {
  text-align: center;
}

.footer-text {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.footer-meta {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 400;
}

/* Notificaciones - Estilo moderno */
.notifications-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 420px;
}

.notification {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--border-light);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.3s ease-out;
}

.notification-success { border-left-color: var(--success); }
.notification-error { border-left-color: var(--error); }
.notification-warning { border-left-color: var(--warning); }
.notification-info { border-left-color: var(--info); }

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.notification-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-message {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.notification-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.notification-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* Error global */
.error-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--error);
  color: white;
  padding: 1rem;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}

.error-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-message {
  flex: 1;
  font-size: 0.9rem;
}

.error-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: all 0.3s ease;
}

.error-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  #app {
    padding: 1rem 0.5rem;
  }

  .main-container {
    gap: 1.5rem;
  }

  .form-section,
  .results-section {
    border-radius: var(--radius-lg);
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    text-align: center;
  }

  .footer-container {
    padding: 0 1rem;
  }

  .notifications-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .error-content {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .main-container,
  .footer-container {
    padding: 0 1rem;
  }
}
</style>
