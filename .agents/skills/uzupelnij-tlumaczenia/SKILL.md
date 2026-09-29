---
name: uzupelnij-tlumaczenia
description: Gdy jakiś język ma dziury w kluczach lub poradnikach albo gdy tłumaczenia strony istnieją, ale czytelnik nadal trafia na angielski wariant. Uruchamiaj przy "brakuje tłumaczeń", "przetłumacz landing page", "przetłumacz na hindi", "build krzyczy o kluczach", "sprawdź parity", "czy wszystkie języki mają X".
---

# Uzupełnianie tłumaczeń

## Najpierw zmierz, potem tłumacz

Nie zgaduj, czego brakuje. Dwie niezależne listy:

```bash
# Braki w kluczach
jq -S 'paths | join(".")' src/i18n/locales/en.json | sort > /tmp/en.txt
jq -S 'paths | join(".")' src/i18n/locales/hi.json | sort > /tmp/hi.txt
diff /tmp/en.txt /tmp/hi.txt

# Braki w poradnikach
diff <(ls src/content/guides/en/) <(ls src/content/guides/hi/)
```

## Osobno przelatuj komponenty interaktywne

To powtarzalny tryb awarii. Zdarzył się dwa razy (Outbox Model Quiz, Zap Simulator istniały tylko po angielsku mimo obowiązkowego i18n). Quizy i symulatory mają własne przestrzenie kluczy i wypadają z ogólnych sprawdzeń:

```bash
for file in src/i18n/locales/*.json; do
  printf "%s " "${file##*/}"; grep -c "zapSimulator\.\|outboxQuiz\.\|nip05Checker\." "$file"
done
```

## Sprawdź, czy przetłumaczona strona naprawdę istnieje

Pełny zestaw kluczy JSON nie oznacza jeszcze dostępnej strony. Landing page miał teksty `homePage` we wszystkich językach, ale trasa `/` renderowała wyłącznie angielski, a przekierowania wysyłały `/{locale}/` do katalogu poradników.

Przy tłumaczeniu całej strony sprawdź także:

1. Czy `getStaticPaths()` generuje URL każdego języka z `src/config/locales.ts`, a `Layout` otrzymuje bieżące `locale`.
2. Czy treści pobierane osobno, na przykład poradniki z kolekcji, komponenty React i linki CTA, korzystają z tego samego języka.
3. Czy `localizedLocales()` w `src/i18n/paths.ts`, przełącznik języków i przekierowania w `vercel.json` prowadzą do faktycznie wygenerowanych stron.
4. Czy po buildzie pliki w `dist/` mają właściwe `html lang`, `dir`, canonical, wzajemne hreflang, widoczny tekst i lokalne linki. Dla strony głównej sprawdza to `npm run verify-seo`.

Zasady routingu strony głównej są w `docs/internal/I18N_PATTERNS.md`. Nie twórz osobnej listy języków w kodzie strony.

## Sprawdź układ przetłumaczonej strony

Pełne klucze i zielony build nie wykrywają źle łamiących się nagłówków. Otwórz każdą wersję językową w przeglądarce na telefonie, przy progu zmiany układu i na szerokim ekranie. Poczekaj na `document.fonts.ready`, potem sprawdź liczbę linii nagłówka, przyciski CTA i poziome przepełnienie.

Na stronie głównej `h1` ma mieścić się w jednym wierszu od `lg` (1024 px). Na telefonie może przechodzić do kolejnych wierszy. Jeśli tłumaczenia wymagają innej skali, użyj nazwanej klasy typograficznej i opisz ją w `docs/internal/VISUAL_SYSTEM.md`.

## Konwencje

Wczytaj `docs/internal/CONTENT_TRANSLATION.md`: ton per język, camelCase pod `guides`, czego nie tłumaczymy (`npub`, `nsec`, `relay`, `NIP` zostają w oryginale we wszystkich językach).

Placeholdery muszą przetrwać tłumaczenie: quizy `{{double}}`, reszta `{single}`. Sprawdź kod komponentu, jeśli nie masz pewności.

Arabski: przy okazji sprawdź, czy komponent używa `ms-*`/`pe-*`/`start-*`, a nie `ml-*`/`pr-*`/`left-*`.

## Zamknięcie

```bash
npm run typecheck && npm run test && npm run build && npm run check:links && npm run verify-seo
```

**Build musi być bez ostrzeżeń o kluczach, nie tylko bez błędów.** Brakujące tłumaczenie leci jako warning i przechodzi build.

Referencja stanu: `docs/internal/TRANSLATION_PARITY_2026-07.md`.
