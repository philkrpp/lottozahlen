<template>
  <v-text-field
    :model-value="modelValue"
    label="Slack Webhook URL"
    placeholder="https://hooks.slack.com/services/..."
    prepend-inner-icon="mdi-slack"
    :rules="[v => !v || v.startsWith('https://') || 'URL muss mit https:// beginnen']"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
