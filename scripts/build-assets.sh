#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
CHROME=${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}
TMP_DIR="$ROOT/tmp/art-build"
PDF_OUTPUT_DIR="$ROOT/output/pdf"

if [ ! -x "$CHROME" ]; then
  echo "Google Chrome was not found at: $CHROME" >&2
  exit 1
fi

mkdir -p "$TMP_DIR" "$PDF_OUTPUT_DIR"
rm -rf "$TMP_DIR/chrome-profile-"*

CHROME_RUN=0

chrome_to_file() {
  OUTPUT_FILE=$1
  SCALE_FACTOR=$2
  shift 2
  CHROME_RUN=$((CHROME_RUN + 1))
  rm -f "$OUTPUT_FILE"
  "$CHROME" \
    --headless=new \
    --disable-gpu \
    --disable-background-networking \
    --disable-component-update \
    --disable-default-apps \
    --disable-extensions \
    --disable-sync \
    --no-default-browser-check \
    --no-first-run \
    --hide-scrollbars \
    --force-device-scale-factor="$SCALE_FACTOR" \
    --run-all-compositor-stages-before-draw \
    --virtual-time-budget=1500 \
    --user-data-dir="$TMP_DIR/chrome-profile-$CHROME_RUN" \
    "$@" >/dev/null 2>&1 &
  CHROME_PID=$!

  attempt=0
  while [ ! -s "$OUTPUT_FILE" ]; do
    if ! kill -0 "$CHROME_PID" 2>/dev/null; then
      wait "$CHROME_PID" || true
      break
    fi
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 300 ]; then
      break
    fi
    sleep 0.1
  done

  if [ ! -s "$OUTPUT_FILE" ]; then
    kill -KILL "$CHROME_PID" 2>/dev/null || true
    wait "$CHROME_PID" 2>/dev/null || true
    echo "Chrome did not create: $OUTPUT_FILE" >&2
    exit 1
  fi

  # Chrome creates the target before every pixel/byte has been flushed.
  sleep 1.5
  kill "$CHROME_PID" 2>/dev/null || true
  wait "$CHROME_PID" 2>/dev/null || true
}

chrome_to_file "$PDF_OUTPUT_DIR/Danila_Igoshin_EMEA_Contract_CV.pdf" \
  1 \
  --no-pdf-header-footer \
  --print-to-pdf-no-header \
  --print-to-pdf="$PDF_OUTPUT_DIR/Danila_Igoshin_EMEA_Contract_CV.pdf" \
  "file://$ROOT/cv/index.html"

cp "$PDF_OUTPUT_DIR/Danila_Igoshin_EMEA_Contract_CV.pdf" "$ROOT/Danila_Igoshin_EMEA_Contract_CV.pdf"

chrome_to_file "$TMP_DIR/og-image@2x.png" 2 --window-size=1200,630 --screenshot="$TMP_DIR/og-image@2x.png" "file://$ROOT/art/og-image.html"
chrome_to_file "$TMP_DIR/og-cv@2x.png" 2 --window-size=1200,630 --screenshot="$TMP_DIR/og-cv@2x.png" "file://$ROOT/art/og-cv.html"
chrome_to_file "$TMP_DIR/linkedin-banner@2x.png" 2 --window-size=3168,792 --screenshot="$TMP_DIR/linkedin-banner@2x.png" "file://$ROOT/art/linkedin-banner.html"

rm -f \
  "$ROOT/public/og-image.jpg" \
  "$ROOT/public/og-cv.jpg" \
  "$ROOT/public/linkedin-banner.jpg" \
  "$ROOT/public/og-image.png" \
  "$ROOT/public/og-cv.png" \
  "$ROOT/public/linkedin-banner.png"

# Keep the Open Graph cards at the full 2x render size. The flat, text-heavy
# artwork stays lossless in PNG, avoiding JPEG ringing and chroma blur.
cp "$TMP_DIR/og-image@2x.png" "$ROOT/public/og-image.png"
cp "$TMP_DIR/og-cv@2x.png" "$ROOT/public/og-cv.png"

# LinkedIn recommends a 1584x396 canvas. This 2x deliverable is first rendered
# at 4x and then downsampled once for cleaner type and rules on high-DPI screens.
sips -z 792 3168 "$TMP_DIR/linkedin-banner@2x.png" --out "$ROOT/public/linkedin-banner.png" >/dev/null

rm -rf "$TMP_DIR"

echo "Built resume PDF and social images."
