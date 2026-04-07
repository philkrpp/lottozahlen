<template>
	<div class="text-center pa-8">
		<v-icon
			:icon="icon"
			size="64"
			color="secondary"
			class="mb-4"
		/>
		<h3 class="text-h6 mb-2">{{ title }}</h3>
		<p
			class="text-body-2 mb-4"
			style="color: var(--v-theme-secondary)"
		>
			{{ description }}
		</p>
		<slot name="action" />
	</div>
</template>

<script setup lang="ts">
defineProps<{
	icon?: string;
	title: string;
	description: string;
}>();
</script>
