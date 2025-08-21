// Localización en español para DoseCron
export default {
  // Metadatos
  meta: {
    language: 'es',
    region: 'ES',
    name: 'Español'
  },

  // Aplicación general
  app: {
    title: 'DoseCron',
    subtitle: 'Calculadora de Fechas Recurrentes',
    description: 'Genera una lista de fechas recurrentes con exclusión inteligente de fines de semana y feriados',
    descriptionShort: 'Calcula fechas recurrentes excluyendo fines de semana y feriados'
  },

  // Analytics (solo para desarrollador)
  analytics: {
    visits: 'Visitas',
    calculations: 'Cálculos',
    daysActive: 'Días activos',
    clearStats: 'Limpiar estadísticas',
    devMode: 'Modo desarrollador'
  },

  // Formulario principal
  form: {
    // Títulos de secciones
    basicConfig: 'Configuración Básica',
    exclusionOptions: 'Opciones de exclusión',
    exclusionSubtitle: '(fines de semana y feriados)',
    themeOptions: 'Tema de la aplicación',
    themeSubtitle: {
      light: '(claro)',
      dark: '(oscuro)'
    },

    // Campos del formulario
    fields: {
      startDate: {
        label: 'Fecha inicial',
        placeholder: 'Selecciona una fecha',
        helpText: 'Fecha de inicio para el cálculo de fechas recurrentes',
        required: 'Fecha inicial *'
      },
      interval: {
        label: 'Intervalo',
        placeholder: 'Ej: 7',
        placeholderDays: 'Ej: 15',
        placeholderWeeks: 'Ej: 2',
        placeholderMonths: 'Ej: 1',
        helpText: 'Frecuencia de repetición de las fechas'
      },
      intervalUnit: {
        days: 'Días',
        weeks: 'Semanas',
        months: 'Meses'
      },
      duration: {
        label: 'Duración',
        placeholder: 'Ej: 4',
        helpText: 'Período total durante el cual generar fechas'
      },
      durationUnit: {
        label: 'Unidad de duración',
        options: {
          days: 'Días',
          weeks: 'Semanas',
          months: 'Meses',
          years: 'Años'
        }
      },
      country: {
        label: 'País para feriados',
        placeholder: 'Selecciona un país (opcional)',
        helpText: 'Selecciona un país para excluir automáticamente sus feriados oficiales',
        noSelection: 'No seleccionado'
      },
      excludeWeekends: {
        label: 'Excluir fines de semana',
        helpText: 'Los sábados y domingos serán omitidos del cálculo'
      },
      excludeHolidays: {
        label: 'Excluir feriados',
        helpText: 'Los feriados del país seleccionado serán omitidos'
      },
      filtersTitle: 'Filtros de exclusión'
    },

    // Botones
    buttons: {
      calculate: 'Calcular Fechas',
      calculating: 'Calculando...',
      reset: 'Resetear',
      export: 'Exportar Resultados',
      showExclusions: 'Mostrar Opciones de Exclusión',
      hideExclusions: 'Ocultar Opciones de Exclusión',
      showTheme: 'Mostrar Opciones de Tema',
      hideTheme: 'Ocultar Opciones de Tema'
    },

    // Textos generales del formulario
    texts: {
      days: 'días',
      intervalVsDurationSuggestion: 'Sugerencia: Reduce el intervalo o aumenta la duración para generar fechas recurrentes.',
      requiredIndicator: 'Campo requerido'
    },

    // Errores del formulario
    errors: {
      fixBeforeSubmit: 'Por favor corrige los errores del formulario antes de continuar',
      calculation: 'Error al calcular fechas'
    },

    // Resumen
    summary: {
      title: 'Resumen de configuración:',
      labels: {
        startDate: 'Inicio:',
        interval: 'Intervalo:',
        duration: 'Duración:',
        country: 'País:',
        exclusions: 'Exclusiones:'
      }
    }
  },

  // Selector de fecha
  datePicker: {
    label: 'Fecha',
    required: 'Campo requerido',
    invalidDate: 'Fecha inválida',
    dateInfoNotAvailable: 'Información de fecha no disponible',
    dateInfo: {
      today: 'hoy',
      past: 'pasado',
      future: 'futuro'
    }
  },

  // Selector de país
  countrySelector: {
    label: 'País',
    placeholder: 'Selecciona un país',
    loading: 'Cargando países...',
    error: 'Error al cargar países',
    noSelection: 'No seleccionado',
    selected: 'Seleccionado',
    invalidCode: 'Código de país inválido'
  },

  // Validaciones
  validation: {
    required: 'Este campo es requerido',
    invalidDate: 'Formato de fecha inválido',
    pastDateNotAllowed: 'No se permiten fechas pasadas',
    futureDateNotAllowed: 'No se permiten fechas futuras',
    minDate: 'La fecha debe ser posterior a {min}',
    maxDate: 'La fecha debe ser anterior a {max}',
    minNumber: 'Debe ser mayor a {min}',
    maxNumber: 'El valor debe ser menor a {max}',
    invalidNumber: 'Debe ser un número válido',
    mustBeInteger: 'Debe ser un número entero',
    dateNotProvided: 'Fecha no proporcionada',
    intervalField: 'El intervalo',
    durationField: 'La duración',
    general: 'Error de validación',
    intervalVsDuration: {
      shorterThanInterval: 'La duración ({duration} días) es menor al intervalo ({interval} días). Esto generará solo la fecha inicial sin recurrencias.'
    }
  },

  // Advertencias
  warnings: {
    noCountry: 'Has seleccionado excluir feriados pero no hay país seleccionado',
    longInterval: 'Un intervalo muy largo puede generar pocas fechas',
    durationShorterThanInterval: 'La duración ({duration} días) es menor al intervalo ({interval} días). Esto generará solo la fecha inicial sin recurrencias.'
  },

  // Errores
  errors: {
    calculation: 'Error al calcular las fechas',
    network: 'Error de conexión',
    generic: 'Ha ocurrido un error inesperado',
    loadingCountries: 'Error al cargar la lista de países',
    invalidConfiguration: 'La configuración del formulario no es válida',
    boundaryTitle: 'Algo salió mal',
    boundaryMessage: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
    retryButton: 'Reintentar'
  },

  // Resultados
  results: {
    title: 'Fechas Calculadas',
    calculationTitle: 'Resultados del Cálculo',
    totalDates: 'Total de fechas: {count}',
    noResults: 'No se generaron fechas con la configuración actual',
    exportSuccess: 'Resultados exportados exitosamente',
    exportError: 'Error al exportar los resultados',
    copySuccess: 'Fechas copiadas al portapapeles',
    copyError: 'Error al copiar al portapapeles',
    copyButton: 'Copiar',
    clearButton: 'Limpiar',
    copyTooltip: 'Copiar fechas al portapapeles',
    clearTooltip: 'Limpiar resultados',
    badges: {
      today: 'Hoy',
      weekend: 'Fin de semana',
      holiday: 'Feriado'
    },
    summary: {
      total: 'Total:',
      weekends: 'Fines de semana:',
      holidays: 'Feriados:'
    },
    columns: {
      date: 'Fecha',
      dayOfWeek: 'Día',
      isHoliday: 'Feriado',
      holidayName: 'Nombre del Feriado',
      isAdjusted: 'Ajustada'
    },
    loading: 'Calculando fechas...',
    empty: {
      title: 'No hay fechas para mostrar',
      message: 'Configura los parámetros y presiona "Calcular" para generar fechas.'
    }
  },

  // Notificaciones
  notifications: {
    success: 'Operación exitosa',
    error: 'Error en la operación',
    warning: 'Advertencia',
    info: 'Información',
    welcome: '¡Bienvenido a DoseCron! Configura tus parámetros para empezar.'
  },

  // Tema
  theme: {
    light: 'Claro',
    dark: 'Oscuro',
    toggle: 'Cambiar Tema',
    description: 'Selecciona el tema visual de la aplicación',
    lightTitle: 'Modo claro',
    darkTitle: 'Modo oscuro',
    español: 'Español',
    english: 'English',
    cambiarAEspañol: 'Cambiar a español',
    cambiarAIngles: 'Cambiar a inglés'
  },

  // Idiomas
  languages: {
    es: 'Español',
    en: 'English'
  },


  // Unidades de tiempo
  time: {
    units: {
      singular: {
        day: 'día',
        week: 'semana',
        month: 'mes',
        year: 'año'
      },
      plural: {
        days: 'días',
        weeks: 'semanas',
        months: 'meses',
        years: 'años'
      }
    },
    formats: {
      intervalDays: 'Cada {count} día | Cada {count} días',
      duration: '{count} {unit}'
    }
  },

  // Días de la semana
  weekDays: {
    monday: 'lunes',
    tuesday: 'martes',
    wednesday: 'miércoles',
    thursday: 'jueves',
    friday: 'viernes',
    saturday: 'sábado',
    sunday: 'domingo'
  },

  // Exclusiones
  exclusions: {
    weekends: 'fines de semana',
    holidays: 'feriados',
    none: 'Ninguna',
    summary: {
      both: '⚠️ Se excluirán fines de semana y feriados',
      weekendsOnly: '📅 Se excluirán solo fines de semana',
      holidaysOnly: '🎊 Se excluirán solo feriados'
    }
  }
}
