<template>
  <div>
    <h2 class="text-h5 font-weight-bold text-center mb-6">Konto erstellen</h2>

    <OAuthButtons />

    <v-form @submit.prevent="handleRegister">
      <v-text-field
        v-model="name"
        label="Name"
        autocomplete="name"
        prepend-inner-icon="mdi-account"
        :error-messages="errors.name"
        class="mb-2"
      />
      <v-text-field
        v-model="email"
        label="E-Mail"
        type="email"
        autocomplete="email"
        prepend-inner-icon="mdi-email"
        :error-messages="errors.email"
        class="mb-2"
      />
      <v-text-field
        v-model="password"
        label="Passwort"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        :error-messages="errors.password"
        hint="Mindestens 8 Zeichen"
        class="mb-2"
        @click:append-inner="showPassword = !showPassword"
      />
      <v-text-field
        v-model="passwordConfirm"
        label="Passwort bestätigen"
        :type="showPassword ? 'text' : 'password'"
        autocomplete="new-password"
        prepend-inner-icon="mdi-lock-check"
        :error-messages="errors.passwordConfirm"
        class="mb-2"
      />
      <v-checkbox v-model="agb" :error-messages="errors.agb" density="compact" class="mb-4">
        <template #label>
          <span>
            Ich akzeptiere die
            <NuxtLink to="/agb" target="_blank" class="text-primary" @click.stop>AGB</NuxtLink>
            und
            <NuxtLink to="/datenschutz" target="_blank" class="text-primary" @click.stop
              >Datenschutzerklärung</NuxtLink
            >
          </span>
        </template>
      </v-checkbox>

      <v-btn type="submit" color="primary" block size="large" :loading="loading">
        Registrieren
      </v-btn>
    </v-form>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-4" density="compact">
      {{ errorMsg }}
    </v-alert>

    <p class="text-center text-body-2 mt-6">
      Bereits ein Konto?
      <NuxtLink to="/login" class="text-primary text-decoration-none font-weight-bold">
        Anmelden
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'
import OAuthButtons from './OAuthButtons.vue'

const { signUp } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const agb = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const errors = ref<Record<string, string>>({})

async function handleRegister() {
  errors.value = {}
  errorMsg.value = ''

  if (!name.value) {
    errors.value.name = 'Name ist erforderlich'
    return
  }
  if (!email.value) {
    errors.value.email = 'E-Mail ist erforderlich'
    return
  }
  if (password.value.length < 8) {
    errors.value.password = 'Mindestens 8 Zeichen'
    return
  }
  if (password.value !== passwordConfirm.value) {
    errors.value.passwordConfirm = 'Passwörter stimmen nicht überein'
    return
  }
  if (!agb.value) {
    errors.value.agb = 'Bitte AGB akzeptieren'
    return
  }

  loading.value = true
  try {
    const result = await signUp.email({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    if (result.error) {
      errorMsg.value = result.error.message || 'Registrierung fehlgeschlagen'
    } else {
      navigateTo({ path: '/verify-email', query: { email: email.value } })
    }
  } catch {
    errorMsg.value = 'Registrierung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}
</script>
