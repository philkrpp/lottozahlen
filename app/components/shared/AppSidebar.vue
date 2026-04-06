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
        <div class="d-flex align-center mb-3">
          <ThemeToggle />
          <v-tooltip text="Abmelden" location="top">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-logout" variant="text" size="small" @click="handleLogout" />
            </template>
          </v-tooltip>
        </div>
        <v-divider class="mb-3" />
        <v-list-item
          v-if="user"
          density="compact"
          rounded="lg"
          class="sidebar-user-item"
        >
          <template #prepend>
            <v-avatar size="28" color="primary" class="me-2">
              <span class="font-weight-bold" style="font-size: 0.65rem">{{ userInitials }}</span>
            </v-avatar>
          </template>
          <v-list-item-title class="sidebar-user-name">{{ user.name || user.email }}</v-list-item-title>
          <v-list-item-subtitle class="sidebar-user-email">{{ user.email }}</v-list-item-subtitle>
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

<style scoped>
.sidebar-user-item :deep(.v-list-item__prepend) {
  margin-inline-end: 0;
}

.sidebar-user-name {
  font-size: 0.75rem !important;
  line-height: 1.2;
}

.sidebar-user-email {
  font-size: 0.65rem !important;
  line-height: 1.2;
}
</style>
