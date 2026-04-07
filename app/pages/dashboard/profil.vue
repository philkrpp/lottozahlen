<template>
	<div>
		<h1 class="text-h4 font-weight-bold mb-6">Profil</h1>

		<LoadingSkeleton
			v-if="isLoadingProfile"
			type="card"
			:count="2"
		/>

		<template v-else>
			<!-- Personal Info -->
			<v-card class="glass-card pa-4 mb-6">
				<h2 class="text-subtitle-1 font-weight-bold mb-4">Persönliche Daten</h2>

				<v-text-field
					v-model="name"
					label="Name"
					prepend-inner-icon="mdi-account"
					class="mb-4"
					@update:model-value="debouncedSaveName"
				/>

				<v-text-field
					:model-value="email"
					label="E-Mail"
					prepend-inner-icon="mdi-email"
					disabled
					hint="Die E-Mail-Adresse kann nicht geändert werden."
					persistent-hint
				/>

				<!-- Name saving indicator -->
				<v-fade-transition>
					<div
						v-if="isSavingName"
						class="text-caption mt-2"
						style="color: var(--v-theme-secondary)"
					>
						<v-progress-circular
							size="12"
							width="2"
							indeterminate
							class="mr-1"
						/>
						Wird gespeichert...
					</div>
				</v-fade-transition>
			</v-card>

			<!-- Password Change -->
			<v-card class="glass-card pa-4 mb-6">
				<h2 class="text-subtitle-1 font-weight-bold mb-4">Passwort ändern</h2>

				<v-form
					ref="passwordFormRef"
					@submit.prevent="handleChangePassword"
				>
					<v-text-field
						v-model="currentPassword"
						label="Aktuelles Passwort"
						:type="showCurrentPassword ? 'text' : 'password'"
						prepend-inner-icon="mdi-lock"
						:append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
						:rules="[(v) => !!v || 'Aktuelles Passwort ist erforderlich']"
						class="mb-2"
						@click:append-inner="showCurrentPassword = !showCurrentPassword"
					/>

					<v-text-field
						v-model="newPassword"
						label="Neues Passwort"
						:type="showNewPassword ? 'text' : 'password'"
						prepend-inner-icon="mdi-lock-plus"
						:append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
						:rules="passwordRules"
						class="mb-2"
						@click:append-inner="showNewPassword = !showNewPassword"
					/>

					<v-text-field
						v-model="confirmPassword"
						label="Neues Passwort bestätigen"
						:type="showConfirmPassword ? 'text' : 'password'"
						prepend-inner-icon="mdi-lock-check"
						:append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
						:rules="[
							(v: string) => !!v || 'Bitte Passwort bestätigen',
							(v: string) => v === newPassword || 'Passwörter stimmen nicht überein',
						]"
						class="mb-4"
						@click:append-inner="showConfirmPassword = !showConfirmPassword"
					/>

					<v-btn
						color="primary"
						variant="flat"
						type="submit"
						:loading="isChangingPassword"
						:disabled="!currentPassword || !newPassword || !confirmPassword"
					>
						Passwort ändern
					</v-btn>
				</v-form>
			</v-card>

			<!-- Account Info -->
			<v-card class="glass-card pa-4">
				<h2 class="text-subtitle-1 font-weight-bold mb-4">Account-Informationen</h2>

				<v-list
					density="compact"
					class="bg-transparent"
				>
					<v-list-item>
						<template #prepend>
							<v-icon
								icon="mdi-calendar"
								size="small"
								class="mr-3"
							/>
						</template>
						<v-list-item-title class="text-body-2">Registriert seit</v-list-item-title>
						<v-list-item-subtitle>{{ createdAtFormatted }}</v-list-item-subtitle>
					</v-list-item>
				</v-list>
			</v-card>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useToast } from "~/composables/useToast";
import { formatDate } from "~/utils/formatters";
import LoadingSkeleton from "~/components/shared/LoadingSkeleton.vue";
import { createLogger } from "~/utils/logger";

const log = createLogger("profil");

definePageMeta({
	layout: "dashboard",
	middleware: "auth",
});

const { success, error: toastError } = useToast();

const name = ref("");
const email = ref("");
const createdAtFormatted = ref("");
const isLoadingProfile = ref(true);
const isSavingName = ref(false);

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const isChangingPassword = ref(false);
const passwordFormRef = ref();

let nameDebounce: ReturnType<typeof setTimeout> | null = null;

const passwordRules = [
	(v: string) => !!v || "Neues Passwort ist erforderlich",
	(v: string) => (v && v.length >= 8) || "Mindestens 8 Zeichen",
];

onMounted(async () => {
	try {
		const profile = await $fetch<{
			name?: string;
			email?: string;
			createdAt?: string;
		}>("/api/user/profile");
		if (profile) {
			name.value = profile.name || "";
			email.value = profile.email || "";
			createdAtFormatted.value = profile.createdAt ? formatDate(profile.createdAt) : "";
		}
	} catch {
		toastError("Profil konnte nicht geladen werden");
	} finally {
		isLoadingProfile.value = false;
	}
});

function debouncedSaveName() {
	if (nameDebounce) clearTimeout(nameDebounce);
	isSavingName.value = true;
	nameDebounce = setTimeout(async () => {
		try {
			await $fetch("/api/user/profile", {
				method: "PUT",
				body: { name: name.value },
			});
			success("Name gespeichert");
		} catch {
			toastError("Name konnte nicht gespeichert werden");
		} finally {
			isSavingName.value = false;
		}
	}, 800);
}

async function handleChangePassword() {
	const result = await passwordFormRef.value?.validate();
	if (!result?.valid) return;

	isChangingPassword.value = true;
	try {
		await $fetch("/api/user/password", {
			method: "PUT",
			body: {
				currentPassword: currentPassword.value,
				newPassword: newPassword.value,
			},
		});
		success("Passwort wurde geändert");
		log.info("Passwort geaendert");
		currentPassword.value = "";
		newPassword.value = "";
		confirmPassword.value = "";
		passwordFormRef.value?.resetValidation();
	} catch (e) {
		log.error("Passwort aendern fehlgeschlagen");
		toastError((e as { data?: { message?: string } })?.data?.message || "Passwort konnte nicht geändert werden");
	} finally {
		isChangingPassword.value = false;
	}
}
</script>
