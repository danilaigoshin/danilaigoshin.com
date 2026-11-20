# Social image sources

The HTML files in this directory are export boards, not public landing pages.
The current social artwork was generated with the built-in imagegen tool to
match the November 2026 portfolio UI: warm white, ink, terracotta, the canonical
D/I mark, and large editorial typography.

Raster masters and their generation prompts live in dated folders under
`generated/`. The LinkedIn banner, portfolio card, and résumé card use the masters in `generated/linkedin-2026-11-20/`.
When updating artwork, point its board at the selected master. Rebuilding requires
no image API or generation call.

- `app-icon.html` renders `public/favicon.svg` into the 180x180 `public/apple-touch-icon.png`. Run `scripts/build-assets.sh --icon-only` to rebuild just the icon.
- `og-image.html` produces a lossless `public/og-image-v2.png` at 2400x1260.
- `og-cv.html` produces a lossless `public/og-cv-v2.png` at 2400x1260.
- `og-smartway.html` produces a lossless `public/og-smartway.png` at 2400x1260.
- `linkedin-banner.html` produces a lossless `public/linkedin-banner.png` at 3168x792.
- `public/x-banner.png` and `public/x-banner-dark.png` are standalone, content-neutral X profile headers at 1500x500.

The social previews are exported at 2400x1260 and kept as PNG files. The LinkedIn
banner master is native 3168x792 (4:1), keeping the brand mark, stack line,
and complete headline visible while leaving the lower-left quarter clear for
the profile avatar. Do not stretch the banner to change its aspect ratio.

Preview changes at both the full size and a small featured-link thumbnail size.
The résumé graphic shows two sheets, and the 70% rendering result always keeps
its qualifier: threads with 1,000+ messages.

Run `scripts/build-assets.sh` from the repository root to rebuild these images and both resume PDFs. Use `scripts/build-assets.sh --resumes-only` to rebuild only the Product Engineer and Full-stack editions, or `--social-only` to rebuild only the social images.
