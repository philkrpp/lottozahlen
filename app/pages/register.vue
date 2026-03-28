<template>
  <RegisterForm />
</template>

<script setup lang="ts">
import RegisterForm from '~/components/auth/RegisterForm.vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})
</script>
