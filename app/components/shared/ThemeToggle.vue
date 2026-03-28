<template>
  <div class="theme-toggle">
    <v-btn-toggle
      v-if="!mobile"
      :model-value="theme"
      mandatory
      density="compact"
      rounded="pill"
      color="primary"
      variant="outlined"
      @update:model-value="setTheme"
    >
      <v-btn value="light" size="small" icon>
        <v-icon size="18">mdi-white-balance-sunny</v-icon>
      </v-btn>
      <v-btn value="dark" size="small" icon>
        <v-icon size="18">mdi-moon-waning-crescent</v-icon>
      </v-btn>
      <v-btn value="system" size="small" icon>
        <v-icon size="18">mdi-monitor</v-icon>
      </v-btn>
    </v-btn-toggle>

    <v-btn
      v-else
      icon
      variant="text"
      size="small"
      @click="toggleTheme"
    >
      <v-icon>
        {{ isDark ? 'mdi-moon-waning-crescent' : 'mdi-white-balance-sunny' }}
      </v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { useAppTheme } from '~/composables/useAppTheme'

const { mobile } = useDisplay()
const { theme, isDark, setTheme, toggleTheme } = useAppTheme()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
}
</style>
