<template>
  <v-list-item
    :title="losNummer"
    :subtitle="displayName || anbieterLabel"
    class="rounded-lg mb-2"
    border
  >
    <template #prepend>
      <v-icon icon="mdi-ticket" color="primary" />
    </template>
    <template #append>
      <LosStatusChip :last-check-result="lastCheckResult" :is-active="isActive" class="mr-2" />
      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        :loading="isChecking === id"
        @click="$emit('quickCheck', id)"
      />
      <v-btn icon="mdi-pencil" variant="text" size="small" @click="$emit('edit', id)" />
      <v-btn
        icon="mdi-delete"
        variant="text"
        size="small"
        color="error"
        @click="$emit('delete', id)"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ANBIETER } from '~/utils/constants'
import LosStatusChip from '~/components/dashboard/LosStatusChip.vue'

const props = defineProps<{
  id: string
  losNummer: string
  anbieter: string
  losTyp: string
  displayName?: string
  isActive: boolean
  lastCheckResult: { hasWon: boolean; prize: string | null; checkedAt: string } | null
  isChecking: string | null
}>()

defineEmits<{
  quickCheck: [id: string]
  edit: [id: string]
  delete: [id: string]
}>()

const anbieterLabel = computed(() => {
  const a = ANBIETER[props.anbieter as keyof typeof ANBIETER]
  return a?.name || props.anbieter
})
</script>
