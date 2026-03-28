<template>
  <v-timeline side="end" density="compact">
    <v-timeline-item
      v-for="draw in draws"
      :key="draw._id"
      :dot-color="hasWonInDraw(draw) ? 'accent' : 'primary'"
      size="small"
    >
      <v-card class="glass-card pa-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-subtitle-2 font-weight-bold">{{ formatDate(draw.drawDate) }}</span>
          <v-chip size="x-small" variant="tonal">{{ draw.drawType || 'Hauptziehung' }}</v-chip>
        </div>
        <div class="d-flex flex-wrap ga-1 mb-2">
          <span v-for="num in draw.results.winningNumbers" :key="num" class="lotto-ball">{{ num }}</span>
        </div>
        <v-chip v-if="hasWonInDraw(draw)" color="accent" size="small" prepend-icon="mdi-party-popper">
          Gewonnen!
        </v-chip>
      </v-card>
    </v-timeline-item>
  </v-timeline>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/formatters'

const props = defineProps<{
  draws: Array<{
    _id: string
    drawDate: string
    drawType: string
    results: { winningNumbers: string[] }
  }>
  userWinDrawIds?: string[]
}>()

function hasWonInDraw(draw: { _id: string }): boolean {
  return props.userWinDrawIds?.includes(draw._id) ?? false
}
</script>
