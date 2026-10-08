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

A product engineer with deep frontend expertise and real full-stack range, who owns work from an empty repository to production. The record is specific and measured:

- sole frontend engineer who took an EdTech product live in ≈5 months
- ≈10× faster builds on a live travel platform, done without pausing delivery, followed by a Tech Lead role mentoring three developers
- an AI-assisted scientific research workspace
- a B2B e-commerce product built solo, end to end

Other candidates can list the same stack. They can't truthfully claim this record.

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
- **Generated assets:** the résumé PDFs are built from `cv/` HTML, and the social images from `art/` HTML boards, both via `scripts/build-assets.sh`. Edit the sources, never the outputs.
- **Language:** English only.
- **Facts discipline:**
  - Every claim on the site must match the CV.
  - All past roles were full-time employment. Morizo Digital is a full-time client engagement. Never label past roles "Contract"; contracting describes what is offered now, not the employment history.
  - "≈5 months" for the EdTech product is the build duration. Never pair it with the Feb-Aug 2025 date range, which reads as longer.
  - The "6 years" figure, the time zone (UTC+4), and the availability status are hardcoded and need periodic re-checking.
- **Terminology:** "Product Engineer · Full-stack Engineer", "case study", "Résumé". Handles: GitHub `danilaigoshin`, LinkedIn `developer-danila`.

## Brand Commitments

- Name and mark: Danila Igoshin, "D/I".
- Voice: plain, first-person, and factual. It should read as precise rather than promotional, and be understandable to a non-engineer recruiter.
- No self-referential chrome: no internal design codenames, fake edition or version numbers, or invented labels a recruiter can't decode.
- Binding visual constraints from the owner (recorded, not expanded): white and gray tones in a semi-strict register; no dark page theme (a single dark closing contact block is accepted); hero display type stays moderate.

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
