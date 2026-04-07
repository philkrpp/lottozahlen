import { describe, it, expect } from "vitest";
import { losSchema, losUpdateSchema, notificationSettingsSchema, preferencesSchema } from "../../../app/utils/validators";

describe("losSchema", () => {
	it("akzeptiert gültige Losnummer (7 Ziffern)", () => {
		const result = losSchema.safeParse({ losNummer: "6123456", anbieter: "deutsche-fernsehlotterie" });
		expect(result.success).toBe(true);
	});

	it("akzeptiert gültige Losnummer (12 Ziffern)", () => {
		const result = losSchema.safeParse({ losNummer: "612345678901", anbieter: "deutsche-fernsehlotterie" });
		expect(result.success).toBe(true);
	});

	it("lehnt zu kurze Losnummer ab (6 Ziffern)", () => {
		const result = losSchema.safeParse({ losNummer: "612345", anbieter: "deutsche-fernsehlotterie" });
		expect(result.success).toBe(false);
	});

	it("lehnt zu lange Losnummer ab (13 Ziffern)", () => {
		const result = losSchema.safeParse({ losNummer: "6123456789012", anbieter: "deutsche-fernsehlotterie" });
		expect(result.success).toBe(false);
	});

	it("lehnt nicht-numerische Losnummer ab", () => {
		const result = losSchema.safeParse({ losNummer: "abc1234", anbieter: "deutsche-fernsehlotterie" });
		expect(result.success).toBe(false);
	});

	it("lehnt ungültigen Anbieter ab", () => {
		const result = losSchema.safeParse({ losNummer: "6123456", anbieter: "andere-lotterie" });
		expect(result.success).toBe(false);
	});

	it("akzeptiert optionalen displayName", () => {
		const result = losSchema.safeParse({
			losNummer: "6123456",
			anbieter: "deutsche-fernsehlotterie",
			displayName: "Mein Los",
		});
		expect(result.success).toBe(true);
	});

	it("lehnt displayName >50 Zeichen ab", () => {
		const result = losSchema.safeParse({
			losNummer: "6123456",
			anbieter: "deutsche-fernsehlotterie",
			displayName: "A".repeat(51),
		});
		expect(result.success).toBe(false);
	});
});

describe("losUpdateSchema", () => {
	it("akzeptiert partielle Updates", () => {
		const result = losUpdateSchema.safeParse({ displayName: "Neuer Name" });
		expect(result.success).toBe(true);
	});

	it("akzeptiert leeres Objekt", () => {
		const result = losUpdateSchema.safeParse({});
		expect(result.success).toBe(true);
	});
});

describe("notificationSettingsSchema", () => {
	it("akzeptiert gültige Slack-Webhook-URL", () => {
		const result = notificationSettingsSchema.safeParse({
			slackWebhookUrl: "https://hooks.slack.com/services/T00/B00/xxxx",
		});
		expect(result.success).toBe(true);
	});

	it("akzeptiert slack:// Format", () => {
		const result = notificationSettingsSchema.safeParse({
			slackWebhookUrl: "slack://T00/B00/xxxx",
		});
		expect(result.success).toBe(true);
	});

	it("lehnt ungültige Slack-URL ab", () => {
		const result = notificationSettingsSchema.safeParse({
			slackWebhookUrl: "https://example.com/webhook",
		});
		expect(result.success).toBe(false);
	});

	it("akzeptiert Boolean-Felder", () => {
		const result = notificationSettingsSchema.safeParse({
			emailEnabled: true,
			notifyOnWin: true,
			notifyOnNoWin: false,
			notifyOnNewDraw: true,
		});
		expect(result.success).toBe(true);
	});
});

describe("preferencesSchema", () => {
	it("akzeptiert gültige Theme-Werte", () => {
		for (const theme of ["light", "dark", "system"]) {
			const result = preferencesSchema.safeParse({ theme });
			expect(result.success).toBe(true);
		}
	});

	it("lehnt ungültigen Theme-Wert ab", () => {
		const result = preferencesSchema.safeParse({ theme: "blue" });
		expect(result.success).toBe(false);
	});

	it("akzeptiert gültige dashboardLayout-Werte", () => {
		for (const layout of ["grid", "list"]) {
			const result = preferencesSchema.safeParse({ dashboardLayout: layout });
			expect(result.success).toBe(true);
		}
	});

	it("akzeptiert nullable defaultAnbieter", () => {
		const result = preferencesSchema.safeParse({ defaultAnbieter: null });
		expect(result.success).toBe(true);
	});
});
