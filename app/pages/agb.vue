<script setup lang="ts">
useSeoMeta({
	title: "AGB – Lottozahlen",
	ogTitle: "AGB – Lottozahlen",
	description:
		"Allgemeine Geschäftsbedingungen von Lottozahlen – Nutzungsbedingungen für den automatischen Losprüfungs-Service.",
	ogDescription: "AGB und Nutzungsbedingungen von Lottozahlen.",
});
</script>

<template>
	<v-container
		class="py-12"
		style="max-width: 800px"
	>
		<h1 class="text-h4 font-weight-bold mb-6">Allgemeine Geschäftsbedingungen</h1>

		<v-card
			class="pa-6"
			rounded="lg"
		>
			<p class="text-body-2 mb-6" style="color: var(--v-theme-secondary)">Stand: April 2026</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 1 Geltungsbereich</h2>
			<p class="text-body-1 mb-2">
				Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für die Nutzung des Online-Dienstes
				„Lottozahlen" (nachfolgend „Dienst"), bereitgestellt von:
			</p>
			<p class="text-body-1 mb-4">
				Philipp Krapp<br />
				Hauptstr. 26<br />
				51465 Bergisch Gladbach<br />
				E-Mail: support@philippkrapp.de
			</p>
			<p class="text-body-1 mb-4">
				Mit der Registrierung erklärt der Nutzer sein Einverständnis mit diesen AGB. Die Nutzung des Dienstes ist nur
				zulässig, wenn der Nutzer diese AGB akzeptiert.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 2 Vertragsgegenstand und Leistungsbeschreibung</h2>
			<p class="text-body-1 mb-2">Der Dienst bietet folgende Funktionen:</p>
			<ul class="text-body-1 mb-4 ml-6">
				<li>Verwaltung von Losnummern der Deutschen Fernsehlotterie</li>
				<li>Automatische Prüfung der eingetragenen Losnummern nach jeder Ziehung</li>
				<li>Benachrichtigung des Nutzers per E-Mail und/oder Slack bei einem Gewinn</li>
			</ul>
			<p class="text-body-1 mb-4">
				Der Dienst dient ausschließlich der komfortablen Überprüfung von Losnummern. Er ersetzt nicht die offizielle
				Gewinnprüfung durch die Deutsche Fernsehlotterie. Gewinnansprüche können ausschließlich gegenüber der Deutschen
				Fernsehlotterie geltend gemacht werden.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 3 Registrierung und Nutzerkonto</h2>
			<p class="text-body-1 mb-2">
				Für die Nutzung des Dienstes ist eine Registrierung erforderlich. Die Registrierung kann erfolgen über:
			</p>
			<ul class="text-body-1 mb-4 ml-6">
				<li>E-Mail-Adresse und Passwort</li>
				<li>Google-Konto (OAuth)</li>
				<li>GitHub-Konto (OAuth)</li>
			</ul>
			<p class="text-body-1 mb-4">
				Bei der Registrierung per E-Mail ist eine Verifizierung der E-Mail-Adresse erforderlich. Der Nutzer ist
				verpflichtet, wahrheitsgemäße und vollständige Angaben zu machen. Pro Person darf nur ein Nutzerkonto erstellt
				werden.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 4 Kostenfreiheit</h2>
			<p class="text-body-1 mb-4">
				Die Nutzung des Dienstes ist derzeit kostenlos. Es fallen keine Gebühren oder Abonnementkosten an. Der Betreiber
				behält sich vor, in Zukunft kostenpflichtige Zusatzfunktionen einzuführen. Bestehende kostenlose Funktionen
				bleiben davon unberührt. Über Änderungen wird der Nutzer rechtzeitig informiert.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 5 Pflichten des Nutzers</h2>
			<p class="text-body-1 mb-2">Der Nutzer verpflichtet sich:</p>
			<ul class="text-body-1 mb-4 ml-6">
				<li>den Dienst nicht missbräuchlich zu nutzen</li>
				<li>seine Zugangsdaten vertraulich zu behandeln und vor dem Zugriff Dritter zu schützen</li>
				<li>keine automatisierten Zugriffe (Bots, Scraper) auf den Dienst durchzuführen</li>
				<li>keine falschen oder irreführenden Daten einzutragen</li>
				<li>den Betreiber unverzüglich zu informieren, wenn ein unbefugter Zugriff auf sein Konto vermutet wird</li>
			</ul>

			<h2 class="text-h6 font-weight-bold mb-2">§ 6 Verfügbarkeit</h2>
			<p class="text-body-1 mb-4">
				Der Betreiber bemüht sich um eine möglichst unterbrechungsfreie Verfügbarkeit des Dienstes, übernimmt jedoch
				keine Garantie für eine ständige Erreichbarkeit. Wartungsarbeiten, technische Störungen oder höhere Gewalt können
				zu vorübergehenden Einschränkungen führen. Ein Anspruch auf ununterbrochene Verfügbarkeit besteht nicht.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 7 Haftungsbeschränkung</h2>
			<p class="text-body-1 mb-4">
				Die Ergebnisse der automatischen Losprüfung erfolgen ohne Gewähr. Der Betreiber übernimmt keine Haftung für die
				Richtigkeit, Vollständigkeit oder Aktualität der angezeigten Prüfergebnisse. Es gelten ausschließlich die
				offiziellen Ergebnisse der Deutschen Fernsehlotterie.
			</p>
			<p class="text-body-1 mb-4">
				Der Betreiber haftet nicht für Schäden, die dem Nutzer durch fehlerhafte oder ausgebliebene Benachrichtigungen
				entstehen. Dies gilt insbesondere für entgangene Gewinne, die aufgrund einer nicht oder fehlerhaft erfolgten
				Prüfung oder Benachrichtigung nicht rechtzeitig geltend gemacht wurden.
			</p>
			<p class="text-body-1 mb-4">
				Die Haftung des Betreibers ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. Bei leichter Fahrlässigkeit
				haftet der Betreiber nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), und dies begrenzt auf
				den vorhersehbaren, vertragstypischen Schaden.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 8 Datenschutz</h2>
			<p class="text-body-1 mb-4">
				Der Schutz personenbezogener Daten ist dem Betreiber wichtig. Einzelheiten zur Erhebung, Verarbeitung und Nutzung
				personenbezogener Daten sind der
				<NuxtLink
					to="/datenschutz"
					class="text-primary"
					>Datenschutzerklärung</NuxtLink
				>
				zu entnehmen.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 9 Kündigung und Kontolöschung</h2>
			<p class="text-body-1 mb-4">
				Der Nutzer kann sein Konto jederzeit und ohne Angabe von Gründen über die Kontoeinstellungen löschen. Mit der
				Löschung werden alle gespeicherten Daten des Nutzers (Losnummern, Prüfergebnisse, Einstellungen) unwiderruflich
				entfernt.
			</p>
			<p class="text-body-1 mb-4">
				Der Betreiber behält sich das Recht vor, Nutzerkonten bei Verstoß gegen diese AGB vorübergehend zu sperren oder
				dauerhaft zu löschen. Der Nutzer wird darüber per E-Mail informiert.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 10 Änderungen der AGB</h2>
			<p class="text-body-1 mb-4">
				Der Betreiber behält sich vor, diese AGB jederzeit zu ändern. Über Änderungen wird der Nutzer per E-Mail
				informiert. Widerspricht der Nutzer den geänderten AGB nicht innerhalb von vier Wochen nach Zugang der
				Mitteilung, gelten die neuen AGB als akzeptiert. Der Betreiber wird den Nutzer in der Änderungsmitteilung auf die
				Bedeutung der Vier-Wochen-Frist und das Widerspruchsrecht gesondert hinweisen.
			</p>

			<h2 class="text-h6 font-weight-bold mb-2">§ 11 Schlussbestimmungen</h2>
			<p class="text-body-1 mb-4">
				Es gilt das Recht der Bundesrepublik Deutschland. Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder
				werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt. Anstelle der unwirksamen Bestimmung gilt
				eine wirksame Bestimmung als vereinbart, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten
				kommt.
			</p>
		</v-card>
	</v-container>
</template>
