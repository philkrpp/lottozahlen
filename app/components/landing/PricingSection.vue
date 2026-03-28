<template>
  <section class="section">
    <v-container class="text-center">
      <h2 class="text-h3 font-weight-bold text-gradient mb-4">Kostenlos starten</h2>
      <p class="text-h6 mb-8" style="color: var(--v-theme-secondary)">
        Lottozahlen ist aktuell komplett kostenlos nutzbar.
      </p>
      <v-card class="glass-card pa-8 mx-auto" max-width="400">
        <h3 class="text-h4 font-weight-bold mb-2">Free</h3>
        <p class="text-h3 font-weight-bold text-primary mb-4">0 &euro;</p>
        <v-list density="compact" class="text-left mb-6" bg-color="transparent">
          <v-list-item prepend-icon="mdi-check-circle" title="Unbegrenzt Lose" />
          <v-list-item prepend-icon="mdi-check-circle" title="Automatische Prüfung" />
          <v-list-item prepend-icon="mdi-check-circle" title="E-Mail & Slack Benachrichtigungen" />
          <v-list-item prepend-icon="mdi-check-circle" title="Quick-Check" />
        </v-list>
        <v-btn color="primary" block size="large" to="/register">Kostenlos registrieren</v-btn>
      </v-card>
    </v-container>
  </section>
</template>

<script setup lang="ts"></script>
