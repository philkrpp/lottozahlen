export default defineEventHandler((event) => {
	const baseUrl = "https://los.philippkrapp.de";
	const pages = [
		{ loc: "/", priority: "1.0", changefreq: "weekly" },
		{ loc: "/datenschutz", priority: "0.3", changefreq: "yearly" },
		{ loc: "/impressum", priority: "0.3", changefreq: "yearly" },
		{ loc: "/agb", priority: "0.3", changefreq: "yearly" },
	];

	const urls = pages
		.map(
			(page) => `
	<url>
		<loc>${baseUrl}${page.loc}</loc>
		<changefreq>${page.changefreq}</changefreq>
		<priority>${page.priority}</priority>
	</url>`,
		)
		.join("");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

	setHeader(event, "content-type", "application/xml");
	return sitemap;
});
