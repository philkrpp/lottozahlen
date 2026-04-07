<template>
	<ClientOnly>
		<v-tooltip
			:text="isDark ? 'Heller Modus' : 'Dunkler Modus'"
			location="top"
		>
			<template #activator="{ props }">
				<v-btn
					v-bind="props"
					icon
					variant="text"
					size="small"
					:aria-label="isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'"
					@click="toggleTheme"
				>
					<v-icon>{{ isDark ? "mdi-weather-sunny" : "mdi-weather-night" }}</v-icon>
				</v-btn>
			</template>
		</v-tooltip>
		<template #fallback>
			<v-btn
				icon
				variant="text"
				size="small"
				aria-label="Theme wechseln"
			>
				<v-icon>mdi-weather-sunny</v-icon>
			</v-btn>
		</template>
	</ClientOnly>
</template>

<script setup lang="ts">
import { useAppTheme } from "~/composables/useAppTheme";

const { isDark, toggleTheme } = useAppTheme();
</script>
