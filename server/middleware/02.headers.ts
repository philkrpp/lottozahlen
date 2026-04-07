export default defineEventHandler((event) => {
	removeResponseHeader(event, "x-powered-by");
});
