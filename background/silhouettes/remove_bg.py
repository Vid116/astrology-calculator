#!/usr/bin/env python3
"""Remove black background from Stellarium constellation PNGs and make transparent."""

from PIL import Image
import os
import glob

def remove_black_background(input_path, output_path, threshold=30):
    """
    Remove black/near-black background from image and make it transparent.

    Args:
        input_path: Path to input PNG
        output_path: Path to save processed PNG
        threshold: Pixels darker than this (0-255) become transparent
    """
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()

    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]

            # If pixel is dark (near black), make it transparent
            if r < threshold and g < threshold and b < threshold:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Keep the pixel but maybe boost alpha slightly for better visibility
                # Also add slight blue tint for ethereal look
                new_r = min(255, int(r * 0.8 + 100 * 0.2))
                new_g = min(255, int(g * 0.85 + 140 * 0.15))
                new_b = min(255, int(b * 0.9 + 200 * 0.1))
                pixels[x, y] = (new_r, new_g, new_b, a)

    img.save(output_path, 'PNG')
    return True

def process_all_images(folder):
    """Process all PNG files in folder."""
    png_files = glob.glob(os.path.join(folder, '*.png'))

    # Create backup folder
    backup_folder = os.path.join(folder, 'originals')
    os.makedirs(backup_folder, exist_ok=True)

    processed = 0
    for png_path in png_files:
        filename = os.path.basename(png_path)

        # Skip if already in backup folder
        if 'originals' in png_path:
            continue

        # Backup original
        backup_path = os.path.join(backup_folder, filename)
        if not os.path.exists(backup_path):
            img = Image.open(png_path)
            img.save(backup_path)

        # Process
        try:
            remove_black_background(png_path, png_path)
            processed += 1
            print(f"Processed: {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    print(f"\nDone! Processed {processed} images.")
    print(f"Originals backed up to: {backup_folder}")

if __name__ == '__main__':
    folder = os.path.dirname(os.path.abspath(__file__))
    process_all_images(folder)
