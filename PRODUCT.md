# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: HR and recruiters** (confirmed by the owner). They screen candidates for remote Product Engineer and Full-stack roles. They usually arrive from LinkedIn, a job application, or a résumé link, often on a phone, and decide in under a minute whether to shortlist and forward. Their job: confirm the match (role, seniority, stack, location, time zone, engagement type, languages), find a credible outcome or two, and get the résumé or a contact.

**Secondary: hiring managers and engineering leads** on remote product teams. They open after a recruiter forwards the profile. They read the case studies to judge ownership, technical judgment, and how Danila works on a team. (Inferred from the case-study depth in the repository; the owner named recruiters as the main readers.)

## Product Purpose

A personal hiring site for Danila Igoshin, a product engineer based in Yerevan with six years of experience shipping B2B products. It turns a CV into a fast, credible screen: who Danila is, what has shipped, and how to get in touch.

Success means a recruiter can shortlist Danila from the first screen, and a forwarded hiring manager finds enough evidence in the case studies to move to an interview. The visit ends in an email, a LinkedIn message, or a résumé download.

## Positioning

Danila’s public role is Product Engineer. His profile line is “I build new products and improve the ones people already use.” The work spans interfaces, APIs, databases, and deployment. The portfolio illustrates that range with shipped projects.

- sole frontend engineer who took an EdTech product live in ≈5 months
- ≈10× faster builds on a live travel platform, done without pausing delivery, followed by a Tech Lead role mentoring three developers
- an AI-assisted scientific research workspace
- a B2B e-commerce product built solo, end to end

B2B appears in the context of past projects and engagement terms. Historical job titles describe the role Danila held on each team.

## Operating Context

- Target roles: Product Engineer and Full-stack Engineer on remote product teams with EU working-day overlap.
- Engagement: both full-time and long-term contract, through an EOR or B2B arrangement (confirmed: keep both as now).
- Recruiters forward the résumé PDFs into ATS systems and inboxes. Two editions exist: Product Engineer (`/cv/`) and Full-stack (`/cv/full-stack/`).
- Links get shared on LinkedIn and in messages, so the social preview images are part of the first impression.
- Hosted on Vercel at danilaigoshin.com.

## Capabilities and Constraints

- **Pages:** home (`/`), case index (`/case/`), four case studies (`/case/edtech/`, `/case/research/`, `/case/smartway/`, `/case/support/`), two résumé pages (`/cv/`, `/cv/full-stack/`), and `/404.html`.
- **Stack:** zero-build static HTML, CSS, and one `script.js`. No framework, bundler, or package manifest.
- **CSP** (`vercel.json`): `default-src 'self'`, `script-src 'self'`. No inline scripts (JSON-LD blocks are fine), no third-party scripts, fonts, analytics, or embeds. Fonts and images are self-hosted.
- `scripts/build-assets.sh` exports the résumé PDFs from `cv/` HTML and the social images from the artwork in `art/`. The six Product Engineer social masters and their ImageGen prompts are in `art/generated/product-engineer-2026-11-26/`. Update the sources before rebuilding the public exports.
- **Language:** English only.
- **Facts discipline:**
  - Every claim on the site must match the CV.
  - All past roles were full-time employment. Morizo Digital is a full-time client engagement. Never label past roles "Contract"; contracting describes what is offered now, not the employment history.
  - "≈5 months" for the EdTech product is the build duration. Never pair it with the Feb-Aug 2025 date range, which reads as longer.
  - The "6 years" figure, the time zone (UTC+4), and the availability status are hardcoded and need periodic re-checking.
- The shared identity is “Product Engineer”. The role-specific résumé remains available as “Full-stack Engineer”. Other public labels include “case study” and “Résumé”. The account names are `danilaigoshin` on GitHub and `developer-danila` on LinkedIn.

## Brand Commitments

- Name and mark: Danila Igoshin, "D/I". The owner selected `output/imagegen/logos-2026-11-04/refined-01-precision-d-i.png`: monochrome lettering with straight horizontal I terminals. Its production vector is `public/favicon.svg`, shared by website headers and browser icons. Derive the Apple touch icon with `scripts/build-assets.sh --icon-only`.
- All buttons and button-like controls use the same subtle 3px corner radius, including image and video close buttons, screenshot zoom controls, and résumé actions.
- The header starts full width without a bottom divider, then becomes a centered floating panel after scrolling past its original height: 8px panel corners, a thin border and soft shadow, and compact D/I mark and name. Keep the floating panel's shadow and the rule above the hero metrics. The navigation order is Work, Experience, About, Résumé, Email. Résumé is a text link; Email is an outlined mailto action. Preserve the header's layout footprint during this transition and the full-screen mobile navigation.
- “Product Engineer” sits above the two-line hero headline “From zero to production.” The final line has a short terracotta dash and an indent. The core technologies sit below the heading. Display type is capped at 86.4px with a 1.03 line height. On mobile, the identity, description, actions, and results follow the heading.
- The compact identity block aligns with the main heading. It pairs the portrait with “I’m Danila.” and “6 years in software · Former tech lead”. The portrait is 128px square on desktop and 80px on phones, with a shoulders-up crop, 6px corners, and a 24px gap to the text.
- The hero summary reads “I build new products and improve the ones people already use.” The supporting line reads “My work spans interfaces, APIs, databases, and deployment.” The summary starts 24px below the identity block and uses 18–20px type at a 1.5 line height, with 28px before the engagement details.
- Availability belongs in the hero description beside the engagement terms: "Open to full-time roles & long-term contracts", "Yerevan · UTC+4 · EU working-day overlap", and "Remote · EOR / B2B". Use plain typography without a separate status label or green online indicator above the hero.
- Product Engineer is the primary hero résumé download. Keep both explicitly named résumé downloads in the contact block and both CV routes, without a role selector in the hero.
- Both résumé editions share `cv/styles.css`: the same Inter, ink, muted gray, and terracotta palette as the portfolio, an open responsive web document, quiet result figures, and horizontal rules instead of boxed skills or vertical dividers. Use the canonical D/I SVG in the résumé mast. The dedicated print styles produce two A4 pages per edition; rebuild both downloads with `scripts/build-assets.sh --resumes-only`, including the legacy Product-edition alias.
- The hero proof strip contains three real results: ≈5 months from an empty frontend repo to a live learning product, ≈10× faster builds, and 70% faster rendering in threads with 1,000+ messages. Use 36px figures at weight 600, an 18px "months" unit, and a thin top rule without vertical dividers. Stack the results in one column on phones. Project summaries keep the result, role, one short ownership sentence, and stack; detailed responsibilities belong in the case studies. Morizo Digital has no numerical impact claim.
- The featured Smart Online Institute summary uses two columns on desktop: client, heading, "Marketplace, learning experience, and instructor workspace.", and case link on the left; ≈5 months, the frontend-repo-to-live-product caption, Solo Frontend Engineer, and the stack on the right. Group technologies into "Next.js · TypeScript" and "AWS S3 · Docker". Use no inner separators or Role label. Stack the columns on phones and keep the horizontal separator before the following project pair. The layout reference does not change the site's light palette.
- Voice: plain, first-person, and factual. It should read as precise rather than promotional, and be understandable to a non-engineer recruiter.
- No self-referential chrome: no internal design codenames, fake edition or version numbers, or invented labels a recruiter can't decode.
- The owner’s November 2026 reference supplies the light white-and-gray canvas, bold editorial type, thin rules, terracotta accents, and large project screenshots. The header identifies Danila as Product Engineer. The contact section names both résumé editions. Dates, roles, and technology labels use at least 12px type, with main body copy at 16–18px.

## Evidence on Hand

- **Case studies:** EdTech MVP (`case/edtech/`), AI research workspace (`case/research/`), Smartway platform (`case/smartway/`), real-time support (`case/support/`).
- **Measured outcomes:**
  - ≈10× faster builds (Webpack to Vite)
  - ≈3× faster measured shopping-cart interactions
  - 70% faster rendering for threads with 1,000+ messages
  - ≈5 months from an empty repository to a live MVP
  - three developers mentored
  - TypeScript migration completed within one year
  - validated uploads for 15+ file formats
- **Screenshots:** `public/online-institute.webp`, `public/ai4s.webp`, `public/smartway.webp`, `public/chat.webp`, plus responsive versions in `public/optimized/v1/`.
- **Portrait:** `public/my_photo_*`.
- **Résumé PDFs:** `Danila_Igoshin_Product_Engineer_CV.pdf` and `Danila_Igoshin_Full_Stack_Engineer_CV.pdf`.
- **Education:** Computer Science, Penza State University, 2016-2020.
- **Languages:** Russian (native), English (professional).
- **Proof policy (confirmed):** shipped work is the only proof. There are no testimonials, quotes, client logos, user counts, revenue, or team-size figures, and future work must not invent any. Germo-S has no case study or screenshot.

## Product Principles

1. **The first screen answers the screen.** Role, seniority, stack, location and time zone, engagement type, and availability must be readable at a glance, on a phone, without scrolling or decoding.
2. **Proof over adjectives.** Every claim is CV-bound and, where possible, measured. Shipped work carries the argument.
3. **Depth on demand.** A recruiter summary up front, with full case studies one click away for the hiring manager it gets forwarded to.
4. **One obvious next step.** Email, résumé, and LinkedIn are always close and low-friction: copyable email, downloadable PDF.
5. **Plain language wins.** If a recruiter can't decode a label, rewrite it.
