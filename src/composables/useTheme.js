// Composable especializado para manejo de tema
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { THEME_CONFIG, STORAGE_KEYS } from '../constants/index.js'

/**
 * Composable para manejo centralizado del tema de la aplicación
 * Responsabilidad única: gestión de tema claro/oscuro
 */
export function useTheme() {
  // Estado reactivo
  const currentTheme = ref(THEME_CONFIG.LIGHT)
  const systemPrefersDark = ref(false)

  /**
   * Detecta la preferencia del sistema
   * @returns {boolean} Si el sistema prefiere tema oscuro
   */
  const detectSystemPreference = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  /**
   * Obtiene el tema guardado del localStorage
   * @returns {string|null} Tema guardado o null
   */
  const getSavedTheme = () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME_SETTING)
    } catch (error) {
      console.warn('Error leyendo tema guardado:', error)
      return null
    }
  }

  /**
   * Guarda el tema en localStorage
   * @param {string} theme - Tema a guardar
   */
  const saveTheme = (theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_SETTING, theme)
    } catch (error) {
      console.warn('Error guardando tema:', error)
    }
  }

  /**
   * Aplica el tema al documento
   * @param {string} theme - Tema a aplicar
   */
  const applyThemeToDocument = (theme) => {
    try {
      document.documentElement.setAttribute('data-theme', theme)

      // También actualizar meta theme-color para móviles
      const metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (metaThemeColor) {
        const color = theme === THEME_CONFIG.DARK ? '#1a1a1a' : '#ffffff'
        metaThemeColor.setAttribute('content', color)
      }
    } catch (error) {
      console.error('Error aplicando tema al documento:', error)
    }
  }

  /**
   * Determina el tema inicial basado en preferencias
   * @returns {string} Tema inicial
   */
  const determineInitialTheme = () => {
    const savedTheme = getSavedTheme()
    const systemPreference = detectSystemPreference()

    systemPrefersDark.value = systemPreference

    // Prioridad: tema guardado > preferencia del sistema > tema claro por defecto
    if (savedTheme && Object.values(THEME_CONFIG).includes(savedTheme)) {
      return savedTheme
    }

    return systemPreference ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT
  }

  /**
   * Inicializa el tema
   */
  const initTheme = () => {
    const initialTheme = determineInitialTheme()
    currentTheme.value = initialTheme
    applyThemeToDocument(initialTheme)
  }

  /**
   * Cambia el tema
   * @param {string} newTheme - Nuevo tema
   */
  const setTheme = (newTheme) => {
    if (!Object.values(THEME_CONFIG).includes(newTheme)) {
      console.warn(`Tema inválido: ${newTheme}`)
      return
    }

    currentTheme.value = newTheme
    applyThemeToDocument(newTheme)
    saveTheme(newTheme)
  }

  /**
   * Alterna entre tema claro y oscuro
   */
  const toggleTheme = () => {
    const newTheme = isDarkMode.value ? THEME_CONFIG.LIGHT : THEME_CONFIG.DARK
    setTheme(newTheme)
  }

  /**
   * Establece tema basado en preferencia del sistema
   */
  const setSystemTheme = () => {
    const systemTheme = detectSystemPreference() ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT
    setTheme(systemTheme)
  }

  /**
   * Maneja cambios en la preferencia del sistema
   * @param {MediaQueryListEvent} event - Evento de cambio
   */
  const handleSystemPreferenceChange = (event) => {
    systemPrefersDark.value = event.matches

    // Solo aplicar automáticamente si no hay tema guardado específico
    const savedTheme = getSavedTheme()
    if (!savedTheme) {
      const newTheme = event.matches ? THEME_CONFIG.DARK : THEME_CONFIG.LIGHT
      currentTheme.value = newTheme
      applyThemeToDocument(newTheme)
    }
  }

  /**
   * Configura listener para cambios en preferencia del sistema
   */
  const setupSystemThemeListener = () => {
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', handleSystemPreferenceChange)

      return () => {
        mediaQuery.removeEventListener('change', handleSystemPreferenceChange)
      }
    } catch (error) {
      console.warn('Error configurando listener de tema del sistema:', error)
      return () => {} // Return empty cleanup function
    }
  }

  // Computed properties
  const isDarkMode = computed(() => currentTheme.value === THEME_CONFIG.DARK)
  const isLightMode = computed(() => currentTheme.value === THEME_CONFIG.LIGHT)
  const themeIcon = computed(() => isDarkMode.value ? '🌙' : '☀️')
  const themeName = computed(() => isDarkMode.value ? 'Dark' : 'Light')

  /**
   * Información del tema actual
   */
  const themeInfo = computed(() => ({
    current: currentTheme.value,
    isDark: isDarkMode.value,
    isLight: isLightMode.value,
    systemPrefersDark: systemPrefersDark.value,
    icon: themeIcon.value,
    name: themeName.value
  }))

  // Lifecycle
  let systemThemeCleanup = null

  onMounted(() => {
    initTheme()
    systemThemeCleanup = setupSystemThemeListener()
  })

  onUnmounted(() => {
    if (systemThemeCleanup) {
      systemThemeCleanup()
    }
  })

  return {
    // Estado
    currentTheme: computed(() => currentTheme.value),
    isDarkMode,
    isLightMode,
    systemPrefersDark,
    themeInfo,

    // Métodos
    setTheme,
    toggleTheme,
    setSystemTheme,
    initTheme,

    // Utilidades
    themeIcon,
    themeName
  }
}
