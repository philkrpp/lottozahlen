import { describe, it, expect } from "vitest";
import { detectLosTypFromNummer } from "../../../server/utils/losTypDetector";

describe("detectLosTypFromNummer", () => {
	it.each([
		["6123456", "einzellos"],
		["7654321", "mega-los"],
		["8123456789", "jahreslos"],
		["9876543210", "dauerlos"],
	])("erkennt %s als %s", (losNummer, expectedTyp) => {
		expect(detectLosTypFromNummer(losNummer)).toBe(expectedTyp);
	});

	it("wirft Error bei ungültiger Erstziffer", () => {
		expect(() => detectLosTypFromNummer("1234567")).toThrow("Unbekannter Los-Typ");
		expect(() => detectLosTypFromNummer("0123456")).toThrow("Unbekannter Los-Typ");
		expect(() => detectLosTypFromNummer("5555555")).toThrow("Unbekannter Los-Typ");
	});

	it("wirft Error bei leerem String", () => {
		expect(() => detectLosTypFromNummer("")).toThrow();
	});
});
