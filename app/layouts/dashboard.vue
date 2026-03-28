<template>
  <v-app>
    <AppSidebar />

    <!-- Mobile Topbar -->
    <v-app-bar
      v-if="mobile"
      flat
      density="compact"
      :style="{ background: 'var(--navbar-bg)', backdropFilter: 'blur(12px)' }"
    >
      <NuxtLink to="/dashboard" class="text-decoration-none ml-4">
        <span class="text-h6 font-weight-bold text-gradient">Lottozahlen</span>
      </NuxtLink>
      <v-spacer />
      <ThemeToggle class="mr-2" />
      <v-btn icon="mdi-logout" variant="text" size="small" class="mr-2" @click="handleLogout" />
    </v-app-bar>

    <v-main>
      <v-container fluid class="pa-4 pa-md-8">
        <slot />
      </v-container>
    </v-main>

    <!-- Global Toast -->
    <v-snackbar
      v-model="show"
      :color="toast.color"
      :timeout="toast.timeout"
      location="bottom right"
    >
      {{ toast.message }}
      <template #actions>
        <v-btn variant="text" @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import AppSidebar from '~/components/shared/AppSidebar.vue'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
import { useToast } from '~/composables/useToast'
import { useAuth } from '~/composables/useAuth'
import { useUserPreferences } from '~/composables/useUserPreferences'

const { mobile } = useDisplay()
const { show, toast } = useToast()
const { signOut } = useAuth()
const { loadPreferences } = useUserPreferences()

onMounted(() => {
  loadPreferences()
})

async function handleLogout() {
  await signOut()
  navigateTo('/login')
}
</script>
