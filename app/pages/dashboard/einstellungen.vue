<template>
  <div>
    <h1 class="text-h4 font-weight-bold mb-6">Einstellungen</h1>

    <!-- Theme Settings -->
    <v-card class="glass-card pa-4 mb-6">
      <h2 class="text-subtitle-1 font-weight-bold mb-4">Erscheinungsbild</h2>

      <div class="mb-4">
        <p class="text-body-2 mb-2" style="color: var(--v-theme-secondary)">Farbschema</p>
        <v-btn-toggle
          :model-value="preferences.theme"
          mandatory
          density="compact"
          color="primary"
          variant="outlined"
          @update:model-value="handleThemeChange"
        >
          <v-btn value="light" prepend-icon="mdi-white-balance-sunny"> Hell </v-btn>
          <v-btn value="system" prepend-icon="mdi-monitor"> System </v-btn>
          <v-btn value="dark" prepend-icon="mdi-moon-waning-crescent"> Dunkel </v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- Dashboard Layout -->
    <v-card class="glass-card pa-4 mb-6">
      <h2 class="text-subtitle-1 font-weight-bold mb-4">Dashboard-Layout</h2>

      <v-btn-toggle
        :model-value="preferences.dashboardLayout"
        mandatory
        density="compact"
        color="primary"
        variant="outlined"
        @update:model-value="updatePreference('dashboardLayout', $event as 'grid' | 'list')"
      >
        <v-btn value="grid" prepend-icon="mdi-view-grid"> Kacheln </v-btn>
        <v-btn value="list" prepend-icon="mdi-view-list"> Liste </v-btn>
      </v-btn-toggle>
    </v-card>

    <!-- Notification Settings -->
    <v-card class="glass-card pa-4 mb-6">
      <NotificationSettings
        :settings="notificationSettings"
        @update="handleNotificationUpdate"
        @test-email="handleTestEmail"
        @test-slack="handleTestSlack"
      />
    </v-card>

    <!-- Profile Section -->
    <v-card class="glass-card pa-4 mb-6">
      <h2 class="text-subtitle-1 font-weight-bold mb-4">Profil</h2>

      <v-text-field
        v-model="displayName"
        label="Anzeigename"
        prepend-inner-icon="mdi-account"
        hide-details
        class="mb-4"
        @update:model-value="debouncedSaveName"
      />

      <v-divider class="my-4" />

      <div>
        <p class="text-body-2 mb-2 text-error">Gefahrenzone</p>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          prepend-icon="mdi-delete-forever"
          @click="showDeleteAccount = true"
        >
          Account löschen
        </v-btn>
      </div>
    </v-card>

    <!-- Saving indicator -->
    <v-fade-transition>
      <div
        v-if="isSavingPrefs"
        class="text-caption text-center"
        style="color: var(--v-theme-secondary)"
      >
        <v-progress-circular size="12" width="2" indeterminate class="mr-1" />
        Wird gespeichert...
      </div>
    </v-fade-transition>

    <!-- Delete Account Confirm -->
    <ConfirmDialog
      v-model="showDeleteAccount"
      title="Account löschen?"
      message="Dein Account und alle zugehörigen Daten werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
      confirm-text="Unwiderruflich löschen"
      confirm-color="error"
      :loading="isDeletingAccount"
      @confirm="handleDeleteAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserPreferences } from '~/composables/useUserPreferences'
import { useAppTheme } from '~/composables/useAppTheme'
import { useNotifications } from '~/composables/useNotifications'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import NotificationSettings from '~/components/notifications/NotificationSettings.vue'
import ConfirmDialog from '~/components/shared/ConfirmDialog.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const { preferences, isSaving: isSavingPrefs, updatePreference } = useUserPreferences()
const { setTheme } = useAppTheme()
const {
  settings: notificationSettings,
  fetchSettings,
  updateSettings,
  sendTestNotification,
} = useNotifications()
const { signOut } = useAuth()
const { error: toastError } = useToast()

const displayName = ref('')
const showDeleteAccount = ref(false)
const isDeletingAccount = ref(false)

let nameDebounce: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  await fetchSettings()

  try {
    const profile = await $fetch<{ name?: string }>('/api/user/profile')
    if (profile?.name) {
      displayName.value = profile.name
    }
  } catch {
    // silently fail
  }
})

function handleThemeChange(mode: 'light' | 'dark' | 'system') {
  setTheme(mode)
}

function handleNotificationUpdate(data: Record<string, string | boolean | null>) {
  updateSettings(data)
}

async function handleTestEmail() {
  await sendTestNotification('email')
}

async function handleTestSlack() {
  await sendTestNotification('slack')
}

function debouncedSaveName() {
  if (nameDebounce) clearTimeout(nameDebounce)
  nameDebounce = setTimeout(async () => {
    try {
      await $fetch('/api/user/profile', {
        method: 'PUT',
        body: { name: displayName.value },
      })
    } catch {
      toastError('Name konnte nicht gespeichert werden')
    }
  }, 800)
}

async function handleDeleteAccount() {
  isDeletingAccount.value = true
  try {
    await $fetch('/api/user/account', { method: 'DELETE' })
    await signOut()
    navigateTo('/login')
  } catch {
    toastError('Account konnte nicht gelöscht werden')
  } finally {
    isDeletingAccount.value = false
  }
}
</script>
