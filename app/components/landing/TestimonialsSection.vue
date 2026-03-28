<template>
  <section class="section">
    <v-container>
      <h2 class="text-h3 font-weight-bold text-center mb-12">Was unsere Nutzer sagen</h2>
      <v-row>
        <v-col v-for="testimonial in testimonials" :key="testimonial.name" cols="12" md="4">
          <ClientOnly>
            <AnimatedContent :delay="100">
              <v-card class="glass-card pa-6 h-100">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary" size="48" class="mr-3">
                    <span class="text-h6 font-weight-bold">{{ testimonial.initials }}</span>
                  </v-avatar>
                  <div>
                    <p class="font-weight-bold">{{ testimonial.name }}</p>
                    <p class="text-caption" style="color: var(--v-theme-secondary)">Nutzer seit {{ testimonial.since }}</p>
                  </div>
                </div>
                <p class="text-body-2" style="font-style: italic; color: var(--v-theme-secondary)">
                  "{{ testimonial.quote }}"
                </p>
              </v-card>
            </AnimatedContent>
            <template #fallback>
              <v-card class="glass-card pa-6 h-100">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary" size="48" class="mr-3">
                    <span class="text-h6 font-weight-bold">{{ testimonial.initials }}</span>
                  </v-avatar>
                  <div>
                    <p class="font-weight-bold">{{ testimonial.name }}</p>
                  </div>
                </div>
                <p class="text-body-2" style="font-style: italic;">"{{ testimonial.quote }}"</p>
              </v-card>
            </template>
          </ClientOnly>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const testimonials = [
  { name: 'Maria S.', initials: 'MS', since: '2024', quote: 'Endlich muss ich nicht mehr selbst prüfen! Die automatische Benachrichtigung ist Gold wert.' },
  { name: 'Thomas K.', initials: 'TK', since: '2024', quote: 'Super einfach zu bedienen. Los eintragen und fertig – den Rest macht die App.' },
  { name: 'Anna L.', initials: 'AL', since: '2025', quote: 'Ich habe tatsächlich einen Gewinn verpasst, bevor ich Lottozahlen genutzt habe. Nie wieder!' },
]
</script>
