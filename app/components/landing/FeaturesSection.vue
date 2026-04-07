<template>
	<section
		id="features"
		class="section"
	>
		<v-container>
			<div class="text-center mb-12">
				<h2 class="text-h2 font-weight-bold">Warum Lottozahlen?</h2>
			</div>

			<v-row>
				<v-col
					v-for="(feature, i) in features"
					:key="feature.title"
					cols="12"
					sm="6"
					lg="3"
				>
					<ClientOnly>
						<AnimatedContent :delay="i * 0.1">
							<v-card class="glass-card pa-6 h-100">
								<v-icon
									:icon="feature.icon"
									size="48"
									color="primary"
									class="mb-4"
								/>
								<h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
								<p
									class="text-body-2"
									style="color: var(--v-theme-secondary)"
								>
									{{ feature.description }}
								</p>
							</v-card>
						</AnimatedContent>
						<template #fallback>
							<v-card class="glass-card pa-6 h-100">
								<v-icon
									:icon="feature.icon"
									size="48"
									color="primary"
									class="mb-4"
								/>
								<h3 class="text-h6 font-weight-bold mb-2">{{ feature.title }}</h3>
								<p
									class="text-body-2"
									style="color: var(--v-theme-secondary)"
								>
									{{ feature.description }}
								</p>
							</v-card>
						</template>
					</ClientOnly>
				</v-col>
			</v-row>
		</v-container>
	</section>
</template>

<script setup lang="ts">
const features = [
	{
		icon: "mdi-refresh-auto",
		title: "Automatische Prüfung",
		description: "Dein Los wird nach jeder Ziehung automatisch geprüft.",
	},
	{
		icon: "mdi-bell-ring",
		title: "Sofort-Benachrichtigung",
		description: "Per E-Mail oder Slack – du erfährst es als Erster.",
	},
	{
		icon: "mdi-history",
		title: "Ziehungs-Historie",
		description: "Alle vergangenen Ziehungen auf einen Blick.",
	},
	{
		icon: "mdi-lightning-bolt",
		title: "Quick-Check",
		description: "Prüfe dein Los jederzeit manuell – auch rückwirkend.",
	},
];
</script>
