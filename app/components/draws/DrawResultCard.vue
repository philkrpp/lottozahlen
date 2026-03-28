<template>
  <v-card class="glass-card pa-4">
    <div class="d-flex justify-space-between align-center mb-3">
      <span class="text-subtitle-2 font-weight-bold">{{ formatDate(drawDate) }}</span>
      <v-chip size="x-small" variant="tonal">{{ drawType || 'Hauptziehung' }}</v-chip>
    </div>
    <div class="d-flex flex-wrap ga-1">
      <span v-for="num in results.winningNumbers" :key="num" class="lotto-ball">{{ num }}</span>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'

defineProps<{
  drawDate: string
  drawType: string
  results: { winningNumbers: string[] }
}>()
</script>
