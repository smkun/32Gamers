#!/usr/bin/env python3
"""
32Gamers Club - Image to WebP Converter

Converts PNG/JPG images to optimized WebP format.
Typically achieves 70-90% size reduction while maintaining quality.

Usage:
    python scripts/convert-to-webp.py                    # Convert all images
    python scripts/convert-to-webp.py --dry-run          # Preview without changes
    python scripts/convert-to-webp.py --max-size 600     # Resize to max 600px
    python scripts/convert-to-webp.py --quality 80       # Set quality (default: 85)
    python scripts/convert-to-webp.py --keep-originals   # Keep original files
"""

import os
import sys
import argparse
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

# Configuration
DEFAULT_QUALITY = 85
DEFAULT_MAX_SIZE = 800  # Max dimension in pixels
ASSETS_DIR = Path(__file__).parent.parent / "assets" / "images"
SUPPORTED_FORMATS = {'.png', '.jpg', '.jpeg'}


def get_file_size_str(size_bytes):
    """Convert bytes to human-readable string."""
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    return f"{size_bytes / 1024:.1f} KB"


def convert_image(input_path, quality=DEFAULT_QUALITY, max_size=DEFAULT_MAX_SIZE,
                  dry_run=False, keep_original=False):
    """Convert a single image to WebP format."""
    input_path = Path(input_path)
    output_path = input_path.with_suffix('.webp')

    original_size = input_path.stat().st_size

    try:
        with Image.open(input_path) as img:
            # Get original dimensions
            orig_width, orig_height = img.size

            # Convert RGBA to RGB if needed (WebP supports alpha, but smaller without)
            if img.mode in ('RGBA', 'P'):
                # Check if image actually has transparency
                if img.mode == 'RGBA':
                    # Keep alpha if image uses it
                    extrema = img.split()[-1].getextrema()
                    has_transparency = extrema[0] < 255
                    if not has_transparency:
                        img = img.convert('RGB')
                else:
                    img = img.convert('RGB')
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if larger than max_size
            if max(orig_width, orig_height) > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                new_width, new_height = img.size
                resized = True
            else:
                new_width, new_height = orig_width, orig_height
                resized = False

            if dry_run:
                # Estimate size by saving to memory
                import io
                buffer = io.BytesIO()
                img.save(buffer, 'WEBP', quality=quality, method=6)
                new_size = buffer.tell()
            else:
                # Save to file
                img.save(output_path, 'WEBP', quality=quality, method=6)
                new_size = output_path.stat().st_size

                # Remove original if not keeping
                if not keep_original and output_path.exists():
                    input_path.unlink()

        savings = original_size - new_size
        savings_pct = (savings / original_size) * 100

        return {
            'input': input_path.name,
            'output': output_path.name,
            'original_size': original_size,
            'new_size': new_size,
            'savings': savings,
            'savings_pct': savings_pct,
            'orig_dimensions': (orig_width, orig_height),
            'new_dimensions': (new_width, new_height),
            'resized': resized,
            'success': True
        }

    except Exception as e:
        return {
            'input': input_path.name,
            'error': str(e),
            'success': False
        }


def main():
    parser = argparse.ArgumentParser(
        description='Convert images to optimized WebP format',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/convert-to-webp.py                    # Convert all images
  python scripts/convert-to-webp.py --dry-run          # Preview changes
  python scripts/convert-to-webp.py --quality 80       # Lower quality, smaller files
  python scripts/convert-to-webp.py --max-size 600     # Resize to max 600px
  python scripts/convert-to-webp.py --keep-originals   # Keep PNG/JPG files
        """
    )
    parser.add_argument('--dry-run', action='store_true',
                        help='Preview changes without modifying files')
    parser.add_argument('--quality', type=int, default=DEFAULT_QUALITY,
                        help=f'WebP quality 1-100 (default: {DEFAULT_QUALITY})')
    parser.add_argument('--max-size', type=int, default=DEFAULT_MAX_SIZE,
                        help=f'Max dimension in pixels (default: {DEFAULT_MAX_SIZE})')
    parser.add_argument('--keep-originals', action='store_true',
                        help='Keep original PNG/JPG files')
    parser.add_argument('--file', type=str,
                        help='Convert a specific file instead of all')

    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("32Gamers Club - WebP Image Converter")
    print("=" * 60)

    if args.dry_run:
        print("MODE: Dry run (no files will be modified)\n")
    else:
        print(f"MODE: Converting images (quality={args.quality}, max={args.max_size}px)\n")

    # Find images to convert
    if args.file:
        images = [Path(args.file)]
    else:
        images = [f for f in ASSETS_DIR.iterdir()
                  if f.suffix.lower() in SUPPORTED_FORMATS]

    if not images:
        print("No PNG/JPG images found to convert.")
        return

    # Sort by size (largest first)
    images.sort(key=lambda f: f.stat().st_size, reverse=True)

    print(f"Found {len(images)} images to convert:\n")

    results = []
    total_original = 0
    total_new = 0

    for img_path in images:
        result = convert_image(
            img_path,
            quality=args.quality,
            max_size=args.max_size,
            dry_run=args.dry_run,
            keep_original=args.keep_originals
        )
        results.append(result)

        if result['success']:
            total_original += result['original_size']
            total_new += result['new_size']

            status = "would save" if args.dry_run else "saved"
            resize_note = ""
            if result['resized']:
                orig_dim = f"{result['orig_dimensions'][0]}x{result['orig_dimensions'][1]}"
                new_dim = f"{result['new_dimensions'][0]}x{result['new_dimensions'][1]}"
                resize_note = f" (resized {orig_dim} -> {new_dim})"

            print(f"  [OK] {result['input']}")
            print(f"    {get_file_size_str(result['original_size'])} -> {get_file_size_str(result['new_size'])}")
            print(f"    {status} {result['savings_pct']:.1f}%{resize_note}\n")
        else:
            print(f"  [FAIL] {result['input']}: {result['error']}\n")

    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)

    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]

    print(f"Converted: {len(successful)}/{len(results)} images")

    if total_original > 0:
        total_savings = total_original - total_new
        savings_pct = (total_savings / total_original) * 100

        print(f"Original total: {get_file_size_str(total_original)}")
        print(f"New total:      {get_file_size_str(total_new)}")
        print(f"Total savings:  {get_file_size_str(total_savings)} ({savings_pct:.1f}%)")

    if failed:
        print(f"\nFailed: {len(failed)}")
        for r in failed:
            print(f"  - {r['input']}: {r['error']}")

    if not args.dry_run and successful:
        print("\n" + "=" * 60)
        print("IMPORTANT: Update Firebase app entries!")
        print("=" * 60)
        print("Change image filenames from .png/.jpg to .webp in:")
        print("  1. Firebase Admin panel (firebase-admin.html)")
        print("  2. Or directly in Firestore console")
        print("\nExample: 'myapp.png' -> 'myapp.webp'")

        print("\nConverted files:")
        for r in successful:
            old_name = r['input']
            new_name = r['output']
            print(f"  {old_name} -> {new_name}")

    print()


if __name__ == '__main__':
    main()
