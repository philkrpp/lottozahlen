import { spawn, type ChildProcess } from "node:child_process";
import { resolve } from "node:path";
import { seed } from "../seed";

process.loadEnvFile(resolve(import.meta.dirname, "../../.env"));

let server: ChildProcess | null = null;

const PORT = 3456;
const BASE_URL = `http://localhost:${PORT}`;

async function waitForServer(url: string, maxAttempts = 30): Promise<void> {
	for (let i = 0; i < maxAttempts; i++) {
		try {
			const res = await fetch(url);
			if (res.ok || res.status < 500) return;
		} catch {
			// Server not ready yet
		}
		await new Promise((r) => setTimeout(r, 1000));
	}
	throw new Error(`Server did not start within ${maxAttempts} seconds`);
}

export async function setup(): Promise<void> {
	await seed();

	server = spawn("node", [".output/server/index.mjs"], {
		env: { ...process.env, NITRO_PORT: String(PORT), NODE_ENV: "test" },
		stdio: "pipe",
	});

	server.on("error", (err) => {
		console.error("Server process error:", err);
	});

	await waitForServer(BASE_URL);
}

export async function teardown(): Promise<void> {
	if (server) {
		server.kill("SIGTERM");
		server = null;
	}
}
