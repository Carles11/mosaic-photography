import os
import csv
import json
from PIL import Image

ROOT = r"C:\Users\elcar\Documents\WEBs\Mosaic\IMGs"
ROOTOUTPUT = r"C:\Users\elcar\Documents\WEBs\Mosaic\Supabase"
CDN_BASE = "https://cdn.mosaic.photography/mosaic-collections/public-domain-collection"
OUTPUT_CSV = os.path.join(ROOTOUTPUT, "images_resize_import_fix1.csv")
SIZE_FOLDERS = ["originals", "originalsWEBP", "w400", "w600", "w800", "w1200", "w1600"]

def strip_ms(filename):
    name, ext = os.path.splitext(filename)
    if name.endswith("_ms"):
        name = name[:-3]
    return name + ext

def filename_to_description(filename):
    name, _ = os.path.splitext(filename)
    if name.endswith("_ms"):
        name = name[:-3]
    parts = name.split('_')
    year_idx = next((i for i, p in enumerate(parts) if p.startswith("year-")), len(parts))
    desc_words = parts[1:year_idx]
    if not desc_words:
        return ""
    desc = " ".join(desc_words).replace("-", " ")
    desc = desc[0].upper() + desc[1:] if desc else ""
    if not desc.endswith('.'):
        desc += '.'
    return desc

def fix_author(author_raw, filename):
    # Map all known photographer keys to correct display names
    photographer_map = {
        "alfred-stieglitz": "Alfred Stieglitz",
        "baron-wilhelm-von-gloeden": "Baron Wilhelm Von Gloeden",
        "clarence-hudson-white": "Clarence Hudson White",
        "clarence-h-white": "Clarence Hudson White",
        "edward-weston": "Edward Weston",
        "eugene-durieu": "Eugene Durieu",
        "durieu-eugene": "Eugene Durieu",
        "durieu": "Eugene Durieu",
        "felix-jacques-moulin": "Felix Jacques Moulin",
        "moulin": "Felix Jacques Moulin",
        "felix-moulin": "Felix Jacques Moulin",
        "fred-holland-day": "Fred Holland Day",
        "robert-demachy": "Robert Demachy",
        "demachy": "Robert Demachy",
        "wilhelm-von-plueschow": "Wilhelm Von Plueschow",
        "wilhelm-von-gloeden": "Baron Wilhelm Von Gloeden",
        "jane-de-la-vaudere": "Jane de La Vaudère",
        "vaudere": "Jane de La Vaudère",
        "anne-brigman": "Anne Brigman",
        "mario-von-bucovich-atelier-karl-schenker": "Mario von Bucovich",
        "mario-von-bucovich": "Mario von Bucovich",
        # Add more if needed
    }
    author_raw_lower = author_raw.strip().lower()
    filename_lower = filename.lower()

    # 1. Fix author for images starting with "000_aaa_"
    if filename_lower.startswith("000_aaa_"):
        rest = filename_lower[len("000_aaa_"):]
        possible_author = rest.split("_")[0]
        if possible_author in photographer_map:
            return photographer_map[possible_author]
        # Try partial match in mapping keys
        for key, val in photographer_map.items():
            if key in possible_author:
                return val

    # 2. Direct match with author_raw
    for key, val in photographer_map.items():
        if author_raw_lower == key or author_raw_lower == key.replace("-", " "):
            return val

    # 3. Universal filename matching
    for key, val in photographer_map.items():
        if f"000_aaa_{key}" in filename_lower or key in filename_lower:
            return val

    # 4. Special cases: publicdomainunverified, unknown, blank, "0"
    if author_raw_lower in ["publicdomainunverified", "unknown", "0", ""]:
        for key, val in photographer_map.items():
            if f"000_aaa_{key}" in filename_lower or key in filename_lower:
                return val
        return ""

    # 5. Partial author matches (for truncated, hyphen, etc)
    for key, val in photographer_map.items():
        # Partial match for Moulin and Vaudere
        if key in author_raw_lower or key.replace("-", " ") in author_raw_lower:
            return val

    # 6. Fallback: Capitalize author_raw nicely
    if author_raw_lower:
        return " ".join([w.capitalize() for w in author_raw_lower.replace("-", " ").split()])
    return ""

def parse_filename(filename):
    name, _ = os.path.splitext(filename)
    if name.endswith("_ms"):
        name = name[:-3]
    parts = name.split('_')
    author = parts[0] if len(parts) > 0 else ""
    title = parts[1] if len(parts) > 1 else ""
    year, orientation, color, nudity = "", "", "", ""
    for p in parts[2:]:
        if p.startswith("year-"):
            year = p.replace("year-", "")
        elif p in ["vertical", "horizontal", "square"]:
            orientation = p
        elif p in ["bw", "color", "sepia"]:
            color = p
        elif "nude" in p or "not" in p:
            nudity = p
        else:
            title += " " + p
    if nudity == "":
        nudity = "nude"
    return author, title, year, orientation, color, nudity

def get_image_info(full_path):
    try:
        with Image.open(full_path) as img:
            width, height = img.size
            fmt = img.format.lower()
            return width, height, fmt
    except Exception as e:
        return None, None, None

rows = []
for photographer in os.listdir(ROOT):
    pdir = os.path.join(ROOT, photographer)
    if not os.path.isdir(pdir): continue
    originals_dir = os.path.join(pdir, "originals")
    if not os.path.isdir(originals_dir): continue
    for img_file in os.listdir(originals_dir):
        if not img_file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.bmp')):
            continue
        clean_img_file = strip_ms(img_file)
        sizes_info = {}
        for size in SIZE_FOLDERS:
            size_dir = os.path.join(pdir, size)
            if not os.path.isdir(size_dir): continue
            if clean_img_file.lower().endswith('.jpg') and size == "originalsWEBP":
                webp_file = os.path.splitext(clean_img_file)[0] + ".webp"
                img_path = os.path.join(size_dir, webp_file)
                cdn_url = f"{CDN_BASE}/{photographer}/{size}/{webp_file}"
                file_to_use = webp_file if os.path.exists(img_path) else None
            else:
                img_path = os.path.join(size_dir, clean_img_file)
                cdn_url = f"{CDN_BASE}/{photographer}/{size}/{clean_img_file}"
                file_to_use = clean_img_file if os.path.exists(img_path) else None
            if file_to_use and os.path.exists(img_path):
                width, height, fmt = get_image_info(img_path)
                sizes_info[size] = {
                    "url": cdn_url,
                    "format": fmt,
                    "width": width,
                    "height": height
                }
        author, title, year, orientation, color, nudity = parse_filename(img_file)
        row = {
            "base_url": f"{CDN_BASE}/{photographer}/{{size}}",
            "filename": clean_img_file,
            "author": fix_author(author, img_file),
            "title": title,
            "year": year,
            "orientation": orientation,
            "color": color,
            "nudity": nudity,
            "description": filename_to_description(img_file),
            "sizes_info": json.dumps(sizes_info, ensure_ascii=False)
        }
        rows.append(row)

header = ["base_url", "filename", "author", "title", "year", "orientation", "color", "nudity", "description", "sizes_info"]

with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=header)
    writer.writeheader()
    writer.writerows(rows)

print(f"Done! CSV saved to {OUTPUT_CSV}")