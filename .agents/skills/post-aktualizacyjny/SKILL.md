---
name: post-aktualizacyjny
description: Pisz i oceniaj krótkie posty o aktualizacjach nostrich.love na konto projektu w Nostr. Użyj, gdy użytkownik prosi o "post z aktualizacją", "co nowego na nostrich.love", "release post", "update post" albo chce poprawić szkic takiego wpisu. Dotyczy wyboru istotnych zmian i formy tekstu, nie publikacji.
---

# Post o aktualizacji nostrich.love

## Wybór treści

1. Przeczytaj ostatnie posty aktualizacyjne konta nostrich.love, aby ustalić jego głos i punkt odniesienia. Publiczny npub konta jest w `src/config/site.ts`. Jeśli potrzeba odczytu z przekaźników, użyj `nostr-relay`.
2. Ustal, co faktycznie zmieniło się od poprzedniego wpisu. Sprawdź commity oraz aktualny kod i treść. Nie przedstawiaj starej funkcji jako nowości ani planu jako gotowego wdrożenia.
3. Wybierz najwyżej trzy zmiany, które początkujący czytelnik zauważy lub z których skorzysta. Pierwszeństwo mają nowe języki i treści, czytelniejsza droga przez poradniki oraz praktyczna pomoc w rozpoczęciu korzystania z Nostr. Pomiń drobne poprawki interfejsu, detale implementacji i kosmetykę, chyba że są głównym tematem aktualizacji. Nie dodawaj punktów, aby osiągnąć założoną liczbę.

## Forma

- Pisz po angielsku, prostym językiem konta projektu. Nie zakładaj, że odbiorca tworzy treści albo zna szczegóły protokołu.
- Jeśli pasuje do ogłoszenia aktualizacji strony, zacznij od `nostrich.love just got an update.`
- Pod otwarciem daj krótką listę z myślnikami ASCII (`-`). Jeden punkt opisuje jedną istotną zmianę i jej znaczenie dla czytelnika. Zwykle wystarczą dwa lub trzy punkty; jeden jest lepszy niż kilka słabych.
- Na końcu możesz dodać jedno naturalne zdanie o misji projektu: Nostr ma być łatwiejszy do zrozumienia i rozpoczęcia używania. Jeśli brzmi to jak slogan lub powtarza listę, pomiń je. Nie używaj rutynowo formułki `Free, no account, open source.`
- Zakończ linkiem `https://nostrich.love` lub bardziej trafną stroną docelową. Bez hashtagów i ozdobników, jeśli nie wynikają z konkretnego celu wpisu.
- Zachowaj zwięzłość poprzednich postów. Korzystaj z nich jako wzoru głosu, nie kopiuj ich treści poza świadomie wybranym otwarciem.

## Przed oddaniem szkicu

Sprawdź każdy punkt w źródle i usuń wszystko, co jest głównie wewnętrzną poprawką. Gdy wpis mówi o już dostępnej aktualizacji, zweryfikuj wersję publiczną przed publikacją. Samo przygotowanie szkicu nie upoważnia do publikacji zdarzenia Nostr; obowiązuje zgoda określona w `AGENTS.md`.
