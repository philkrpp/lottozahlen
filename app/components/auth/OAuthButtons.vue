<template>
	<div v-if="hasAnyProvider">
		<v-btn
			v-if="providers?.google"
			block
			variant="outlined"
			size="large"
			class="mb-3"
			prepend-icon="mdi-google"
			:loading="loadingGoogle"
			@click="signInWithGoogle"
		>
			Weiter mit Google
		</v-btn>
		<v-btn
			v-if="providers?.github"
			block
			variant="outlined"
			size="large"
			:class="{ 'mb-3': !providers?.google }"
			prepend-icon="mdi-github"
			:loading="loadingGithub"
			@click="signInWithGitHub"
		>
			Weiter mit GitHub
		</v-btn>

		<div class="d-flex align-center my-6">
			<v-divider />
			<span
				class="mx-4 text-body-2"
				style="color: var(--v-theme-secondary)"
				>oder</span
			>
			<v-divider />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuth } from "~/composables/useAuth";

const { signIn } = useAuth();
const loadingGoogle = ref(false);
const loadingGithub = ref(false);

const { data: providers } = useFetch<{ google: boolean; github: boolean }>("/api/auth/providers");

const hasAnyProvider = computed(() => providers.value?.google || providers.value?.github);

async function signInWithGoogle() {
	loadingGoogle.value = true;
	try {
		await signIn.social({ provider: "google", callbackURL: "/dashboard" });
	} finally {
		loadingGoogle.value = false;
	}
}

async function signInWithGitHub() {
	loadingGithub.value = true;
	try {
		await signIn.social({ provider: "github", callbackURL: "/dashboard" });
	} finally {
		loadingGithub.value = false;
	}
}
</script>
