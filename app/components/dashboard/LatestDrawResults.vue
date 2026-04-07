<template>
	<v-card class="glass-card pa-4">
		<div class="d-flex justify-space-between align-center mb-4">
			<h3 class="text-subtitle-1 font-weight-bold">Letzte Ziehungen</h3>
			<v-btn
				variant="text"
				size="small"
				to="/dashboard/ziehungen"
				append-icon="mdi-arrow-right"
			>
				Alle ansehen
			</v-btn>
		</div>

		<div
			v-if="draws.length === 0"
			class="text-center pa-4"
		>
			<p
				class="text-body-2"
				style="color: var(--v-theme-secondary)"
			>
				Noch keine Ziehungen vorhanden.
			</p>
		</div>

		<div
			v-for="draw in draws"
			:key="draw._id"
			class="mb-3 pb-3"
			style="border-bottom: 1px solid var(--glass-border)"
		>
			<div class="d-flex justify-space-between align-center mb-2">
				<span class="text-caption font-weight-bold">{{ formatDate(draw.drawDate) }}</span>
				<v-chip
					size="x-small"
					variant="tonal"
					>{{ draw.drawType || "Hauptziehung" }}</v-chip
				>
			</div>
			<EndziffernTable
				:gewinne="draw.results.gewinne"
				:winning-numbers="draw.results.winningNumbers"
				compact
			/>
		</div>
	</v-card>
</template>

<script setup lang="ts">
import { formatDate } from "~/utils/formatters";
import EndziffernTable from "~/components/draws/EndziffernTable.vue";

defineProps<{
	draws: Array<{
		_id: string;
		drawDate: string;
		drawType: string;
		results: {
			winningNumbers: string[];
			gewinne?: Array<{ gewinnzahl: string; gewinn: string; rang: number }>;
		};
	}>;
}>();
</script>
