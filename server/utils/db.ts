import mongoose from "mongoose";

const log = useLogger("mongodb");

let isConnected = false;

const MAX_RETRIES = 5;
let retryCount = 0;

export async function connectDB() {
	if (isConnected) return;

	const config = useRuntimeConfig();
	const uri = config.mongodbUri;

	if (!uri) {
		log.warn("Keine MONGODB_URI konfiguriert, überspringe Verbindung");
		return;
	}

	try {
		await withSpan("db.mongodb.connect", { "db.system": "mongodb" }, async () => {
			await mongoose.connect(uri);
		});
		isConnected = true;
		retryCount = 0;
		log.info("Verbindung erfolgreich hergestellt");
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		retryCount++;

		if (retryCount >= MAX_RETRIES) {
			log.fatal(`MongoDB: ${MAX_RETRIES} Verbindungsversuche fehlgeschlagen, gebe auf`, {
				retries: retryCount,
			}, err);
			return;
		}

		const delay = Math.min(5000 * Math.pow(2, retryCount - 1), 30_000);
		log.error(`Verbindung fehlgeschlagen, Retry ${retryCount}/${MAX_RETRIES} in ${delay / 1000}s`, {
			retry: retryCount,
			maxRetries: MAX_RETRIES,
		}, err);

		setTimeout(() => {
			isConnected = false;
			connectDB();
		}, delay);
	}

	mongoose.connection.on("disconnected", () => {
		log.warn("Verbindung getrennt");
		isConnected = false;
	});
}
