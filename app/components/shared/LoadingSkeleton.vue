<template>
  <div>
    <v-skeleton-loader v-for="i in count" :key="i" :type="type" class="mb-4" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: string
    count?: number
  }>(),
  {
    type: 'card',
    count: 3,
  },
)
</script>
