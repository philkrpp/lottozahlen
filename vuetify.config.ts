import { defineVuetifyConfiguration } from 'vuetify-nuxt-module/custom-configuration'

const lightTheme = {
  dark: false,
  colors: {
    background: '#FAFBFC',
    surface: '#FFFFFF',
    'surface-variant': '#F1F5F9',
    primary: '#0D9488',
    secondary: '#64748B',
    accent: '#D4A017',
    error: '#DC2626',
    success: '#059669',
    info: '#0EA5E9',
    warning: '#F59E0B',
    'on-background': '#0F172A',
    'on-surface': '#0F172A',
    'on-primary': '#FFFFFF',
  },
}

const darkTheme = {
  dark: true,
  colors: {
    background: '#0A0F1E',
    surface: '#111827',
    'surface-variant': '#1A2332',
    primary: '#00E5CC',
    secondary: '#94A3B8',
    accent: '#FFD700',
    error: '#FF4757',
    success: '#00D68F',
    info: '#38BDF8',
    warning: '#FBBF24',
    'on-background': '#F1F5F9',
    'on-surface': '#F1F5F9',
    'on-primary': '#0A0F1E',
  },
}

export default defineVuetifyConfiguration({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VBtn: {
      rounded: 'lg',
    },
    VChip: {
      rounded: 'pill',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
  },
})
