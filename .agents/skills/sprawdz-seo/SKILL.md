---
name: sprawdz-seo
description: Gdy dotykamy SEO, hreflang, sitemapy, canonicali albo meta tagów w nostrich.love — i przed każdym większym deployem. Uruchamiaj przy "sprawdź SEO", "hreflang", "sitemapa", "Google nie indeksuje", "canonical", "meta tagi", "pozycje w wyszukiwarce".
---

# SEO / SEO międzynarodowe

```bash
npm run build && npm run verify-seo
```

Skrypt przelatuje wszystkie strony i 7 języków. Sprawdza: sitemapę z adnotacjami hreflang, `html lang` per język, `og:locale`, obecność wszystkich locale, fallback `x-default`.

## Zasady, które łatwo złamać

- **Hreflang musi być w DWÓCH miejscach.** W `<head>` (odkrywanie przy crawlu) i w sitemapie (konsolidacja sygnałów dla Google). Nigdy tylko jedno.
- **Sitemapa jest generowana automatycznie** przez `@astrojs/sitemap` z blokiem `i18n` — żadnych ręcznych `xhtml:link`. Statyczny `public/sitemap.xml` był kiedyś źródłem pomyłek (24 URL-e, zero hreflang, brakujące języki, obok autogenerowanego). Został skasowany. Nie wracać.
- **Nowy język = dopisz go do `scripts/verify-seo.js`.** Inaczej skrypt świeci na zielono, nie sprawdzając nowego locale.
- **Angielski jest bez prefiksu.** Canonical i hreflang dla angielskiego to `/guides/x`, nie `/en/guides/x`. Linkowanie przez redirect marnuje budżet crawlu.

## Stan, którego nie widać w repo

- **Google Search Console jest już zweryfikowane przez DNS.** Grep po repo tego nie znajdzie — nie ma pliku weryfikacyjnego ani meta taga. Nie proponuj ponownej weryfikacji.
- Stronę serwują cztery hosty.
- **Raport GSC trzeba rozbić na adresy.** Eksport strony zbiorczej zawiera tylko liczby. Otwórz daną przyczynę i sprawdź tabelę `Examples`, daty ostatniego skanowania oraz odpowiedź produkcyjną. W 2026 roku wcześniejsze błędne hreflang ogłaszały nieistniejące wersje językowe, także ścieżki z dwoma prefiksami locale. Te adresy mogą nadal występować jako 404, choć nie ma ich w obecnej sitemapie ani linkach. Nie dodawaj masowych przekierowań tylko po to, by zmniejszyć licznik 404. Dla strony przeniesionej do konkretnego odpowiednika dodaj przekierowanie obejmujące oba warianty końcowego ukośnika.
- **„Crawled - currently not indexed” wymaga osobnej diagnozy.** Oddziel aktualne adresy kanoniczne z sitemapy od dawnych tras, zasobów i wariantów bez końcowego ukośnika. Poprawny build, sitemapa i canonical nie dowodzą, że Google zaindeksuje stronę. Nie przypisuj braku indeksacji wyłącznie słabym linkom zewnętrznym bez danych dla konkretnych URL-i.
- **„Discovered - currently not indexed” sprawdzaj w grafie linków.** Porównaj adresy z produkcyjną sitemapą, odpowiedzią HTTP, `robots`, canonical i zwykłymi linkami `<a>` ze strony głównej. Data `1970-01-01` w eksporcie CSV to brak daty skanowania, a nie rzeczywista data. Gdy te kontrole przechodzą, sprawdź w Search Console ostatni odczyt sitemapy, Crawl stats i Test live URL zamiast zgadywać zmianę w kodzie.
- **Końcowy ukośnik wymaga spójnej zmiany.** Vercel obecnie zwraca 200 dla obu wariantów ścieżki, a sitemapa i canonical używają ukośnika. Wiele linków wewnętrznych go pomija. Przed ustawieniem `trailingSlash: true` popraw linki emitowane przez stronę, inaczej każda taka nawigacja dostanie przekierowanie.

## Referencje

**`docs/SEO_LESSONS_LEARNED.md`** — główne źródło.
**`docs/DEPLOYMENT_CHECKLIST.md` jest nieaktualny** i sam to o sobie pisze w nagłówku. Nie cytuj go.
Bieżący audyt: pamięć `nostrich-seo-audit-2026-08`.
