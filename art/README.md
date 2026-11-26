# Social image sources

The HTML files in this directory are export boards, not public landing pages.
The current social artwork was generated with the built-in imagegen tool to
match the November 2026 portfolio UI: warm white, ink, terracotta, the canonical
D/I mark, and large editorial typography.

The six Product Engineer masters and their ImageGen prompts live in
`generated/product-engineer-2026-11-26/`.
The profile headline and About text for LinkedIn are in `linkedin-profile.txt`.
When updating artwork, point its board at the selected master. Rebuilding requires
no image API or generation call.

- `app-icon.html` renders `public/favicon.svg` into the 180x180 `public/apple-touch-icon.png`. Run `scripts/build-assets.sh --icon-only` to rebuild just the icon.
- `og-image.html` produces `public/og-image-v2.png` and its identical `public/og-image.png` alias at 2400x1260.
- `og-cv.html` produces `public/og-cv-v2.png` and its identical `public/og-cv.png` alias at 2400x1260.
- `og-smartway.html` combines the generated artwork with the original dashboard screenshot in `public/smartway.webp` and produces `public/og-smartway.png` at 2400x1260.
- `linkedin-banner.html` produces a lossless `public/linkedin-banner.png` at 3168x792.
- The build resizes the light and dark X masters proportionally to `public/x-banner.png` and `public/x-banner-dark.png` at 1500x500.

The LinkedIn board takes a centered 4:1 crop of the master. The brand mark,
role, headline, and domain fit inside that crop, and the lower-left quarter
stays clear for the profile avatar.

Preview changes at both the full size and a small featured-link thumbnail size.
The résumé graphic shows two sheets, and the 70% rendering result always keeps
its qualifier: threads with 1,000+ messages.

Run `scripts/build-assets.sh` from the repository root to rebuild these images and both resume PDFs. Use `scripts/build-assets.sh --resumes-only` to rebuild only the Product Engineer and Full-stack editions, or `--social-only` to rebuild only the social images.
