import { ref, computed } from 'vue'
import { useToast } from './useToast'

interface LosCheckResult {
  hasWon: boolean
  prize: string | null
  drawDate: string
  checkedAt: string
}

interface Los {
  _id: string
  losNummer: string
  anbieter: string
  losTyp: string
  displayName?: string
  isActive: boolean
  lastCheckedAt: string | null
  lastCheckResult: LosCheckResult | null
  createdAt: string
  updatedAt: string
}

interface CreateLosData {
  losNummer: string
  anbieter: string
  losTyp: string
  displayName?: string
}

const lose = ref<Los[]>([])
const isLoading = ref(false)
const isCreating = ref(false)
const isDeleting = ref<string | null>(null)
const isChecking = ref<string | null>(null)

export function useLos() {
  const { success, error } = useToast()

  async function fetchLose() {
    isLoading.value = true
    try {
      const data = await $fetch<Los[]>('/api/los')
      lose.value = data
    } catch (e) {
      error('Lose konnten nicht geladen werden')
    } finally {
      isLoading.value = false
    }
  }

  async function createLos(data: CreateLosData) {
    isCreating.value = true
    try {
      const newLos = await $fetch<Los>('/api/los', {
        method: 'POST',
        body: data,
      })
      lose.value.unshift(newLos)
      success('Los wurde hinzugefügt')
      return newLos
    } catch (e: any) {
      error(e?.data?.message || 'Los konnte nicht erstellt werden')
      return null
    } finally {
      isCreating.value = false
    }
  }

  async function updateLos(id: string, data: Partial<CreateLosData & { isActive: boolean }>) {
    try {
      const updated = await $fetch<Los>(`/api/los/${id}`, {
        method: 'PUT',
        body: data,
      })
      const index = lose.value.findIndex(l => l._id === id)
      if (index !== -1) lose.value[index] = updated
      success('Los wurde aktualisiert')
      return updated
    } catch (e: any) {
      error(e?.data?.message || 'Los konnte nicht aktualisiert werden')
      return null
    }
  }

  async function deleteLos(id: string) {
    isDeleting.value = id
    try {
      await $fetch(`/api/los/${id}`, { method: 'DELETE' })
      lose.value = lose.value.filter(l => l._id !== id)
      success('Los wurde gelöscht')
    } catch (e: any) {
      error(e?.data?.message || 'Los konnte nicht gelöscht werden')
    } finally {
      isDeleting.value = null
    }
  }

  async function quickCheck(id: string) {
    isChecking.value = id
    try {
      const result = await $fetch<{ los: Los; results: any[] }>(`/api/los/${id}/check`, {
        method: 'POST',
      })
      // Update the los in the list
      const index = lose.value.findIndex(l => l._id === id)
      if (index !== -1) lose.value[index] = result.los
      success('Los wurde geprüft')
      return result
    } catch (e: any) {
      error(e?.data?.message || 'Quick-Check fehlgeschlagen')
      return null
    } finally {
      isChecking.value = null
    }
  }

  const activeLose = computed(() => lose.value.filter(l => l.isActive))
  const wonLose = computed(() => lose.value.filter(l => l.lastCheckResult?.hasWon))

  return {
    lose,
    activeLose,
    wonLose,
    isLoading,
    isCreating,
    isDeleting,
    isChecking,
    fetchLose,
    createLos,
    updateLos,
    deleteLos,
    quickCheck,
  }
}
