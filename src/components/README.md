# 🧩 Componentes de la Aplicación

## 📅 DatePicker

Componente Vue para selección de fechas con validación, estilos consistentes y soporte completo para v-model.

### 🚀 Características principales

- ✅ **Input type="date" estilizado** con diseño personalizado
- ✅ **Validación integrada** - fecha requerida, fechas mín/máx, restricciones
- ✅ **Soporte v-model completo** con eventos de cambio
- ✅ **Información de fecha** formateada en español
- ✅ **Restricciones de fecha** - pasadas/futuras, rangos personalizados
- ✅ **Accesibilidad completa** y navegación por teclado
- ✅ **Estilos consistentes** con el diseño de la aplicación
- ✅ **Cross-browser** compatible (Chrome, Firefox, Safari, Edge)

### 📖 API Reference

#### Props

```javascript
{
  // Valor del v-model (fecha en formato YYYY-MM-DD)
  modelValue: {
    type: String,
    default: ''
  },
  
  // Etiqueta del campo
  label: {
    type: String,
    default: 'Fecha'
  },
  
  // Campo requerido
  required: {
    type: Boolean,
    default: false
  },
  
  // Campo deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Fecha mínima (YYYY-MM-DD)
  min: {
    type: String,
    default: ''
  },
  
  // Fecha máxima (YYYY-MM-DD)
  max: {
    type: String,
    default: ''
  },
  
  // Mensaje de error externo
  errorMessage: {
    type: String,
    default: ''
  },
  
  // Texto de ayuda
  helpText: {
    type: String,
    default: ''
  },
  
  // Mostrar información de la fecha
  showDateInfo: {
    type: Boolean,
    default: false
  },
  
  // Permitir fechas pasadas
  allowPastDates: {
    type: Boolean,
    default: true
  },
  
  // Permitir fechas futuras
  allowFutureDates: {
    type: Boolean,
    default: true
  },
  
  // Validar al perder foco
  validateOnBlur: {
    type: Boolean,
    default: true
  }
}
```

#### Eventos

```javascript
// Evento para v-model
@update:modelValue - (value: string) => void

// Evento de cambio con información completa
@change - (data: {
  value: string,          // Fecha en formato YYYY-MM-DD
  date: Date|null,        // Objeto Date parseado
  isValid: boolean,       // Si la fecha es válida
  formatted: string,      // Fecha formateada para mostrar
  event: Event           // Evento DOM original
}) => void

// Eventos de foco
@focus - (data: { value: string, event: Event }) => void
@blur - (data: { value: string, date: Date|null, isValid: boolean, event: Event }) => void

// Evento de error
@error - (error: Error) => void
```

#### Métodos expuestos

```javascript
// Establecer fecha de hoy
setToday() => void

// Limpiar fecha
clear() => void

// Validar manualmente
validate() => boolean

// Propiedades computadas expuestas
isValid           // Boolean: si la fecha es válida
hasError          // Boolean: si hay errores
parsedDate        // Date|null: fecha parseada
formattedDateInfo // String: información formateada
```

### 🔧 Ejemplos de uso

#### Uso básico

```vue
<template>
  <DatePicker
    v-model="selectedDate"
    label="Fecha de nacimiento"
    required
    @change="onDateChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker.vue'

const selectedDate = ref('')

const onDateChange = (data) => {
  if (data.isValid) {
    console.log('Fecha seleccionada:', data.formatted)
  }
}
</script>
```

#### Con validación y restricciones

```vue
<template>
  <DatePicker
    v-model="appointmentDate"
    label="Fecha de cita"
    help-text="Selecciona una fecha futura para tu cita"
    :min="minDate"
    :max="maxDate"
    :allow-past-dates="false"
    required
    show-date-info
    @change="validateAppointment"
  />
</template>

<script setup>
import { ref, computed } from 'vue'

const appointmentDate = ref('')

// Solo permitir citas en los próximos 3 meses
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const threeMonths = new Date()
  threeMonths.setMonth(threeMonths.getMonth() + 3)
  return threeMonths.toISOString().split('T')[0]
})

const validateAppointment = (data) => {
  if (data.isValid) {
    console.log('Cita programada para:', data.formatted)
  }
}
</script>
```

#### Con botones de acción

```vue
<template>
  <div>
    <DatePicker
      ref="datePickerRef"
      v-model="eventDate"
      label="Fecha del evento"
      show-date-info
      @change="onEventDateChange"
    />
    
    <div class="date-actions">
      <button @click="setToday">📅 Hoy</button>
      <button @click="setTomorrow">⏭️ Mañana</button>
      <button @click="clearDate">🗑️ Limpiar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const datePickerRef = ref()
const eventDate = ref('')

const setToday = () => {
  datePickerRef.value.setToday()
}

const setTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  eventDate.value = tomorrow.toISOString().split('T')[0]
}

const clearDate = () => {
  datePickerRef.value.clear()
}

const onEventDateChange = (data) => {
  console.log('Fecha del evento:', data.formatted)
}
</script>
```

### 🎨 Personalización

El componente hereda los estilos del diseño principal pero puede personalizarse:

```css
/* Personalizar colores */
.date-picker .date-input {
  border-color: #your-color;
}

.date-picker .date-input:focus {
  border-color: #your-focus-color;
  box-shadow: 0 0 0 3px rgba(your-color, 0.1);
}

/* Personalizar icono */
.date-picker .calendar-icon {
  color: #your-icon-color;
}
```

### 🛡️ Validación

El componente incluye múltiples niveles de validación:

1. **Validación nativa HTML5** - formato de fecha
2. **Validación personalizada** - fechas mín/máx, restricciones
3. **Validación de negocio** - lógica específica de la aplicación

```javascript
// Ejemplo de validación personalizada
const validateBusinessLogic = (date) => {
  // No permitir fines de semana
  const dayOfWeek = date.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'No se permiten fines de semana'
  }
  
  // No permitir días festivos
  if (isHoliday(date)) {
    return 'No se permiten días festivos'
  }
  
  return '' // Válido
}
```

### 📱 Compatibilidad

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **Fallback**: Input text en navegadores sin soporte para type="date"

### 🌙 Modo oscuro

Soporte automático para modo oscuro usando `prefers-color-scheme`.

---

## ⚙️ FilterOptions

Componente Vue para opciones de filtrado con checkboxes estilizados y soporte dual v-model.

### 🚀 Características principales

- ✅ **Dual v-model** - Soporte independiente para ambos checkboxes
- ✅ **Layout responsive** - Horizontal y vertical automático
- ✅ **Estados avanzados** - Deshabilitado, ayuda contextual
- ✅ **Eventos específicos** - `@update:excludeWeekends` y `@update:excludeHolidays`
- ✅ **Controles programáticos** - Funciones para manejar estado
- ✅ **Accesibilidad completa** - ARIA labels, focus management
- ✅ **Estilos consistentes** - Integrado con el diseño de la app

### 📖 API Reference

#### Props

```javascript
{
  // Valores de los checkboxes (v-model)
  excludeWeekends: {
    type: Boolean,
    default: false
  },
  
  excludeHolidays: {
    type: Boolean,
    default: false
  },
  
  // Configuración visual
  title: {
    type: String,
    default: ''
  },
  
  layout: {
    type: String,
    default: 'horizontal', // 'horizontal' | 'vertical'
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  },
  
  // Estados
  weekendsDisabled: {
    type: Boolean,
    default: false
  },
  
  holidaysDisabled: {
    type: Boolean,
    default: false
  },
  
  // Textos de ayuda
  weekendsHelpText: {
    type: String,
    default: ''
  },
  
  holidaysHelpText: {
    type: String,
    default: ''
  },
  
  // Funcionalidades adicionales
  showSummary: {
    type: Boolean,
    default: false
  },
  
  customIdPrefix: {
    type: String,
    default: ''
  }
}
```

#### Eventos

```javascript
// Eventos para v-model dual
@update:excludeWeekends - (value: boolean) => void
@update:excludeHolidays - (value: boolean) => void

// Evento de cambio unificado
@change - (data: {
  type: 'weekends' | 'holidays' | 'all',
  excludeWeekends: boolean,
  excludeHolidays: boolean,
  event?: Event
}) => void
```

#### Métodos expuestos

```javascript
// Obtener estado actual
getState() => {
  excludeWeekends: boolean,
  excludeHolidays: boolean,
  bothActive: boolean,
  noneActive: boolean
}

// Establecer ambos valores
setAll(weekends: boolean, holidays: boolean) => void

// Resetear todo
reset() => void

// Activar todo
selectAll() => void
```

### 🔧 Ejemplos de uso

#### Uso básico con v-model dual

```vue
<template>
  <FilterOptions
    v-model:exclude-weekends="weekends"
    v-model:exclude-holidays="holidays"
    title="Opciones de exclusión"
    @change="onFilterChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import FilterOptions from '@/components/FilterOptions.vue'

const weekends = ref(false)
const holidays = ref(true)

const onFilterChange = (data) => {
  console.log('Filtros:', data.excludeWeekends, data.excludeHolidays)
}
</script>
```

#### Con layout vertical y ayuda

```vue
<template>
  <FilterOptions
    v-model:exclude-weekends="settings.weekends"
    v-model:exclude-holidays="settings.holidays"
    title="Configuración de exclusiones"
    layout="vertical"
    show-summary
    weekends-help-text="Sábados y domingos serán omitidos"
    holidays-help-text="Días festivos del país seleccionado"
    @change="updateSettings"
  />
</template>

<script setup>
const settings = reactive({
  weekends: true,
  holidays: false
})

const updateSettings = (data) => {
  // Guardar configuración automáticamente
  localStorage.setItem('filters', JSON.stringify(data))
}
</script>
```

#### Con estados deshabilitados y controles

```vue
<template>
  <FilterOptions
    ref="filterRef"
    v-model:exclude-weekends="filters.weekends"
    v-model:exclude-holidays="filters.holidays"
    title="Filtros avanzados"
    :holidays-disabled="!countrySelected"
    holidays-help-text="Requiere seleccionar un país"
    show-summary
    @change="onFiltersChange"
  />
  
  <div class="filter-actions">
    <button @click="selectAll">Seleccionar todo</button>
    <button @click="clearAll">Limpiar todo</button>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const filterRef = ref()
const countrySelected = ref(false)
const filters = reactive({
  weekends: false,
  holidays: false
})

const selectAll = () => {
  filterRef.value.selectAll()
}

const clearAll = () => {
  filterRef.value.reset()
}

const onFiltersChange = (data) => {
  console.log('Nuevo estado:', data)
}
</script>
```

#### Integración con formularios

```vue
<template>
  <form @submit="handleSubmit">
    <FilterOptions
      v-model:exclude-weekends="form.excludeWeekends"
      v-model:exclude-holidays="form.excludeHolidays"
      title="Opciones de cálculo"
      show-summary
      @change="validateForm"
    />
    
    <button type="submit" :disabled="!isFormValid">
      Calcular fechas
    </button>
  </form>
</template>

<script setup>
const form = reactive({
  excludeWeekends: true,
  excludeHolidays: true,
  // otros campos...
})

const isFormValid = ref(true)

const validateForm = (data) => {
  // Lógica de validación personalizada
  if (data.excludeHolidays && !form.country) {
    isFormValid.value = false
    alert('Selecciona un país para excluir feriados')
  } else {
    isFormValid.value = true
  }
}
</script>
```

### 🎨 Personalización

```css
/* Personalizar colores de checkboxes */
.filter-options .checkmark {
  border-color: #your-color;
}

.filter-options .filter-checkbox:checked + .checkmark {
  background-color: #your-accent;
  border-color: #your-accent;
}

/* Personalizar hover states */
.filter-options .filter-option:hover {
  background-color: #your-hover-bg;
}
```

### 🛡️ Accesibilidad

- **ARIA labels** completos para screen readers
- **Focus management** con estilos visibles
- **Keyboard navigation** optimizada
- **IDs únicos** para múltiples instancias
- **Help text** asociado correctamente

### 📱 Responsive

- **Layout automático** en móviles (horizontal → vertical)
- **Touch-friendly** con áreas de toque amplias
- **Font-size adaptive** para diferentes pantallas

---

## 🌍 CountrySelector

Componente Vue dropdown para selección de países con integración completa con el servicio `holidayApi` y soporte para v-model.

### 🚀 Características principales

- ✅ **Integración con holidayApi** - Obtiene países automáticamente
- ✅ **Soporte v-model** completo con emit de eventos
- ✅ **Ordenación alfabética** de países en español
- ✅ **Estados de carga** con spinner animado
- ✅ **Accesibilidad completa** (ARIA, roles, labels)
- ✅ **Estilos responsive** y modo oscuro
- ✅ **Validación integrada** con mensajes de error
- ✅ **Múltiples variantes** (básico, requerido, con ayuda)

### 📖 API Reference

#### Props

```javascript
{
  // Valor del v-model (código ISO del país)
  modelValue: {
    type: String,
    default: ''
  },
  
  // Etiqueta del campo
  label: {
    type: String,
    default: 'País'
  },
  
  // Texto del placeholder
  placeholder: {
    type: String,
    default: 'Selecciona un país'
  },
  
  // Campo requerido
  required: {
    type: Boolean,
    default: false
  },
  
  // Campo deshabilitado
  disabled: {
    type: Boolean,
    default: false
  },
  
  // Mensaje de error externo
  errorMessage: {
    type: String,
    default: ''
  },
  
  // Texto de ayuda
  helpText: {
    type: String,
    default: ''
  },
  
  // Mostrar información del país seleccionado
  showSelectedInfo: {
    type: Boolean,
    default: false
  },
  
  // ID personalizado
  customId: {
    type: String,
    default: ''
  }
}
```

#### Eventos

```javascript
// Evento para v-model
@update:modelValue - (code: string) => void

// Evento de cambio con información completa
@change - (data: {
  code: string,           // Código ISO del país
  country: Object|null,   // Objeto completo del país
  event: Event           // Evento DOM original
}) => void

// Evento de error
@error - (error: Error) => void
```

#### Métodos expuestos

```javascript
// Recargar lista de países
reload() => Promise<void>

// Obtener país por código
getCountryByCode(code: string) => Object|null

// Propiedades computadas expuestas
countries          // Array de países
selectedCountry    // País actualmente seleccionado
isLoading         // Estado de carga
hasError          // Si hay errores
```

### 🔧 Ejemplos de uso

#### Uso básico

```vue
<template>
  <CountrySelector
    v-model="selectedCountry"
    label="Selecciona tu país"
    placeholder="Elige un país..."
    @change="onCountryChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import CountrySelector from '@/components/CountrySelector.vue'

const selectedCountry = ref('')

const onCountryChange = (data) => {
  console.log('País seleccionado:', data.country.name)
  console.log('Código:', data.code)
}
</script>
```

#### Campo requerido con validación

```vue
<template>
  <CountrySelector
    v-model="country"
    label="País de residencia"
    placeholder="Selecciona tu país de residencia"
    required
    :error-message="countryError"
    @change="validateCountry"
  />
</template>

<script setup>
import { ref } from 'vue'

const country = ref('')
const countryError = ref('')

const validateCountry = (data) => {
  if (!data.code) {
    countryError.value = 'El país es requerido'
  } else {
    countryError.value = ''
    console.log('País válido:', data.country.name)
  }
}
</script>
```

#### Con texto de ayuda e información

```vue
<template>
  <CountrySelector
    v-model="holidayCountry"
    label="País para feriados"
    help-text="Selecciona tu país para calcular feriados locales automáticamente"
    show-selected-info
    @change="onHolidayCountryChange"
  />
</template>

<script setup>
const holidayCountry = ref('CR') // Costa Rica por defecto

const onHolidayCountryChange = (data) => {
  // Lógica para actualizar feriados
  if (data.code) {
    console.log(`Cargando feriados para ${data.country.name}`)
  }
}
</script>
```

#### Integración con formularios

```vue
<template>
  <form @submit="handleSubmit">
    <CountrySelector
      v-model="form.country"
      label="País de origen"
      required
      :error-message="errors.country"
      :disabled="isSubmitting"
      @change="clearCountryError"
    />
    
    <button type="submit" :disabled="!isFormValid">
      Enviar
    </button>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const form = ref({
  country: ''
})

const errors = ref({
  country: ''
})

const isSubmitting = ref(false)

const isFormValid = computed(() => {
  return form.value.country && !errors.value.country
})

const clearCountryError = () => {
  errors.value.country = ''
}

const handleSubmit = (event) => {
  event.preventDefault()
  
  // Validar
  if (!form.value.country) {
    errors.value.country = 'Selecciona un país'
    return
  }
  
  // Procesar formulario
  console.log('Formulario válido:', form.value)
}
</script>
```

### 🎨 Personalización de estilos

#### Variables CSS disponibles

```css
/* El componente usa CSS variables que puedes personalizar */
.country-selector {
  --country-border-color: #d1d5db;
  --country-border-focus: #667eea;
  --country-border-error: #ef4444;
  --country-bg: #ffffff;
  --country-text: #374151;
  --country-placeholder: #9ca3af;
}

/* Ejemplo de personalización */
.my-custom-selector {
  --country-border-focus: #10b981; /* Verde en lugar de azul */
  --country-border-error: #f59e0b;  /* Naranja en lugar de rojo */
}
```

#### Clases CSS personalizables

```css
/* Wrapper principal */
.country-selector { }

/* Label del campo */
.country-label { }

/* Wrapper del select */
.country-select-wrapper { }

/* Select element */
.country-select { }

/* Estados del select */
.country-select.has-error { }
.country-select.is-loading { }
.country-select:disabled { }

/* Iconos */
.dropdown-icon { }
.loading-spinner { }

/* Mensajes */
.error-message { }
.help-text { }
.selected-info { }
```

### 🛡️ Accesibilidad

El componente implementa las mejores prácticas de accesibilidad:

- **ARIA labels** y **roles** apropiados
- **aria-describedby** para asociar errores y ayuda
- **aria-invalid** para estados de error
- **aria-required** para campos requeridos
- **Focus management** con estilos visibles
- **Screen reader** compatible
- **Keyboard navigation** completa

### 📱 Responsividad

- **Mobile-first** design
- **Touch-friendly** en dispositivos móviles
- **Font-size optimization** para iOS (previene zoom)
- **Flexible layout** que se adapta al contenedor
- **Reduced motion** support para usuarios sensibles

### 🌙 Modo oscuro

Soporte automático para modo oscuro usando `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  /* Estilos automáticos para modo oscuro */
}
```

### 🔧 Integración con servicios

El componente se integra automáticamente con:

- **holidayApi.getCountries()** - Para obtener lista de países
- **Ordenación en español** - Usando `localeCompare`
- **Cache automático** - Los países se cargan una vez
- **Error handling** - Manejo robusto de errores de API

### 🚨 Manejo de errores

```javascript
// El componente maneja automáticamente:
// - Errores de carga de países
// - Códigos de país inválidos
// - Estados de carga
// - Validación de props

// Escuchar errores
<CountrySelector @error="handleError" />

const handleError = (error) => {
  console.error('Error en CountrySelector:', error)
  // Mostrar notificación al usuario
}
```

### 🎯 Casos de uso

1. **Formularios de registro** - Selección de país de origen
2. **Configuración de feriados** - País para calcular feriados
3. **Preferencias de usuario** - Guardar país preferido
4. **Filtros de búsqueda** - Filtrar por país
5. **Configuración de aplicación** - País por defecto

### 📊 Performance

- **Carga lazy** de países (solo cuando se monta)
- **Ordenación optimizada** una sola vez
- **Eventos eficientes** sin re-renders innecesarios
- **Memory efficient** - Cleanup automático
- **SSR compatible** - Funciona con server-side rendering

### 🔄 Próximas mejoras

- [ ] Búsqueda/filtrado de países
- [ ] Agrupación por regiones
- [ ] Soporte para banderas de países
- [ ] Múltiple selección de países
- [ ] Integración con APIs de geocoding
