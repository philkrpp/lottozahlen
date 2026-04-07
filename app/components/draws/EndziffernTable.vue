<template>
	<div>
		<!-- Full table when gewinne data is available -->
		<v-table
			v-if="sortedGewinne.length > 0"
			density="compact"
			class="endziffern-table"
		>
			<thead v-if="!compact">
				<tr>
					<th class="text-left">Endziffer</th>
					<th class="text-right">Gewinn</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="g in sortedGewinne"
					:key="g.rang"
				>
					<td>
						<span class="endziffer-nummer">{{ g.gewinnzahl }}</span>
					</td>
					<td class="text-right endziffer-gewinn">{{ g.gewinn }}</td>
				</tr>
			</tbody>
		</v-table>

		<!-- Fallback for legacy data without gewinne -->
		<div
			v-else
			class="d-flex flex-column ga-1"
		>
			<span
				v-for="num in winningNumbers"
				:key="num"
				class="endziffer-nummer"
			>
				{{ num }}
			</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
	gewinne?: Array<{
		gewinnzahl: string;
		gewinn: string;
		rang: number;
	}>;
	winningNumbers: string[];
	compact?: boolean;
}>();

const sortedGewinne = computed(() => {
	if (!props.gewinne?.length) return [];
	return [...props.gewinne].sort((a, b) => a.rang - b.rang);
});
</script>
