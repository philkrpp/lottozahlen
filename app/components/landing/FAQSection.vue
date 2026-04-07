<template>
	<section
		id="faq"
		class="section"
	>
		<v-container>
			<h2 class="text-h3 font-weight-bold text-center mb-12">Häufige Fragen</h2>

			<v-row justify="center">
				<v-col
					cols="12"
					md="8"
				>
					<AnimatedContent>
						<v-expansion-panels variant="accordion">
							<v-expansion-panel
								v-for="item in faqItems"
								:key="item.question"
								class="glass-card mb-3"
								rounded="lg"
								eager
							>
								<v-expansion-panel-title class="font-weight-bold">
									{{ item.question }}
								</v-expansion-panel-title>
								<v-expansion-panel-text>
									<p
										class="text-body-2 pt-2"
										style="color: var(--v-theme-secondary)"
									>
										{{ item.answer }}
									</p>
								</v-expansion-panel-text>
							</v-expansion-panel>
						</v-expansion-panels>
					</AnimatedContent>
				</v-col>
			</v-row>
		</v-container>
	</section>
</template>

<script setup lang="ts">
const faqItems = inject<{ question: string; answer: string }[]>("faqItems", []);
</script>
