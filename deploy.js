#!/usr/bin/env node

/**
 * Script de deployment automatizado para DoseCron
 * Solo GitHub Pages
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'

// Función para ejecutar comandos
function runCommand(command, description) {
  console.log(`\n🚀 ${description}`)
  console.log(`📝 Ejecutando: ${command}\n`)

  try {
    execSync(command, { stdio: 'inherit' })
    console.log(`✅ ${description} completado exitosamente!\n`)
    return true
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message)
    return false
  }
}

// Función principal
async function main() {
  console.log('🎯 DoseCron - Deployment a GitHub Pages\n')

  // Verificar que existe la carpeta dist
  if (!existsSync('dist')) {
    console.log('🔨 Construyendo proyecto...')
    runCommand('npm run build', 'Build del proyecto')
  }

  console.log('📋 Iniciando deployment a GitHub Pages...\n')

  // Hacer deployment a GitHub Pages
  const success = runCommand('npm run deploy', 'Deployment a GitHub Pages')

  if (success) {
    console.log('🎉 ¡Deployment completado exitosamente!')
    console.log('📱 Tu aplicación estará disponible en: https://tuusuario.github.io/doseCron/')
    console.log('\n💡 Recuerda:')
    console.log('   1. Ve a Settings > Pages en tu repositorio de GitHub')
    console.log('   2. Selecciona la rama "gh-pages" como fuente')
    console.log('   3. Espera unos minutos para que se active')
  } else {
    console.log('❌ El deployment falló. Revisa los errores arriba.')
    process.exit(1)
  }
}

// Ejecutar script
main().catch(console.error)
