<template>
  <!-- Desktop Sidebar -->
  <v-navigation-drawer
    v-if="!mobile"
    permanent
    :style="{ background: 'var(--sidebar-bg)', backdropFilter: 'blur(12px)' }"
    border="e"
  >
    <div class="d-flex flex-column h-100">
      <div class="pa-4">
        <NuxtLink to="/dashboard" class="text-decoration-none">
          <span class="text-h6 font-weight-bold text-gradient">Lottozahlen</span>
        </NuxtLink>
      </div>

      <v-list nav density="comfortable" class="flex-grow-1">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          exact
        />
      </v-list>

      <div class="pa-4">
        <ThemeToggle class="mb-4" />
        <v-divider class="mb-4" />
        <v-list-item
          v-if="user"
          :title="user.name || user.email"
          :subtitle="user.email"
          density="compact"
          rounded="lg"
        >
          <template #prepend>
            <v-avatar size="32" color="primary">
              <span class="text-caption font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
          </template>
          <template #append>
            <v-btn icon="mdi-logout" variant="text" size="small" @click="handleLogout" />
          </template>
        </v-list-item>
      </div>
    </div>
  </v-navigation-drawer>

  <!-- Mobile Bottom Navigation -->
  <v-bottom-navigation v-else grow>
    <v-btn v-for="item in navItems" :key="item.to" :to="item.to">
      <v-icon>{{ item.icon }}</v-icon>
      <span class="text-caption">{{ item.shortTitle || item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuth } from '~/composables/useAuth'
import ThemeToggle from './ThemeToggle.vue'

const { mobile } = useDisplay()
const { useSession, signOut } = useAuth()
const session = useSession()

const user = computed(() => session.value?.data?.user)
const userInitials = computed(() => {
  const name = user.value?.name || user.value?.email || ''
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const navItems = [
  { title: 'Dashboard', shortTitle: 'Home', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Meine Lose', shortTitle: 'Lose', icon: 'mdi-ticket', to: '/dashboard/lose' },
  { title: 'Ziehungen', shortTitle: 'Ziehungen', icon: 'mdi-history', to: '/dashboard/ziehungen' },
  {
    title: 'Einstellungen',
    shortTitle: 'Settings',
    icon: 'mdi-cog',
    to: '/dashboard/einstellungen',
  },
]

async function handleLogout() {
  await signOut()
  navigateTo('/login')
}
</script>
