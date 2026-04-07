<template>
	<NuxtLayout>
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
import { useAppTheme } from "~/composables/useAppTheme";

// Theme init happens in onMounted inside the composable (SSR-safe)
useAppTheme();
</script>
