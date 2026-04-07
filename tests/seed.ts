import mongoose from "mongoose";
import { hashPassword } from "better-auth/crypto";

// Feste IDs – werden bei jedem Lauf überschrieben (upsert)
export const TEST_USER_ID = "seed-test-user-00001";
export const TEST_ACCOUNT_ID = "seed-test-account-00001";
export const TEST_USER_EMAIL = "test@lottozahlen.de";
export const TEST_USER_PASSWORD = "TestPasswort123!";

export async function seed() {
	const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/lottozahlen";
	await mongoose.connect(mongodbUri);
	const db = mongoose.connection.db;

	const now = new Date();
	const hashedPassword = await hashPassword(TEST_USER_PASSWORD);

	await db.collection("user").updateOne(
		{ _id: TEST_USER_ID },
		{
			$set: {
				name: "Test User",
				email: TEST_USER_EMAIL,
				emailVerified: true,
				image: null,
				updatedAt: now,
			},
			$setOnInsert: {
				createdAt: now,
			},
		},
		{ upsert: true },
	);

	await db.collection("account").updateOne(
		{ _id: TEST_ACCOUNT_ID },
		{
			$set: {
				userId: TEST_USER_ID,
				providerId: "credential",
				accountId: TEST_USER_EMAIL,
				password: hashedPassword,
				updatedAt: now,
			},
			$setOnInsert: {
				createdAt: now,
			},
		},
		{ upsert: true },
	);

	await mongoose.disconnect();
	console.log("Seed: Test-User angelegt/aktualisiert");
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
	seed().catch((err) => {
		console.error("Seed fehlgeschlagen:", err);
		process.exit(1);
	});
}
