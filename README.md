# Ajay Tour and Travels: MERN website

React + Vite (pre-rendered) · Express · MongoDB Atlas · JWT cookie admin · Vercel + Render

```
client/   React app (public site + /admin), Vite, Tailwind, pre-render script, vercel.json
server/   Express API, Mongoose models, admin API, seed + bootstrap scripts, Jest tests
render.yaml   Render blueprint for the API
```

> **Status honesty.** Everything here was written and statically checked (syntax of every file, import/export
> resolution). `npm install`, the production build and the test suites **have not been run** by the author because
> the authoring environment had no network access. Run steps 1-3 below first; if anything fails, fix before deploying.

## 1. Run locally

Prerequisites: Node 20+, local MongoDB (or MongoDB Atlas).

### Quick start from the root directory:
```bash
# Run both Backend API and Frontend Website concurrently:
npm run dev

# Or run them separately:
npm run dev:server      # http://localhost:5000/api/health
npm run dev:client      # http://localhost:5173  (Admin at /admin)
```

### Admin Credentials (configured in `server/.env`):
- **Admin ID / Username:** `admin`
- **Admin Email:** `admin@ajaytourtravels.com`
- **Password:** `Admin@AjayTour2026!`
*(You can sign in with either `admin` or `admin@ajaytourtravels.com`)*
The admin account and starter content are auto-bootstrapped on server startup!

### Helper scripts (from root):
```bash
npm run seed              # Seed starter destinations, routes, vehicles, FAQs
npm run bootstrap-admin   # Reset/bootstrap admin user
npm test                  # Run both server and client test suites
npm run build             # Build production bundle
```

## 2. First-time content setup (do this before going live)

1. Sign in at `/admin`. The dashboard warns while sample content is still published.
2. **Settings → Business:** enter the real phone, WhatsApp, email, address, hours, service areas, Google Business Profile URL.
   Tick **Contact details verified**. Until then phone/email/address/map are hidden from visitors and from structured data.
3. **Destinations / Vehicles / Packages / FAQs / Blog:** replace the seeded starter copy with verified information, add real photos
   (upload converts to responsive WebP), then untick **Sample content**. Distances, durations and fares are never shown unless
   you enter them and tick **Details verified** (routes) or choose a price mode other than "quote".
4. **SEO and redirects:** set titles and descriptions for the main pages and review the completeness check.
5. Add only genuine **Reviews** (Settings → Reviews); none are shown by default.
6. Review **Privacy Policy** and **Terms** (client/src/pages/Legal.jsx) with a qualified adviser. They are generic templates.

## 3. Deploy

### MongoDB Atlas
1. Create a cluster → Database Access: a user with read/write on `ajay-tour-travels`.
2. Network Access: allow Render's outbound IPs (or `0.0.0.0/0` on the free tier, protected by the strong DB password).
3. Copy the `mongodb+srv://…` string into `MONGODB_URI`.
4. **Backups:** M10+ clusters have continuous cloud backup. On the free tier run `mongodump --uri "$MONGODB_URI" --gzip --archive=backup.gz`
   on a schedule (weekly or more) and store it off-site. **Recovery:** create a new cluster and `mongorestore --uri "<new>" --gzip --archive=backup.gz`,
   update `MONGODB_URI` on Render, redeploy, check `/api/health`.

### Render (API)
Dashboard → New → Blueprint (uses `render.yaml`), or create a Web Service with root dir `server`, build `npm ci`, start `npm start`,
health check `/api/health`. Set env vars (see `server/.env.example`). Production validation **refuses to start** if `CLIENT_ORIGINS`
is not an explicit list of https URLs or `JWT_SECRET` is short. After first deploy open the Render shell and run
`npm run bootstrap-admin` (with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set temporarily) and optionally `npm run seed`.

### Vercel (website)
Import the repo, **Root Directory = `client`**. Env vars:

| Variable | Value |
|---|---|
| `VITE_API_URL` | your Render URL or `https://api.yourdomain.com` |
| `VITE_SITE_URL` | the public site URL, e.g. `https://www.yourdomain.com` (used for canonicals, sitemap, JSON-LD) |

`npm run build` builds the client, builds the SSR bundle, then **pre-renders every public page** from the live API into static HTML
(unique title/description/canonical/Open Graph/JSON-LD + body content), and writes `sitemap.xml`, `robots.txt` and a real-404 `404.html`.
**The API must be reachable at build time**; otherwise the build fails on purpose instead of publishing empty pages.

**Keeping pre-rendered pages fresh:** content you publish in the admin appears immediately in the SPA, but the static HTML for *new* URLs
(a new destination or article) is generated at build time. Create a Vercel **Deploy Hook** (Project → Settings → Git → Deploy Hooks) and set
it as `VERCEL_DEPLOY_HOOK_URL` on Render; the API then triggers a debounced rebuild (60 s) after content changes.

### Cookies across domains (important)
The admin session is an HTTP-only JWT cookie with a per-session CSRF token header.

* **Recommended:** serve the site at `www.yourdomain.com` and the API at `api.yourdomain.com` (Render custom domain). Set
  `COOKIE_DOMAIN=.yourdomain.com`, `COOKIE_SAMESITE=lax`, `CLIENT_ORIGINS=https://www.yourdomain.com`. Same-site cookies, no third-party cookie issues.
* **Fallback (vercel.app + onrender.com):** `COOKIE_SAMESITE=none` (forces `Secure`). Safari and some browsers block third-party cookies, so admin login
  may fail there. Use a custom domain for reliable admin access.
* Never use `*` for CORS with cookies; the server rejects unknown origins.

### Redirects
Admin-managed redirects work in the SPA (visitors are sent on from the 404 view). For true HTTP 301/302 at the edge, copy the generated
block from **Admin → SEO and redirects** into `client/vercel.json` (`"redirects"`) and redeploy.

## 4. Smoke test (after every deploy)

- [ ] `GET <api>/api/health` → 200 `{"status":"ok","db":"connected"}`
- [ ] `<site>/` loads; view-source shows page-specific `<title>`, canonical, JSON-LD and visible content (pre-rendered)
- [ ] Each of `/destinations/amb-andaura`, `/una`, `/ludhiana`, `/chandigarh`, `/una-to-ludhiana`, `/una-to-chandigarh`, `/amb-andaura-to-chandigarh` renders unique H1/title
- [ ] `<site>/does-not-exist` shows the custom 404 **with HTTP 404** (`curl -I`)
- [ ] `<site>/sitemap.xml` lists only published pages; `<site>/robots.txt` disallows `/admin`
- [ ] Submit a test inquiry at `/book` → reference shown; appears in Admin → Inquiries; resubmitting the same data returns the same reference
- [ ] Contact form submits and appears in the inbox
- [ ] Admin login/logout works; `GET <api>/api/admin/dashboard` without cookie → 401
- [ ] Edit a destination in admin → change visible on the site; unpublish → page 404s on the API
- [ ] From a non-allowlisted origin, a browser request to the API with credentials is blocked (CORS)
- [ ] 320 px, 375 px, 425 px, 768 px, 1024 px, 1440 px: no horizontal scroll; mobile menu opens/closes with keyboard (Esc), focus visible
- [ ] OS "reduce motion" on: animations stop, content still visible

## 5. SEO verification checklist

- [ ] Search Console: add property, verify (paste the code in Admin → Settings → Analytics, or DNS), submit `sitemap.xml`
- [ ] URL Inspection on `/`, one destination page, one blog post: "URL is available to Google", rendered HTML shows content
- [ ] Rich Results Test / Schema Markup Validator on `/` (TravelAgency) and a destination (Service + BreadcrumbList) and a blog post (Article)
- [ ] Mobile-friendly check and Lighthouse (Performance, Accessibility, SEO, Best Practices) on mobile profile
- [ ] Core Web Vitals (PageSpeed Insights / CrUX once there is traffic): LCP, INP, CLS
- [ ] Crawl for broken links and redirect chains (e.g. Screaming Frog free tier); duplicates: Admin → SEO completeness check
- [ ] Google Business Profile: create/claim the real listing, paste its URL in Settings, keep name/phone/address identical everywhere (NAP)
- [ ] Do not create fake addresses or duplicate "doorway" pages; each destination page must carry unique, verified information

Notes on structured data: `FAQPage` markup is intentionally **not** emitted, because Google limits FAQ rich results to authoritative government and
health sites; FAQs are still visible, indexable page content. Reviews/ratings markup is never emitted.

## 6. Security summary

Helmet · strict CORS allowlist (credentials) · bcrypt (cost 12) · HTTP-only, Secure, SameSite JWT cookie with server-side `tokenVersion`
revocation (logout and password change kill old tokens) · per-session CSRF token + Origin check on all admin writes · login lockout + rate limits ·
Zod validation + HTML sanitization on every write · NoSQL operator stripping + `sanitizeFilter` · 20 kB body limit · no stack traces in production ·
no public admin registration · raw IPs never stored · CSV export neutralizes spreadsheet formulas · env validation at boot.

## 7. Tests

`server`: `npm test` (Jest + Supertest + in-memory MongoDB): auth, lockout, CSRF, logout revocation, CRUD/slug rules, publish/unpublish visibility,
inquiry validation/dedupe/honeypot/sanitization, NoSQL payloads, CSV safety, anonymization, settings visibility, redirect chains, sitemap, CORS.
`client`: `npm test` (Vitest): WhatsApp encoding, price formatting, booking validation, JSON-LD rules, mobile navigation accessibility.

## 8. Known limitations

- Hero and card imagery uses generated gradient/mountain art until you upload real photos (no stock photos are bundled).
- Uploaded images are served as WebP (480/960/1600 px); AVIF is not generated.
- Static HTML for brand-new URLs needs a rebuild (deploy hook above); until then the SPA still serves them, but crawlers may see a 404 first.
- Manual "add inquiry by phone" exists in the API (`POST /api/admin/inquiries`) but has no admin screen yet.
