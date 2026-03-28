<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Dashboard</h1>

    <!-- Status Cards -->
    <v-row class="mb-8">
      <v-col v-for="stat in statusCards" :key="stat.title" cols="6" md="3">
        <v-card class="glass-card pa-4 text-center">
          <v-icon :icon="stat.icon" :color="stat.color" size="32" class="mb-2" />
          <ClientOnly>
            <div class="text-h4 font-weight-bold" :class="`text-${stat.color}`">
              <CountUp :from="0" :to="stat.value" :duration="1.5" />
            </div>
            <template #fallback>
              <div class="text-h4 font-weight-bold" :class="`text-${stat.color}`">{{ stat.value }}</div>
            </template>
          </ClientOnly>
          <p class="text-caption mt-1" style="color: var(--v-theme-secondary)">{{ stat.title }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Lose Section -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5 font-weight-bold">Meine Lose</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
        Los hinzufügen
      </v-btn>
    </div>

    <LoadingSkeleton v-if="isLoading" type="card" :count="3" />

    <EmptyState
      v-else-if="activeLose.length === 0"
      icon="mdi-ticket-outline"
      title="Noch keine Lose"
      description="Füge dein erstes Los hinzu und werde automatisch benachrichtigt."
    >
      <template #action>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
          Los hinzufügen
        </v-btn>
      </template>
    </EmptyState>

    <v-row v-else>
      <v-col v-for="los in activeLose" :key="los._id" cols="12" sm="6" lg="4">
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

    <!-- Latest Draws -->
    <div class="mt-8">
      <LatestDrawResults :draws="recentDraws" />
    </div>

    <!-- Add/Edit Dialog -->
    <LosFormDialog
      v-model="showAddDialog"
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
import { useDraws } from '~/composables/useDraws'
import LosOverviewCard from '~/components/dashboard/LosOverviewCard.vue'
import LatestDrawResults from '~/components/dashboard/LatestDrawResults.vue'
import LosFormDialog from '~/components/los/LosFormDialog.vue'
import LosDeleteConfirm from '~/components/los/LosDeleteConfirm.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import LoadingSkeleton from '~/components/shared/LoadingSkeleton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { lose, activeLose, wonLose, isLoading, isChecking, isDeleting, fetchLose, createLos, updateLos, deleteLos, quickCheck } = useLos()
const { draws, fetchDraws } = useDraws()

const showAddDialog = ref(false)
const showDeleteDialog = ref(false)
const editingLos = ref<any>(null)
const deletingLosId = ref<string | null>(null)

const recentDraws = computed(() => draws.value.slice(0, 5))

const statusCards = computed(() => [
  { title: 'Aktive Lose', value: activeLose.value.length, icon: 'mdi-ticket', color: 'primary' },
  { title: 'Geprüft', value: lose.value.filter(l => l.lastCheckResult).length, icon: 'mdi-check-circle', color: 'success' },
  { title: 'Ausstehend', value: activeLose.value.filter(l => !l.lastCheckResult).length, icon: 'mdi-clock-outline', color: 'warning' },
  { title: 'Gewinne', value: wonLose.value.length, icon: 'mdi-party-popper', color: 'accent' },
])

onMounted(async () => {
  await Promise.all([fetchLose(), fetchDraws({ limit: 5 })])
})

async function handleSubmit(data: { losNummer: string; anbieter: string; losTyp: string; displayName?: string }) {
  if (editingLos.value) {
    await updateLos(editingLos.value._id, data)
  } else {
    await createLos(data)
  }
  showAddDialog.value = false
  editingLos.value = null
}

function handleEdit(id: string) {
  editingLos.value = lose.value.find(l => l._id === id) || null
  showAddDialog.value = true
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

async function handleQuickCheck(id: string) {
  await quickCheck(id)
}
</script>
