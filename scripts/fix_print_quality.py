import os
import csv
import unicodedata
from PIL import Image

ROOT = r"C:\Users\elcar\Documents\WEBs\Mosaic\IMGs"
input_csv = r"C:\Users\elcar\Documents\WEBs\Mosaic\Supabase\images_resize_import_fix_quality8.csv"
output_csv = r"C:\Users\elcar\Documents\WEBs\Mosaic\Supabase\images_resize_import_fix_quality9.csv"

# Map display name to folder slug
author_map = {
    "Alfred Stieglitz": "alfred-stieglitz",
    "Baron Wilhelm Von Gloeden": "wilhelm-von-gloeden",
    "Clarence Hudson White": "clarence-hudson-white",
    "Edward Weston": "edward-weston",
    "Eugene Durieu": "eugene-durieu",
    "Felix Jacques Moulin": "jacques-moulin",
    "Fred Holland Day": "fred-holland-day",
    "Robert Demachy": "robert-demachy",
    "Wilhelm Von Plueschow": "wilhelm-von-plueschow",
    "Jane de La Vaudere": "jane-de-la-vaudere",  # unaccented!
    "Anne Brigman": "anne-brigman",
    "Mario von Bucovich": "mario-von-bucovich",
    # Add more mappings as needed!
}

def slugify(text):
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = text.lower().replace(" ", "-")
    return text

def author_to_folder(author):
    # Try to map display name to folder slug
    if author in author_map:
        return author_map[author]
    return slugify(author)

def get_image_size(photographer, filename):
    folder_name = author_to_folder(photographer)
    img_path = os.path.join(ROOT, folder_name, "originals", filename)
    if not os.path.exists(img_path):
        return None, None
    try:
        with Image.open(img_path) as img:
            return img.width, img.height
    except Exception:
        return None, None

with open(input_csv, newline='', encoding='utf-8') as infile, \
     open(output_csv, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = reader.fieldnames + [c for c in ['width', 'height', 'print_quality'] if c not in reader.fieldnames]
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        photographer = row.get('author', '').strip()
        # Write out photographer exactly as in the CSV (already correct)
        row['author'] = photographer

        filename = row.get('filename', '').strip()
        width, height = get_image_size(photographer, filename)
        row['width'] = width if width is not None else ''
        row['height'] = height if height is not None else ''
        if width is None or height is None:
            row['print_quality'] = ""
        elif width >= 3500 or height >= 3500:
            row['print_quality'] = "professional"
        elif width >= 2500 or height >= 2500:
            row['print_quality'] = "excellent"
        elif width >= 1400 or height >= 1400:
            row['print_quality'] = "good"
        else:
            row['print_quality'] = "standard"
        writer.writerow(row)

print(f"Done! Width, height, and print_quality columns added to {output_csv}")