/**
 * SEO invariants check — runs against dist/, exits non-zero on failure.
 *
 * Replaces an earlier version that validated routes the routing refactor
 * removed and always exited 0 (audit findings #75/#90). Every check here
 * encodes a decision documented in docs/audit-2026-07/session-handoff.md:
 * English is served un-prefixed, hreflang is emitted only for routes that
 * exist in their advertised locales, and the sitemap must agree with the pages.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SITE = "https://nostrich.love";
const LOCALES = ["pl", "es", "de", "zh", "ar", "hi"]; // prefixed locales; en is un-prefixed

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`✗ ${msg}`);
};
const ok = (msg) => console.log(`✓ ${msg}`);

const read = (p) => readFileSync(join(DIST, p), "utf8");

/**
 * The hreflang annotations of a page — and only those.
 *
 * An hreflang annotation is a `<link rel="alternate" hreflang="…">` in <head>
 * (or the sitemap/HTTP-header equivalents); `hreflang` on an `<a>` merely
 * describes the language of a link target and carries no international-targeting
 * signal. The footer's crawlable language row is exactly such a set of anchors,
 * so a bare /hreflang="([^"]+)"/ scan counted them as alternates and reported
 * duplicated clusters on every page. Match the <link> elements themselves.
 */
const LINK_ALTERNATE = /<link\b[^>]*\brel="alternate"[^>]*\bhreflang="([^"]+)"[^>]*>/g;
const hreflangsOf = (html) => [...html.matchAll(LINK_ALTERNATE)].map((m) => m[1]);

if (!existsSync(DIST)) {
  console.error("dist/ does not exist — run `npm run build` first");
  process.exit(1);
}

// --- 1. The old /en/ scheme must be gone -----------------------------------
if (existsSync(join(DIST, "en"))) {
  fail("dist/en/ exists — English must be served un-prefixed");
} else {
  ok("no dist/en/ — English is un-prefixed");
}

// --- 2. English guide page: canonical, hreflang, JSON-LD, og:type ----------
const SAMPLE = "guides/what-is-nostr/index.html";
if (!existsSync(join(DIST, SAMPLE))) {
  fail(`${SAMPLE} missing`);
} else {
  const html = read(SAMPLE);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical === `${SITE}/guides/what-is-nostr/`) ok(`canonical: ${canonical}`);
  else fail(`canonical is ${canonical}, expected ${SITE}/guides/what-is-nostr/`);

  const hreflangs = hreflangsOf(html);
  const expected = ["en", ...LOCALES, "x-default"];
  const missing = expected.filter((l) => !hreflangs.includes(l));
  if (missing.length === 0 && hreflangs.length === expected.length)
    ok(`guide hreflang set complete (${hreflangs.length})`);
  else fail(`guide hreflang wrong — got [${hreflangs}], missing [${missing}]`);

  // A page may emit one node or an array of them — guides now ship
  // LearningResource + BreadcrumbList (+ FAQPage where the guide is Q&A).
  // Assert the types we depend on rather than just "something parsed".
  const ld = html.match(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/s)?.[1];
  if (!ld) fail("guide page has no JSON-LD");
  else {
    try {
      const parsed = JSON.parse(ld);
      const types = (Array.isArray(parsed) ? parsed : [parsed]).map((n) => n?.["@type"]);
      const required = ["LearningResource", "BreadcrumbList"];
      const missingTypes = required.filter((type) => !types.includes(type));
      if (types.some((type) => !type)) fail(`a JSON-LD node has no @type (got [${types}])`);
      else if (missingTypes.length === 0) ok(`JSON-LD parses (@type: ${types.join(", ")})`);
      else fail(`guide JSON-LD is missing [${missingTypes}] — got [${types}]`);
    } catch {
      fail("JSON-LD does not parse");
    }
  }

  if (/property="og:type" content="article"/.test(html)) ok("og:type is article on guides");
  else fail("guide og:type is not article");
}

// --- 3. Localized guide pages exist with their own canonicals --------------
for (const l of LOCALES) {
  const p = `${l}/guides/what-is-nostr/index.html`;
  if (!existsSync(join(DIST, p))) {
    fail(`${p} missing`);
    continue;
  }
  const canonical = read(p).match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical === `${SITE}/${l}/guides/what-is-nostr/`) ok(`${l} canonical correct`);
  else fail(`${l} canonical is ${canonical}`);
}

// --- 3b. Every homepage locale is built, translated and reciprocal ---------
{
  const expectedHreflangs = ["en", ...LOCALES, "x-default"].sort();
  for (const locale of ["en", ...LOCALES]) {
    const path = locale === "en" ? "index.html" : `${locale}/index.html`;
    if (!existsSync(join(DIST, path))) {
      fail(`${path} missing`);
      continue;
    }
    const html = read(path);
    const expectedUrl = locale === "en" ? `${SITE}/` : `${SITE}/${locale}/`;
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const expectedCopy = JSON.parse(readFileSync(`src/i18n/locales/${locale}.json`, "utf8")).homePage;
    const expectedTitle = `${expectedCopy.meta.title} | Nostrich.love`;
    const expectedGuide = locale === "en" ? "/guides/what-is-nostr" : `/${locale}/guides/what-is-nostr`;
    const lang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1];
    const dir = html.match(/<html[^>]*\bdir="([^"]+)"/)?.[1];
    const expectedDir = locale === "ar" ? "rtl" : "ltr";
    const hreflangs = hreflangsOf(html).sort();
    if (canonical !== expectedUrl) fail(`${path} canonical is ${canonical}, expected ${expectedUrl}`);
    if (lang !== locale || dir !== expectedDir) fail(`${path} language/direction is ${lang}/${dir}`);
    if (!html.includes(`<title>${expectedTitle}</title>`)) fail(`${path} lacks its translated page title`);
    if (!html.includes(`content="${expectedCopy.meta.description}"`)) fail(`${path} lacks its translated meta description`);
    if (!html.includes(expectedCopy.hero.title)) fail(`${path} lacks its translated hero title`);
    if (!html.includes(`href="${expectedGuide}"`)) fail(`${path} lacks its local first-guide link`);
    if (hreflangs.join(",") !== expectedHreflangs.join(","))
      fail(`${path} homepage hreflang wrong: [${hreflangs}]`);
    else if (canonical === expectedUrl && lang === locale && dir === expectedDir &&
      html.includes(`<title>${expectedTitle}</title>`) &&
      html.includes(`content="${expectedCopy.meta.description}"`) &&
      html.includes(expectedCopy.hero.title) && html.includes(`href="${expectedGuide}"`))
      ok(`${path} localized homepage, canonical and hreflang correct`);
  }
}

// --- 4. English-only pages must NOT advertise alternates -------------------
for (const p of ["tools/index.html"]) {
  if (!existsSync(join(DIST, p))) {
    fail(`${p} missing`);
    continue;
  }
  const n = hreflangsOf(read(p)).length;
  if (n === 0) ok(`${p} has no hreflang (English-only route)`);
  else fail(`${p} advertises ${n} hreflang alternates for pages that may not exist`);
}

// --- 4b. Glossary ships in exactly en+pl+es+de -----------------------------
// The route is partially localized: hreflang must list exactly the built
// variants (a wrong alternate advertises a 404 — the audit's original sin),
// and the unshipped locales must not exist on disk.
const GLOSSARY_LOCALES = ["pl", "es", "de"]; // + un-prefixed en
{
  const expectedGlossary = ["en", ...GLOSSARY_LOCALES, "x-default"].sort();
  const pages = [
    { path: "glossary/index.html", canonical: `${SITE}/glossary/` },
    ...GLOSSARY_LOCALES.map((l) => ({
      path: `${l}/glossary/index.html`,
      canonical: `${SITE}/${l}/glossary/`,
    })),
  ];
  for (const { path, canonical } of pages) {
    if (!existsSync(join(DIST, path))) {
      fail(`${path} missing`);
      continue;
    }
    const html = read(path);
    const got = hreflangsOf(html).sort();
    if (got.join(",") === expectedGlossary.join(","))
      ok(`${path} hreflang is exactly {en,pl,es,de,x-default}`);
    else fail(`${path} hreflang wrong — got [${got}], expected [${expectedGlossary}]`);

    const c = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    if (c === canonical) ok(`${path} canonical correct`);
    else fail(`${path} canonical is ${c}, expected ${canonical}`);
  }
  const unshipped = ["zh", "ar", "hi"].filter((l) => existsSync(join(DIST, l, "glossary")));
  if (unshipped.length === 0) ok("no unshipped glossary locales on disk (zh/ar/hi)");
  else for (const l of unshipped) fail(`dist/${l}/glossary exists but is not in the shipped locale set`);
}

// --- 4c. Every locale must be reachable by a crawlable <a>, not just hreflang
// The language switcher is a React island whose options only exist after
// hydration, so before the footer language row the static HTML contained no
// anchor into any locale directory at all: 105 localized URLs were discoverable
// only through the sitemap and hreflang, which are hints rather than links.
// Guard the anchors, not the switcher — hreflang alternates are checked above.
{
  const home = existsSync(join(DIST, "index.html")) ? read("index.html") : "";
  const unreachable = LOCALES.filter((l) => !new RegExp(`href="/${l}/"`).test(home));
  if (home && unreachable.length === 0)
    ok(`homepage links to all ${LOCALES.length} localized homepages with real anchors`);
  else fail(`homepage has no crawlable <a> into: ${unreachable.join(", ") || "(index.html missing)"}`);

  // On a route that ships locale variants the row must mirror that exact set —
  // same source of truth as the hreflang cluster, so it can never link a 404.
  const glossary = existsSync(join(DIST, "glossary/index.html"))
    ? read("glossary/index.html")
    : "";
  const wrong = ["zh", "ar", "hi"].filter((l) =>
    new RegExp(`href="/${l}/glossary/"`).test(glossary)
  );
  if (glossary && wrong.length === 0)
    ok("glossary language row links no unshipped locale");
  else fail(`glossary language row links unshipped locales: ${wrong.join(", ")}`);
}

// --- 4d. HTML hreflang and sitemap hreflang must annotate the same cluster --
// They are emitted by two independent code paths: SEO.astro reads
// localeConfig.htmlLang (bare codes), @astrojs/sitemap reads the i18n.locales
// map in astro.config.mjs. Those drifted — the HTML said hreflang="es" while
// the sitemap said "es-ES" for the same URL pair, so the two annotations
// described the same cluster with different values. Assert they agree.
if (existsSync(join(DIST, "sitemap-0.xml"))) {
  const sm = read("sitemap-0.xml");
  const smLangs = new Set([...sm.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]));
  const htmlLangs = new Set(hreflangsOf(read(SAMPLE)));
  const onlyInSitemap = [...smLangs].filter((l) => !htmlLangs.has(l));
  const onlyInHtml = [...htmlLangs].filter((l) => !smLangs.has(l));
  if (onlyInSitemap.length === 0 && onlyInHtml.length === 0)
    ok(`hreflang codes agree between HTML and sitemap (${[...htmlLangs].sort().join(",")})`);
  else
    fail(
      `hreflang code mismatch — sitemap-only [${onlyInSitemap}], HTML-only [${onlyInHtml}]. ` +
        `Keep astro.config.mjs i18n.locales in lockstep with localeConfig.htmlLang.`
    );
}

// --- 4e. Guide prev/next must be real anchors in the static HTML -----------
// GuideNavigation used to derive the current slug from window.location inside
// a useEffect, so all 112 guide pages served a pulsing skeleton and the
// sequential path through the content — the site's core structure — carried no
// anchor text at all. It is now a pure component rendered with no client
// directive. Guard the output, not the implementation: any guide page that
// stops emitting a prev/next link has regressed.
{
  const guidePages = [
    "guides/keys-and-security/index.html", // mid-level: has both prev and next
    "pl/guides/keys-and-security/index.html",
    "ar/guides/keys-and-security/index.html",
  ];
  for (const path of guidePages) {
    if (!existsSync(join(DIST, path))) {
      fail(`${path} missing`);
      continue;
    }
    const html = read(path);
    // Match the labelled <nav> the component renders, not a Tailwind class
    // string. The old matcher pinned `class="group flex`, so a purely visual
    // change that dropped the hover-group failed this check while every anchor
    // was still there. Guard the output: anchors to other guides, inside the
    // guide navigation region, present in the static HTML.
    const navRegion = html.match(/<nav[^>]*aria-label="[^"]*"[^>]*>([\s\S]*?)<\/nav>/g) || [];
    const navLinks = navRegion
      .filter((region) => /href="[^"]*\/guides\/[a-z0-9-]+"/.test(region))
      .flatMap((region) => [...region.matchAll(/href="([^"]*\/guides\/[a-z0-9-]+)"/g)]);
    if (navLinks.length >= 2) ok(`${path} ships ${navLinks.length} prev/next anchors statically`);
    else fail(`${path} has ${navLinks.length} prev/next anchors — expected 2 (skeleton regression?)`);
  }
}

// --- 5. Sitemap exists and agrees with the un-prefixed scheme --------------
if (!existsSync(join(DIST, "sitemap-index.xml"))) fail("sitemap-index.xml missing");
else ok("sitemap-index.xml present");

if (existsSync(join(DIST, "sitemap-0.xml"))) {
  const sm = read("sitemap-0.xml");
  if (sm.includes(`${SITE}/en/`)) fail("sitemap contains /en/ URLs (old scheme)");
  else ok("sitemap has no /en/ URLs");
  if (sm.includes(`${SITE}/guides/what-is-nostr/`)) ok("sitemap lists un-prefixed English guides");
  else fail("sitemap is missing the un-prefixed English guide URLs");
} else {
  fail("sitemap-0.xml missing");
}

// --- 6. Manifest must be valid JSON (it is linked from every page) ---------
try {
  JSON.parse(readFileSync("public/site.webmanifest", "utf8"));
  ok("site.webmanifest is valid JSON");
} catch {
  fail("site.webmanifest is not valid JSON");
}

console.log(failures === 0 ? "\nAll SEO invariants hold." : `\n${failures} SEO invariant(s) violated.`);
process.exit(failures === 0 ? 0 : 1);
