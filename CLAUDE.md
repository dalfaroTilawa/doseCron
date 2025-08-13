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

## Convenciones Específicas

### Estructura de Componentes
- **Principio de responsabilidad única**: cada componente maneja una funcionalidad específica
- **Composables para lógica compartida**: `useDateCalculator`, `useSettings`
- **Props tipados** y **eventos bien definidos**

### Gestión de Fechas
- **Siempre usar `date-fns`** para operaciones con fechas
- **Formato ISO**: `yyyy-MM-dd` para inputs y almacenamiento
- **Localización**: usar locale `es` para mostrar fechas al usuario
- **Validación**: verificar `isValid()` antes de procesar fechas

### Tema y Diseño
- **CSS custom properties** para sistema de colores consistente
- **Modo claro/oscuro** con persistencia en localStorage
- **Diseño responsive** con mobile-first approach
- **Accesibilidad**: ARIA labels, estados de focus visibles

### Validaciones
- **Tiempo real** cuando `realtimeValidation: true`
- **Mensajes descriptivos** en español
- **Advertencias no bloqueantes** vs errores críticos
- **Validación específica**: duración vs intervalo cuando `durationUnit === 'days'`

### Estado y Persistencia
- **Configuraciones del usuario** se guardan automáticamente en localStorage
- **Estados reactivos** para UI responsive
- **Manejo centralizado de errores** con sistema de notificaciones

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
- **Mensajes user-friendly** en español

### Estructura de Archivos
```
src/
├── components/           # Componentes Vue
│   ├── DateForm.vue     # Formulario principal  
│   ├── DatePicker.vue   # Selector de fechas
│   ├── ResultsList.vue  # Lista de resultados
│   └── ...
├── composables/         # Lógica reutilizable
├── services/           # APIs y servicios externos
└── App.vue            # Componente raíz
```

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