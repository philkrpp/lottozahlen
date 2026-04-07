<template>
	<v-app>
		<v-main
			class="d-flex align-center justify-center"
			style="min-height: 100vh"
		>
			<v-container class="d-flex justify-center">
				<v-card
					class="pa-8 glass-card"
					max-width="460"
					width="100%"
				>
					<div class="text-center mb-6">
						<NuxtLink
							to="/"
							class="text-decoration-none"
						>
							<span class="text-h5 font-weight-bold text-gradient">Lottozahlen</span>
						</NuxtLink>
					</div>
					<slot />
				</v-card>
			</v-container>
		</v-main>
		<!-- Global Toast -->
		<v-snackbar
			v-model="show"
			:color="toast.color"
			:timeout="toast.timeout"
			location="bottom right"
		>
			{{ toast.message }}
		</v-snackbar>
	</v-app>
</template>

<script setup lang="ts">
import { useToast } from "~/composables/useToast";

const { show, toast } = useToast();
</script>
