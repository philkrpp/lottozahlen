import * as CookieConsent from "vanilla-cookieconsent";

function loadUmamiScript(host: string, websiteId: string) {
	if (document.querySelector(`script[data-website-id="${websiteId}"]`)) return;
	const script = document.createElement("script");
	script.src = `${host}/script.js`;
	script.dataset.websiteId = websiteId;
	script.async = true;
	script.defer = true;
	document.head.appendChild(script);
}

export default defineNuxtPlugin(() => {
	const { umamiHost, umamiWebsiteId } = useRuntimeConfig().public;
	if (!umamiHost || !umamiWebsiteId) return;

	const tryLoad = () => {
		if (CookieConsent.acceptedCategory("analytics")) {
			loadUmamiScript(umamiHost, umamiWebsiteId);
		}
	};

	tryLoad();
	window.addEventListener("cc:consent-change", tryLoad);
});
