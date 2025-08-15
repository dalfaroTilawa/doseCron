# 🚀 Guía de Deployment - DoseCron

Esta guía te ayudará a hacer deployment de DoseCron en GitHub Pages.

## 📋 Prerrequisitos

1. **Node.js** (versión 18 o superior)
2. **Git** configurado
3. **Repositorio en GitHub**

## 🔨 Build del Proyecto

Antes de hacer deployment, asegúrate de construir el proyecto:

```bash
npm run build
```

Esto creará la carpeta `dist/` con los archivos optimizados para producción.

## 🌐 Deployment en GitHub Pages

**Ventajas:**
- ✅ Gratuito
- ✅ Integración directa con GitHub
- ✅ Configuración automática
- ✅ SSL automático

## 🚀 Deployment Automatizado

Usa nuestro script de deployment automatizado:

```bash
# Deployment automático a GitHub Pages
node deploy.js
```

**O manualmente:**
```bash
npm run deploy
```

## 📋 Pasos del Deployment

### 1. **Preparar el proyecto**
```bash
npm run build
```

### 2. **Ejecutar deployment**
```bash
node deploy.js
```

### 3. **Configurar GitHub Pages**
1. Ve a tu repositorio en GitHub
2. Ve a **Settings** > **Pages**
3. En **Source**, selecciona la rama **`gh-pages`**
4. Guarda la configuración

### 4. **Esperar activación**
- GitHub Pages puede tardar unos minutos en activarse
- Verás un mensaje verde indicando que está activo

## 🌐 URL Resultante

Tu aplicación estará disponible en:
```
https://tuusuario.github.io/doseCron/
```

## 🔧 Solución de Problemas Comunes

### Error: "Module not found"
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Error: "Build failed"
```bash
# Verifica que no haya errores de linting
npm run lint
npm run lint:fix
```

### Error: "Base path not found"
- Verifica que `vite.config.js` tenga: `base: '/doseCron/'`
- Este valor debe coincidir con el nombre de tu repositorio

### Error: "gh-pages branch not found"
- Asegúrate de que el repositorio esté en GitHub
- Verifica que tengas permisos de escritura
- Ejecuta `npm run deploy` nuevamente

## 📱 Configuración para Dispositivos Móviles

El proyecto ya incluye:
- ✅ Diseño responsive
- ✅ PWA ready
- ✅ Meta tags optimizados
- ✅ Viewport configurado

## 🔒 Seguridad

El proyecto incluye headers de seguridad configurados en el build.

## 📊 Monitoreo

Para monitorear tu aplicación en producción:
1. Revisa los logs de GitHub Actions (si los tienes configurados)
2. Usa las herramientas de desarrollador del navegador
3. Monitorea el rendimiento con Lighthouse

## 🎯 Próximos Pasos

1. **Haz el primer deployment** usando `node deploy.js`
2. **Configura GitHub Pages** en tu repositorio
3. **Verifica que funcione** en la URL generada
4. **Configura un dominio personalizado** si lo deseas

## 📞 Soporte

Si tienes problemas con el deployment:
1. Revisa los logs de build
2. Verifica la configuración de GitHub Pages
3. Asegúrate de que la rama `gh-pages` se haya creado
4. Abre un issue en el repositorio

---

**¡Feliz deployment! 🎉**
