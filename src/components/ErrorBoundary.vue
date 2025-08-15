<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        ⚠️
      </div>
      <h3 class="error-title">
        {{ t('errors.boundaryTitle') }}
      </h3>
      <p class="error-message">
        {{ t('errors.boundaryMessage') }}
      </p>
      <button
        class="error-retry-btn"
        @click="retry"
      >
        {{ t('errors.retryButton') }}
      </button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '../composables/useI18n.js'

// Composables
const { t } = useI18n()

// Estado
const hasError = ref(false)
const error = ref(null)

// Props
defineProps({
  fallback: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['error'])

// Error handler
const errorCaptured = (err, instance, info) => {
  console.error('Error capturado por boundary:', err, info)
  hasError.value = true
  error.value = err
  emit('error', { error: err, info })
  return false // Previene que el error se propague
}

// Retry function
const retry = () => {
  hasError.value = false
  error.value = null
}

// Expose error handler for parent components
defineExpose({
  errorCaptured,
  retry,
  hasError
})
</script>

<script>
export default {
  name: 'ErrorBoundary',
  errorCaptured(err, instance, info) {
    // Call the setup function's error handler
    if (this.errorCaptured) {
      return this.errorCaptured(err, instance, info)
    }
    return false
  }
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 2rem;
  background-color: var(--color-error-50);
  border: 1px solid var(--color-error-200);
  border-radius: 8px;
  margin: 1rem 0;
}

.error-container {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--color-error-700);
  margin-bottom: 0.5rem;
}

.error-message {
  color: var(--color-error-600);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.error-retry-btn {
  padding: 0.5rem 1rem;
  background-color: var(--color-error-600);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.error-retry-btn:hover {
  background-color: var(--color-error-700);
}

.error-retry-btn:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-error-500), 0.3);
}
</style>
