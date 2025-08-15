import { createApp } from 'vue'
import './assets/styles.css'
import App from './App.vue'
import i18n from './plugins/i18n.js'

// Crear la aplicación con i18n configurado
const app = createApp(App)

// Configurar i18n
app.use(i18n)

// Montar la aplicación
app.mount('#app')
