<template>
  <v-dialog v-model="dialogModel" :max-width="500" :fullscreen="mobile">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span>{{ isEdit ? 'Los bearbeiten' : 'Neues Los hinzufügen' }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-select
            v-model="form.anbieter"
            label="Anbieter"
            :items="anbieterItems"
            item-title="name"
            item-value="slug"
            prepend-inner-icon="mdi-domain"
            class="mb-2"
          />

          <v-select
            v-model="form.losTyp"
            label="Los-Typ"
            :items="losTypItems"
            item-title="label"
            item-value="value"
            prepend-inner-icon="mdi-ticket"
            :disabled="!form.anbieter"
            class="mb-2"
          />

          <v-text-field
            v-model="form.losNummer"
            label="Losnummer"
            prepend-inner-icon="mdi-numeric"
            placeholder="1234567"
            :rules="[v => /^\d{7}$/.test(v) || 'Losnummer muss 7 Ziffern haben']"
            maxlength="7"
            class="mb-2"
          />

          <v-text-field
            v-model="form.displayName"
            label="Anzeigename (optional)"
            prepend-inner-icon="mdi-label"
            placeholder="z.B. Mein Glückslos"
            maxlength="50"
            class="mb-2"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close">Abbrechen</v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="handleSubmit">
          {{ isEdit ? 'Speichern' : 'Hinzufügen' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { ANBIETER } from '~/utils/constants'

const props = defineProps<{
  modelValue: boolean
  editLos?: {
    _id: string
    losNummer: string
    anbieter: string
    losTyp: string
    displayName?: string
  } | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: { losNummer: string; anbieter: string; losTyp: string; displayName?: string }]
}>()

const { mobile } = useDisplay()
const loading = ref(false)

const form = ref({
  anbieter: 'deutsche-fernsehlotterie',
  losTyp: '',
  losNummer: '',
  displayName: '',
})

const isEdit = computed(() => !!props.editLos)

const dialogModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const anbieterItems = computed(() =>
  Object.values(ANBIETER).map(a => ({ name: a.name, slug: a.slug }))
)

const losTypItems = computed(() => {
  const a = ANBIETER[form.value.anbieter as keyof typeof ANBIETER]
  return a?.losTypen || []
})

watch(() => props.editLos, (los) => {
  if (los) {
    form.value = {
      anbieter: los.anbieter,
      losTyp: los.losTyp,
      losNummer: los.losNummer,
      displayName: los.displayName || '',
    }
  }
}, { immediate: true })

watch(() => props.modelValue, (open) => {
  if (open && !props.editLos) {
    form.value = { anbieter: 'deutsche-fernsehlotterie', losTyp: '', losNummer: '', displayName: '' }
  }
})

function close() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!/^\d{7}$/.test(form.value.losNummer)) return
  if (!form.value.anbieter || !form.value.losTyp) return

  emit('submit', {
    losNummer: form.value.losNummer,
    anbieter: form.value.anbieter,
    losTyp: form.value.losTyp,
    displayName: form.value.displayName || undefined,
  })
}
</script>
