import type { openobserveRum } from "@openobserve/browser-rum";
import type { Tracer } from "@opentelemetry/api";

declare module "#app" {
	interface NuxtApp {
		$o2Rum: typeof openobserveRum;
		$otelTracer: Tracer;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$o2Rum: typeof openobserveRum;
		$otelTracer: Tracer;
	}
}

export {};
