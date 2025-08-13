# 🔧 Configuración de Variables de Entorno - DoseCron

## 📋 Descripción

DoseCron utiliza variables de entorno para centralizar la configuración de la aplicación, permitiendo personalizar comportamientos sin modificar el código fuente.

## 🚀 Configuración Rápida

### 1. Crear archivo de entorno

```bash
# Copiar el archivo ejemplo
cp .env.example .env

# Editar según tus necesidades
# El archivo .env NO se sube a Git por seguridad
```

### 2. Configurar variables importantes

```env
# API de feriados (cambiar si usas otro servicio)
VITE_API_BASE_URL=https://date.nager.at/api/v3

# Cache (30 días en milisegundos)
VITE_CACHE_TTL=2592000000

# País por defecto
VITE_DEFAULT_COUNTRY=CR
```

## 📚 Variables Disponibles

### 🌐 API Configuration
| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `https://date.nager.at/api/v3` | URL base del servicio de feriados |
| `VITE_API_TIMEOUT` | `10000` | Timeout de peticiones HTTP (ms) |

### 💾 Cache Configuration  
| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_CACHE_TTL` | `2592000000` | Tiempo de vida del cache (30 días en ms) |
| `VITE_STORAGE_PREFIX` | `dosecron` | Prefijo para claves de localStorage |

### ⚙️ App Configuration
| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_MAX_ITERATIONS` | `1000` | Máximo iteraciones para cálculo |
| `VITE_MAX_ATTEMPTS` | `30` | Máximo intentos para día válido |

### 🎨 User Preferences
| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_DEFAULT_COUNTRY` | `CR` | País por defecto (ISO 2 letras) |
| `VITE_DEFAULT_THEME` | `light` | Tema por defecto (light/dark) |
| `VITE_DEFAULT_LANGUAGE` | `es` | Idioma por defecto |
| `VITE_DEFAULT_DURATION_UNIT` | `months` | Unidad duración (days/weeks/months/years) |
| `VITE_DEFAULT_EXCLUDE_WEEKENDS` | `true` | Excluir fines de semana |
| `VITE_DEFAULT_EXCLUDE_HOLIDAYS` | `true` | Excluir feriados |

### 🐛 Development Configuration
| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_DEBUG_MODE` | `false` | Habilitar modo debug |
| `VITE_LOG_LEVEL` | `warn` | Nivel de logs (error/warn/info/debug) |

## 🔍 Uso en el Código

### Importar configuración

```javascript
import { API_CONFIG, CACHE_CONFIG, APP_CONFIG, logger } from '@/config/env.js'

// Usar configuraciones
const apiUrl = API_CONFIG.BASE_URL
const cacheTime = CACHE_CONFIG.TTL
const maxIterations = APP_CONFIG.MAX_ITERATIONS

// Usar logger configurable
logger.info('Información general')
logger.warn('Advertencia')
logger.error('Error crítico')
logger.debug('Debug (solo si DEBUG_MODE=true)')
```

### Obtener variable específica

```javascript
// En env.js - función utilitaria
const getEnvVar = (key, defaultValue, type = 'string') => {
  const value = import.meta.env[key]
  // ... lógica de conversión
}

// Ejemplos de uso
const debugMode = getEnvVar('VITE_DEBUG_MODE', false, 'boolean')
const maxAttempts = getEnvVar('VITE_MAX_ATTEMPTS', 30, 'number')
```

## 🎯 Casos de Uso

### Desarrollo Local
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_API_TIMEOUT=30000
```

### Producción
```env
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=error
VITE_CACHE_TTL=7776000000  # 90 días
```

### Testing con API alternativa
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_CACHE_TTL=0  # Desactivar cache
VITE_DEBUG_MODE=true
```

### País específico (ejemplo España)
```env
VITE_DEFAULT_COUNTRY=ES
VITE_DEFAULT_LANGUAGE=es
VITE_DEFAULT_EXCLUDE_HOLIDAYS=true
```

## ⚠️ Importantes

### Prefijo VITE_
- **Obligatorio**: Todas las variables deben empezar con `VITE_`
- **Motivo**: Vite solo expone al frontend las variables con este prefijo
- **Seguridad**: Evita exponer variables sensibles por error

### Tipos de Datos
```env
# String (por defecto)
VITE_API_BASE_URL=https://api.ejemplo.com

# Number (se convierte automáticamente)
VITE_MAX_ITERATIONS=1000

# Boolean (debe ser string 'true' o 'false')
VITE_DEBUG_MODE=true
```

### Reinicio Requerido
Los cambios en `.env` requieren **reiniciar el servidor de desarrollo**:

```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm run dev
```

## 🔧 Troubleshooting

### Variable no se aplica
1. ✅ Verificar prefijo `VITE_`
2. ✅ Reiniciar servidor desarrollo
3. ✅ Verificar sintaxis (sin espacios alrededor del `=`)
4. ✅ Verificar que `.env` existe en la raíz del proyecto

### Modo debug no funciona
```env
# Ambas variables son necesarias
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Cache no se limpia
```env
# Reducir TTL temporalmente
VITE_CACHE_TTL=0

# O cambiar prefijo para "resetear"
VITE_STORAGE_PREFIX=dosecron_new
```

## 📁 Estructura de Archivos

```
doseCron/
├── .env                 # ❌ NO commitear (tu configuración)
├── .env.example         # ✅ Commitear (plantilla)
├── .gitignore           # ✅ Incluye .env
└── src/
    └── config/
        └── env.js       # ✅ Lógica de configuración
```

## 🔗 Referencias

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Date Nager API](https://date.nager.at/swagger/index.html)
- [ISO Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)