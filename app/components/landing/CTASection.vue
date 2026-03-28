<template>
  <section class="section" style="position: relative; overflow: hidden">
    <ClientOnly>
      <div style="position: absolute; inset: 0; z-index: 0; pointer-events: none">
        <Particles
          :particle-colors="[vueBitsColors.particleColor]"
          :particle-count="30"
          :speed="0.3"
        />
      </div>
    </ClientOnly>

    <v-container style="position: relative; z-index: 1" class="text-center">
      <div class="mb-6">
        <ClientOnly>
          <DecryptedText
            text="Bereit, dein Glück zu prüfen?"
            class="text-h3 font-weight-bold"
            animate-on="view"
            sequential
          />
          <template #fallback>
            <h2 class="text-h3 font-weight-bold">Bereit, dein Glück zu prüfen?</h2>
          </template>
        </ClientOnly>
      </div>

      <v-btn
        color="primary"
        size="x-large"
        rounded="lg"
        to="/register"
        class="mb-4"
        min-width="240"
      >
        Jetzt kostenlos starten
      </v-btn>

      <p class="text-body-2 mt-4" style="color: var(--v-theme-secondary)">
        Kostenlos. Keine Kreditkarte nötig.
      </p>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import { useAppTheme } from '~/composables/useAppTheme'

const { vueBitsColors } = useAppTheme()
</script>
