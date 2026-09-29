import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { locales } from '../src/config/locales';

// vercel.json reached production unvalidated and failed the deploy: two header
// entries carried a "//" key used as a comment, and Vercel's schema rejects
// additional properties outright ("headers[1] should NOT have additional
// property //"). The build failed AFTER the merge landed, so main was green
// locally and the site was still serving the previous deploy.
//
// JSON has no comments. The rationale that used to live in those "//" keys is
// recorded here instead, next to the assertion that keeps the file loadable.
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));

/** Keys Vercel accepts on a headers[] entry. Anything else fails the deploy. */
const HEADER_KEYS = new Set(['source', 'headers', 'has', 'missing']);
/** Keys Vercel accepts on a redirects[] entry. */
const REDIRECT_KEYS = new Set([
  'source',
  'destination',
  'permanent',
  'statusCode',
  'has',
  'missing',
]);

describe('vercel.json', () => {
  it('is valid JSON with the sections the site depends on', () => {
    expect(Array.isArray(config.headers)).toBe(true);
    expect(Array.isArray(config.redirects)).toBe(true);
  });

  it('has no unknown keys on headers entries', () => {
    const offenders = config.headers.flatMap((entry: object, index: number) =>
      Object.keys(entry)
        .filter((key) => !HEADER_KEYS.has(key))
        .map((key) => `headers[${index}].${key}`)
    );
    expect(
      offenders,
      'Vercel rejects additional properties and fails the whole deploy. ' +
        'JSON has no comments — put the reasoning in the commit message or in this test.'
    ).toEqual([]);
  });

  it('has no unknown keys on redirect entries', () => {
    const offenders = config.redirects.flatMap((entry: object, index: number) =>
      Object.keys(entry)
        .filter((key) => !REDIRECT_KEYS.has(key))
        .map((key) => `redirects[${index}].${key}`)
    );
    expect(offenders).toEqual([]);
  });

  it('every header entry declares at least one key/value pair', () => {
    for (const entry of config.headers) {
      expect(Array.isArray(entry.headers)).toBe(true);
      expect(entry.headers.length).toBeGreaterThan(0);
      for (const header of entry.headers) {
        expect(Object.keys(header).sort()).toEqual(['key', 'value']);
      }
    }
  });

  // --- the two rules whose rationale the "//" keys used to carry -------------

  it('serves versioned brand assets with a long immutable cache', () => {
    // A new brand path prevents old immutable image URLs from keeping stale
    // logo and share-card artwork after a redesign.
    const rule = config.headers.find((entry: { source: string }) =>
      entry.source.includes('/brand/illustrated/')
    );
    expect(rule, 'the immutable-cache rule for brand assets is gone').toBeDefined();
    const cacheControl = rule.headers.find(
      (header: { key: string }) => header.key === 'Cache-Control'
    );
    expect(cacheControl.value).toContain('immutable');
  });

  it('keeps *.vercel.app preview hostnames out of the index', () => {
    // Every alias serves the complete site with a canonical pointing at the
    // apex, but canonical is a hint, and Google discounts it from a host whose
    // content visibly differs — nostr-beginner-guide.vercel.app was serving
    // /simulators/ at 200 while the apex 308s it to sandstr.app. Removing the
    // aliases in the Vercel dashboard is the real fix; this is the half that
    // lives in the repo.
    const rule = config.headers.find((entry: { has?: { type: string; value: string }[] }) =>
      entry.has?.some((condition) => condition.type === 'host' && condition.value.includes('vercel'))
    );
    expect(rule, 'the *.vercel.app noindex rule is gone').toBeDefined();
    expect(rule.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex' });
  });

  // --- host and locale-landing redirects -------------------------------------

  it('sends www to the apex, and does so before any other redirect', () => {
    // www answered 200 for every path instead of redirecting, so the whole site
    // existed on two hosts. Both emit a canonical pointing at the apex, but
    // canonical is a hint; a 308 is not.
    //
    // Order matters and is the reason this asserts index 0. Vercel stops at the
    // first matching redirect, and a relative destination keeps the request on
    // the host it arrived on — so if /en/guides matched first, a www reader
    // would be sent to www.nostrich.love/guides and only then bounced here.
    const rule = config.redirects[0];
    expect(rule.has).toContainEqual({ type: 'host', value: '^www\\.nostrich\\.love$' });
    expect(rule.destination).toBe('https://nostrich.love/:path*');
    expect(rule.permanent).toBe(true);

    // The host value is a regex, so the anchors and the escaped dots are load
    // bearing: a bare "www.nostrich.love" would also match a host that merely
    // contains it, e.g. www-nostrich.love.example.com.
    const host = new RegExp(rule.has[0].value);
    expect(host.test('www.nostrich.love')).toBe(true);
    expect(host.test('nostrich.love')).toBe(false);
    expect(host.test('evil-www.nostrich.love.example.com')).toBe(false);
  });

  it('does not redirect localized homepages away from their content', () => {
    const rootPaths = locales.filter((locale) => locale !== 'en')
      .flatMap((locale) => [`/${locale}`, `/${locale}/`]);
    for (const path of rootPaths) {
      expect(config.redirects.some((entry: { source: string }) => entry.source === path)).toBe(false);
    }
    expect(config.redirects.some((entry: { destination: string }) => entry.destination === '/:lang/guides/')).toBe(false);
  });
});
