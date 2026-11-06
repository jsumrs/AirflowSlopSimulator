#!/usr/bin/env bash
# Build the app and publish dist/ to the gh-pages branch on origin.
# GitHub Pages serves that branch (Settings -> Pages -> Deploy from a branch).
set -euo pipefail

cd "$(dirname "$0")/.."
remote_url=$(git remote get-url origin)
commit=$(git rev-parse --short HEAD)

bun run build

out_dir=$(mktemp -d)
trap 'rm -rf "$out_dir"' EXIT
cp -r dist/. "$out_dir"
touch "$out_dir/.nojekyll"  # skip GitHub's Jekyll build

cd "$out_dir"
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy $commit"
git push -q --force "$remote_url" gh-pages

echo "Deployed $commit to gh-pages"
