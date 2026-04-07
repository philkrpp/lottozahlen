import { registerCronJobs } from "~~/server/cron";

export default defineNitroPlugin(() => {
	registerCronJobs();
});
