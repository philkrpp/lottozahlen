<template>
  <div>
    <h2 class="text-h5 font-weight-bold text-center mb-6">Willkommen zurück</h2>

    <OAuthButtons class="mb-6" />

    <div class="d-flex align-center mb-6">
      <v-divider />
      <span class="mx-4 text-body-2" style="color: var(--v-theme-secondary)">oder</span>
      <v-divider />
    </div>

    <v-form @submit.prevent="handleLogin">
      <v-text-field
        v-model="email"
        label="E-Mail"
        type="email"
        prepend-inner-icon="mdi-email"
        :error-messages="errors.email"
        class="mb-2"
      />
      <v-text-field
        v-model="password"
        label="Passwort"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        :error-messages="errors.password"
        class="mb-2"
      />

      <div class="text-right mb-4">
        <NuxtLink to="/forgot-password" class="text-body-2 text-primary text-decoration-none">
          Passwort vergessen?
        </NuxtLink>
      </div>

      <v-btn
        type="submit"
        color="primary"
        block
        size="large"
        :loading="loading"
      >
        Anmelden
      </v-btn>
    </v-form>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-4" density="compact">
      {{ errorMsg }}
    </v-alert>

    <p class="text-center text-body-2 mt-6">
      Noch kein Konto?
      <NuxtLink to="/register" class="text-primary text-decoration-none font-weight-bold">
        Registrieren
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import OAuthButtons from './OAuthButtons.vue'

const { signIn } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const errors = ref<Record<string, string>>({})

async function handleLogin() {
  errors.value = {}
  errorMsg.value = ''

  if (!email.value) { errors.value.email = 'E-Mail ist erforderlich'; return }
  if (!password.value) { errors.value.password = 'Passwort ist erforderlich'; return }

  loading.value = true
  try {
    const result = await signIn.email({ email: email.value, password: password.value })
    if (result.error) {
      errorMsg.value = 'Ungültige E-Mail oder Passwort'
    } else {
      navigateTo('/dashboard')
    }
  } catch (e: any) {
    errorMsg.value = 'Anmeldung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>
