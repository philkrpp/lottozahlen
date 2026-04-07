import { describe, it, expect } from "vitest";
import { getCompatibleLosTypesForDraw } from "../../../server/utils/drawCompatibility";

describe("getCompatibleLosTypesForDraw", () => {
	it.each([
		["0", ["jahreslos", "dauerlos", "einzellos"]],
		["1", ["jahreslos", "dauerlos", "einzellos"]],
		["3", ["mega-los"]],
		["4", ["jahreslos", "dauerlos", "einzellos"]],
		["5", ["jahreslos", "dauerlos", "einzellos"]],
	])("drawType %s → %j", (drawType, expected) => {
		expect(getCompatibleLosTypesForDraw(drawType)).toEqual(expected);
	});

	it("gibt leeres Array für unbekannten drawType zurück", () => {
		expect(getCompatibleLosTypesForDraw("99")).toEqual([]);
		expect(getCompatibleLosTypesForDraw("2")).toEqual([]);
		expect(getCompatibleLosTypesForDraw("")).toEqual([]);
	});
});
