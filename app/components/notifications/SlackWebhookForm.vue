<template>
	<v-text-field
		:model-value="modelValue"
		label="Slack Webhook URL"
		placeholder="slack://XXX/XXX/XXX"
		hint="Formate: slack://XXX/XXX/XXX oder https://hooks.slack.com/services/XXX/XXX/XXX"
		persistent-hint
		prepend-inner-icon="mdi-slack"
		:rules="[
			(v) =>
				!v ||
				/^(https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+|slack:\/\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+)$/.test(
					v,
				) ||
				'Ungültiges Format (slack://XXX/XXX/XXX oder https://hooks.slack.com/services/...)',
		]"
		@update:model-value="$emit('update:modelValue', $event)"
	/>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>
