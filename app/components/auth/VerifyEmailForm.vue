<template>
  <div>
    <h2 class="text-h5 font-weight-bold text-center mb-2">E-Mail bestätigen</h2>
    <p class="text-body-2 text-center mb-6" style="color: var(--v-theme-secondary)">
      Wir haben einen 6-stelligen Code an <strong>{{ email }}</strong> gesendet.
    </p>

    <v-form @submit.prevent="handleVerify">
      <v-otp-input v-model="otp" :length="6" type="number" class="mb-4" />

      <v-btn
        type="submit"
        color="primary"
        block
        size="large"
        :loading="loading"
        :disabled="otp.length < 6"
      >
        Bestätigen
      </v-btn>
    </v-form>

    <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-4" density="compact">
      {{ errorMsg }}
    </v-alert>

    <div class="text-center mt-6">
      <v-btn
        variant="text"
        size="small"
        :disabled="resendCooldown > 0"
        :loading="resending"
        @click="handleResend"
      >
        {{ resendCooldown > 0 ? `Code erneut senden (${resendCooldown}s)` : 'Code erneut senden' }}
      </v-btn>
    </div>

    <p class="text-center text-body-2 mt-4">
      <NuxtLink to="/login" class="text-primary text-decoration-none"> Zurück zum Login </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const auth = useAuth()

const email = ref((route.query.email as string) || '')
const otp = ref('')
const loading = ref(false)
const resending = ref(false)
const errorMsg = ref('')
const resendCooldown = ref(0)

let cooldownInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  // If user is already verified, redirect to dashboard
  const { data: session } = await auth.getSession()
  if (session?.user?.emailVerified) {
    navigateTo('/dashboard')
    return
  }
  // Use email from session if not in query
  if (!email.value && session?.user?.email) {
    email.value = session.user.email
  }
  startCooldown()
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})

function startCooldown() {
  resendCooldown.value = 60
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && cooldownInterval) {
      clearInterval(cooldownInterval)
    }
  }, 1000)
}

async function handleVerify() {
  errorMsg.value = ''
  if (!email.value || otp.value.length < 6) return

  loading.value = true
  try {
    const result = await auth.emailOtp.verifyEmail({ email: email.value, otp: otp.value })
    if (result.error) {
      errorMsg.value = getErrorMessage(result.error.code)
    } else {
      navigateTo('/dashboard')
    }
  } catch {
    errorMsg.value = 'Verifizierung fehlgeschlagen'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  errorMsg.value = ''
  resending.value = true
  try {
    await auth.emailOtp.sendVerificationOTP({ email: email.value, type: 'email-verification' })
    startCooldown()
  } catch {
    errorMsg.value = 'Code konnte nicht gesendet werden'
  } finally {
    resending.value = false
  }
}

function getErrorMessage(code?: string): string {
  switch (code) {
    case 'OTP_EXPIRED':
      return 'Der Code ist abgelaufen. Bitte fordere einen neuen an.'
    case 'INVALID_OTP':
      return 'Ungültiger Code. Bitte überprüfe deine Eingabe.'
    case 'TOO_MANY_ATTEMPTS':
      return 'Zu viele Versuche. Bitte fordere einen neuen Code an.'
    default:
      return 'Verifizierung fehlgeschlagen'
  }
}
</script>
