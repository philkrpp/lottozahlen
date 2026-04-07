<template>
	<ConfirmDialog
		:model-value="modelValue"
		title="Los löschen?"
		message="Möchtest du dieses Los wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."
		confirm-text="Löschen"
		confirm-color="error"
		:loading="loading"
		@update:model-value="$emit('update:modelValue', $event)"
		@confirm="$emit('confirm')"
	/>
</template>

<script setup lang="ts">
import ConfirmDialog from "~/components/shared/ConfirmDialog.vue";

withDefaults(
	defineProps<{
		modelValue: boolean;
		loading?: boolean;
	}>(),
	{
		loading: false,
	},
);

defineEmits<{
	"update:modelValue": [value: boolean];
	confirm: [];
}>();
</script>
