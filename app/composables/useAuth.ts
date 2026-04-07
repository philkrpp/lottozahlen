import { createAuthClient } from "better-auth/vue";
import { emailOTPClient, magicLinkClient } from "better-auth/client/plugins";

export function useAuth() {
	const origin = import.meta.server ? useRequestURL().origin : window.location.origin;
	const client = createAuthClient({
		baseURL: `${origin}/api/auth`,
		plugins: [emailOTPClient(), magicLinkClient()],
	});
	return client;
}
