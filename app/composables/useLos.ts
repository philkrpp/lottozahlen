import { ref, computed } from "vue";
import { useToast } from "./useToast";
import { createLogger } from "~/utils/logger";

const log = createLogger("los");

export interface LosCheckResult {
	hasWon: boolean;
	prize: string | null;
	drawDate: string;
	checkedAt: string;
}

export interface Los {
	_id: string;
	losNummer: string;
	anbieter: string;
	losTyp: string;
	displayName?: string;
	isActive: boolean;
	lastCheckedAt: string | null;
	lastCheckResult: LosCheckResult | null;
	createdAt: string;
	updatedAt: string;
}

interface CreateLosData {
	losNummer: string;
	anbieter: string;
	displayName?: string;
}

const lose = ref<Los[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const isDeleting = ref<string | null>(null);
const isChecking = ref<string | null>(null);

export function useLos() {
	const { success, error } = useToast();

	async function fetchLose() {
		isLoading.value = true;
		try {
			const data = await $fetch<Los[]>("/api/los");
			lose.value = data;
			log.info("Lose geladen", { count: data.length });
		} catch {
			error("Lose konnten nicht geladen werden");
			log.error("Lose laden fehlgeschlagen");
		} finally {
			isLoading.value = false;
		}
	}

	async function createLos(data: CreateLosData) {
		isCreating.value = true;
		log.info("Los erstellen", { anbieter: data.anbieter });
		try {
			const newLos = await $fetch<Los>("/api/los", {
				method: "POST",
				body: data,
			});
			lose.value.unshift(newLos);
			success("Los wurde hinzugefügt");
			log.info("Los erstellt", { losId: newLos._id, anbieter: newLos.anbieter });
			return newLos;
		} catch (e) {
			error((e as { data?: { message?: string } })?.data?.message || "Los konnte nicht erstellt werden");
			log.error("Los erstellen fehlgeschlagen", { anbieter: data.anbieter });
			return null;
		} finally {
			isCreating.value = false;
		}
	}

	async function updateLos(id: string, data: Partial<CreateLosData & { isActive: boolean }>) {
		log.info("Los aktualisieren", { losId: id });
		try {
			const updated = await $fetch<Los>(`/api/los/${id}`, {
				method: "PUT",
				body: data,
			});
			const index = lose.value.findIndex((l) => l._id === id);
			if (index !== -1) lose.value[index] = updated;
			success("Los wurde aktualisiert");
			log.info("Los aktualisiert", { losId: id });
			return updated;
		} catch (e) {
			error((e as { data?: { message?: string } })?.data?.message || "Los konnte nicht aktualisiert werden");
			log.error("Los aktualisieren fehlgeschlagen", { losId: id });
			return null;
		}
	}

	async function deleteLos(id: string) {
		isDeleting.value = id;
		log.info("Los loeschen", { losId: id });
		try {
			await $fetch(`/api/los/${id}`, { method: "DELETE" });
			lose.value = lose.value.filter((l) => l._id !== id);
			success("Los wurde gelöscht");
			log.info("Los geloescht", { losId: id });
		} catch (e) {
			error((e as { data?: { message?: string } })?.data?.message || "Los konnte nicht gelöscht werden");
			log.error("Los loeschen fehlgeschlagen", { losId: id });
		} finally {
			isDeleting.value = null;
		}
	}

	async function quickCheck(id: string) {
		isChecking.value = id;
		log.info("Quick-Check gestartet", { losId: id });
		try {
			const result = await $fetch<{ los: Los; results: LosCheckResult[] }>(`/api/los/${id}/check`, {
				method: "POST",
			});
			// Update the los in the list
			const index = lose.value.findIndex((l) => l._id === id);
			if (index !== -1) lose.value[index] = result.los;
			success("Los wurde geprüft");
			const hasWon = result.results.some((r) => r.hasWon);
			log.info("Quick-Check abgeschlossen", { losId: id, hasWon, resultCount: result.results.length });
			return result;
		} catch (e) {
			error((e as { data?: { message?: string } })?.data?.message || "Quick-Check fehlgeschlagen");
			log.error("Quick-Check fehlgeschlagen", { losId: id });
			return null;
		} finally {
			isChecking.value = null;
		}
	}

	const activeLose = computed(() => lose.value.filter((l) => l.isActive));
	const wonLose = computed(() => lose.value.filter((l) => l.lastCheckResult?.hasWon));

	return {
		lose,
		activeLose,
		wonLose,
		isLoading,
		isCreating,
		isDeleting,
		isChecking,
		fetchLose,
		createLos,
		updateLos,
		deleteLos,
		quickCheck,
	};
}
