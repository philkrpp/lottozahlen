<template>
	<div>
		<HeroSection />
		<FeaturesSection />
		<HowItWorksSection />
		<PricingSection />
		<TestimonialsSection />
		<FAQSection />
		<CTASection />
	</div>
</template>

<script setup lang="ts">
import HeroSection from "~/components/landing/HeroSection.vue";
import FeaturesSection from "~/components/landing/FeaturesSection.vue";
import HowItWorksSection from "~/components/landing/HowItWorksSection.vue";
import PricingSection from "~/components/landing/PricingSection.vue";
import TestimonialsSection from "~/components/landing/TestimonialsSection.vue";
import FAQSection from "~/components/landing/FAQSection.vue";
import CTASection from "~/components/landing/CTASection.vue";

definePageMeta({
	layout: "default",
});

useSeoMeta({
	title: "Lottozahlen – Losnummern automatisch prüfen lassen",
	ogTitle: "Lottozahlen – Losnummern automatisch prüfen lassen",
	description:
		"Trage deine Losnummern der Deutschen Fernsehlotterie ein und werde automatisch per E-Mail oder Slack benachrichtigt, wenn du gewinnst. Kostenlos, schnell und zuverlässig.",
	ogDescription: "Losnummern eintragen, automatisch prüfen lassen und bei Gewinn benachrichtigt werden.",
	ogUrl: "https://los.philippkrapp.de/",
	twitterCard: "summary_large_image",
	twitterTitle: "Lottozahlen – Losnummern automatisch prüfen lassen",
	twitterDescription: "Losnummern eintragen, automatisch prüfen lassen und bei Gewinn benachrichtigt werden.",
});

const faqItems = [
	{
		question: "Was ist Lottozahlen?",
		answer: "Lottozahlen ist ein kostenloser Service, der deine Losnummern der Deutschen Fernsehlotterie nach jeder Ziehung automatisch prüft und dich bei einem Gewinn sofort benachrichtigt.",
	},
	{
		question: "Ist der Service wirklich kostenlos?",
		answer: "Ja, Lottozahlen ist komplett kostenlos – ohne versteckte Kosten, ohne Abo und ohne Kreditkarte.",
	},
	{
		question: "Welche Lotterien werden unterstützt?",
		answer: "Aktuell unterstützen wir die Deutsche Fernsehlotterie. Die Ergebnisse werden direkt nach der offiziellen Ziehung abgerufen und geprüft.",
	},
	{
		question: "Wann erhalte ich die Ergebnisse?",
		answer: "Die Ziehungen finden sonntags um 18:00 und 20:00 Uhr statt. Deine Lose werden automatisch ab 20:15 Uhr geprüft und du wirst umgehend benachrichtigt.",
	},
	{
		question: "Wie werde ich bei einem Gewinn benachrichtigt?",
		answer: "Du kannst zwischen E-Mail- und Slack-Benachrichtigungen wählen – oder beides gleichzeitig nutzen. So verpasst du keinen Gewinn mehr.",
	},
	{
		question: "Kann ich mehrere Lose eintragen?",
		answer: "Ja, du kannst unbegrenzt viele Losnummern eintragen. Alle werden nach jeder Ziehung automatisch geprüft.",
	},
];

provide("faqItems", faqItems);

useHead({
	script: [
		{
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "WebApplication",
				name: "Lottozahlen",
				url: "https://los.philippkrapp.de",
				description: "Automatische Losnummern-Prüfung der Deutschen Fernsehlotterie",
				applicationCategory: "UtilityApplication",
				operatingSystem: "Web",
				offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
			}),
		},
		{
			type: "application/ld+json",
			innerHTML: JSON.stringify({
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: faqItems.map((item) => ({
					"@type": "Question",
					name: item.question,
					acceptedAnswer: {
						"@type": "Answer",
						text: item.answer,
					},
				})),
			}),
		},
	],
});
</script>
