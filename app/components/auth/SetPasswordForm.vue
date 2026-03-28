<template>
  <div>
    <h2 class="text-h5 font-weight-bold text-center mb-2">Neues Passwort setzen</h2>
    <p class="text-body-2 text-center mb-6" style="color: var(--v-theme-secondary)">
      Wähle ein neues Passwort für dein Konto.
    </p>

    <v-form @submit.prevent="handleSetPassword">
      <v-text-field
        v-model="newPassword"
        label="Neues Passwort"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :error-messages="errors.newPassword"
        hint="Mindestens 8 Zeichen"
        class="mb-2"
        @click:append-inner="showPassword = !showPassword"
      />
      <v-text-field
        v-model="confirmPassword"
        label="Passwort bestätigen"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        prepend-inner-icon="mdi-lock-check"
        :error-messages="errors.confirmPassword"
        class="mb-4"
      />

      <v-btn
        type="submit"
        color="primary"
        block
        size="large"
        :loading="loading"
        :disabled="!newPassword || !confirmPassword"
      >
        Passwort speichern
      </v-btn>
    </v-form>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-4" density="compact">
      {{ errorMsg }}
    </v-alert>

    <v-alert v-if="successMsg" type="success" variant="tonal" class="mt-4" density="compact">
      {{ successMsg }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const auth = useAuth()

const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    navigateTo('/login')
  }
})

async function handleSetPassword() {
  errors.value = {}
  errorMsg.value = ''
  successMsg.value = ''

  if (newPassword.value.length < 8) {
    errors.value.newPassword = 'Mindestens 8 Zeichen'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwörter stimmen nicht überein'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/user/set-password', {
      method: 'POST',
      body: { newPassword: newPassword.value },
    })
    successMsg.value = 'Passwort erfolgreich gesetzt!'
    setTimeout(() => navigateTo('/dashboard'), 1500)
  } catch (e) {
    errorMsg.value =
      (e as { data?: { message?: string } })?.data?.message ||
      'Passwort konnte nicht gesetzt werden'
  } finally {
    loading.value = false
  }
}
</script>
