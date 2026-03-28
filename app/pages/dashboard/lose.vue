<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold">Meine Lose</h1>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
        Los hinzufügen
      </v-btn>
    </div>

    <!-- Search / Filter Bar -->
    <v-card class="glass-card pa-4 mb-6">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="searchText"
            label="Suche"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="compact"
            placeholder="Losnummer oder Name..."
          />
        </v-col>
        <v-col cols="6" sm="4">
          <v-select
            v-model="filterAnbieter"
            label="Anbieter"
            :items="anbieterFilterItems"
            clearable
            hide-details
            density="compact"
          />
        </v-col>
        <v-col cols="6" sm="4">
          <v-select
            v-model="filterStatus"
            label="Status"
            :items="statusFilterItems"
            clearable
            hide-details
            density="compact"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading -->
    <LoadingSkeleton v-if="isLoading" type="card" :count="3" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="lose.length === 0"
      icon="mdi-ticket-outline"
      title="Noch keine Lose"
      description="Füge dein erstes Los hinzu, um automatisch benachrichtigt zu werden."
    >
      <template #action>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">
          Los hinzufügen
        </v-btn>
      </template>
    </EmptyState>

    <!-- No results after filter -->
    <EmptyState
      v-else-if="filteredLose.length === 0"
      icon="mdi-filter-off-outline"
      title="Keine Treffer"
      description="Kein Los entspricht deinen Filterkriterien."
    >
      <template #action>
        <v-btn variant="outlined" @click="clearFilters">Filter zurücksetzen</v-btn>
      </template>
    </EmptyState>

    <!-- Lose Grid -->
    <v-row v-else>
      <v-col v-for="los in filteredLose" :key="los._id" cols="12" sm="6" lg="4">
        <LosOverviewCard
          :id="los._id"
          :los-nummer="los.losNummer"
          :anbieter="los.anbieter"
          :los-typ="los.losTyp"
          :display-name="los.displayName"
          :is-active="los.isActive"
          :last-check-result="los.lastCheckResult"
          :is-checking="isChecking"
          @quick-check="handleQuickCheck"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </v-col>
    </v-row>

    <!-- Result count -->
    <p v-if="filteredLose.length > 0" class="text-caption mt-4" style="color: var(--v-theme-secondary)">
      {{ filteredLose.length }} von {{ lose.length }} Losen
    </p>

    <!-- Add/Edit Dialog -->
    <LosFormDialog
      v-model="showFormDialog"
      :edit-los="editingLos"
      @submit="handleSubmit"
    />

    <!-- Delete Confirm -->
    <LosDeleteConfirm
      v-model="showDeleteDialog"
      :loading="isDeleting !== null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLos } from '~/composables/useLos'
import { ANBIETER } from '~/utils/constants'
import LosOverviewCard from '~/components/dashboard/LosOverviewCard.vue'
import LosFormDialog from '~/components/los/LosFormDialog.vue'
import LosDeleteConfirm from '~/components/los/LosDeleteConfirm.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import LoadingSkeleton from '~/components/shared/LoadingSkeleton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const {
  lose,
  isLoading,
  isChecking,
  isDeleting,
  fetchLose,
  createLos,
  updateLos,
  deleteLos,
  quickCheck,
} = useLos()

const searchText = ref('')
const filterAnbieter = ref<string | null>(null)
const filterStatus = ref<string | null>(null)

const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const editingLos = ref<any>(null)
const deletingLosId = ref<string | null>(null)

const anbieterFilterItems = computed(() =>
  Object.values(ANBIETER).map(a => ({ title: a.name, value: a.slug }))
)

const statusFilterItems = [
  { title: 'Aktiv', value: 'active' },
  { title: 'Inaktiv', value: 'inactive' },
  { title: 'Gewonnen', value: 'won' },
  { title: 'Ausstehend', value: 'pending' },
  { title: 'Geprüft', value: 'checked' },
]

const filteredLose = computed(() => {
  let result = [...lose.value]

  if (searchText.value) {
    const q = searchText.value.toLowerCase()
    result = result.filter(
      l =>
        l.losNummer.includes(q) ||
        (l.displayName && l.displayName.toLowerCase().includes(q))
    )
  }

  if (filterAnbieter.value) {
    result = result.filter(l => l.anbieter === filterAnbieter.value)
  }

  if (filterStatus.value) {
    switch (filterStatus.value) {
      case 'active':
        result = result.filter(l => l.isActive)
        break
      case 'inactive':
        result = result.filter(l => !l.isActive)
        break
      case 'won':
        result = result.filter(l => l.lastCheckResult?.hasWon)
        break
      case 'pending':
        result = result.filter(l => l.isActive && !l.lastCheckResult)
        break
      case 'checked':
        result = result.filter(l => l.lastCheckResult && !l.lastCheckResult.hasWon)
        break
    }
  }

  return result
})

function clearFilters() {
  searchText.value = ''
  filterAnbieter.value = null
  filterStatus.value = null
}

onMounted(() => {
  fetchLose()
})

function openAddDialog() {
  editingLos.value = null
  showFormDialog.value = true
}

function handleEdit(id: string) {
  editingLos.value = lose.value.find(l => l._id === id) || null
  showFormDialog.value = true
}

function handleDelete(id: string) {
  deletingLosId.value = id
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (deletingLosId.value) {
    await deleteLos(deletingLosId.value)
    showDeleteDialog.value = false
    deletingLosId.value = null
  }
}

async function handleSubmit(data: {
  losNummer: string
  anbieter: string
  losTyp: string
  displayName?: string
}) {
  if (editingLos.value) {
    await updateLos(editingLos.value._id, data)
  } else {
    await createLos(data)
  }
  showFormDialog.value = false
  editingLos.value = null
}

async function handleQuickCheck(id: string) {
  await quickCheck(id)
}
</script>
