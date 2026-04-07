<template>
	<v-app>
		<AppNavbar />
		<v-main>
			<slot />
		</v-main>
		<AppFooter />
		<!-- Global Toast -->
		<ClientOnly>
			<v-snackbar
				v-model="show"
				:color="toast.color"
				:timeout="toast.timeout"
				location="bottom right"
			>
				{{ toast.message }}
				<template #actions>
					<v-btn
						variant="text"
						@click="show = false"
					>
						<v-icon>mdi-close</v-icon>
					</v-btn>
				</template>
			</v-snackbar>
		</ClientOnly>
	</v-app>
</template>

<script setup lang="ts">
import AppNavbar from "~/components/shared/AppNavbar.vue";
import AppFooter from "~/components/shared/AppFooter.vue";
import { useToast } from "~/composables/useToast";

const { show, toast } = useToast();
</script>
