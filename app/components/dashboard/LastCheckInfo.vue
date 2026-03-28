<template>
  <div v-if="lastCheckResult" class="text-caption" style="color: var(--v-theme-secondary)">
    Zuletzt geprüft: {{ formatRelativeTime(lastCheckResult.checkedAt) }}
  </div>
  <div v-else class="text-caption" style="color: var(--v-theme-secondary)">
    Noch nicht geprüft
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '~/utils/formatters'

defineProps<{
  lastCheckResult: { checkedAt: string } | null
}>()
</script>
