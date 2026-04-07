<template>
	<section
		id="how-it-works"
		class="section"
	>
		<v-container>
			<div class="text-center mb-12">
				<h2 class="text-h2 font-weight-bold">So einfach geht's</h2>
			</div>

			<div
				class="steps-container mx-auto"
				style="max-width: 600px"
			>
				<div
					v-for="(step, i) in steps"
					:key="step.title"
					class="step-item d-flex ga-6 mb-8"
				>
					<div class="step-number-col d-flex flex-column align-center">
						<div class="step-number">{{ i + 1 }}</div>
						<div
							v-if="i < steps.length - 1"
							class="step-line flex-grow-1"
						/>
					</div>
					<ClientOnly>
						<AnimatedContent :delay="i * 0.15">
							<v-card class="glass-card pa-6 flex-grow-1">
								<h3 class="text-h6 font-weight-bold mb-2">{{ step.title }}</h3>
								<p
									class="text-body-2"
									style="color: var(--v-theme-secondary)"
								>
									{{ step.description }}
								</p>
							</v-card>
						</AnimatedContent>
						<template #fallback>
							<v-card class="glass-card pa-6 flex-grow-1">
								<h3 class="text-h6 font-weight-bold mb-2">{{ step.title }}</h3>
								<p
									class="text-body-2"
									style="color: var(--v-theme-secondary)"
								>
									{{ step.description }}
								</p>
							</v-card>
						</template>
					</ClientOnly>
				</div>
			</div>
		</v-container>
	</section>
</template>

<script setup lang="ts">
const steps = [
	{
		title: "Registrieren",
		description: "Erstelle kostenlos deinen Account – in weniger als einer Minute.",
	},
	{
		title: "Los eintragen",
		description: "Hinterlege deine Losnummer und wähle den Anbieter und Los-Typ.",
	},
	{
		title: "Benachrichtigt werden",
		description: "Nach jeder Ziehung prüfen wir automatisch dein Los und benachrichtigen dich.",
	},
];
</script>

<style scoped>
.step-number {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	background: linear-gradient(135deg, var(--text-gradient-from), var(--text-gradient-to));
	color: white;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.25rem;
	font-weight: 700;
	flex-shrink: 0;
}

.step-line {
	width: 2px;
	background: var(--glass-border);
	margin: 8px 0;
	min-height: 24px;
}
</style>
