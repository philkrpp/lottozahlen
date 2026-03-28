<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Ziehungen</h1>

    <!-- Filter Bar -->
    <v-card class="glass-card pa-4 mb-6">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="selectedAnbieter"
            label="Anbieter"
            :items="anbieterItems"
            clearable
            hide-details
            density="compact"
            prepend-inner-icon="mdi-domain"
          />
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <v-btn-toggle v-model="viewMode" mandatory density="compact" color="primary" variant="outlined">
            <v-btn value="timeline" prepend-icon="mdi-timeline">
              Timeline
            </v-btn>
            <v-btn value="table" prepend-icon="mdi-table">
              Tabelle
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card>

    <!-- Loading -->
    <LoadingSkeleton v-if="isLoading" type="card" :count="3" />

    <!-- Empty State -->
    <EmptyState
      v-else-if="draws.length === 0"
      icon="mdi-dice-multiple-outline"
      title="Keine Ziehungen"
      description="Es wurden noch keine Ziehungen gefunden."
    />

    <!-- Timeline View -->
    <template v-else-if="viewMode === 'timeline'">
      <DrawTimeline :draws="draws" />
    </template>

    <!-- Table View -->
    <template v-else>
      <DrawHistoryTable
        :draws="draws"
        :loading="isLoading"
      />
    </template>

    <!-- Pagination -->
    <div v-if="!isLoading && draws.length > 0 && totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination
        :model-value="currentPage"
        :length="totalPages"
        :total-visible="5"
        density="compact"
        rounded
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useDraws } from '~/composables/useDraws'
import { ANBIETER } from '~/utils/constants'
import DrawTimeline from '~/components/draws/DrawTimeline.vue'
import DrawHistoryTable from '~/components/draws/DrawHistoryTable.vue'
import EmptyState from '~/components/shared/EmptyState.vue'
import LoadingSkeleton from '~/components/shared/LoadingSkeleton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { draws, isLoading, currentPage, totalPages, fetchDraws } = useDraws()

const selectedAnbieter = ref<string | null>(null)
const viewMode = ref<'timeline' | 'table'>('timeline')

const anbieterItems = computed(() =>
  Object.values(ANBIETER).map(a => ({ title: a.name, value: a.slug }))
)

onMounted(() => {
  loadDraws()
})

watch(selectedAnbieter, () => {
  loadDraws(1)
})

function loadDraws(page?: number) {
  fetchDraws({
    page: page || 1,
    limit: 10,
    anbieter: selectedAnbieter.value || undefined,
  })
}

function handlePageChange(page: number) {
  loadDraws(page)
}
</script>
