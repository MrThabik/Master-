# THASEEN OS: master website

Hub of your websites + photo/art gallery + bilingual blog, all edited from /developer.

## Setup
1. Supabase: create a project. SQL Editor: edit `master@example.com` in `schema.sql` to your email, then run it.
2. Supabase > Storage: create two PUBLIC buckets: `screenshots` and `gallery`.
3. Supabase > Authentication > Users: add your Master user (email + password).
4. Generate admin secrets: `node scripts/make-admin-secrets.mjs <username> "<password>" <pin>` and put the 4 printed lines in your env. In Supabase > Authentication > Users set the Master user's password to the printed ADMIN_SUPABASE_PASSWORD, and in Authentication > Providers turn OFF new sign-ups.
5. Copy `.env.example` to `.env.local` and fill in the four values (MASTER_EMAIL = your Master email).
6. `npm install` then `npm run dev` and open http://localhost:3000
7. Open /developer, sign in, and add your sites; use /developer/gallery and /developer/blog.

## Deploy (Vercel)
Push to GitHub, import the repo in Vercel, add the same four environment variables, deploy.
Then add your own domain in Vercel > Settings > Domains.

## Pages
/ hub (3D ring + cards) | /gallery | /moodboard | /blog | /developer, /developer/gallery, /developer/blog, /developer/moodboard (Master only)

## Extras
- Intro (Bismillah, then THASEEN OS) plays once per session; tap to skip.
- Floating dock + Dark/Light switch (saved in the browser).
- Visit counters count taps on each card's Visit button.
- 3D ring uses `three`; cards show the screenshot you set in Developer Space.

## Admin protection
- Developer Space needs username + password + PIN, all checked on the server (scrypt hashes, constant-time compare).
- 5 wrong attempts from one address locks login for 15 minutes (30 total across all addresses).
- The real Supabase password is a random secret only the server knows; it is never typed or shown.
- Database rules (RLS) still allow writes only for the Master email, as a second layer.
- Sessions end when the tab closes or after 15 idle minutes. /developer is hidden from search engines and not linked publicly.

## Sitemap
`/sitemap.xml` and `/robots.txt` are generated automatically (blog posts are added when published; /developer and /api are excluded). Set `NEXT_PUBLIC_SITE_URL` to your real domain, then submit `https://yourdomain.com/sitemap.xml` in Google Search Console.

## Getting found on Google ("Thaseen Shabik")
Built in: name-rich titles/descriptions, Person + WebSite structured data, share image, canonical links, sitemap, robots.txt.
You must do:
1. Use your own domain and set NEXT_PUBLIC_SITE_URL.
2. Google Search Console > add your domain > verify (HTML tag: put the content value in NEXT_PUBLIC_GOOGLE_VERIFICATION) > Sitemaps > submit /sitemap.xml > URL Inspection > Request indexing for the home page.
3. Link your three portfolio sites to this hub and the hub to them; add the hub link to LinkedIn, GitHub and other profiles (list those in NEXT_PUBLIC_SAME_AS).
Google decides rankings and search suggestions; nobody can force them. New sites usually take days to weeks to appear.

## Design & Layout (Developer Space > Design & Layout)
Colours (with ready-made sets), heading and text fonts, card style and roundness, home page section order, 3D cards on/off and height,
cards per row, navigation dock (position, links, dark/light button), opening intro (text, length, colour), gallery timing and watermark,
and optional custom CSS. Everything is saved in the `settings` table; no new upload is needed for these changes.
Developer Space adapts to phone, tablet and laptop (side menu on laptops, Menu button on phones, sticky Save bar).

## Round 1: contact, language switch, subscribe
- /contact: contact form (stored in Supabase, read in Developer Space > Messages) and a WhatsApp button. Set your number in Site Settings > Contact and WhatsApp.
- Tamil / English button in the dock. Tamil texts are edited in Site Settings > Tamil versions; fixed labels live in lib/i18n.ts.
- Subscribe box on the blog pages; people are listed in Developer Space > Subscribers (copy all emails or download CSV). Sending emails automatically needs an email service and is not included.
- Protection: hidden trap field, speed check, and limits per address (5 per hour) and overall, all on the server.
- Run the "Update 4" part of schema.sql once in Supabase. Add `Contact|/contact` to your dock links in Design & Layout.
