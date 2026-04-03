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
      <EndziffernTable
        :gewinne="item.results.gewinne"
        :winning-numbers="item.results.winningNumbers"
        compact
      />
    </template>
    <template #item.drawType="{ item }">
      <v-chip size="x-small" variant="tonal">{{ item.drawType || 'Hauptziehung' }}</v-chip>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import EndziffernTable from '~/components/draws/EndziffernTable.vue'

defineProps<{
  draws: Array<{
    _id: string
    drawDate: string
    drawType: string
    results: {
      winningNumbers: string[]
      gewinne?: Array<{ gewinnzahl: string; gewinn: string; rang: number }>
    }
  }>
  loading: boolean
}>()

const headers = [
  { title: 'Datum', key: 'drawDate', sortable: true },
  { title: 'Typ', key: 'drawType' },
  { title: 'Endziffern / Gewinne', key: 'results', sortable: false },
]
</script>
