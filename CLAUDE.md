# CLAUDE.md - DoseCron

> Extiende: [CLAUDE.md Global](C:\Users\dougl\.claude\CLAUDE.md)

## Contexto del Proyecto

**DoseCron** es una aplicación web para calcular fechas recurrentes con exclusión inteligente de fines de semana y feriados.

- **Dominio**: Calculadora de fechas médicas/administrativas
- **Usuarios**: Profesionales que necesitan programar dosis, citas o eventos recurrentes
- **Objetivo**: Generar listas de fechas precisas respetando calendarios laborales

## Stack Tecnológico

- **Frontend**: Vue.js 3 (Composition API)
- **Librerías principales**: 
  - `date-fns` para manipulación de fechas
  - `date-fns/locale` para localización en español
- **Estilo**: CSS moderno con custom properties y design system
- **Estado**: Reactive data con Vue 3 reactivity
- **Persistencia**: localStorage para configuraciones del usuario

## Diagrama de Arquitectura

### Representación Visual de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DoseCron - Arquitectura Frontend                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🎨 COMPONENTS LAYER                                                │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  App.vue (Raíz)                                             │    │
│  │    ├─→ DateForm.vue (Formulario Principal)                  │    │
│  │    │     ├─→ DatePicker.vue (Selector Fechas)              │    │
│  │    │     └─→ ResultsList.vue (Lista Resultados)            │    │
│  │    ├─→ ThemeToggle.vue (Cambio Tema)                       │    │
│  │    └─→ LanguageSelector.vue (Selector Idioma)             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                 ↓                                   │
│  🔧 COMPOSABLES LAYER                                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • useDateCalculator() ←─ Lógica de cálculo de fechas       │    │
│  │  • useSettings() ←─ Persistencia de configuraciones         │    │
│  │  • useTheme() ←─ Manejo de tema claro/oscuro               │    │
│  │  • useI18n() ←─ Internacionalización extendida             │    │
│  │  • useValidation() ←─ Validaciones de formulario           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                 ↓                                   │
│  ⚙️ SERVICES LAYER                                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • DateService ←─ Wrapper de date-fns                      │    │
│  │  • HolidayService ←─ Integración API feriados              │    │
│  │  • StorageService ←─ Abstracción localStorage              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                 ↓                                   │
│  🌐 EXTERNAL DEPENDENCIES                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • date-fns (Manipulación fechas)                          │    │
│  │  • date-fns/locale/es (Localización)                       │    │
│  │  • Holiday API (Feriados por país)                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  💾 BROWSER STORAGE                                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  localStorage (Configuraciones de usuario)                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Flujo de Datos Principal

```
👤 Usuario interactúa con DateForm.vue
         ↓
🔧 DateForm usa useDateCalculator() y useValidation()
         ↓
⚙️ useDateCalculator() consume DateService y HolidayService
         ↓
🌐 DateService procesa con date-fns + localización
🌐 HolidayService consulta API externa de feriados
         ↓
📊 Resultados calculados se muestran en ResultsList.vue
         ↓
💾 Configuraciones se persisten vía useSettings() → StorageService
```

## Comandos Frecuentes

### Desarrollo
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

### Linting y Formato
```bash
# Linting
npm run lint

# Fix automático
npm run lint:fix

# Formateo con Prettier (si está configurado)
npm run format
```

### Testing
```bash
# Ejecutar tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## Patrones Específicos del Proyecto

### Composables
- **useDateCalculator**: Lógica central de cálculo de fechas
- **useSettings**: Persistencia de configuraciones
- **useI18n**: Internacionalización con funciones especializadas
- Seguir patrón: `const { state, actions } = useComposable()`

### Componentes de Formulario
- **Props bien tipados** con defaults
- **Emit events** para comunicación padre-hijo
- **Validación interna** + emit de errores
- **Help text descriptivo** para UX

### Manejo de Errores
- **Errores locales**: fieldErrors reactive object
- **Errores globales**: globalError ref + notificaciones
- **Try-catch** en operaciones async
- **Mensajes user-friendly** localizados según idioma activo

### Estructura de Archivos
```
src/
├── components/           # Componentes Vue
│   ├── DateForm.vue     # Formulario principal  
│   ├── DatePicker.vue   # Selector de fechas
│   ├── ResultsList.vue  # Lista de resultados
│   ├── LanguageSelector.vue # Selector de idioma
│   └── ...
├── composables/         # Lógica reutilizable
│   ├── useDateCalculator.js
│   ├── useSettings.js
│   ├── useI18n.js      # Composable de i18n extendido
│   └── ...
├── locales/            # Archivos de internacionalización
│   ├── index.js        # Configuración central
│   ├── es.js          # Traducciones en español
│   ├── en.js          # Traducciones en inglés
│   └── ...
├── plugins/            # Plugins de Vue
│   ├── i18n.js        # Configuración Vue I18n
│   └── ...
├── services/           # APIs y servicios externos
└── App.vue            # Componente raíz
```

## Convenciones de Internacionalización

### Estructura de Traducciones
```javascript
// Organización jerárquica por contexto
{
  app: { title, subtitle, description },
  form: { 
    basicConfig, 
    fields: { startDate: { label, helpText, required } }
  },
  validation: { required, invalidDate, minNumber },
  errors: { calculation, network, generic },
  warnings: { noCountry, longInterval }
}
```

### Uso del Composable useI18n
```javascript
// En componentes Vue
const { t, validateMessage, errorMessage, fieldLabel } = useI18n()

// Traducción general
{{ t('form.basicConfig') }}

// Traducción con contexto específico
{{ validateMessage('required') }}  // validation.required
{{ errorMessage('calculation') }}  // errors.calculation
{{ fieldLabel('startDate', 'label') }}  // form.fields.startDate.label
```

### Interpolación de Parámetros
```javascript
// Con parámetros dinámicos
{{ t('validation.minNumber', { min: 1 }) }}
{{ t('warnings.durationShorterThanInterval', { duration: 5, interval: 7 }) }}

// Pluralización automática
{{ formatInterval(7) }}  // "Cada 7 días"
{{ formatTimeUnit(1, 'month') }}  // "mes" vs "meses"
```

### Persistencia y Detección
- **Detección automática**: `getBrowserLocale()` con fallback a español
- **Persistencia**: `localStorage.setItem('dosecron-locale', code)`
- **Cambio dinámico**: `setLocale(newCode)` actualiza toda la UI

### Convenciones de Claves
- **Kebab-case** para archivos: `es.js`, `en.js`
- **camelCase** para propiedades: `startDate`, `helpText`
- **Contexto específico**: `form.fields.*.label` vs `validation.*`
- **Interpolación clara**: `{count}`, `{min}`, `{max}`, `{duration}`

## Consideraciones de Mantenimiento

### Refactoring Triggers Específicos
- **Función de cálculo** con más de 15 líneas → extraer a composable
- **Validaciones duplicadas** → crear validador reutilizable
- **Estilos repetidos** → consolidar en custom properties
- **Lógica de tema** dispersa → centralizar en composable

### Testing Prioritario
1. **Cálculo de fechas recurrentes** (lógica crítica)
2. **Validaciones de formulario** (experiencia usuario)
3. **Persistencia de configuraciones** (funcionalidad esperada)
4. **Manejo de feriados por país** (integración externa)

### Performance Considerations
- **Computed properties** para cálculos derivados
- **Debounce** en validaciones tiempo real si es necesario
- **Lazy loading** de países para selector
- **Memoización** en cálculos complejos de fechas

---

*Última actualización: 2025-08-13*