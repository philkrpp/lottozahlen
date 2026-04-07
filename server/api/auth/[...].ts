import { getAuth } from "~~/server/utils/auth";

export default defineEventHandler((event) => {
	return getAuth().handler(toWebRequest(event));
});
