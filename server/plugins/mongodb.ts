import { connectDB } from "../utils/db";

export default defineNitroPlugin(async () => {
	await connectDB();
});
