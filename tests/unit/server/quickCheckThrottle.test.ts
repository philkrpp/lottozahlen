import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shouldCallApi } from "../../../server/utils/quickCheckThrottle";

describe("shouldCallApi", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("gibt true zurück wenn lastManualCheckAt null ist", () => {
		expect(shouldCallApi(null)).toBe(true);
	});

	it("gibt true zurück wenn letzter Check >24h her ist", () => {
		vi.setSystemTime(new Date("2026-04-08T12:00:00Z"));
		const lastCheck = new Date("2026-04-07T11:00:00Z"); // 25h ago
		expect(shouldCallApi(lastCheck)).toBe(true);
	});

	it("gibt false zurück wenn letzter Check <24h her ist (kein Sonntag)", () => {
		// Mittwoch 08.04.2026 14:00 UTC = 16:00 CEST
		vi.setSystemTime(new Date("2026-04-08T14:00:00Z"));
		const lastCheck = new Date("2026-04-08T10:00:00Z"); // 4h ago
		expect(shouldCallApi(lastCheck)).toBe(false);
	});

	it("gibt true zurück am Sonntag nach 18:00 Berlin wenn letzter Check vor 18:00 war", () => {
		// Sonntag 12.04.2026 18:30 CEST = 16:30 UTC
		vi.setSystemTime(new Date("2026-04-12T16:30:00Z"));
		// Letzter Check: Sonntag 17:00 CEST = 15:00 UTC
		const lastCheck = new Date("2026-04-12T15:00:00Z");
		expect(shouldCallApi(lastCheck)).toBe(true);
	});

	it("gibt true zurück am Sonntag nach 20:00 Berlin wenn letzter Check vor 20:00 war", () => {
		// Sonntag 12.04.2026 20:15 CEST = 18:15 UTC
		vi.setSystemTime(new Date("2026-04-12T18:15:00Z"));
		// Letzter Check: Sonntag 19:00 CEST = 17:00 UTC (nach 18:00 aber vor 20:00)
		const lastCheck = new Date("2026-04-12T17:00:00Z");
		expect(shouldCallApi(lastCheck)).toBe(true);
	});

	it("gibt false zurück am Sonntag nach 20:00 Berlin wenn letzter Check auch nach 20:00 war", () => {
		// Sonntag 12.04.2026 21:00 CEST = 19:00 UTC
		vi.setSystemTime(new Date("2026-04-12T19:00:00Z"));
		// Letzter Check: Sonntag 20:30 CEST = 18:30 UTC
		const lastCheck = new Date("2026-04-12T18:30:00Z");
		expect(shouldCallApi(lastCheck)).toBe(false);
	});

	it("gibt false zurück am Sonntag vor 18:00 Berlin wenn letzter Check <24h her ist", () => {
		// Sonntag 12.04.2026 15:00 CEST = 13:00 UTC
		vi.setSystemTime(new Date("2026-04-12T13:00:00Z"));
		// Letzter Check: Sonntag 10:00 CEST = 08:00 UTC
		const lastCheck = new Date("2026-04-12T08:00:00Z");
		expect(shouldCallApi(lastCheck)).toBe(false);
	});
});
