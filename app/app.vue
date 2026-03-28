<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useAppTheme } from '~/composables/useAppTheme'

// Initialize theme on app mount
const { initTheme } = useAppTheme()
</script>
