export default defineNuxtRouteMiddleware(async (_to) => {
	// Skip during SSR to avoid self-request deadlock
	if (import.meta.server) return;

	const { data: session } = await useAuth().getSession();

	if (session?.user && session.user.emailVerified) {
		return navigateTo("/dashboard");
	}
});
