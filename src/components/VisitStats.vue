<template>
  <div v-if="isDeveloper" class="visit-stats">
    <div class="dev-badge">{{ t('analytics.devMode') }}</div>
    
    <div class="stats-container">
      <div class="stat-item">
        <span class="stat-number">{{ stats.visits }}</span>
        <span class="stat-label">{{ t('analytics.visits') }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-number">{{ stats.calculations }}</span>
        <span class="stat-label">{{ t('analytics.calculations') }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-number">{{ daysActive }}</span>
        <span class="stat-label">{{ t('analytics.daysActive') }}</span>
      </div>
    </div>
    
    <button 
      @click="clearStats" 
      class="clear-button"
      :title="t('analytics.clearStats')"
    >
      🗑️
    </button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalytics } from '../composables/useAnalytics.js'
import { APP_CONFIG } from '../config/env.js'

const { t } = useI18n()
const { stats, daysActive, clearStats } = useAnalytics()

// Estado para controlar visibilidad manual
const manuallyVisible = ref(false)

// Solo visible para desarrollador o cuando se activa manualmente
const isDeveloper = computed(() => {
  // SOLO visible cuando se activa manualmente desde consola
  // Ignorar completamente las variables de entorno en producción
  const isLocalDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '127.0.0.1'
  
  // En desarrollo local, permitir variables de entorno
  if (isLocalDev) {
    return manuallyVisible.value ||
           (APP_CONFIG.DEVELOPER_MODE === true) ||
           (APP_CONFIG.DEBUG_MODE === true)
  }
  
  // En producción, SOLO manual
  return manuallyVisible.value
})

// Funciones para control desde consola
const showDevStats = () => {
  manuallyVisible.value = true
  console.log('📊 Panel de estadísticas activado')
  console.log('Stats actuales:', stats.value)
}

const hideDevStats = () => {
  manuallyVisible.value = false
  console.log('📊 Panel de estadísticas oculto')
}

const getDevStats = () => {
  const currentStats = stats.value
  console.log('📊 Estadísticas de DoseCron:')
  console.log(`   👥 Visitas: ${currentStats.visits}`)
  console.log(`   🧮 Cálculos: ${currentStats.calculations}`)
  console.log(`   📅 Días activos: ${daysActive.value}`)
  console.log(`   🎯 Primera visita: ${currentStats.firstVisit ? new Date(currentStats.firstVisit).toLocaleString() : 'N/A'}`)
  console.log(`   ⏰ Última visita: ${currentStats.lastVisit ? new Date(currentStats.lastVisit).toLocaleString() : 'N/A'}`)
  return currentStats
}

// Exponer funciones globalmente
onMounted(() => {
  window.showDevStats = showDevStats
  window.hideDevStats = hideDevStats  
  window.getDevStats = getDevStats
  
  // Mensaje de bienvenida en consola solo una vez
  if (!window._dosecronDevMsgShown) {
    console.log('%c📊 DoseCron Analytics', 'color: #10b981; font-weight: bold; font-size: 14px')
    console.log('%cComandos disponibles:', 'color: #6b7280; font-size: 12px')
    console.log('%c  showDevStats()  - Mostrar panel', 'color: #374151; font-family: monospace')
    console.log('%c  hideDevStats()  - Ocultar panel', 'color: #374151; font-family: monospace') 
    console.log('%c  getDevStats()   - Ver estadísticas', 'color: #374151; font-family: monospace')
    window._dosecronDevMsgShown = true
  }
})

// Limpiar funciones al desmontar
onUnmounted(() => {
  delete window.showDevStats
  delete window.hideDevStats
  delete window.getDevStats
})
</script>

<style scoped>
.visit-stats {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  font-size: 0.75rem;
  font-family: monospace;
  backdrop-filter: blur(4px);
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dev-badge {
  background: #10b981;
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.stats-container {
  display: flex;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-weight: 600;
  color: #10b981;
  font-size: 0.875rem;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.125rem;
}

.clear-button {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.clear-button:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  transform: scale(1.05);
}

/* Responsive - en móvil se hace más compacto */
@media (max-width: 640px) {
  .visit-stats {
    bottom: 0.5rem;
    right: 0.5rem;
    padding: 0.375rem 0.5rem;
    gap: 0.5rem;
  }
  
  .stats-container {
    gap: 0.5rem;
  }
  
  .stat-number {
    font-size: 0.75rem;
  }
  
  .stat-label {
    font-size: 0.5625rem;
  }
  
  .dev-badge {
    display: none; /* Ocultar badge en móvil para ahorrar espacio */
  }
}

/* Solo visible en desarrollo/localhost */
@media print {
  .visit-stats {
    display: none;
  }
}
</style>