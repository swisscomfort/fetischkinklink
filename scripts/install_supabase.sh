#!/usr/bin/env bash
set -euo pipefail

# Ensure required commands exist
for cmd in curl sudo tar file; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Fehler: benötigtes Kommando '$cmd' fehlt. Bitte installiere es (z.B. sudo apt install curl tar fileutils)"
    exit 1
  fi
done

TMPDIR="/tmp/supabase-cli"
mkdir -p "$TMPDIR"

# find latest linux_amd64 asset url
URL=$(curl -s https://api.github.com/repos/supabase/cli/releases/latest \
  | grep -Eo 'https://[^"]+linux_amd64\.tar\.gz' | head -n1)

if [ -z "$URL" ]; then
  echo "Fehler: Keine passende Download-URL gefunden. Ausgabe der Releases:"
  curl -s https://api.github.com/repos/supabase/cli/releases/latest
  exit 1
fi

echo "Downloading $URL"
curl -L "$URL" -o "$TMPDIR/supabase.tar.gz"

echo "Downloaded file info:"
file "$TMPDIR/supabase.tar.gz"
ls -lh "$TMPDIR/supabase.tar.gz"

echo "Extracting..."
tar -xzf "$TMPDIR/supabase.tar.gz" -C "$TMPDIR"

echo "Contents of $TMPDIR:"
ls -la "$TMPDIR"

if [ ! -f "$TMPDIR/supabase" ]; then
  echo "Fehler: binäre Datei 'supabase' nicht gefunden im Archiv."
  exit 1
fi

echo "Installing to /usr/local/bin (sudo may ask for password)..."
sudo mv "$TMPDIR/supabase" /usr/local/bin/
sudo chmod +x /usr/local/bin/supabase

rm -rf "$TMPDIR"
echo "Installation abgeschlossen. Version:"
supabase --version || { echo "supabase command not found after install"; exit 1; }