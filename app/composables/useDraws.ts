import { ref } from "vue";
import { useToast } from "./useToast";
import { createLogger } from "~/utils/logger";

const log = createLogger("draws");

export interface DrawGewinn {
	anzahlGewinner: number;
	gewinn: string;
	gewinnArt: number;
	gewinnzahl: string;
	rang: number;
}

interface DrawResults {
	winningNumbers: string[];
	gewinne?: DrawGewinn[];
	additionalData: Record<string, unknown>;
}

interface Draw {
	_id: string;
	anbieter: string;
	drawDate: string;
	drawType: string;
	results: DrawResults;
	fetchedAt: string;
	createdAt: string;
}

interface DrawsResponse {
	draws: Draw[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

const draws = ref<Draw[]>([]);
const latestDraw = ref<Draw | null>(null);
const total = ref(0);
const currentPage = ref(1);
const totalPages = ref(0);
const isLoading = ref(false);

export function useDraws() {
	const { error } = useToast();

	async function fetchDraws(params?: { page?: number; limit?: number; anbieter?: string }) {
		isLoading.value = true;
		try {
			const query: Record<string, string> = {};
			if (params?.page) query.page = String(params.page);
			if (params?.limit) query.limit = String(params.limit);
			if (params?.anbieter) query.anbieter = params.anbieter;

			const data = await $fetch<DrawsResponse>("/api/draws", { query });
			draws.value = data.draws;
			total.value = data.total;
			currentPage.value = data.page;
			totalPages.value = data.totalPages;
			log.info("Ziehungen geladen", { count: data.draws.length, page: data.page });
		} catch {
			error("Ziehungen konnten nicht geladen werden");
			log.error("Ziehungen laden fehlgeschlagen");
		} finally {
			isLoading.value = false;
		}
	}

	async function fetchLatestDraw(anbieter?: string) {
		try {
			const data = await $fetch<Draw | null>("/api/draws/latest", {
				query: anbieter ? { anbieter } : undefined,
			});
			latestDraw.value = data;
		} catch {
			// Silent fail for latest draw
		}
	}

	return {
		draws,
		latestDraw,
		total,
		currentPage,
		totalPages,
		isLoading,
		fetchDraws,
		fetchLatestDraw,
	};
}
