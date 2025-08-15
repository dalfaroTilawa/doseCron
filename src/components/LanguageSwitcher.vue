<template>
  <div class="language-switcher">
    <div
      :class="[
        'flex items-center bg-surface-secondary/50 rounded-full p-1 border border-border-light',
        size === 'small' ? 'gap-1' : 'gap-1.5 sm:gap-2'
      ]"
    >
      <!-- Botón Español -->
      <button
        type="button"
        :class="[
          'flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          sizeClasses,
          currentLocale === 'es'
            ? 'bg-primary-500 shadow-md transform scale-110 ring-2 ring-primary-500/30'
            : 'bg-surface-primary hover:bg-surface-hover border border-border-light'
        ]"
        :title="t('theme.español')"
        :aria-label="t('theme.cambiarAEspañol')"
        @click="switchToSpanish"
      >
        <span
          :class="[
            'leading-none select-none',
            size === 'small' ? 'text-sm' : 'text-base sm:text-lg'
          ]"
        >🇪🇸</span>
      </button>

      <!-- Separador visual -->
      <div
        :class="[
          'bg-border-light',
          size === 'small' ? 'w-px h-2' : 'w-px h-3 sm:h-4'
        ]"
      />

      <!-- Botón Inglés -->
      <button
        type="button"
        :class="[
          'flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          sizeClasses,
          currentLocale === 'en'
            ? 'bg-primary-500 shadow-md transform scale-110 ring-2 ring-primary-500/30'
            : 'bg-surface-primary hover:bg-surface-hover border border-border-light'
        ]"
        :title="t('theme.english')"
        :aria-label="t('theme.cambiarAIngles')"
        @click="switchToEnglish"
      >
        <span
          :class="[
            'leading-none select-none',
            size === 'small' ? 'text-sm' : 'text-base sm:text-lg'
          ]"
        >🇬🇧</span>
      </button>
    </div>

    <!-- Tooltip opcional con el idioma actual -->
    <div
      v-if="showTooltip"
      class="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-surface-primary border border-border-primary rounded-lg px-3 py-1 text-sm text-text-secondary shadow-lg z-50"
    >
      {{ t(`languages.${currentLocale}`) }}
      <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-primary border-l border-t border-border-primary rotate-45" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from '../composables/useI18n.js'

// Props
const props = defineProps({
  showTooltip: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'normal', // normal | small | large
    validator: (value) => ['small', 'normal', 'large'].includes(value)
  }
})

// Composables
const { currentLocale, currentLocaleInfo, setLocale, t } = useI18n()

// Estado para tooltip temporal
const showTooltipTemp = ref(false)

// Funciones para cambiar idioma
const switchToSpanish = () => {
  setLocale('es')
  showTemporaryTooltip()
}

const switchToEnglish = () => {
  setLocale('en')
  showTemporaryTooltip()
}

// Mostrar tooltip temporalmente al cambiar idioma
const showTemporaryTooltip = () => {
  if (!props.showTooltip) {
    showTooltipTemp.value = true
    setTimeout(() => {
      showTooltipTemp.value = false
    }, 1500)
  }
}

// Tooltip mostrado
const showTooltip = computed(() => props.showTooltip || showTooltipTemp.value)

// Clases de tamaño
const sizeClasses = computed(() => {
  const sizes = {
    small: 'w-6 h-6 text-sm',
    normal: 'w-8 h-8 text-lg',
    large: 'w-10 h-10 text-xl'
  }
  return sizes[props.size] || sizes.normal
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

/* Animación suave para los botones */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: scale(1.1);
}

button:active {
  transform: scale(1.05);
}

/* Efecto de selección más pronunciado */
button.selected {
  box-shadow: 0 4px 12px rgba(var(--color-primary-500), 0.3);
}

/* Tooltip con animación */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
}
</style>
