<template>
	<v-card
		class="glass-card pa-4"
		:class="{ 'winner-card': lastCheckResult?.hasWon }"
	>
		<div class="d-flex justify-space-between align-start">
			<div class="flex-grow-1">
				<div class="los-nummer mb-2">{{ losNummer }}</div>
				<div class="d-flex ga-2 flex-wrap mb-2">
					<v-chip
						size="x-small"
						variant="tonal"
						color="primary"
						>{{ anbieterLabel }}</v-chip
					>
					<v-chip
						size="x-small"
						variant="tonal"
						>{{ losTypLabel }}</v-chip
					>
				</div>
				<p
					v-if="displayName"
					class="text-body-2 mb-1"
					style="color: var(--v-theme-secondary)"
				>
					{{ displayName }}
				</p>
				<LosStatusChip
					:last-check-result="lastCheckResult"
					:is-active="isActive"
				/>
				<LastCheckInfo
					:last-check-result="lastCheckResult"
					class="mt-1"
				/>
			</div>
			<div class="d-flex flex-column align-center">
				<QuickCheckButton
					:los-id="id"
					:is-checking="isChecking"
					@check="$emit('quickCheck', id)"
				/>
				<v-menu>
					<template #activator="{ props: menuProps }">
						<v-btn
							icon="mdi-dots-vertical"
							variant="text"
							size="small"
							v-bind="menuProps"
						/>
					</template>
					<v-list density="compact">
						<v-list-item
							prepend-icon="mdi-pencil"
							title="Bearbeiten"
							@click="$emit('edit', id)"
						/>
						<v-list-item
							prepend-icon="mdi-delete"
							title="Löschen"
							class="text-error"
							@click="$emit('delete', id)"
						/>
					</v-list>
				</v-menu>
			</div>
		</div>
	</v-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ANBIETER } from "~/utils/constants";
import LosStatusChip from "./LosStatusChip.vue";
import LastCheckInfo from "./LastCheckInfo.vue";
import QuickCheckButton from "./QuickCheckButton.vue";

const props = defineProps<{
	id: string;
	losNummer: string;
	anbieter: string;
	losTyp: string;
	displayName?: string;
	isActive: boolean;
	lastCheckResult: {
		hasWon: boolean;
		prize: string | null;
		checkedAt: string;
		drawDate: string;
	} | null;
	isChecking: string | null;
}>();

defineEmits<{
	quickCheck: [id: string];
	edit: [id: string];
	delete: [id: string];
}>();

const anbieterLabel = computed(() => {
	const a = ANBIETER[props.anbieter as keyof typeof ANBIETER];
	return a?.name || props.anbieter;
});

const losTypLabel = computed(() => {
	const a = ANBIETER[props.anbieter as keyof typeof ANBIETER];
	const t = a?.losTypen.find((lt) => lt.value === props.losTyp);
	return t?.label || props.losTyp;
});
</script>

<style scoped>
.winner-card {
	border: 2px solid var(--v-theme-accent) !important;
	box-shadow: 0 0 20px rgba(255, 215, 0, 0.2) !important;
}
</style>
