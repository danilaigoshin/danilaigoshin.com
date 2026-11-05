# Social image sources

The HTML files in this directory are export boards, not public landing pages.
The current social artwork was generated with the built-in imagegen tool to
match the November 2026 portfolio UI: warm white, ink, terracotta, the canonical
D/I mark, and large editorial typography.

Raster masters and the exact generation/refinement prompts live in
`generated/linkedin-2026-11-05/`. Keep selected masters in this directory when
updating the artwork, then update the board's image path. Rebuilding requires
no image API or generation call.

- `app-icon.html` renders `public/favicon.svg` into the 180x180 `public/apple-touch-icon.png`. Run `scripts/build-assets.sh --icon-only` to rebuild just the icon.
- `og-image.html` produces a lossless `public/og-image.png` at 2400x1260.
- `og-cv.html` produces a lossless `public/og-cv.png` at 2400x1260.
- `og-smartway.html` produces a lossless `public/og-smartway.png` at 2400x1260.
- `linkedin-banner.html` produces a lossless `public/linkedin-banner.png` at 3168x792.
- `public/x-banner.png` and `public/x-banner-dark.png` are standalone, content-neutral X profile headers at 1500x500.

The social previews are exported at 2400x1260 and kept as PNG files. The LinkedIn
master is 2172x724; its board crops empty background to 4:1 using
`object-position: 50% 24%`, then exports at 3168x792. This keeps the logo, role
and complete headline visible while leaving the lower-left quarter clear for
the profile avatar. Do not stretch the banner to change its aspect ratio.

Preview changes at both the full size and a small featured-link thumbnail size.
The résumé graphic shows two sheets, and the 70% rendering result always keeps
its qualifier: threads with 1,000+ messages.

Run `scripts/build-assets.sh` from the repository root to rebuild these images and both resume PDFs. Use `scripts/build-assets.sh --resumes-only` to rebuild only the Product Engineer and Full-stack editions, or `--social-only` to rebuild only the social images.
