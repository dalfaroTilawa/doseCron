/**
 * Archivo de prueba para el servicio holidayApi
 * Para ejecutar desde la consola del navegador
 */

import { getCountries, getHolidays, isHoliday, clearHolidaysCache, getCacheStats } from './holidayApi.js'

// Función para probar el servicio
export const testHolidayAPI = async () => {
  console.log('🧪 Iniciando pruebas del Holiday API...')

  try {
    // 1. Probar getCountries
    console.log('\n📍 Probando getCountries():')
    const countries = getCountries()
    console.log(`✅ Países disponibles: ${countries.length}`)
    console.log('Primeros 5 países:', countries.slice(0, 5))

    // 2. Probar getHolidays
    console.log('\n🎄 Probando getHolidays(2025, "ES"):')
    const holidays2025 = await getHolidays(2025, 'ES')
    console.log(`✅ Feriados España 2025: ${holidays2025.length}`)
    console.log('Primeros 3 feriados:', holidays2025.slice(0, 3))

    // 3. Probar cache (segunda llamada debería ser desde cache)
    console.log('\n💾 Probando cache (segunda llamada):')
    const holidaysFromCache = await getHolidays(2025, 'ES')
    console.log(`✅ Feriados desde cache: ${holidaysFromCache.length}`)

    // 4. Probar isHoliday
    console.log('\n🔍 Probando isHoliday("2025-01-01", "ES"):')
    const newYearHoliday = await isHoliday('2025-01-01', 'ES')
    console.log('✅ 1 de enero 2025:', newYearHoliday ? `Es feriado: ${newYearHoliday.localName}` : 'No es feriado')

    // 5. Probar con fecha que no es feriado
    console.log('\n🔍 Probando isHoliday("2025-02-15", "ES"):')
    const randomDate = await isHoliday('2025-02-15', 'ES')
    console.log('✅ 15 de febrero 2025:', randomDate ? `Es feriado: ${randomDate.localName}` : 'No es feriado')

    // 6. Estadísticas del cache
    console.log('\n📊 Estadísticas del cache:')
    const stats = getCacheStats()
    console.log('✅ Stats:', stats)

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  }
}

// Hacer la función disponible globalmente para pruebas
if (typeof window !== 'undefined') {
  window.testHolidayAPI = testHolidayAPI
}
