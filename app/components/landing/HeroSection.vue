<template>
	<section
		class="hero-section d-flex align-center"
		style="min-height: 100vh; position: relative; overflow: hidden"
	>
		<!-- Aurora Background -->
		<ClientOnly>
			<div style="position: absolute; inset: 0; z-index: 0; pointer-events: none">
				<Aurora
					:color-stops="vueBitsColors.auroraColors"
					:blend="0.5"
					:amplitude="1.0"
					:speed="0.5"
				/>
			</div>
		</ClientOnly>

		<v-container
			style="position: relative; z-index: 1"
			class="text-center"
		>
			<ClientOnly>
				<SplitText
					text="Deine Losnummern. Automatisch geprüft."
					animate-by="words"
					:delay="80"
					class="hero-headline mb-4"
				/>
				<template #fallback>
					<h1 class="hero-headline mb-4">Deine Losnummern. Automatisch geprüft.</h1>
				</template>
			</ClientOnly>

			<ClientOnly>
				<BlurText
					text="Losnummer eintragen, zurücklehnen, benachrichtigt werden."
					:delay="200"
					animate-by="words"
					class="text-h6 mb-8"
					style="color: var(--v-theme-secondary)"
				/>
				<template #fallback>
					<p
						class="text-h6 mb-8"
						style="color: var(--v-theme-secondary)"
					>
						Losnummer eintragen, zurücklehnen, benachrichtigt werden.
					</p>
				</template>
			</ClientOnly>

			<div class="d-flex justify-center ga-4 flex-wrap mb-12">
				<v-btn
					color="primary"
					size="large"
					rounded="lg"
					to="/register"
					min-width="220"
				>
					Kostenlos registrieren
				</v-btn>
				<v-btn
					variant="outlined"
					color="primary"
					size="large"
					rounded="lg"
					min-width="180"
					@click="scrollToFeatures"
				>
					Mehr erfahren
				</v-btn>
			</div>

			<v-row
				justify="center"
				class="mt-8"
			>
				<v-col
					v-for="stat in stats"
					:key="stat.label"
					cols="12"
					sm="4"
					class="text-center"
				>
					<ClientOnly>
						<div class="text-h4 font-weight-bold text-primary">
							<CountUp
								:from="0"
								:to="stat.value"
								:duration="2"
							/>+
						</div>
						<template #fallback>
							<div class="text-h4 font-weight-bold text-primary">{{ stat.value }}+</div>
						</template>
					</ClientOnly>
					<p
						class="text-body-2 mt-1"
						style="color: var(--v-theme-secondary)"
					>
						{{ stat.label }}
					</p>
				</v-col>
			</v-row>
		</v-container>
	</section>
</template>

<script setup lang="ts">
import { useAppTheme } from "~/composables/useAppTheme";

const { vueBitsColors } = useAppTheme();

const stats = [
	{ value: 1000, label: "Lose geprüft" },
	{ value: 500, label: "Zufriedene Nutzer" },
	{ value: 5000, label: "Benachrichtigungen" },
];

function scrollToFeatures() {
	document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
}
</script>

<style scoped>
.hero-headline {
	font-family: "Sora", sans-serif;
	font-weight: 800;
	font-size: clamp(2rem, 5vw, 4rem);
	line-height: 1.1;
}
</style>
