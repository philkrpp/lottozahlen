<template>
  <v-data-table
    :headers="headers"
    :items="draws"
    :loading="loading"
    items-per-page="10"
    class="glass-card"
  >
    <template #item.drawDate="{ item }">
      {{ formatDate(item.drawDate) }}
    </template>
    <template #item.results="{ item }">
      <div class="d-flex flex-wrap ga-1">
        <span v-for="num in item.results.winningNumbers" :key="num" class="lotto-ball" style="width: 32px; height: 32px; font-size: 0.75rem;">
          {{ num }}
        </span>
      </div>
    </template>
    <template #item.drawType="{ item }">
      <v-chip size="x-small" variant="tonal">{{ item.drawType || 'Hauptziehung' }}</v-chip>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'

defineProps<{
  draws: Array<{
    _id: string
    drawDate: string
    drawType: string
    results: { winningNumbers: string[] }
  }>
  loading: boolean
}>()

const headers = [
  { title: 'Datum', key: 'drawDate', sortable: true },
  { title: 'Typ', key: 'drawType' },
  { title: 'Gewinnzahlen', key: 'results', sortable: false },
]
</script>
