<template>
  <v-text-field
    :model-value="modelValue"
    label="E-Mail-Adresse für Benachrichtigungen"
    type="email"
    prepend-inner-icon="mdi-email"
    :rules="[(v) => !v || /.+@.+\..+/.test(v) || 'Ungültige E-Mail']"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
