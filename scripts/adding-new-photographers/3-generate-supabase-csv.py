import os
import csv
import re
import sys
import argparse
from datetime import date

ROOT = r"C:\Users\elcar\Documents\WEBs\Mosaic\IMGs"
ROOTOUTPUT = r"C:\Users\elcar\Documents\WEBs\Mosaic\Supabase"
CDN_BASE = "https://cdn.mosaic.photography/mosaic-collections/public-domain-collection"


def fix_author(author_raw):
    photographer_map = {
        "alfred-stieglitz": "Alfred Stieglitz",
        "matthew-brady": "Matthew Brady",
        "julia-margaret-cameron": "Julia Margaret Cameron",
        "baron-wilhelm-von-gloeden": "Baron Wilhelm Von Gloeden",
        "clarence-hudson-white": "Clarence Hudson White",
        "edward-weston": "Edward Weston",
        "anne-brigman": "Anne Brigman",
    }
    author_raw_lower = author_raw.strip().lower()

    for key, val in photographer_map.items():
        if author_raw_lower == key or author_raw_lower == key.replace("-", " "):
            return val

    if author_raw_lower:
        return " ".join([w.capitalize() for w in author_raw_lower.replace("-", " ").split()])
    return ""


def parse_filename(filename):
    name, _ = os.path.splitext(filename)
    if name.endswith("_ms"):
        name = name[:-3]

    # 1. Clean up "000_aaa_" prefix if present
    if name.startswith("000_aaa_"):
        name = name[len("000_aaa_"):]

    # 2. Extract year using regex (catches -year-XXXX or _year-XXXX)
    year = ""
    year_match = re.search(r'[-_]year-(\d{4})', name)
    if year_match:
        year = year_match.group(1)
        # Remove the year block from the name so it doesn't pollute the title
        name = name.replace(year_match.group(0), "")

    parts = name.split('_')
    author_raw = parts[0] if len(parts) > 0 else ""
    title_raw = parts[1] if len(parts) > 1 else ""

    orientation, gender, color, nudity = "", "", "", "nude"

    for p in parts[2:]:
        if p in ["vertical", "horizontal", "square"]:
            orientation = p
        elif p in ["bw", "color", "sepia"]:
            color = p
        elif p in ["male", "female", "couple", "group", "mixed"]:
            # Map couple and group to mixed
            if p in ["couple", "group"]:
                gender = "mixed"
            else:
                gender = p
        elif p == "not-nude" or p == "not":
            nudity = "not-nude"

    # Format Title (Title Case)
    title_words = [w for w in title_raw.replace("-", " ").split() if w]
    title_clean = " ".join([w.capitalize() for w in title_words])

    # Format Description (Sentence Case)
    desc_clean = ""
    if title_clean:
        # Capitalize first letter, lower case the rest, add period.
        desc_clean = title_clean[0].upper() + title_clean[1:].lower()
        if not desc_clean.endswith("."):
            desc_clean += "."

    return author_raw, title_clean, year, orientation, gender, color, nudity, desc_clean


def read_sources(pdir):
    """Rows of _commons/sources.csv (written by 0-fetch-from-commons --apply), keyed by filename stem."""
    path = os.path.join(pdir, "_commons", "sources.csv")
    if not os.path.isfile(path):
        return {}
    with open(path, newline="", encoding="utf-8") as f:
        return {os.path.splitext(r["filename"])[0]: r for r in csv.DictReader(f)}


def get_image_dimensions(full_path):
    from PIL import Image

    try:
        with Image.open(full_path) as img:
            return img.width, img.height
    except Exception:
        return None, None


class Parser(argparse.ArgumentParser):
    def error(self, message):
        self.print_usage(sys.stderr)
        self.exit(1, f"{self.prog}: error: {message}\n")


def main():
    parser = Parser(description="Generate the images_resize CSV for one photographer.")
    parser.add_argument("--folder", required=True, help="Photographer folder slug")
    parser.add_argument("--author", required=True, help="Display name / join key")
    parser.add_argument("--out", default=None, help="Output CSV path")
    args = parser.parse_args()

    folder = args.folder
    pdir = os.path.join(ROOT, folder)
    webp_dir = os.path.join(pdir, "originalsWEBP")

    if not os.path.isdir(pdir):
        print(f"Folder not found: {pdir}", file=sys.stderr)
        return 1

    if not os.path.isdir(webp_dir):
        print(f"originalsWEBP folder not found: {webp_dir} (did step 1 finish?)", file=sys.stderr)
        return 1

    out_path = args.out or os.path.join(
        ROOTOUTPUT, f"images_resize_{folder}_{date.today().isoformat()}.csv"
    )
    out_dir = os.path.dirname(out_path)
    if out_dir and not os.path.exists(out_dir):
        os.makedirs(out_dir)

    sources = read_sources(pdir)
    rows = []

    for img_file in os.listdir(webp_dir):
        if not img_file.lower().endswith('.webp'):
            continue

        full_path = os.path.join(webp_dir, img_file)
        width, height = get_image_dimensions(full_path)

        author_raw, title, year, orientation, gender, color, nudity, desc = parse_filename(img_file)

        stem = os.path.splitext(img_file)[0]
        src = sources.get(stem[:-3] if stem.endswith("_ms") else stem)
        if src and src.get("mosaic_title"):
            title = src["mosaic_title"]
            desc = f"{title}. Photograph by {args.author}, {src.get('year') or year}."
        if src and img_file.startswith("000_aaa_"):
            nudity = "not-nude"
            year = src.get("year") or year
            orientation = src.get("orientation") or orientation
            color = src.get("color") or color
            g = src.get("gender", "")
            gender = "mixed" if g in ("couple", "group") else ("" if g == "none" else g)

        row = {
            "base_url": f"{CDN_BASE}/{folder}",
            "filename": img_file,
            "author": args.author,
            "title": title,
            "year": year,
            "orientation": orientation,
            "color": color,
            "nudity": nudity,
            "width": width,
            "height": height,
            "print_quality": "standard",
            "description": desc,
            "gender": gender,
            "moderation": '{"banned": {"web": false, "mobile": false}, "banned_at": null, "banned_reason": null}'
        }
        rows.append(row)

    if not rows:
        print(f"No rows produced for {folder}.", file=sys.stderr)
        return 1

    header = ["base_url", "filename", "author", "title", "year", "orientation", "color", "nudity", "width", "height", "print_quality", "description", "gender", "moderation"]

    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)

    print(f"Done! Processed {len(rows)} images. CSV saved to {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
