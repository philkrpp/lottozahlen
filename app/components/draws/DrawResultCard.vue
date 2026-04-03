<template>
  <v-card class="glass-card pa-4">
    <div class="d-flex justify-space-between align-center mb-3">
      <span class="text-subtitle-2 font-weight-bold">{{ formatDate(drawDate) }}</span>
      <v-chip size="x-small" variant="tonal">{{ drawType || 'Hauptziehung' }}</v-chip>
    </div>
    <EndziffernTable
      :gewinne="results.gewinne"
      :winning-numbers="results.winningNumbers"
    />
  </v-card>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'
import EndziffernTable from '~/components/draws/EndziffernTable.vue'

defineProps<{
  drawDate: string
  drawType: string
  results: {
    winningNumbers: string[]
    gewinne?: Array<{ gewinnzahl: string; gewinn: string; rang: number }>
  }
}>()
</script>
