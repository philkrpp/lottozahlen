<template>
	<v-chip
		:color="chipColor"
		:variant="hasWon ? 'elevated' : 'tonal'"
		size="small"
		:prepend-icon="chipIcon"
	>
		{{ chipText }}
	</v-chip>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	lastCheckResult: { hasWon: boolean; prize: string | null; checkedAt: string } | null;
	isActive: boolean;
}>();

const hasWon = computed(() => props.lastCheckResult?.hasWon);
const chipColor = computed(() => {
	if (!props.isActive) return "secondary";
	if (hasWon.value) return "accent";
	if (props.lastCheckResult) return "success";
	return "warning";
});
const chipIcon = computed(() => {
	if (!props.isActive) return "mdi-close-circle";
	if (hasWon.value) return "mdi-party-popper";
	if (props.lastCheckResult) return "mdi-check-circle";
	return "mdi-clock-outline";
});
const chipText = computed(() => {
	if (!props.isActive) return "Inaktiv";
	if (hasWon.value) return "Gewonnen!";
	if (props.lastCheckResult) return "Geprüft – noch kein Gewinn";
	return "Ausstehend";
});
</script>
