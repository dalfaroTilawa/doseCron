<template>
  <div class="language-selector">
    <label v-if="label" :for="selectId" class="block text-sm font-semibold text-text-primary mb-2">
      {{ label }}
    </label>

    <div class="relative">
      <select
        :id="selectId"
        :value="currentLocale"
        class="w-full py-2 px-3 pr-8 border border-border-primary rounded-base bg-surface-primary text-text-primary transition-all duration-fast focus:outline-none focus:ring-3 focus:ring-primary-500/10 focus:border-border-focus appearance-none"
        @change="handleLanguageChange"
      >
        <option
          v-for="locale in locales"
          :key="locale.code"
          :value="locale.code"
        >
          {{ locale.flag }} {{ locale.name }}
        </option>
      </select>

      <!-- Icono de dropdown -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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

    <div v-if="helpText" class="help-text mt-2 text-sm text-text-secondary">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from '../composables/useI18n.js'

// Props
const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  customId: {
    type: String,
    default: ''
  }
})

// Composables
const { currentLocale, locales, setLocale } = useI18n()

// ID único para accesibilidad
const selectId = computed(() => props.customId || `language-selector-${Math.random().toString(36).substr(2, 9)}`)

// Event handlers
const handleLanguageChange = (event) => {
  const newLocale = event.target.value
  setLocale(newLocale)
}
</script>

<style scoped>
.language-selector select {
  cursor: pointer;
}

.language-selector select:focus {
  box-shadow: 0 0 0 3px rgba(var(--color-primary-500), 0.1);
}

.help-text {
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
