import { describe, it, expect } from "vitest";
import { parseGewinnBetrag } from "../../../server/utils/parseGewinnBetrag";

describe("parseGewinnBetrag", () => {
	it.each([
		["5.000,00 Euro", 5000.0],
		["10,00 Euro", 10.0],
		["1.234.567,89 Euro", 1234567.89],
		["0,50 Euro", 0.5],
		["100,00 Euro", 100.0],
		["25.000,00 Euro", 25000.0],
	])('parst "%s" → %d', (input, expected) => {
		expect(parseGewinnBetrag(input)).toBe(expected);
	});

	it("gibt null zurück für ungültige Strings", () => {
		expect(parseGewinnBetrag("")).toBeNull();
		expect(parseGewinnBetrag("Sachgewinn")).toBeNull();
		expect(parseGewinnBetrag("kein Gewinn")).toBeNull();
	});
});
