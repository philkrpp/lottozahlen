<template>
	<v-container
		class="py-12"
		style="max-width: 800px"
	>
		<h1 class="text-h4 font-weight-bold mb-6">Datenschutzerklärung</h1>

		<v-card
			class="pa-6"
			rounded="lg"
		>
			<h2 class="text-h6 font-weight-bold mb-2">1. Verantwortlicher</h2>
			<p class="text-body-1 mb-4">
				Philipp Krapp<br />
				Hauptstr. 26<br />
				51465 Bergisch Gladbach<br />
				Telefon: 0160 6360743<br />
				E-Mail: support@philippkrapp.de
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">2. Überblick der Verarbeitungen</h2>
			<p class="text-body-1 mb-4">
				Diese Webseite ermöglicht die automatische Prüfung von Losnummern der Deutschen Fernsehlotterie sowie die
				Benachrichtigung bei Gewinnen. Im Folgenden informieren wir Sie über die Art, den Umfang und den Zweck der
				Erhebung und Verwendung personenbezogener Daten.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">3. Rechtsgrundlagen</h2>
			<p class="text-body-1 mb-4">Die Verarbeitung personenbezogener Daten erfolgt auf Basis folgender Rechtsgrundlagen:</p>
			<ul class="text-body-1 mb-4 ml-4">
				<li><strong>Einwilligung</strong> (Art. 6 Abs. 1 lit. a DSGVO) — z. B. für Analyse-Cookies</li>
				<li>
					<strong>Vertragserfüllung</strong> (Art. 6 Abs. 1 lit. b DSGVO) — für die Bereitstellung des Dienstes
					(Registrierung, Losprüfung, Benachrichtigungen)
				</li>
				<li>
					<strong>Berechtigte Interessen</strong> (Art. 6 Abs. 1 lit. f DSGVO) — für die Sicherheit und Stabilität der
					Webseite sowie zur Fehlerbehebung
				</li>
			</ul>

			<h2 class="text-h6 font-weight-bold mb-2">4. Erhebung personenbezogener Daten</h2>
			<p class="text-body-1 mb-2">Bei der Nutzung unseres Dienstes erheben wir folgende Daten:</p>
			<ul class="text-body-1 mb-4 ml-4">
				<li><strong>Registrierungsdaten:</strong> E-Mail-Adresse, Passwort (verschlüsselt gespeichert)</li>
				<li><strong>Losnummern:</strong> Von Ihnen eingegebene Losnummern der Deutschen Fernsehlotterie</li>
				<li>
					<strong>Nutzungsdaten:</strong> IP-Adresse, Browsertyp, Betriebssystem, Zugriffszeitpunkt, aufgerufene Seiten
				</li>
				<li>
					<strong>Benachrichtigungseinstellungen:</strong> E-Mail-Adresse für Gewinnbenachrichtigungen, optional
					Slack-Webhook-URL
				</li>
			</ul>

			<h2 class="text-h6 font-weight-bold mb-2">5. Cookies</h2>
			<p class="text-body-1 mb-2">Wir verwenden folgende Arten von Cookies:</p>
			<p class="text-body-1 mb-2"><strong>Notwendige Cookies</strong></p>
			<ul class="text-body-1 mb-2 ml-4">
				<li>Sitzungsverwaltung und Authentifizierung</li>
				<li>Cookie-Einwilligungsstatus</li>
				<li>Theme-Einstellungen (Hell-/Dunkelmodus)</li>
			</ul>
			<p class="text-body-1 mb-2"><strong>Analyse-Cookies (nur mit Einwilligung)</strong></p>
			<ul class="text-body-1 mb-4 ml-4">
				<li>PostHog — zur Analyse des Nutzerverhaltens</li>
				<li>Umami — zur datenschutzfreundlichen Webanalyse</li>
			</ul>
			<p class="text-body-1 mb-4">
				Sie können Ihre Cookie-Einstellungen jederzeit über den Link „Cookie-Einstellungen" im Footer der Webseite
				anpassen.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">6. Hosting und Infrastruktur</h2>
			<p class="text-body-1 mb-2">Unsere Webseite wird auf Servern in Deutschland bzw. der EU gehostet. Wir nutzen folgende Anbieter:</p>
			<ul class="text-body-1 mb-4 ml-4">
				<li>
					<strong>Hetzner Online GmbH</strong> — Serverhosting, Industriestr. 25, 91710 Gunzenhausen, Deutschland.
					<a href="https://www.hetzner.com/de/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
						>Datenschutzerklärung</a
					>
				</li>
				<li>
					<strong>Active Servers</strong> — Serverhosting, Deutschland.
				</li>
				<li>
					<strong>ALL-INKL.COM</strong> — Domain und DNS, Hauptstraße 68, 02742 Friedersdorf, Deutschland.
					<a href="https://all-inkl.com/datenschutzinformationen/" target="_blank" rel="noopener noreferrer"
						>Datenschutzerklärung</a
					>
				</li>
				<li>
					<strong>Google Cloud Platform (GCP)</strong> — Cloud-Dienste, Google Ireland Limited, Gordon House, Barrow Street,
					Dublin 4, Irland. Datenverarbeitung innerhalb der EU.
					<a href="https://cloud.google.com/privacy" target="_blank" rel="noopener noreferrer"
						>Datenschutzerklärung</a
					>
				</li>
			</ul>
			<p class="text-body-1 mb-4">
				Alle Serverdaten werden in Deutschland bzw. der Europäischen Union verarbeitet. Ein Transfer in Drittländer
				findet im Rahmen des Hostings nicht statt.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">7. Datenbanken</h2>
			<p class="text-body-1 mb-4">
				Zur Speicherung Ihrer Daten verwenden wir MongoDB, PostgreSQL und Redis. Alle Datenbanken werden auf unseren
				eigenen Servern in Deutschland betrieben. Eine Weitergabe der Daten an Dritte findet nicht statt.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">8. E-Mail-Versand</h2>
			<ul class="text-body-1 mb-4 ml-4">
				<li>
					<strong>Resend</strong> — Versand von Transaktionsmails (z. B. Registrierungsbestätigung, Gewinnbenachrichtigungen).
					Resend, Inc., USA. Es gelten EU-Standardvertragsklauseln.
					<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
						>Datenschutzerklärung</a
					>
				</li>
				<li>
					<strong>Mailchimp (Intuit)</strong> — Newsletter-Versand. Intuit Inc., USA. Es gelten EU-Standardvertragsklauseln.
					<a href="https://www.intuit.com/privacy/statement/" target="_blank" rel="noopener noreferrer"
						>Datenschutzerklärung</a
					>
				</li>
			</ul>

			<h2 class="text-h6 font-weight-bold mb-2">9. Authentifizierung</h2>
			<p class="text-body-1 mb-2">Für die Anmeldung bieten wir folgende Verfahren an:</p>
			<ul class="text-body-1 mb-4 ml-4">
				<li><strong>E-Mail und Passwort</strong> — lokal gespeichert, Passwörter werden verschlüsselt (gehasht)</li>
				<li>
					<strong>Google OAuth</strong> — Bei Nutzung der Anmeldung über Google werden Ihr Name und Ihre E-Mail-Adresse von
					Google an uns übermittelt. Es gelten die
					<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
						>Datenschutzbestimmungen von Google</a
					>.
				</li>
				<li>
					<strong>GitHub OAuth</strong> — Bei Nutzung der Anmeldung über GitHub werden Ihr Benutzername und Ihre
					E-Mail-Adresse von GitHub (Microsoft) an uns übermittelt. Es gelten die
					<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer"
						>Datenschutzbestimmungen von GitHub</a
					>.
				</li>
			</ul>

			<h2 class="text-h6 font-weight-bold mb-2">10. Analyse und Monitoring</h2>
			<ul class="text-body-1 mb-4 ml-4">
				<li>
					<strong>PostHog</strong> — Webanalyse zur Verbesserung unseres Dienstes. Die Nutzung erfolgt nur mit Ihrer
					Einwilligung über den Cookie-Banner. PostHog, Inc., USA. Es gelten EU-Standardvertragsklauseln.
					<a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>
				</li>
				<li>
					<strong>Umami</strong> — Datenschutzfreundliche Webanalyse. Die Nutzung erfolgt nur mit Ihrer Einwilligung über
					den Cookie-Banner. Umami Software, Inc., USA. Es gelten EU-Standardvertragsklauseln.
					<a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</a>
				</li>
				<li>
					<strong>SigNoz / OpenTelemetry</strong> — Technisches Monitoring und Performance-Überwachung zur Sicherstellung
					der Stabilität und Fehlerbehebung. Die erfassten Daten umfassen technische Metriken und werden auf unseren
					eigenen Servern in Deutschland verarbeitet. Rechtsgrundlage: berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO).
				</li>
			</ul>

			<h2 class="text-h6 font-weight-bold mb-2">11. Ihre Rechte</h2>
			<p class="text-body-1 mb-2">Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:</p>
			<ul class="text-body-1 mb-4 ml-4">
				<li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO)</li>
				<li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)</li>
				<li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO)</li>
				<li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
				<li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
				<li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO)</li>
			</ul>
			<p class="text-body-1 mb-4">
				Darüber hinaus haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer
				personenbezogenen Daten zu beschweren. Die für uns zuständige Aufsichtsbehörde ist die Landesbeauftragte für
				Datenschutz und Informationsfreiheit Nordrhein-Westfalen.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">12. Widerruf der Einwilligung</h2>
			<p class="text-body-1 mb-4">
				Sofern die Verarbeitung Ihrer Daten auf einer Einwilligung beruht, haben Sie das Recht, diese jederzeit zu
				widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt davon unberührt. Sie können
				Ihre Cookie-Einwilligung jederzeit über den Link „Cookie-Einstellungen" im Footer anpassen. Für sonstige
				Widerrufe kontaktieren Sie uns bitte per E-Mail.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">13. Änderungen dieser Datenschutzerklärung</h2>
			<p class="text-body-1">
				Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen
				Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann
				die jeweils aktuelle Datenschutzerklärung.
			</p>

			<p class="text-body-2 mt-6" style="color: var(--v-theme-secondary)">Stand: April 2026</p>
		</v-card>
	</v-container>
</template>
