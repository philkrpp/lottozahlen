<template>
  <v-badge v-if="count > 0" :content="count" color="accent" overlap>
    <slot />
  </v-badge>
  <slot v-else />
</template>

<script setup lang="ts">
defineProps<{
  count: number
}>()
</script>
