import { trace, context } from "@opentelemetry/api";
import { createLogger } from "~/utils/logger";
import { setUserId } from "~/utils/session";

const log = createLogger("router");

export default defineNuxtPlugin((nuxtApp) => {
	const router = useRouter();

	// User-ID setzen sobald Auth-Session verfuegbar
	try {
		const { getSession } = useAuth();
		getSession()
			.then(({ data: session }) => {
				if (session?.user?.id) {
					setUserId(session.user.id);

					// User-ID an O2 RUM propagieren fuer Session-Replay-Zuordnung
					const o2Rum = nuxtApp.$o2Rum as { setUser?: (user: { id: string }) => void } | undefined;
					o2Rum?.setUser?.({ id: session.user.id });
				}
			})
			.catch(() => {
				// Nicht eingeloggt oder Fehler — ignorieren
			});
	} catch {
		// useAuth nicht verfuegbar
	}

	router.beforeEach((to, from) => {
		const tracer = trace.getTracer("lottozahlen-frontend");
		const parentCtx = context.active();

		const span = tracer.startSpan("navigation", {
			attributes: {
				"navigation.from": from.fullPath,
				"navigation.to": to.fullPath,
				"navigation.name": (to.name as string) || "unknown",
				"navigation.type": from.name ? "client" : "initial",
			},
		}, parentCtx);

		// Span als aktiven Context setzen damit Logs trace_id erhalten
		const navCtx = trace.setSpan(parentCtx, span);
		context.with(navCtx, () => {
			log.info(`Navigation: ${from.fullPath} → ${to.fullPath}`, {
				from: from.fullPath,
				to: to.fullPath,
				routeName: (to.name as string) || "unknown",
			});
		});

		const meta = to.meta as Record<string, unknown>;
		meta.__navSpan = span;
		meta.__navCtx = navCtx;
	});

	router.afterEach((to, from, failure) => {
		const meta = to.meta as Record<string, unknown>;
		const span = meta.__navSpan as
			| ReturnType<ReturnType<typeof trace.getTracer>["startSpan"]>
			| undefined;
		if (!span) return;

		const navCtx = meta.__navCtx as ReturnType<typeof context.active> | undefined;

		const finish = () => {
			if (failure) {
				span.setStatus({
					code: 2, // SpanStatusCode.ERROR
					message: failure.message,
				});
				log.error(`Navigation failed: ${failure.message}`, {
					from: from.fullPath,
					to: to.fullPath,
				});
			} else {
				span.setStatus({ code: 1 }); // SpanStatusCode.OK
			}
			span.end();
		};

		// Context reaktivieren damit afterEach-Logs trace_id tragen
		if (navCtx) {
			context.with(navCtx, finish);
		} else {
			finish();
		}
	});
});
