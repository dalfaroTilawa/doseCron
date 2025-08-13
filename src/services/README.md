# 🏗️ Servicios de la Aplicación

## 📅 Holiday API Service

Servicio para gestionar la API de feriados de [Nager.Date](https://date.nager.at/) con cache inteligente y manejo robusto de errores.

### 🚀 Características principales

- ✅ **Cache inteligente** en localStorage con TTL de 7 días
- ✅ **Manejo de errores** completo con timeouts y reconexión
- ✅ **54 países soportados** con códigos ISO estándar
- ✅ **Funciones utilitarias** para verificación y estadísticas
- ✅ **Optimización de rendimiento** evitando peticiones duplicadas

### 📖 API Reference

#### `getCountries()`
Obtiene la lista de países soportados.

```javascript
import { getCountries } from './services/holidayApi.js'

const countries = getCountries()
// [{ code: 'ES', name: 'España' }, { code: 'US', name: 'Estados Unidos' }, ...]
```

#### `getHolidays(year, countryCode)`
Obtiene los feriados de un país y año específicos.

```javascript
import { getHolidays } from './services/holidayApi.js'

try {
  const holidays = await getHolidays(2025, 'ES')
  console.log(holidays)
  // [{ date: '2025-01-01', localName: 'Año Nuevo', name: 'New Year\'s Day', ... }]
} catch (error) {
  console.error('Error:', error.message)
}
```

#### `isHoliday(date, countryCode)`
Verifica si una fecha específica es feriado.

```javascript
import { isHoliday } from './services/holidayApi.js'

try {
  const holiday = await isHoliday('2025-01-01', 'ES')
  if (holiday) {
    console.log(`Es feriado: ${holiday.localName}`)
  } else {
    console.log('No es feriado')
  }
} catch (error) {
  console.error('Error:', error.message)
}
```

#### `clearHolidaysCache(countryCode?, year?)`
Limpia el cache de feriados.

```javascript
import { clearHolidaysCache } from './services/holidayApi.js'

// Limpiar todo el cache
clearHolidaysCache()

// Limpiar cache de un país específico
clearHolidaysCache('ES')

// Limpiar cache de un país y año específicos
clearHolidaysCache('ES', 2025)
```

#### `getCacheStats()`
Obtiene estadísticas del cache.

```javascript
import { getCacheStats } from './services/holidayApi.js'

const stats = getCacheStats()
// { totalEntries: 2, countries: ['ES', 'US'], years: ['2024', '2025'], totalSizeKB: 15 }
```

### 🏗️ Estructura de datos

#### Holiday Object
```javascript
{
  date: "2025-01-01",           // Fecha en formato YYYY-MM-DD
  localName: "Año Nuevo",       // Nombre local del feriado
  name: "New Year's Day",       // Nombre en inglés
  countryCode: "ES",            // Código ISO del país
  fixed: true,                  // Si es fecha fija cada año
  global: true,                 // Si aplica a todo el país
  counties: null,               // Condados específicos (si aplica)
  launchYear: null              // Año de inicio del feriado
}
```

#### Country Object
```javascript
{
  code: "ES",                   // Código ISO de 2 letras
  name: "España"                // Nombre del país en español
}
```

### 🔧 Configuración

#### Variables de configuración
```javascript
// Base URL de la API
const API_BASE_URL = 'https://date.nager.at/api/v3'

// Tiempo de vida del cache (7 días)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

// Timeout de peticiones (10 segundos)
const REQUEST_TIMEOUT = 10000
```

### 💾 Cache Strategy

El cache utiliza localStorage con las siguientes claves:
- **Formato**: `holidays_{COUNTRY_CODE}_{YEAR}`
- **Ejemplo**: `holidays_ES_2025`
- **TTL**: 7 días desde la última descarga
- **Auto-limpieza**: El cache expirado se elimina automáticamente

### 🌍 Países soportados

| Código | País | Código | País |
|--------|------|--------|------|
| ES | España | US | Estados Unidos |
| MX | México | AR | Argentina |
| CO | Colombia | PE | Perú |
| CL | Chile | FR | Francia |
| DE | Alemania | IT | Italia |
| GB | Reino Unido | CA | Canadá |
| ... | ... | ... | ... |

Total: **54 países**

### 🚨 Manejo de errores

El servicio maneja múltiples tipos de errores:

- **Errores de red**: Conexión perdida, timeout
- **Errores de API**: 404, 500, respuestas inválidas
- **Errores de validación**: Parámetros inválidos
- **Errores de cache**: localStorage no disponible

```javascript
try {
  const holidays = await getHolidays(2025, 'ES')
} catch (error) {
  switch (error.message) {
    case 'La petición ha excedido el tiempo límite':
      // Manejar timeout
      break
    case 'Error de conexión. Verifica tu conexión a internet.':
      // Manejar sin conexión
      break
    default:
      // Manejar otros errores
      console.error('Error:', error.message)
  }
}
```

### 🧪 Testing

Para probar el servicio, puedes usar el archivo de prueba incluido:

```javascript
import { testHolidayAPI } from './services/test-holiday-api.js'

// Ejecutar pruebas
await testHolidayAPI()
```

O usar la demo integrada en la aplicación visitando el desarrollo en el navegador.

### 📈 Performance

- **Cache hit**: ~1ms (lectura desde localStorage)
- **Cache miss**: ~200-500ms (petición a API)
- **Tamaño promedio**: ~3-5KB por país/año
- **Compresión**: Los datos se almacenan como JSON compacto

### 🔄 Próximas mejoras

- [ ] Soporte para feriados regionales/locales
- [ ] Predownload de años futuros
- [ ] Compresión de datos en cache
- [ ] Modo offline con fallback
- [ ] Sincronización en background
