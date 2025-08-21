// English localization for DoseCron
export default {
  // Metadata
  meta: {
    language: 'en',
    region: 'US',
    name: 'English'
  },

  // General application
  app: {
    title: 'DoseCron',
    subtitle: 'Recurring Date Calculator',
    description: 'Generate a list of recurring dates with intelligent exclusion of weekends and holidays',
    descriptionShort: 'Calculate recurring dates excluding weekends and holidays'
  },

  // Main form
  form: {
    // Section titles
    basicConfig: 'Basic Configuration',
    exclusionOptions: 'Exclusion Options',
    exclusionSubtitle: '(weekends and holidays)',
    themeOptions: 'Theme Options',

    // Form fields
    fields: {
      startDate: {
        label: 'Start date',
        placeholder: 'Select a date',
        helpText: 'Starting date for recurring date calculation',
        required: 'Start date *'
      },
      interval: {
        label: 'Interval',
        placeholder: 'Ex: 7',
        placeholderDays: 'Ex: 15',
        placeholderWeeks: 'Ex: 2',
        placeholderMonths: 'Ex: 1',
        helpText: 'Frequency of date repetition'
      },
      intervalUnit: {
        days: 'Days',
        weeks: 'Weeks',
        months: 'Months'
      },
      duration: {
        label: 'Duration',
        placeholder: 'Ex: 6 for 6 months',
        helpText: 'Total time to generate recurring dates'
      },
      durationUnit: {
        label: 'Duration unit',
        options: {
          days: 'Days',
          weeks: 'Weeks',
          months: 'Months',
          years: 'Years'
        }
      },
      country: {
        label: 'Country',
        placeholder: 'Select a country',
        helpText: 'Country to get official holidays',
        noSelection: 'Not selected'
      },
      excludeWeekends: {
        label: 'Exclude weekends',
        helpText: 'Dates falling on Saturday or Sunday will be moved to the next business day'
      },
      excludeHolidays: {
        label: 'Exclude holidays',
        helpText: 'Dates coinciding with official holidays will be moved to the next business day'
      },
      filtersTitle: 'Exclusion filters'
    },

    // Buttons
    buttons: {
      calculate: 'Calculate Dates',
      calculating: 'Calculating...',
      reset: 'Clear Form',
      export: 'Export Results',
      showExclusions: 'Show Exclusion Options',
      hideExclusions: 'Hide Exclusion Options',
      showTheme: 'Show Theme Options',
      hideTheme: 'Hide Theme Options'
    },

    // General form texts
    texts: {
      days: 'days',
      intervalVsDurationSuggestion: 'Suggestion: Reduce the interval or increase the duration to generate recurring dates.',
      requiredIndicator: 'Required field'
    },

    // Form errors
    errors: {
      fixBeforeSubmit: 'Please fix the form errors before continuing',
      calculation: 'Error calculating dates'
    },

    // Summary
    summary: {
      title: 'Configuration Summary:',
      labels: {
        startDate: 'Start:',
        interval: 'Interval:',
        duration: 'Duration:',
        country: 'Country:',
        exclusions: 'Exclusions:'
      }
    }
  },

  // Date picker
  datePicker: {
    label: 'Date',
    required: 'Required field',
    invalidDate: 'Invalid date',
    dateInfoNotAvailable: 'Date information not available',
    dateInfo: {
      today: 'today',
      past: 'past',
      future: 'future'
    }
  },

  // Country selector
  countrySelector: {
    label: 'Country',
    placeholder: 'Select a country',
    loading: 'Loading countries...',
    error: 'Error loading countries',
    noSelection: 'Not selected',
    selected: 'Selected',
    invalidCode: 'Invalid country code'
  },

  // Validations
  validation: {
    required: 'This field is required',
    invalidDate: 'Invalid date format',
    pastDateNotAllowed: 'Past dates are not allowed',
    futureDateNotAllowed: 'Future dates are not allowed',
    minDate: 'Date must be after {min}',
    maxDate: 'Date must be before {max}',
    minNumber: 'Must be greater than {min}',
    maxNumber: 'Value must be less than {max}',
    invalidNumber: 'Must be a valid number',
    mustBeInteger: 'Must be an integer',
    dateNotProvided: 'Date not provided',
    intervalField: 'The interval',
    durationField: 'The duration',
    general: 'Validation error',
    intervalVsDuration: {
      shorterThanInterval: 'Duration ({duration} days) is shorter than interval ({interval} days). This will generate only the initial date without recurrences.'
    }
  },

  // Warnings
  warnings: {
    noCountry: 'You have selected to exclude holidays but no country is selected',
    longInterval: 'A very long interval may generate few dates',
    durationShorterThanInterval: 'Duration ({duration} days) is shorter than interval ({interval} days). This will generate only the initial date without recurrences.'
  },

  // Errors
  errors: {
    calculation: 'Error calculating dates',
    network: 'Connection error',
    generic: 'An unexpected error occurred',
    loadingCountries: 'Error loading country list',
    invalidConfiguration: 'Form configuration is not valid',
    boundaryTitle: 'Something went wrong',
    boundaryMessage: 'An unexpected error occurred. Please try again.',
    retryButton: 'Retry'
  },

  // Results
  results: {
    title: 'Calculated Dates',
    calculationTitle: 'Calculation Results',
    totalDates: 'Total dates: {count}',
    noResults: 'No dates were generated with current configuration',
    exportSuccess: 'Results exported successfully',
    exportError: 'Error exporting results',
    copySuccess: 'Dates copied to clipboard',
    copyError: 'Error copying to clipboard',
    copyButton: 'Copy',
    clearButton: 'Clear',
    copyTooltip: 'Copy dates to clipboard',
    clearTooltip: 'Clear results',
    badges: {
      today: 'Today',
      weekend: 'Weekend',
      holiday: 'Holiday'
    },
    summary: {
      total: 'Total:',
      weekends: 'Weekends:',
      holidays: 'Holidays:'
    },
    columns: {
      date: 'Date',
      dayOfWeek: 'Day',
      isHoliday: 'Holiday',
      holidayName: 'Holiday Name',
      isAdjusted: 'Adjusted'
    }
  },

  // Notifications
  notifications: {
    success: 'Successful operation',
    error: 'Operation error',
    warning: 'Warning',
    info: 'Information',
    welcome: 'Welcome to DoseCron! Configure your parameters to get started.'
  },

  // Theme
  theme: {
    light: 'Light',
    dark: 'Dark',
    toggle: 'Toggle Theme',
    description: 'Select the visual theme of the application',
    lightTitle: 'Light mode',
    darkTitle: 'Dark mode',
    español: 'Español',
    english: 'English',
    cambiarAEspañol: 'Switch to Spanish',
    cambiarAIngles: 'Switch to English'
  },

  // Languages
  languages: {
    es: 'Spanish',
    en: 'English'
  },

  // Loading and empty states
  loading: {
    calculating: 'Calculating dates...',
    countries: 'Loading countries...'
  },

  empty: {
    title: 'No dates to show',
    message: 'Configure the parameters and press "Calculate" to generate dates.'
  },

  // Time units
  time: {
    units: {
      singular: {
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year'
      },
      plural: {
        days: 'days',
        weeks: 'weeks',
        months: 'months',
        years: 'years'
      }
    },
    formats: {
      intervalDays: 'Every {count} day | Every {count} days',
      duration: '{count} {unit}'
    }
  },

  // Week days
  weekDays: {
    monday: 'monday',
    tuesday: 'tuesday',
    wednesday: 'wednesday',
    thursday: 'thursday',
    friday: 'friday',
    saturday: 'saturday',
    sunday: 'sunday'
  },

  // Exclusions
  exclusions: {
    weekends: 'weekends',
    holidays: 'holidays',
    none: 'None',
    summary: {
      both: '⚠️ Weekends and holidays will be excluded',
      weekendsOnly: '📅 Only weekends will be excluded',
      holidaysOnly: '🎊 Only holidays will be excluded'
    }
  }
}
