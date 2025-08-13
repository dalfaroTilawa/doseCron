# 🧩 Composables de la Aplicación

## ⚙️ useSettings

Composable para manejo de configuraciones y persistencia en localStorage. Implementa patrón singleton para compartir estado entre componentes.

### 🚀 Características principales

- ✅ **Persistencia automática** en localStorage
- ✅ **Patrón singleton** para estado global compartido
- ✅ **Manejo seguro** de errores de localStorage
- ✅ **Auto-inicialización** con valores por defecto
- ✅ **Funciones específicas** para configuraciones comunes
- ✅ **Import/Export** de configuraciones
- ✅ **Watchers automáticos** para cambios importantes

### 📖 API Reference

#### Inicialización

```javascript
import { useSettings } from '@/composables/useSettings.js'

const { 
  settings, 
  saveCountry, 
  loadCountry, 
  clearSettings 
} = useSettings()
```

#### Estados Reactivos

```javascript
// Estado principal (reactivo)
settings.country              // 'CR' - País seleccionado
settings.theme               // 'light' - Tema de la aplicación
settings.language            // 'es' - Idioma
settings.excludeWeekends     // true - Excluir fines de semana
settings.excludeHolidays     // true - Excluir feriados
settings.defaultInterval     // 15 - Intervalo por defecto (días)
settings.defaultDuration     // 4 - Duración por defecto
settings.defaultDurationUnit // 'months' - Unidad por defecto

// Estados computados
isLoaded.value              // Boolean: configuraciones cargadas
error.value                // String: mensaje de error
currentCountry.value       // String: país actual
currentTheme.value         // String: tema actual
isDefaultCountry.value     // Boolean: si es país por defecto
```

#### Funciones Principales

```javascript
// Funciones específicas (compatibilidad con API solicitada)
saveCountry('CR')           // Guardar país
loadCountry()              // Cargar país guardado
clearSettings()            // Limpiar todas las configuraciones

// Funciones generales
saveSetting('theme', 'dark')        // Guardar configuración específica
loadSetting('theme', 'light')      // Cargar con valor por defecto
savePreferences({ theme: 'dark' }) // Guardar múltiples configuraciones
loadPreferences()                  // Cargar todas las configuraciones

// Utilidades
exportSettings()           // Exportar configuraciones como JSON
importSettings(config)     // Importar configuraciones
resetToDefaults()         // Resetear a valores por defecto
initializeSettings()      // Re-inicializar configuraciones
```

### 🏗️ Configuraciones por defecto

```javascript
const DEFAULT_SETTINGS = {
  country: 'CR',                    // Costa Rica
  theme: 'light',                   // Tema claro
  language: 'es',                   // Español
  excludeWeekends: true,            // Excluir fines de semana
  excludeHolidays: true,            // Excluir feriados
  defaultInterval: 15,              // 15 días de intervalo
  defaultDuration: 4,               // 4 unidades de duración
  defaultDurationUnit: 'months'     // Meses como unidad
}
```

### 💾 Claves de localStorage

```javascript
const STORAGE_KEYS = {
  COUNTRY: 'dosecron_country',
  THEME: 'dosecron_theme',
  LANGUAGE: 'dosecron_language',
  USER_PREFERENCES: 'dosecron_preferences'
}
```

### 🔧 Ejemplos de uso

#### Ejemplo básico

```javascript
import { useSettings } from '@/composables/useSettings.js'

export default {
  setup() {
    const { settings, saveCountry, clearSettings } = useSettings()

    // Cambiar país
    const changeCountry = (newCountry) => {
      saveCountry(newCountry)
      console.log('País actualizado:', settings.country)
    }

    // Limpiar configuraciones
    const reset = () => {
      clearSettings()
      console.log('Configuraciones limpiadas')
    }

    return {
      settings,
      changeCountry,
      reset
    }
  }
}
```

#### Ejemplo con configuraciones múltiples

```javascript
const { savePreferences, loadPreferences } = useSettings()

// Guardar múltiples configuraciones
savePreferences({
  country: 'ES',
  excludeWeekends: false,
  defaultInterval: 30
})

// Cargar configuraciones guardadas
const saved = loadPreferences()
console.log('Configuraciones cargadas:', saved)
```

#### Ejemplo de export/import

```javascript
const { exportSettings, importSettings } = useSettings()

// Exportar configuraciones actuales
const exported = exportSettings()
console.log('Configuraciones exportadas:', exported)

// Importar configuraciones desde archivo/API
const importedConfig = {
  country: 'MX',
  theme: 'dark',
  excludeHolidays: false
}
importSettings(importedConfig)
```

### 🛡️ Manejo de errores

El composable maneja automáticamente:

- **localStorage no disponible** (modo privado, cuotas excedidas)
- **Datos corruptos** en localStorage
- **Configuraciones inválidas** en import
- **Errores de serialización** JSON

```javascript
const { error } = useSettings()

// Verificar errores
if (error.value) {
  console.error('Error en configuraciones:', error.value)
}
```

### 🔄 Auto-sincronización

Las configuraciones importantes se sincronizan automáticamente:

```javascript
// Cambios en settings.country se guardan automáticamente
settings.country = 'ES'  // Se guarda en localStorage automáticamente
```

### 🎯 Integración con otros composables

El composable se integra automáticamente con `useDateCalculator`:

```javascript
// useDateCalculator usa automáticamente las configuraciones guardadas
const calculator = useDateCalculator() // Usa settings.country automáticamente
```

---

## 📅 useDateCalculator

Composable principal para calcular fechas recurrentes con exclusión inteligente de fines de semana y feriados.

### 🚀 Características principales

- ✅ **Cálculo de fechas recurrentes** con intervalos configurables
- ✅ **Exclusión automática** de fines de semana y feriados
- ✅ **Integración completa** con holidayApi
- ✅ **Estados reactivos** con Vue 3 Composition API
- ✅ **Cache inteligente** para optimizar rendimiento
- ✅ **Validación robusta** de configuración
- ✅ **Filtros avanzados** para análisis de datos

### 📖 API Reference

#### Inicialización

```javascript
import { useDateCalculator } from '@/composables/useDateCalculator.js'

const calculator = useDateCalculator({
  startDate: '2025-08-10',
  interval: 15,
  duration: 4,
  durationUnit: 'months',
  excludeWeekends: true,
  excludeHolidays: true,
  country: 'ES'
})
```

#### Configuración

```javascript
// Objeto de configuración reactivo
const config = {
  startDate: '2025-08-10',     // Fecha inicial (YYYY-MM-DD)
  interval: 15,                // Días entre fechas
  duration: 4,                 // Cantidad de tiempo
  durationUnit: 'months',      // 'days', 'weeks', 'months', 'years'
  excludeWeekends: true,       // Excluir sábados y domingos
  excludeHolidays: true,       // Excluir feriados
  country: 'ES'                // Código ISO del país
}
```

#### Estados Reactivos

```javascript
// Estados principales
calculator.loading.value         // Boolean: cálculo en progreso
calculator.error.value          // String: mensaje de error
calculator.calculatedDates.value // Array: fechas calculadas
calculator.config               // Object: configuración reactiva

// Computed properties
calculator.isConfigValid.value     // Boolean: configuración válida
calculator.totalDatesCalculated.value // Number: total de fechas
calculator.datesSummary.value      // Object: resumen estadístico
```

#### Funciones Principales

```javascript
// Calcular fechas
await calculator.calculateDates()

// Actualizar configuración
await calculator.updateConfig({
  interval: 30,
  excludeHolidays: false
}, true) // segundo parámetro = auto-calcular

// Resetear estado
calculator.reset()

// Obtener información de fecha específica
const dateInfo = calculator.getDateInfo('2025-08-25')

// Filtrar fechas
const workingDays = calculator.filterDates({
  onlyWorkingDays: true
})
```

### 🏗️ Estructura de datos

#### Objeto de fecha calculada

```javascript
{
  date: Date,                    // Objeto Date nativo
  dateString: "2025-08-10",      // Fecha como string (YYYY-MM-DD)
  formatted: "10/08/2025",       // Fecha formateada (DD/MM/YYYY)
  dayName: "domingo",            // Nombre completo del día
  dayNameShort: "dom",           // Nombre abreviado del día
  dayOfWeek: 0,                  // Número del día (0=domingo)
  isWeekend: true,               // Si es fin de semana
  isHoliday: false,              // Si es feriado
  holiday: null,                 // Información del feriado (si aplica)
  intervalNumber: 1              // Número de intervalo
}
```

#### Resumen estadístico

```javascript
{
  total: 16,                     // Total de fechas calculadas
  workingDays: 12,               // Días laborales
  weekends: 3,                   // Fines de semana
  holidays: 1,                   // Feriados
  firstDate: Date,               // Primera fecha
  lastDate: Date                 // Última fecha
}
```

### 🔧 Ejemplos de uso

#### Ejemplo básico

```javascript
import { useDateCalculator } from '@/composables/useDateCalculator.js'

export default {
  setup() {
    const calculator = useDateCalculator({
      startDate: '2025-01-01',
      interval: 7,
      duration: 3,
      durationUnit: 'months',
      excludeWeekends: true,
      country: 'ES'
    })

    // Calcular fechas al montar
    onMounted(async () => {
      await calculator.calculateDates()
    })

    return {
      calculator
    }
  }
}
```

#### Ejemplo con filtros

```javascript
// Obtener solo días laborales
const workingDays = calculator.filterDates({
  onlyWorkingDays: true
})

// Obtener fechas en un rango específico
const rangeFilter = calculator.filterDates({
  startDate: '2025-01-01',
  endDate: '2025-03-31'
})

// Obtener solo feriados
const holidays = calculator.filterDates({
  onlyHolidays: true
})
```

#### Ejemplo con configuración dinámica

```javascript
// Cambiar intervalo dinámicamente
const changeInterval = async (newInterval) => {
  await calculator.updateConfig({
    interval: newInterval
  })
}

// Cambiar país y recalcular
const changeCountry = async (countryCode) => {
  await calculator.updateConfig({
    country: countryCode,
    excludeHolidays: !!countryCode
  })
}
```

### ⚙️ Configuración avanzada

#### Unidades de duración

- **`days`**: Días calendarios
- **`weeks`**: Semanas (7 días)
- **`months`**: Meses calendarios
- **`years`**: Años calendarios

#### Lógica de exclusión

1. **Fines de semana**: Sábados (6) y domingos (0)
2. **Feriados**: Basados en API de Nager.Date por país
3. **Avance automático**: Si una fecha calculada cae en día excluido, avanza al siguiente día válido

#### Ejemplo de avance automático

```javascript
// Configuración: cada 7 días, excluyendo fines de semana
// Si la fecha calculada es sábado, avanza a lunes
startDate: '2025-01-01' (miércoles)
interval: 7
// Resultado: 01/01 (miércoles) → 08/01 (miércoles) → 15/01 (miércoles)
```

### 🎯 Casos de uso

#### 1. Dosificación médica
```javascript
const medication = useDateCalculator({
  startDate: '2025-01-01',
  interval: 3,              // Cada 3 días
  duration: 30,
  durationUnit: 'days',
  excludeWeekends: false,   // Medicación todos los días
  excludeHolidays: false
})
```

#### 2. Citas de seguimiento
```javascript
const appointments = useDateCalculator({
  startDate: '2025-01-01',
  interval: 14,             // Cada 2 semanas
  duration: 6,
  durationUnit: 'months',
  excludeWeekends: true,    // Solo días laborales
  excludeHolidays: true,
  country: 'ES'
})
```

#### 3. Eventos recurrentes
```javascript
const events = useDateCalculator({
  startDate: '2025-01-01',
  interval: 1,
  duration: 52,
  durationUnit: 'weeks',    // Cada semana por 1 año
  excludeWeekends: false,
  excludeHolidays: true,
  country: 'US'
})
```

### 🔍 Debugging y testing

#### Funciones internas disponibles

```javascript
// Acceso a funciones internas para testing
const { _internal } = calculator

// Calcular fecha final
const endDate = _internal.calculateEndDate(new Date())

// Verificar exclusiones
const exclusions = _internal.checkExclusions(new Date(), holidaysMap)

// Obtener siguiente día válido
const nextValid = _internal.getNextValidDate(new Date(), holidaysMap)

// Ver cache de feriados
console.log(_internal.holidaysCache.value)
```

#### Logging

El composable incluye logging automático para:
- Errores de cálculo
- Advertencias de días no válidos
- Cache hits/misses de feriados

### 🚨 Manejo de errores

```javascript
try {
  await calculator.calculateDates()
} catch (error) {
  // Error automáticamente capturado en calculator.error.value
  console.error('Error de cálculo:', calculator.error.value)
}
```

#### Errores comunes

- **"Configuración inválida"**: Verificar startDate, interval > 0, duration > 0
- **"Fecha inicial inválida"**: Formato debe ser YYYY-MM-DD
- **"Demasiadas fechas generadas"**: Revisar duración e intervalo
- **Errores de feriados**: Problemas de conectividad o país no soportado

### 📈 Performance

- **Cache de feriados**: Evita peticiones duplicadas a API
- **Cálculo lazy**: Solo calcula cuando se solicita
- **Límites de seguridad**: Máximo 1000 fechas por cálculo
- **Optimización de memoria**: Limpieza automática de cache interno

### 🔄 Próximas mejoras

- [ ] Soporte para múltiples intervalos
- [ ] Cálculo en background con Web Workers  
- [ ] Exportación a formatos (CSV, ICS)
- [ ] Timezone awareness
- [ ] Patrones de recurrencia complejos (cada 2do martes, etc.)
