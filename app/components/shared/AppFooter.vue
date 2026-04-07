<template>
	<v-footer
		class="pa-8"
		:style="{ borderTop: '1px solid var(--glass-border)' }"
	>
		<v-container>
			<v-row>
				<v-col
					cols="12"
					md="4"
				>
					<span class="text-h6 font-weight-bold text-gradient">Lottozahlen</span>
					<p
						class="text-body-2 mt-2"
						style="color: var(--v-theme-secondary)"
					>
						Deine Losnummern. Automatisch geprüft.
					</p>
				</v-col>
				<v-col
					cols="6"
					md="4"
				>
					<p class="text-subtitle-2 font-weight-bold mb-2">Links</p>
					<div class="d-flex flex-column">
						<NuxtLink
							to="/#features"
							class="text-body-2 text-decoration-none mb-1"
							>Features</NuxtLink
						>
						<NuxtLink
							to="/#how-it-works"
							class="text-body-2 text-decoration-none mb-1"
							>So funktioniert's</NuxtLink
						>
						<NuxtLink
							to="/#pricing"
							class="text-body-2 text-decoration-none mb-1"
							>Preise</NuxtLink
						>
					</div>
				</v-col>
				<v-col
					cols="6"
					md="4"
				>
					<p class="text-subtitle-2 font-weight-bold mb-2">Rechtliches</p>
					<div class="d-flex flex-column">
						<NuxtLink
							to="/impressum"
							class="text-body-2 text-decoration-none mb-1"
							>Impressum</NuxtLink
						>
						<NuxtLink
							to="/datenschutz"
							class="text-body-2 text-decoration-none mb-1"
							>Datenschutz</NuxtLink
						>
<a
							v-if="!isAuthenticated"
							href="#"
							class="text-body-2 text-decoration-none mb-1"
							data-cc="show-preferencesModal"
							>Cookie-Einstellungen</a
						>
					</div>
				</v-col>
			</v-row>
			<v-divider class="my-4" />
			<div class="d-flex justify-center ga-2 mb-4">
				<v-btn
					icon="mdi-twitter"
					variant="text"
					size="small"
				/>
				<v-btn
					icon="mdi-github"
					variant="text"
					size="small"
				/>
				<v-btn
					icon="mdi-linkedin"
					variant="text"
					size="small"
				/>
				<v-btn
					icon="mdi-instagram"
					variant="text"
					size="small"
				/>
			</div>
			<p
				class="text-body-2 text-center"
				style="color: var(--v-theme-secondary)"
			>
				&copy; {{ new Date().getFullYear() }} Lottozahlen. Alle Rechte vorbehalten.
			</p>
		</v-container>
	</v-footer>
</template>

<script setup lang="ts">
const { useSession } = useAuth();
const session = useSession();
const isAuthenticated = computed(() => !!session.value?.data?.user);
</script>
