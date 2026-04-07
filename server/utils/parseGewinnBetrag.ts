/** Parse German-formatted prize strings like "5.000,00 Euro" into a number */
export function parseGewinnBetrag(gewinnStr: string): number | null {
	const match = gewinnStr.match(/([\d.]+),(\d{2})\s*Euro/);
	if (!match?.[1] || !match[2]) return null;
	const integerPart = match[1].replace(/\./g, "");
	const decimalPart = match[2];
	return parseFloat(`${integerPart}.${decimalPart}`);
}
