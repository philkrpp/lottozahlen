import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins/email-otp";
import { magicLink } from "better-auth/plugins/magic-link";
import mongoose from "mongoose";
import { sendEmail, verificationOtpTemplate, magicLinkTemplate } from "../services/emailService";

let _auth: ReturnType<typeof betterAuth> | null = null;

function buildSocialProviders() {
	const providers: Record<string, { clientId: string; clientSecret: string }> = {};
	if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
		providers.google = {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		};
	}
	if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
		providers.github = {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		};
	}
	return providers;
}

export function getEnabledProviders() {
	return {
		google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
		github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
	};
}

export function getAuth() {
	if (!_auth) {
		_auth = betterAuth({
			database: mongodbAdapter(mongoose.connection.getClient().db(mongoose.connection.name)),
			emailAndPassword: {
				enabled: true,
				requireEmailVerification: true,
			},
			socialProviders: buildSocialProviders(),
			session: {
				expiresIn: 60 * 60 * 24 * 7,
				updateAge: 60 * 60 * 24,
			},
			plugins: [
				emailOTP({
					otpLength: 6,
					expiresIn: 300,
					sendVerificationOnSignUp: true,
					async sendVerificationOTP({ email, otp, type }) {
						if (type === "email-verification") {
							await sendEmail(email, "Dein Bestätigungscode", verificationOtpTemplate(otp));
						}
					},
				}),
				magicLink({
					expiresIn: 600,
					async sendMagicLink({ email, url }) {
						await sendEmail(email, "Passwort zurücksetzen", magicLinkTemplate(url));
					},
				}),
			],
		});
	}
	return _auth;
}
