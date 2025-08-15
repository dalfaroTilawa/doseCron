// Composable compartido para manejo de locale de date-fns
import { computed } from 'vue'
import { es, enUS } from 'date-fns/locale'
import { useI18n } from './useI18n.js'

/**
 * Composable para manejo centralizado de locale de date-fns
 * Elimina duplicación de lógica de locale en múltiples componentes
 */
export function useDateLocale() {
  const { currentLocale } = useI18n()

  /**
   * Locale actual de date-fns basado en idioma seleccionado
   */
  const dateLocale = computed(() => {
    return currentLocale.value === 'en' ? enUS : es
  })

  /**
   * Código de locale en formato string
   */
  const localeCode = computed(() => currentLocale.value)

  /**
   * Información si el locale actual es inglés
   */
  const isEnglish = computed(() => currentLocale.value === 'en')

  /**
   * Información si el locale actual es español
   */
  const isSpanish = computed(() => currentLocale.value === 'es')

  return {
    dateLocale,
    localeCode,
    isEnglish,
    isSpanish
  }
}
