import Draw from "~~/server/models/Draw";
import Los from "~~/server/models/Los";
import CheckResult from "~~/server/models/CheckResult";
import { fetchLatestDrawResults } from "~~/server/services/drawFetcher";
import { checkLosAgainstDraw } from "~~/server/services/losChecker";
import { notifyUser } from "~~/server/services/notificationService";
import { notifyUsersForDraw } from "./notifyUsers";
import { withSpan } from "../utils/tracing";

const log = useLogger("cron");
const ANBIETER_LIST = ["deutsche-fernsehlotterie"];

export async function checkDrawResults(): Promise<void> {
	return withSpan("cron.checkDrawResults", {}, async (span) => {
		log.info("Cron-Job gestartet: Ziehungsergebnisse prüfen");

		let newDrawsCount = 0;
		let checkedLoseCount = 0;
		let gewinneCount = 0;
		let errorsCount = 0;

		// --- Part 1: Fetch new draws and match locally ---
		for (const anbieter of ANBIETER_LIST) {
			try {
				const results = await fetchLatestDrawResults(anbieter);

				for (const result of results) {
					// Check for duplicates by externalId
					const existing = await Draw.findOne({
						anbieter,
						externalId: result.externalId,
					});

					if (existing) continue;

					// Save new draw
					const draw = await Draw.create({
						anbieter,
						...result,
						fetchedAt: new Date(),
					});

					newDrawsCount++;
					log.info("Neue Ziehung gespeichert", {
						anbieter,
						drawDate: result.drawDate,
						drawType: result.drawType,
						externalId: result.externalId,
					});

					// Trigger local matching for this draw
					await notifyUsersForDraw(draw);
				}
			} catch (error) {
				errorsCount++;
				log.error(`Fehler beim Abrufen der Ziehungen`, { anbieter }, error instanceof Error ? error : new Error(String(error)));
			}
		}

		// --- Part 2: Direct per-ticket API check ---
		const activeLose = await Los.find({ isActive: true });
		log.info("Direkte Los-Checks starten", { activeLoseCount: activeLose.length });

		for (const los of activeLose) {
			try {
				const result = await checkLosAgainstDraw(los.losNummer, los.anbieter, los.losTyp);
				checkedLoseCount++;

				// Save CheckResult (no drawId for direct checks)
				const checkResult = await CheckResult.create({
					userId: los.userId,
					losId: los._id,
					...result,
					checkType: "automatic",
				});

				// Update Los
				los.lastCheckedAt = new Date();
				los.lastCheckResult = {
					hasWon: result.hasWon,
					prize: result.prize,
					drawDate: new Date(),
					checkedAt: new Date(),
				};
				await los.save();

				if (result.hasWon) gewinneCount++;

				// Send notification
				const sent = await notifyUser({
					userId: los.userId.toString(),
					type: result.hasWon ? "gewinn" : "kein-gewinn",
					losNummer: los.losNummer,
					prize: result.prize || undefined,
					drawDate: new Date(),
				});

				if (sent) {
					checkResult.notificationSent = true;
					checkResult.notificationSentAt = new Date();
					await checkResult.save();
				}
			} catch (error) {
				errorsCount++;
				log.error("Fehler beim Los-Check", { losId: String(los._id), losNummer: los.losNummer }, error instanceof Error ? error : new Error(String(error)));
			}
		}

		span.setAttribute("cron.newDraws", newDrawsCount);
		span.setAttribute("cron.checkedLose", checkedLoseCount);
		span.setAttribute("cron.gewinne", gewinneCount);
		span.setAttribute("cron.errors", errorsCount);
		log.info("Cron-Job abgeschlossen", { newDrawsCount, checkedLoseCount, gewinneCount, errorsCount });
	});
}
