"""Pull the latest Instagram posts into the site.

Runs from the GitHub Actions workflow in .github/workflows/instagram.yml.
It calls the official Instagram API with the studio's own access token,
saves each post image into assets/instagram/ as a small WebP, and rewrites
the block between the instagram:start / instagram:end markers in index.html.
Visitors only ever load files from this site; nothing is embedded from
Instagram or a third-party widget service.

Environment:
  IG_ACCESS_TOKEN  long-lived Instagram access token (required unless --fixture)
  IG_POST_COUNT    how many posts to show (default 3)

Options:
  --fixture PATH   read the media list from a local JSON file instead of the API
                   (same shape as the API's "data" array) - used for testing.
"""

import argparse
import html
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
IMG_DIR = os.path.join(ROOT, "assets", "instagram")
API = "https://graph.instagram.com/v21.0/me/media"
FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
START = "<!-- instagram:start -->"
END = "<!-- instagram:end -->"
SIZE = 720
LABEL_MAX = 22


def fetch_media(token, count):
    query = urllib.parse.urlencode({"fields": FIELDS, "limit": count, "access_token": token})
    with urllib.request.urlopen(f"{API}?{query}", timeout=30) as res:
        body = json.load(res)
    if "data" not in body:
        raise SystemExit(f"Unexpected API response: {body}")
    return body["data"]


def first_line(caption):
    """First meaningful line of a caption, without hashtags or emoji."""
    for line in (caption or "").splitlines():
        line = re.sub(r"#\S+", "", line)
        line = re.sub(r"[\U0001F000-\U0001FAFF☀-➿️‍]", "", line)
        line = line.strip(" 　・|｜-–—")
        if line:
            return line
    return "Instagramの投稿"


def shorten(text, limit=LABEL_MAX):
    return text if len(text) <= limit else text[: limit - 1] + "…"


def save_image(post):
    url = post.get("thumbnail_url") if post.get("media_type") == "VIDEO" else post.get("media_url")
    if not url:
        return None
    with urllib.request.urlopen(url, timeout=60) as res:
        data = res.read()
    im = Image.open(io.BytesIO(data)).convert("RGB")
    side = min(im.size)
    left = (im.width - side) // 2
    top = (im.height - side) // 2
    im = im.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.LANCZOS)
    name = f"{post['id']}.webp"
    im.save(os.path.join(IMG_DIR, name), quality=82, method=6)
    return f"assets/instagram/{name}"


def render(cards):
    lines = []
    for i, c in enumerate(cards):
        delay = f' style="--reveal-delay:{i * 0.1:.1f}s;"' if i else ""
        lines.append(
            f'        <a class="ig-card reveal"{delay} href="{html.escape(c["permalink"])}" target="_blank" rel="noopener">\n'
            f'          <img src="{c["image"]}" alt="{html.escape(c["alt"])}" loading="lazy" width="{SIZE}" height="{SIZE}">\n'
            f'          <span class="ig-card__label">{html.escape(c["label"])}</span>\n'
            f"        </a>"
        )
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixture")
    args = parser.parse_args()
    count = int(os.environ.get("IG_POST_COUNT", "3"))

    if args.fixture:
        with open(args.fixture, encoding="utf-8") as f:
            media = json.load(f)
    else:
        token = os.environ.get("IG_ACCESS_TOKEN")
        if not token:
            # Not configured yet: leave the posts already on the page as they are.
            print("::warning::IG_ACCESS_TOKEN is not set; skipping the Instagram update.")
            return
        media = fetch_media(token, count * 2)

    os.makedirs(IMG_DIR, exist_ok=True)
    cards = []
    for post in media:
        if len(cards) == count:
            break
        image = save_image(post)
        if not image:
            continue
        text = first_line(post.get("caption"))
        cards.append({"permalink": post["permalink"], "image": image, "alt": text, "label": shorten(text)})

    if not cards:
        sys.exit("No usable posts returned; leaving the site unchanged")

    keep = {os.path.basename(c["image"]) for c in cards}
    for name in os.listdir(IMG_DIR):
        if name.endswith(".webp") and name not in keep:
            os.remove(os.path.join(IMG_DIR, name))

    with open(INDEX, encoding="utf-8") as f:
        page = f.read()
    if START not in page or END not in page:
        sys.exit("instagram markers not found in index.html")
    head, rest = page.split(START, 1)
    _, tail = rest.split(END, 1)
    page = f"{head}{START}\n{render(cards)}\n        {END}{tail}"
    with open(INDEX, "w", encoding="utf-8", newline="") as f:
        f.write(page)
    print(f"Updated {len(cards)} Instagram posts")


if __name__ == "__main__":
    main()
