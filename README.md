# 📅 DoseCron - Calculadora de Fechas Recurrentes

Aplicación web para calcular fechas recurrentes con exclusión inteligente de fines de semana y feriados por país. Ideal para programar dosis médicas, citas o eventos recurrentes.

## 🚀 Características

- ✅ Cálculo de fechas recurrentes con intervalos personalizables
- ✅ Exclusión automática de fines de semana
- ✅ Exclusión de feriados por país (API externa)
- ✅ Configuración de duración flexible (días/semanas/meses/años)
- ✅ Validación inteligente de parámetros
- ✅ Persistencia de configuración del usuario
- ✅ Interfaz moderna con modo claro/oscuro
- ✅ Diseño responsive y accesible
- ✅ Desarrollado con Vue.js 3 + Composition API

## 🛠️ Tecnologías

- **Vue.js 3** - Framework principal con Composition API
- **Vite** - Build tool y dev server
- **date-fns** - Librería para manipulación de fechas
- **API de feriados** - https://date.nager.at/api/v3/
- **GitHub Pages** - Hosting y deploy

## 📦 Instalación

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Pasos de instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/date-calculator.git
cd date-calculator

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# El proyecto estará disponible en http://localhost:3000
```

## 🚀 Deploy a GitHub Pages

### Configuración inicial

1. **Crear repositorio en GitHub** con el nombre `date-calculator`

2. **Conectar repositorio local:**
```bash
git remote add origin https://github.com/tu-usuario/date-calculator.git
git branch -M main
git push -u origin main
```

3. **Configurar GitHub Pages:**
   - Ve a Settings > Pages en tu repositorio
   - Selecciona "Deploy from a branch"
   - Elige la rama `gh-pages`
   - Click en "Save"

### Deploy automático

```bash
# Hacer deploy a GitHub Pages
npm run deploy
```

Este comando:
1. Ejecuta `npm run build` para generar la versión de producción
2. Usa `gh-pages` para subir el contenido de `dist/` a la rama `gh-pages`
3. GitHub Pages automáticamente publica desde esa rama

### URL de acceso
Tu aplicación estará disponible en:
```
https://tu-usuario.github.io/date-calculator/
```

## 🏗️ Estructura del proyecto

```
date-calculator/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/          # Componentes Vue reutilizables
│   ├── composables/         # Lógica reutilizable (Composition API)
│   ├── services/           # Servicios para API calls y lógica externa
│   ├── App.vue             # Componente raíz
│   ├── main.js            # Punto de entrada
│   └── style.css          # Estilos globales
├── index.html             # Template HTML
├── package.json           # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
└── README.md             # Este archivo
```

## 🔧 Scripts disponibles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build local
npm run preview

# Deploy a GitHub Pages
npm run deploy

# Linting y calidad de código
npm run lint
npm run lint:fix

# Tests
npm run test
npm run test:watch
npm run test:coverage
```

## 🌐 Variables de entorno

El proyecto está configurado para funcionar en:
- **Desarrollo:** `http://localhost:3000`
- **Producción:** `https://tu-usuario.github.io/date-calculator/`

## 📝 Próximos pasos de desarrollo

1. **Componentes principales:**
   - DateInput - Selector de fecha inicial
   - IntervalInput - Input de intervalo en días
   - DurationInput - Selector de duración
   - CountrySelector - Selector de país
   - DateList - Lista de fechas resultantes

2. **Composables:**
   - useDateCalculator - Lógica principal de cálculo
   - useHolidays - Manejo de feriados por país
   - useLocalStorage - Persistencia de configuración

3. **Services:**
   - holidaysAPI - Servicio para consumir API de feriados
   - dateUtils - Utilidades para fechas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:
1. Revisa los [Issues existentes](https://github.com/tu-usuario/date-calculator/issues)
2. Crea un nuevo Issue si no encuentras solución
3. Proporciona detalles del error y pasos para reproducirlo

## 9. **Archivos adicionales**

**.gitignore**:
```gitignore:.gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
Thumbs.db
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
```

**public/favicon.svg** (placeholder):
```svg:public/favicon.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
  <line x1="16" y1="2" x2="16" y2="6"></line>
  <line x1="8" y1="2" x2="8" y2="6"></line>
  <line x1="3" y1="10" x2="21" y2="10"></line>
</svg>
```

## ✅ **Estructura inicial completada**

**Archivos creados:**
- ✅ `package.json` - Dependencias Vue 3, Vite, date-fns, gh-pages
- ✅ `vite.config.js` - Configurado para GitHub Pages (`/date-calculator/`)
- ✅ `index.html` - HTML básico con meta tags
- ✅ `src/main.js` - Setup de Vue
- ✅ `src/App.vue` - Estructura básica con header/main/footer
- ✅ `src/style.css` - Estilos globales base
- ✅ `.gitignore` - Exclusiones para Git
- ✅ `README.md` - Documentación completa
- ✅ `public/favicon.svg` - Icono del calendario

**Carpetas creadas:**
- ✅ `src/components/` - Para componentes Vue
- ✅ `src/composables/` - Para Composition API logic
- ✅ `src/services/` - Para servicios API

**Para comenzar el desarrollo:**
```bash
npm install
npm run dev
```

**Listo para el siguiente paso!** 🚀
