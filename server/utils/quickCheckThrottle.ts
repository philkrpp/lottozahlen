const BERLIN_TZ = "Europe/Berlin";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface BerlinTime {
	weekday: number;
	hour: number;
	dateStr: string;
}

function toBerlin(date: Date): BerlinTime {
	const parts = Object.fromEntries(
		new Intl.DateTimeFormat("en-US", {
			timeZone: BERLIN_TZ,
			weekday: "short",
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			hour12: false,
		})
			.formatToParts(date)
			.map((p) => [p.type, p.value]),
	);

	const weekdayMap: Record<string, number> = {
		Sun: 0,
		Mon: 1,
		Tue: 2,
		Wed: 3,
		Thu: 4,
		Fri: 5,
		Sat: 6,
	};

	return {
		weekday: weekdayMap[parts.weekday],
		hour: parseInt(parts.hour),
		dateStr: `${parts.year}-${parts.month}-${parts.day}`,
	};
}

/** Convert a Berlin date+hour to a UTC Date */
function berlinHourToUtc(dateStr: string, hour: number): Date {
	const guess = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00Z`);
	const berlinHour = toBerlin(guess).hour;
	let offsetHours = berlinHour - hour;
	if (offsetHours > 12) offsetHours -= 24;
	if (offsetHours < -12) offsetHours += 24;
	return new Date(guess.getTime() - offsetHours * 60 * 60 * 1000);
}

export function shouldCallApi(lastManualCheckAt: Date | null): boolean {
	if (!lastManualCheckAt) return true;

	const now = new Date();

	if (now.getTime() - lastManualCheckAt.getTime() >= COOLDOWN_MS) return true;

	const berlinNow = toBerlin(now);
	if (berlinNow.weekday === 0) {
		const sunday18 = berlinHourToUtc(berlinNow.dateStr, 18);
		const sunday20 = berlinHourToUtc(berlinNow.dateStr, 20);

		if (now >= sunday18 && lastManualCheckAt < sunday18) return true;
		if (now >= sunday20 && lastManualCheckAt < sunday20) return true;
	}

	return false;
}
