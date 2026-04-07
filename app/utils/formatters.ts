import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/de";

dayjs.extend(relativeTime);
dayjs.locale("de");

export function formatDate(date: Date | string): string {
	return dayjs(date).format("DD.MM.YYYY");
}

export function formatDateTime(date: Date | string): string {
	return dayjs(date).format("DD.MM.YYYY HH:mm");
}

export function formatRelativeTime(date: Date | string): string {
	return dayjs(date).fromNow();
}

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);
}
