# Security Remediation & Vercel Readiness Report

## Overview
This document details the security vulnerability remediations and build optimization fixes applied to ensure the repository is fully production- and Vercel-ready with zero build warnings, zero ESLint errors, and full compliance against all reported GitHub Dependabot alerts.

---

## 1. Security Vulnerability Remediations

All 20 Dependabot security alerts and secondary transitive CVEs have been remediated.

| Alert # | Package | Severity | Advisory / CVE | Root Cause & Transitive Path | Remediation Applied |
|---|---|---|---|---|---|
| **#21** | `next` | **Critical** | GHSA-p293-qw3h-jr36 | Unauthenticated Remote Code Execution on Windows-hosted servers | Upgraded `next` to `15.5.27` |
| **#22** | `next` | **Critical** | GHSA-2xp9-vwfh-vxw4 | Unauthenticated Remote Code Execution in Image Optimization API with AVIF files | Upgraded `next` to `15.5.27` |
| **#24** | `sharp` | **High** | GHSA-g89c-p67h-r497, GHSA-2jg2-4ch7-h545 | Vulnerabilities in bundled `libheif` library | Added npm override: `sharp: ^0.35.5` |
| **#7** | `sharp` | **High** | GHSA-f88m-g3jw-g9cj (CVE-2026-33327, CVE-2026-33328, CVE-2026-35590, CVE-2026-35591) | Inherited vulnerabilities in `libvips` | Added npm override: `sharp: ^0.35.5` |
| **#1** | `xlsx` | **High** | GHSA-4r6h-8v6p-xvw6 | Prototype Pollution in SheetJS core (unmaintained on npm registry at `0.18.5`) | Replaced `xlsx` with `exceljs@^4.4.0` in `app/api/events/[slug]/registrations/export/route.ts` |
| **#2** | `xlsx` | **High** | GHSA-5pgg-2g8v-p4x9 | Regular Expression Denial of Service (ReDoS) in SheetJS formula parsing | Replaced `xlsx` with `exceljs@^4.4.0` |
| **#17** | `nanoid` | **High** | GHSA-2v37-7h3g-55p8 | Custom generators infinite loop when size is zero | Added npm override: `nanoid: ^3.3.19` |
| **#16** | `nanoid` | **High** | GHSA-28wg-ghj8-5hjv | Non-secure generators infinite loop with negative size | Added npm override: `nanoid: ^3.3.19` |
| **#18** | `browserslist` | **High** | GHSA-73wf-gq98-2v4g | Uncaught crash / prototype write via untrusted custom stats (`normalizeStats`) | Added npm override: `browserslist: ^4.29.3` |
| **#19** | `browserslist` | **High** | GHSA-c83g-rgw3-j3cx | Unbounded memory growth (no cache eviction) via distinct query results | Added npm override: `browserslist: ^4.29.3` |
| **#8** | `postcss` | **High** | GHSA-6g55-p6wh-862q | Arbitrary file read & information disclosure via attacker-controlled `sourceMappingURL` in CSS comments | Upgraded root and overrides to `postcss: ^8.5.28` |
| **#9** | `postcss` | **High** | GHSA-r28c-9q8g-f849 | Path Traversal in Previous Source Map Auto-Loading (`sourceMappingURL`) | Upgraded root and overrides to `postcss: ^8.5.28` |
| **#14** | `postcss` | **Moderate** | GHSA-fxqj-rqcc-2cmp | Incomplete fix of GHSA-6g55-p6wh-862q when `from` option is unset | Upgraded root and overrides to `postcss: ^8.5.28` |
| **#3** | `postcss` | **Moderate** | GHSA-qx2v-qp2m-jg93 | XSS via unescaped `</style>` tags in CSS stringify output | Upgraded root and overrides to `postcss: ^8.5.28` |
| **#6** | `js-yaml` | **High** | GHSA-52cp-r559-cp3m | YAML merge-key chains forcing quadratic CPU consumption | Added npm override: `js-yaml: ^4.3.2` |
| **#23** | `js-yaml` | **High** | GHSA-2883-xcg3-v3hh | `maxTotalMergeKeys` does not limit CPU use for empty merge sources | Added npm override: `js-yaml: ^4.3.2` |
| **#15** | `js-yaml` | **High** | GHSA-5p4m-2wfm-xmqj | Quadratic CPU consumption in `!!omap` resolution (CVE-2026-59870) | Added npm override: `js-yaml: ^4.3.2` |
| **#5** | `brace-expansion` | **High** | GHSA-3jxr-9vmj-r5cp | DoS via exponential-time expansion of consecutive non-expanding `{}` groups | Added npm override: `brace-expansion: ^1.1.21` & `5.0.12` |
| **#4** | `brace-expansion` | **High** | GHSA-3jxr-9vmj-r5cp | DoS via exponential-time expansion of consecutive non-expanding `{}` groups | Added npm override: `brace-expansion: ^1.1.21` & `5.0.12` |
| **#20** | `baseline-browser-mapping` | **Moderate** | GHSA-w5vr-8v7q-w6rv | Process termination on invalid input causes denial of service | Added npm override: `baseline-browser-mapping: ^2.11.27` |
| **Sec** | `uuid` | **Moderate** | GHSA-w5hq-g745-h8pq | Missing buffer bounds check in `uuid` v3/v5/v6 when `buf` is provided | Added npm override: `uuid: ^11.1.1` |

---

## 2. Migration from `xlsx` to `exceljs`

### Why:
The SheetJS npm package `xlsx` at version `0.18.5` has had known, unpatched prototype pollution and ReDoS vulnerabilities for years, as the vendor stopped publishing security updates to the npm registry. 

### Solution:
Migrated `app/api/events/[slug]/registrations/export/route.ts` to `exceljs@4.4.0`:
- 100% compliant with OpenXML spreadsheet standard (`.xlsx`).
- Strongly typed TypeScript support out of the box.
- Directly exports an asynchronous binary buffer streamed via standard Next.js `NextResponse`.
- Completely removes the vulnerable `xlsx` package from `package.json` and `package-lock.json`.

---

## 3. Vercel Build & Lint Readiness

### A. Next.js Output File Tracing Root
- **Issue**: Next.js logged `Warning: Next.js inferred your workspace root, but it may not be correct` when parent directories contained lockfiles.
- **Fix**: Configured `outputFileTracingRoot: path.join(__dirname)` in `next.config.mjs`.

### B. ESLint & Dead Code Cleanups
- `components/layout/footer.tsx`: Resolved unescaped quotes by using HTML entities `&ldquo;` and `&rdquo;`.
- `app/dashboard/page.tsx`: Removed unused `UserIcon` and `ExternalLink` imports.
- `app/events/page.tsx`: Cleaned unused temporal flag parameter `_isPast` in event mappings.
- `app/page.tsx`: Removed unused `Image` and `communityJourney` imports.
- `components/events/EventDetailClient.tsx`: Removed unused `Users` and `SectionWrapper` imports.
- `components/site/ui.tsx`: Removed unused `fadeIn` animation variant, handled `title` in `Hero`, and rendered the `eyebrow` badge in `FeatureCard`.

### C. Image Optimization (`@next/next/no-img-element`)
- `components/site/collaborations-field.tsx`: Replaced native `<img>` elements with Next.js `<Image />` component with responsive sizing and layout containment.
- `components/site/CommunityJourney.tsx`: Replaced native `<img>` elements with Next.js `<Image />` component with explicit width and height dimensions.

---

## 4. Verification

Production build was run via `npm run build`:
- **Result**: Exit code 0 (Success)
- **Pages generated**: 31/31 static and dynamic routes compiled without errors
- **Lint status**: 0 errors, 0 warnings
- **Security audit**: All 20 requested security alerts remediated
