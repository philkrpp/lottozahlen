<template>
  <div>
    <v-btn
      block
      variant="outlined"
      size="large"
      class="mb-3"
      prepend-icon="mdi-google"
      @click="signInWithGoogle"
      :loading="loadingGoogle"
    >
      Weiter mit Google
    </v-btn>
    <v-btn
      block
      variant="outlined"
      size="large"
      prepend-icon="mdi-github"
      @click="signInWithGitHub"
      :loading="loadingGithub"
    >
      Weiter mit GitHub
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { signIn } = useAuth()
const loadingGoogle = ref(false)
const loadingGithub = ref(false)

async function signInWithGoogle() {
  loadingGoogle.value = true
  try {
    await signIn.social({ provider: 'google', callbackURL: '/dashboard' })
  } finally {
    loadingGoogle.value = false
  }
}

async function signInWithGitHub() {
  loadingGithub.value = true
  try {
    await signIn.social({ provider: 'github', callbackURL: '/dashboard' })
  } finally {
    loadingGithub.value = false
  }
}
</script>
