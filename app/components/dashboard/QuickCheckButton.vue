<template>
  <v-btn
    icon
    variant="text"
    size="small"
    :loading="isChecking === losId"
    @click="$emit('check')"
  >
    <v-icon :class="{ 'spin-animation': isChecking === losId }">mdi-refresh</v-icon>
    <v-tooltip activator="parent" location="top">Quick-Check</v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
defineProps<{
  losId: string
  isChecking: string | null
}>()

defineEmits<{
  check: []
}>()
</script>

<style scoped>
.spin-animation {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
