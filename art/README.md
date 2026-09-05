# Social image sources

The HTML files in this directory are source files, not public landing pages.

- `og-image.html` produces a lossless `public/og-image.png` at 2400x1260.
- `og-cv.html` produces a lossless `public/og-cv.png` at 2400x1260.
- `og-smartway.html` produces a lossless `public/og-smartway.png` at 2400x1260.
- `linkedin-banner.html` produces a lossless `public/linkedin-banner.png` at 3168x792.
- `public/x-banner.png` and `public/x-banner-dark.png` are standalone, content-neutral X profile headers at 1500x500.

The social images are rendered at 2x and kept as PNG files so typography and
fine rules do not pick up JPEG compression artifacts. The LinkedIn source is
supersampled once more before being reduced to its final 2x dimensions.

Run `scripts/build-assets.sh` from the repository root to rebuild these images and both resume PDFs. Use `scripts/build-assets.sh --resumes-only` to rebuild only the Product Engineer and Full-stack editions, or `--social-only` to rebuild only the social images.
