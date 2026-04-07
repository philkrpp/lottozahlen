import { describe, it, expect } from "vitest";

const BASE_URL = "http://localhost:3456";

describe("Landing Page", () => {
	it("liefert Status 200", async () => {
		const res = await fetch(`${BASE_URL}/`);
		expect(res.status).toBe(200);
	});

	it("enthält den Seitentitel", async () => {
		const html = await (await fetch(`${BASE_URL}/`)).text();
		expect(html).toContain("Lottozahlen");
	});

	it("enthält SEO-Meta-Tags", async () => {
		const html = await (await fetch(`${BASE_URL}/`)).text();
		expect(html).toContain("Losnummern automatisch prüfen");
	});
});

describe("Auth-Seiten (client-side rendered)", () => {
	it("GET /login liefert Status 200", async () => {
		const res = await fetch(`${BASE_URL}/login`);
		expect(res.status).toBe(200);
	});

	it("GET /register liefert Status 200", async () => {
		const res = await fetch(`${BASE_URL}/register`);
		expect(res.status).toBe(200);
	});
});
