<template>
	<div>
		<h2 class="text-h5 font-weight-bold text-center mb-2">Passwort vergessen?</h2>
		<p
			class="text-body-2 text-center mb-6"
			style="color: var(--v-theme-secondary)"
		>
			Gib deine E-Mail-Adresse ein und wir senden dir einen magischen Link zum Zurücksetzen.
		</p>

		<v-form
			v-if="!sent"
			@submit.prevent="handleReset"
		>
			<v-text-field
				v-model="email"
				label="E-Mail"
				type="email"
				prepend-inner-icon="mdi-email"
				:error-messages="errors.email"
				class="mb-4"
			/>
			<v-btn
				type="submit"
				color="primary"
				block
				size="large"
				:loading="loading"
			>
				Link senden
			</v-btn>
		</v-form>

		<v-alert
			v-else
			type="success"
			variant="tonal"
			class="mb-4"
		>
			Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link gesendet.
		</v-alert>

		<v-alert
			v-if="errorMsg"
			type="error"
			variant="tonal"
			class="mt-4"
			density="compact"
		>
			{{ errorMsg }}
		</v-alert>

		<p class="text-center text-body-2 mt-6">
			<NuxtLink
				to="/login"
				class="text-primary text-decoration-none"
			>
				Zurück zum Login
			</NuxtLink>
		</p>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "~/composables/useAuth";

const { signIn } = useAuth();

const email = ref("");
const loading = ref(false);
const sent = ref(false);
const errorMsg = ref("");
const errors = ref<Record<string, string>>({});

async function handleReset() {
	errors.value = {};
	errorMsg.value = "";
	if (!email.value) {
		errors.value.email = "E-Mail ist erforderlich";
		return;
	}

	loading.value = true;
	try {
		await signIn.magicLink({ email: email.value, callbackURL: "/set-password" });
		sent.value = true;
	} catch {
		// Always show success to prevent email enumeration
		sent.value = true;
	} finally {
		loading.value = false;
	}
}
</script>
