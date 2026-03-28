import { ref, computed, watch, onMounted } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { useUserPreferences } from './useUserPreferences'

type ThemeMode = 'light' | 'dark' | 'system'

const themeMode = ref<ThemeMode>('system')
const systemPrefersDark = ref(false)

export function useAppTheme() {
  const { preferences, updatePreference } = useUserPreferences()

  const isDark = computed(() => {
    if (themeMode.value === 'system') return systemPrefersDark.value
    return themeMode.value === 'dark'
  })

  const resolvedTheme = computed<'light' | 'dark'>(() => isDark.value ? 'dark' : 'light')

  // Vue Bits theme-aware colors
  const vueBitsColors = computed(() => ({
    auroraColors: isDark.value
      ? ['#0A0F1E', '#00E5CC', '#38BDF8']
      : ['#FAFBFC', '#0D9488', '#0EA5E9'],
    particleColor: isDark.value ? '#00E5CC' : '#0D9488',
    gradientFrom: isDark.value ? '#00e5cc' : '#0d9488',
    gradientTo: isDark.value ? '#38bdf8' : '#0ea5e9',
  }))

  function applyTheme() {
    try {
      const vuetifyTheme = useVuetifyTheme()
      if (vuetifyTheme) {
        vuetifyTheme.global.name.value = resolvedTheme.value
      }
    } catch {}
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    updatePreference('theme', mode)
    applyTheme()
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function initTheme() {
    // Load from preferences
    if (preferences.value.theme) {
      themeMode.value = preferences.value.theme
    } else {
      // Try localStorage for non-authenticated users
      try {
        const stored = localStorage.getItem('lottozahlen-theme')
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
          themeMode.value = stored as ThemeMode
        }
      } catch {}
    }

    // Listen for system preference changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches

      mediaQuery.addEventListener('change', (e) => {
        systemPrefersDark.value = e.matches
        if (themeMode.value === 'system') {
          applyTheme()
        }
      })
    }

    applyTheme()
  }

  // Watch for preference changes
  watch(() => preferences.value.theme, (newTheme) => {
    if (newTheme && newTheme !== themeMode.value) {
      themeMode.value = newTheme
      applyTheme()
    }
  })

  // Watch resolved theme to apply
  watch(resolvedTheme, () => {
    applyTheme()
  })

  onMounted(() => {
    initTheme()
  })

  return {
    theme: themeMode,
    isDark,
    resolvedTheme,
    vueBitsColors,
    setTheme,
    toggleTheme,
    initTheme,
  }
}
