import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:3456";

describe("Statische Seiten", () => {
	it("GET /datenschutz liefert Status 200 und enthält Datenschutz", async () => {
		const res = await fetch(`${BASE_URL}/datenschutz`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Datenschutz");
	});

	it("GET /impressum liefert Status 200 und enthält Impressum", async () => {
		const res = await fetch(`${BASE_URL}/impressum`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Impressum");
	});

	it("GET /agb liefert Status 200 und enthält AGB", async () => {
		const res = await fetch(`${BASE_URL}/agb`);
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("AGB");
	});
});
