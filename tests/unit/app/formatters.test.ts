import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, formatCurrency } from "../../../app/utils/formatters";

describe("formatDate", () => {
	it("formatiert Datum im deutschen Format", () => {
		expect(formatDate(new Date("2026-01-15T00:00:00Z"))).toBe("15.01.2026");
	});

	it("formatiert String-Datum", () => {
		expect(formatDate("2026-12-31")).toBe("31.12.2026");
	});
});

describe("formatDateTime", () => {
	it("formatiert Datum mit Uhrzeit", () => {
		const result = formatDateTime(new Date("2026-03-05T14:30:00Z"));
		expect(result).toMatch(/05\.03\.2026 \d{2}:30/);
	});
});

describe("formatCurrency", () => {
	it("formatiert Betrag als Euro", () => {
		const result = formatCurrency(5000);
		// Intl.NumberFormat kann verschiedene Leerzeichen verwenden
		expect(result).toMatch(/5\.000,00/);
		expect(result).toContain("€");
	});

	it("formatiert Dezimalbeträge", () => {
		const result = formatCurrency(10.5);
		expect(result).toMatch(/10,50/);
	});
});
