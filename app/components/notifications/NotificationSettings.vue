<template>
  <div>
    <h3 class="text-h6 font-weight-bold mb-4">Benachrichtigungen</h3>

    <v-switch
      v-model="emailEnabled"
      label="E-Mail-Benachrichtigungen"
      color="primary"
      hide-details
      class="mb-2"
      @update:model-value="save({ emailEnabled: $event as boolean })"
    />

    <v-text-field
      v-if="emailEnabled"
      v-model="emailAddress"
      label="E-Mail-Adresse"
      type="email"
      prepend-inner-icon="mdi-email"
      class="mb-4 ml-8"
      @update:model-value="debouncedSave({ emailAddress: $event as string })"
    />

    <v-switch
      v-model="slackEnabled"
      label="Slack-Benachrichtigungen"
      color="primary"
      hide-details
      class="mb-2"
      @update:model-value="save({ slackEnabled: $event as boolean })"
    />

    <v-text-field
      v-if="slackEnabled"
      v-model="slackWebhookUrl"
      label="Slack Webhook URL"
      placeholder="https://hooks.slack.com/services/..."
      prepend-inner-icon="mdi-slack"
      class="mb-4 ml-8"
      @update:model-value="debouncedSave({ slackWebhookUrl: $event as string })"
    />

    <v-divider class="my-4" />

    <v-checkbox
      v-model="notifyOnWin"
      label="Bei Gewinn benachrichtigen"
      color="primary"
      hide-details
      density="compact"
      @update:model-value="save({ notifyOnWin: $event as boolean })"
    />
    <v-checkbox
      v-model="notifyOnNoWin"
      label="Auch bei Nicht-Gewinn benachrichtigen"
      color="primary"
      hide-details
      density="compact"
      @update:model-value="save({ notifyOnNoWin: $event as boolean })"
    />
    <v-checkbox
      v-model="notifyOnNewDraw"
      label="Bei neuer Ziehung informieren"
      color="primary"
      hide-details
      density="compact"
      @update:model-value="save({ notifyOnNewDraw: $event as boolean })"
    />

    <v-divider class="my-4" />

    <div class="d-flex ga-2">
      <v-btn variant="outlined" size="small" prepend-icon="mdi-email" @click="$emit('testEmail')">
        Test E-Mail
      </v-btn>
      <v-btn
        variant="outlined"
        size="small"
        prepend-icon="mdi-slack"
        :disabled="!slackEnabled"
        @click="$emit('testSlack')"
      >
        Test Slack
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  settings: {
    emailEnabled: boolean
    emailAddress: string
    slackEnabled: boolean
    slackWebhookUrl: string | null
    notifyOnWin: boolean
    notifyOnNoWin: boolean
    notifyOnNewDraw: boolean
  } | null
}>()

const emit = defineEmits<{
  update: [data: Record<string, string | boolean | null>]
  testEmail: []
  testSlack: []
}>()

const emailEnabled = ref(true)
const emailAddress = ref('')
const slackEnabled = ref(false)
const slackWebhookUrl = ref('')
const notifyOnWin = ref(true)
const notifyOnNoWin = ref(false)
const notifyOnNewDraw = ref(true)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.settings,
  (s) => {
    if (s) {
      emailEnabled.value = s.emailEnabled
      emailAddress.value = s.emailAddress || ''
      slackEnabled.value = s.slackEnabled
      slackWebhookUrl.value = s.slackWebhookUrl || ''
      notifyOnWin.value = s.notifyOnWin
      notifyOnNoWin.value = s.notifyOnNoWin
      notifyOnNewDraw.value = s.notifyOnNewDraw
    }
  },
  { immediate: true },
)

function save(data: Record<string, string | boolean | null>) {
  emit('update', data)
}

function debouncedSave(data: Record<string, string | boolean | null>) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => save(data), 500)
}
</script>

<style scoped>
:deep(.v-switch .v-switch__track) {
  background-color: #9e9e9e;
  opacity: 1;
}
:deep(.v-switch .v-selection-control--dirty .v-switch__track) {
  background-color: rgb(var(--v-theme-primary));
}
</style>
