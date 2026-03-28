import { ref, watch, computed } from 'vue'
import { useToast } from './useToast'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  dashboardLayout: 'grid' | 'list'
  showInactiveLose: boolean
  defaultAnbieter: string | null
  language: string
}

const preferences = ref<UserPreferences>({
  theme: 'system',
  dashboardLayout: 'grid',
  showInactiveLose: false,
  defaultAnbieter: null,
  language: 'de',
})

const isLoaded = ref(false)
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingChanges: Partial<UserPreferences> = {}

export function useUserPreferences() {
  const { success, error } = useToast()

  async function loadPreferences() {
    try {
      const data = await $fetch<UserPreferences>('/api/preferences')
      if (data) {
        preferences.value = { ...preferences.value, ...data }
      }
      isLoaded.value = true
    } catch (e) {
      // Fallback to localStorage for non-authenticated users
      const stored = localStorage.getItem('lottozahlen-preferences')
      if (stored) {
        try {
          preferences.value = { ...preferences.value, ...JSON.parse(stored) }
        } catch {}
      }
      isLoaded.value = true
    }
  }

  async function saveToServer(changes: Partial<UserPreferences>) {
    isSaving.value = true
    try {
      const data = await $fetch<UserPreferences>('/api/preferences', {
        method: 'PUT',
        body: changes,
      })
      if (data) {
        preferences.value = { ...preferences.value, ...data }
      }
      lastSaved.value = new Date()
      success('Gespeichert')
    } catch (e) {
      error('Speichern fehlgeschlagen')
      // Revert optimistic update would go here
    } finally {
      isSaving.value = false
    }
  }

  function saveToLocalStorage() {
    try {
      localStorage.setItem('lottozahlen-preferences', JSON.stringify(preferences.value))
    } catch {}
  }

  function updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    // Optimistic update
    preferences.value[key] = value

    // Save to localStorage as fallback
    saveToLocalStorage()

    // Debounced server save
    pendingChanges[key] = value as any

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const changes = { ...pendingChanges }
      pendingChanges = {}
      saveToServer(changes)
    }, 500)
  }

  function updatePreferences(partial: Partial<UserPreferences>) {
    // Optimistic update
    Object.assign(preferences.value, partial)

    // Save to localStorage
    saveToLocalStorage()

    // Debounced server save
    Object.assign(pendingChanges, partial)

    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const changes = { ...pendingChanges }
      pendingChanges = {}
      saveToServer(changes)
    }, 500)
  }

  return {
    preferences: computed(() => preferences.value),
    isLoaded: computed(() => isLoaded.value),
    isSaving: computed(() => isSaving.value),
    lastSaved: computed(() => lastSaved.value),
    loadPreferences,
    updatePreference,
    updatePreferences,
  }
}
