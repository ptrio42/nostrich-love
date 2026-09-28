---
name: nowy-poradnik
description: Gdy piszemy nowy poradnik (MDX) albo przepisujemy istniejący. Uruchamiaj przy "napisz poradnik o…", "nowy guide", "brakuje nam tekstu o…", "dodaj do ścieżki nauki", "new guide". Do samego tłumaczenia gotowego poradnika użyj uzupelnij-tlumaczenia.
---

# Nowy poradnik

## Zanim napiszesz zdanie

1. **Sprawdź, czy to naprawdę dziura.** `docs/internal/CONTENT_AUDIT_AND_KNOWLEDGE_MAP.md` — mapa tego, co już pokryte. Powtórka jest gorsza niż brak: rozmywa i konkuruje sama ze sobą w wyszukiwarce.
2. **Test odbiorcy.** Piszemy dla osób początkujących na Nostr, niezależnie od tego, czy chcą czytać, rozmawiać, publikować, wspierać innych czy poznawać technologię. Wyjaśnij nowe pojęcia przed użyciem. Poradnik wprowadzający ma działać bez znajomości kryptografii i terminala.
3. **Wczytaj w tej kolejności:** `docs/internal/TEACHING_METHODS.md` → `I18N_PATTERNS.md` → `CONTENT_TRANSLATION.md`.

## Pisanie

- Praktyka przed teorią. Symulator w przeglądarce bije trzy akapity wyjaśnień.
- Slug **identyczny we wszystkich 7 katalogach**. `tests/content-integrity.test.ts` wywala build, jeśli się rozjadą.
- **Linki wewnątrz MDX prowadzą do własnego locale.** Polski poradnik → `/pl/guides/x`. Angielski → `/guides/x` (bez prefiksu). Test wywala build przy linku do `/en/`.
- Komponenty interaktywne: `client:idle`, nigdy `client:load`. Jeśli komponent nie potrzebuje JS — bez dyrektywy.
- Wpięcie w sekwencję: `src/data/learning-paths.ts`.

## Czego nie robić

- **Nie rób formatu „zadanie na dzień N".** Był proponowany i został odrzucony. Tematy dla deweloperów nie są domyślną ścieżką wprowadzającą; można je opisać jako opcjonalne rozwinięcie dla zainteresowanych początkujących.
- **Nie pisz o kampaniach zewnętrznych** (posty na nostr, nagrody w satach). To terytorium Piotra, obsługiwane poza repo.
- Nie tłumacz terminów protokołu: `npub`, `nsec`, `relay`, `NIP` zostają.

## Zamknięcie

```bash
npm run test && npm run build && npm run check:links
```

Build musi być **bez ostrzeżeń o brakujących kluczach**, nie tylko bez błędów. `check:links` na czerwono po dodaniu poradnika to prawie zawsze ręcznie sklejony URL zamiast `guidePath()`.
