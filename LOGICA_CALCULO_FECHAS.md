# Lógica de Cálculo de Fechas - DoseCron

## Tabla de Contenidos
- [Introducción](#introducción)
- [Algoritmo Principal](#algoritmo-principal)
- [Cálculo Matemático Base](#cálculo-matemático-base)
- [Escenarios de Exclusión](#escenarios-de-exclusión)
- [Lógica de Feriados](#lógica-de-feriados)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Casos Edge y Consideraciones](#casos-edge-y-consideraciones)
- [Diagrama de Flujo](#diagrama-de-flujo)

---

## Introducción

DoseCron calcula fechas recurrentes con exclusión inteligente de fines de semana y feriados. El sistema está diseñado para mantener consistencia matemática mientras respeta configuraciones de exclusión.

### Principios Fundamentales

1. **Consistencia Matemática**: El número de fechas calculadas es siempre el mismo, independientemente de los filtros aplicados
2. **Predictibilidad**: El algoritmo es determinístico y reproducible
3. **Flexibilidad**: Soporta múltiples unidades de tiempo y configuraciones de exclusión

---

## Algoritmo Principal

### Flujo General

```
1. Configuración de entrada
   ├─ Fecha inicial
   ├─ Intervalo (días entre fechas)
   ├─ Duración total (cantidad + unidad)
   └─ Filtros de exclusión

2. Cálculo matemático
   ├─ Convertir duración a días totales
   ├─ Calcular número de fechas: días_totales ÷ intervalo (floor)
   └─ Generar fechas teóricas

3. Aplicación de filtros
   ├─ Ajustar fecha inicial si es necesario
   ├─ Calcular fechas desde fecha ajustada
   └─ Verificar y ajustar cada fecha de resultado

4. Resultado final
   └─ Array de fechas válidas con metadatos
```

---

## Cálculo Matemático Base

### Fórmula Principal

```javascript
// Paso 1: Calcular días totales del período
const diasTotales = Math.floor((fechaFinal - fechaInicial) / (1000 * 60 * 60 * 24))

// Paso 2: Calcular número exacto de fechas
const numeroFechas = Math.floor(diasTotales / intervalo)

// Paso 3: Generar fechas teóricas
for (let i = 0; i < numeroFechas; i++) {
    const fechaTeorica = fechaInicialAjustada + (i * intervalo)
    // ... aplicar filtros y generar fecha final
}
```

### Ejemplo Numérico

**Configuración:**
- Fecha inicial: 13 agosto 2025
- Duración: 4 meses
- Intervalo: 15 días

**Cálculo:**
```
Fecha final = 13 agosto + 4 meses = 13 diciembre 2025
Días totales = 122 días
Número de fechas = 122 ÷ 15 = 8.13... → floor(8.13) = 8 fechas

Fechas teóricas:
1. 13-ago (13 + 0×15)
2. 28-ago (13 + 1×15)
3. 12-sep (13 + 2×15)
4. 27-sep (13 + 3×15)
5. 12-oct (13 + 4×15)
6. 27-oct (13 + 5×15)
7. 11-nov (13 + 6×15)
8. 26-nov (13 + 7×15)
```

---

## Escenarios de Exclusión

### Sin Exclusiones (Caso Base)

```javascript
// Configuración más simple
excludeWeekends: false
excludeHolidays: false

// Resultado: fechas teóricas exactas sin modificaciones
```

### Exclusión de Fines de Semana

**Comportamiento:**
- Las fechas que caen en sábado o domingo se mueven al siguiente lunes
- El cálculo de intervalos se mantiene desde la fecha original

**Ejemplo:**
```
Fecha teórica: 16-ago-2025 (sábado)
Fecha ajustada: 18-ago-2025 (lunes)
Siguiente intervalo: desde 16-ago + 15 días = 31-ago (no desde 18-ago)
```

### Exclusión de Feriados

**Comportamiento Actual (Nueva Lógica):**
- Solo se verifican feriados en fechas de resultado final
- Los feriados en días intermedios se ignoran
- Si la fecha inicial es feriado, se ajusta al siguiente día hábil

---

## Lógica de Feriados

### Algoritmo Detallado

```javascript
function calcularFechasConFeriados(config) {
    // 1. Ajustar fecha inicial si es feriado
    let fechaInicialAjustada = ajustarSiFeriado(fechaInicial)
    
    // 2. Generar fechas desde fecha ajustada
    for (let i = 0; i < numeroFechas; i++) {
        // Calcular fecha teórica desde fecha AJUSTADA
        const fechaTeorica = fechaInicialAjustada + (i * intervalo)
        
        // Solo verificar si ESTA fecha específica es feriado
        const fechaFinal = ajustarSiFeriado(fechaTeorica)
        
        fechasResultado.push(fechaFinal)
    }
    
    return fechasResultado
}
```

### Diferencia con Lógica Anterior

**❌ Lógica Anterior (Problemática):**
```javascript
// Problema: calculaba desde fechas ya ajustadas
let fechaActual = ajustarSiFeriado(fechaInicial)
for (let i = 0; i < numeroFechas; i++) {
    fechasResultado.push(fechaActual)
    fechaActual = ajustarSiFeriado(fechaActual + intervalo) // ❌ Error aquí
}
```

**✅ Lógica Nueva (Correcta):**
```javascript
// Solución: calcular desde fecha inicial ajustada, intervalos fijos
let fechaInicialAjustada = ajustarSiFeriado(fechaInicial)
for (let i = 0; i < numeroFechas; i++) {
    const fechaTeorica = fechaInicialAjustada + (i * intervalo) // ✅ Correcto
    const fechaFinal = ajustarSiFeriado(fechaTeorica)
    fechasResultado.push(fechaFinal)
}
```

---

## Ejemplos Prácticos

### Caso 1: Sin Exclusiones

**Configuración:**
```javascript
startDate: '2025-08-13'
interval: 15
duration: 4
durationUnit: 'months'
excludeWeekends: false
excludeHolidays: false
```

**Resultado:**
```
1. 13-ago-2025 (miércoles)
2. 28-ago-2025 (jueves)
3. 12-sep-2025 (viernes)
4. 27-sep-2025 (sábado)    ← Sin filtrar
5. 12-oct-2025 (domingo)   ← Sin filtrar
6. 27-oct-2025 (lunes)
7. 11-nov-2025 (martes)
8. 26-nov-2025 (miércoles)
```

### Caso 2: Con Exclusión de Fines de Semana

**Configuración:**
```javascript
excludeWeekends: true
excludeHolidays: false
```

**Resultado:**
```
1. 13-ago-2025 (miércoles)
2. 28-ago-2025 (jueves)
3. 12-sep-2025 (viernes)
4. 29-sep-2025 (lunes)     ← Movido desde 27-sep (sábado)
5. 13-oct-2025 (lunes)     ← Movido desde 12-oct (domingo)
6. 27-oct-2025 (lunes)
7. 11-nov-2025 (martes)
8. 26-nov-2025 (miércoles)
```

### Caso 3: Fecha Inicial es Feriado

**Configuración:**
```javascript
startDate: '2025-08-15'  // Día de las Madres (feriado en CR)
interval: 7
duration: 2
durationUnit: 'weeks'
excludeWeekends: true
excludeHolidays: true
```

**Proceso:**
```
1. Detectar que 15-ago es feriado
2. Ajustar fecha inicial: 15-ago → 18-ago (lunes)
3. Calcular desde fecha ajustada:
   - Primera fecha: 18-ago
   - Segunda fecha: 18-ago + 7 días = 25-ago
```

**Resultado:**
```
1. 18-ago-2025 (lunes)     ← Ajustado desde feriado
2. 25-ago-2025 (lunes)
```

### Caso 4: Feriado Intermedio (Nueva Lógica)

**Configuración:**
```javascript
startDate: '2025-08-10'  // Domingo normal
interval: 7
duration: 3
durationUnit: 'weeks'
excludeWeekends: false
excludeHolidays: true
```

**Análisis:**
```
Fechas teóricas: 10-ago, 17-ago, 24-ago
Feriado intermedio: 15-ago (día de las madres)
Nueva lógica: Ignorar 15-ago porque NO es fecha de resultado
```

**Resultado:**
```
1. 10-ago-2025 (domingo)   ← No es feriado
2. 17-ago-2025 (domingo)   ← No es feriado
3. 24-ago-2025 (domingo)   ← No es feriado
```

---

## Casos Edge y Consideraciones

### Límites del Sistema

1. **Máximo 30 intentos** para encontrar día válido (previene bucles infinitos)
2. **Cache de feriados** con TTL de 24 horas
3. **Validación de configuración** antes del cálculo

### Casos Especiales

#### Duración Menor que Intervalo
```javascript
startDate: '2025-08-13'
interval: 30
duration: 2
durationUnit: 'weeks'  // = 14 días

// Resultado: 14 ÷ 30 = 0.46 → floor(0.46) = 0 fechas
```

#### Intervalos Muy Pequeños
```javascript
interval: 1  // Diario
duration: 1
durationUnit: 'months'  // = ~30 días

// Resultado: 30 fechas (una por día)
```

#### Países Sin Feriados
```javascript
country: 'XX'  // País inexistente

// Resultado: Solo exclusión de fines de semana (si está habilitada)
```

---

## Diagrama de Flujo

```
┌─────────────────┐
│   CONFIGURACIÓN │
│                 │
│ • Fecha inicial │
│ • Intervalo     │
│ • Duración      │
│ • Filtros       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ VALIDAR CONFIG  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ CALCULAR DÍAS   │
│ TOTALES         │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ NÚMERO DE       │
│ FECHAS =        │
│ días ÷ intervalo│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ CARGAR FERIADOS │
│ (si necesario)  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ AJUSTAR FECHA   │
│ INICIAL         │
│ (si es feriado) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ GENERAR FECHAS  │
│                 │
│ Para i = 0 hasta│
│ número de fechas│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ FECHA TEÓRICA = │
│ inicial_ajust + │
│ (i × intervalo) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ VERIFICAR       │
│ EXCLUSIONES     │
│ (solo en fecha  │
│ de resultado)   │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ AJUSTAR FECHA   │
│ SI ES NECESARIO │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ AGREGAR A       │
│ RESULTADO       │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ ¿MÁS FECHAS?    │
└─────┬───────────┘
      │ Sí    │ No
      ▼       ▼
   ┌────┐  ┌─────────────────┐
   │LOOP│  │ RESULTADO FINAL │
   └────┘  └─────────────────┘
```

---

## Notas de Implementación

### Archivos Clave

- **`src/composables/useDateCalculator.js`**: Lógica principal
- **`tests/useDateCalculator.test.js`**: Tests comprehensivos
- **`src/services/holidayApi.js`**: Integración con API de feriados

### Funciones Principales

1. **`calculateDates()`**: Función principal de cálculo
2. **`getNextValidDate()`**: Encuentra siguiente día válido
3. **`checkExclusions()`**: Verifica exclusiones para una fecha
4. **`loadHolidays()`**: Carga y cachea feriados

---

*Documento actualizado: 16 agosto 2025*
*Versión de lógica: 2.0 (Nueva lógica de feriados)*