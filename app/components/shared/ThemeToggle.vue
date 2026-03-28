<template>
  <v-btn
    icon
    variant="text"
    size="small"
    :aria-label="isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'"
    @click="toggleTheme"
  >
    <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { useAppTheme } from '~/composables/useAppTheme'

const { isDark, toggleTheme } = useAppTheme()
</script>
