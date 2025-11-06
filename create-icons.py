#!/usr/bin/env python3
"""
Blue shield with checkmark icon generator for the website blocker extension
Run with: python3 create-icons.py
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow library not found. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont
import os
import math

def create_icon(size, filename):
    """Create a blue shield icon with white checkmark"""
    # Create image with black background
    img = Image.new('RGB', (size, size), color='#000000')
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Shield dimensions
    shield_top = int(size * 0.12)
    shield_bottom = int(size * 0.92)
    shield_width = int(size * 0.72)
    shield_left = center - shield_width // 2
    shield_right = center + shield_width // 2
    
    # Outer border (dark blue)
    outer_border = max(2, int(size * 0.04))
    
    # Draw shield shape (top rounded, bottom pointed)
    # Outer shield points (with border)
    outer_shield_points = [
        (shield_left, shield_top + outer_border),  # Top left
        (shield_right, shield_top + outer_border),  # Top right
        (shield_right, int(size * 0.7)),  # Right side
        (center, shield_bottom),  # Bottom point
        (shield_left, int(size * 0.7)),  # Left side
    ]
    
    # Draw outer dark blue border
    dark_blue = (0, 50, 100)  # Dark blue border
    draw.polygon(outer_shield_points, fill=dark_blue)
    
    # Draw rounded top for outer border
    top_radius = int(size * 0.13)
    draw.ellipse(
        [shield_left, shield_top,
         shield_right, shield_top + top_radius * 2],
        fill=dark_blue
    )
    # Clip bottom half
    draw.rectangle(
        [shield_left, shield_top + top_radius,
         shield_right, shield_top + top_radius * 2],
        fill=dark_blue
    )
    
    # Inner shield (light gray/white outline area)
    inner_margin = outer_border + max(1, int(size * 0.02))
    inner_shield_top = shield_top + inner_margin
    inner_shield_bottom = shield_bottom - max(1, int(size * 0.015))
    inner_shield_width = shield_width - (inner_margin * 2)
    inner_shield_left = center - inner_shield_width // 2
    inner_shield_right = center + inner_shield_width // 2
    
    inner_shield_points = [
        (inner_shield_left, inner_shield_top),
        (inner_shield_right, inner_shield_top),
        (inner_shield_right, int(size * 0.68)),
        (center, inner_shield_bottom),
        (inner_shield_left, int(size * 0.68)),
    ]
    
    # Light gray/off-white outline
    light_gray = (220, 220, 220)  # Off-white/gray outline
    draw.polygon(inner_shield_points, fill=light_gray)
    
    # Draw rounded top for inner shield
    inner_top_radius = int(size * 0.11)
    draw.ellipse(
        [inner_shield_left, inner_shield_top,
         inner_shield_right, inner_shield_top + inner_top_radius * 2],
        fill=light_gray
    )
    draw.rectangle(
        [inner_shield_left, inner_shield_top + inner_top_radius,
         inner_shield_right, inner_shield_top + inner_top_radius * 2],
        fill=light_gray
    )
    
    # Two-tone blue shield body
    blue_body_margin = max(2, int(size * 0.025))
    body_top = inner_shield_top + blue_body_margin
    body_bottom = inner_shield_bottom - blue_body_margin
    body_width = inner_shield_width - (blue_body_margin * 2)
    body_left = center - body_width // 2
    body_right = center + body_width // 2
    
    body_points = [
        (body_left, body_top),
        (body_right, body_top),
        (body_right, int(size * 0.66)),
        (center, body_bottom),
        (body_left, int(size * 0.66)),
    ]
    
    # Create gradient: lighter cyan-blue on left, darker medium blue on right
    lighter_blue = (50, 180, 255)  # Cyan-blue
    darker_blue = (30, 120, 200)    # Medium blue
    
    # Draw two-tone blue shield body
    # Left half (lighter)
    left_points = [
        (body_left, body_top),
        (center, body_top),
        (center, int(size * 0.66)),
        (center, body_bottom),
        (body_left, int(size * 0.66)),
    ]
    draw.polygon(left_points, fill=lighter_blue)
    
    # Right half (darker)
    right_points = [
        (center, body_top),
        (body_right, body_top),
        (body_right, int(size * 0.66)),
        (center, body_bottom),
        (center, int(size * 0.66)),
    ]
    draw.polygon(right_points, fill=darker_blue)
    
    # Draw rounded top for blue body
    body_top_radius = int(size * 0.09)
    # Left half circle
    draw.ellipse(
        [body_left, body_top,
         center, body_top + body_top_radius * 2],
        fill=lighter_blue
    )
    draw.rectangle(
        [body_left, body_top + body_top_radius,
         center, body_top + body_top_radius * 2],
        fill=lighter_blue
    )
    # Right half circle
    draw.ellipse(
        [center, body_top,
         body_right, body_top + body_top_radius * 2],
        fill=darker_blue
    )
    draw.rectangle(
        [center, body_top + body_top_radius,
         body_right, body_top + body_top_radius * 2],
        fill=darker_blue
    )
    
    # Draw white checkmark in center
    checkmark_size = int(size * 0.25)
    checkmark_center_x = center
    checkmark_center_y = int(size * 0.52)
    
    # Checkmark dimensions
    check_width = max(2, int(size * 0.035))  # Thickness of checkmark
    
    # Checkmark path (thick, rounded ends)
    # First stroke (down-right)
    check_start_x = checkmark_center_x - checkmark_size * 0.4
    check_start_y = checkmark_center_y
    check_mid_x = checkmark_center_x - checkmark_size * 0.1
    check_mid_y = checkmark_center_y + checkmark_size * 0.3
    
    # Second stroke (up-right)
    check_end_x = checkmark_center_x + checkmark_size * 0.4
    check_end_y = checkmark_center_y - checkmark_size * 0.2
    
    # Draw thick checkmark lines
    white = (255, 255, 255)
    
    # First part of checkmark (downward stroke)
    draw.line(
        [check_start_x, check_start_y, check_mid_x, check_mid_y],
        fill=white,
        width=check_width
    )
    
    # Second part of checkmark (upward stroke)
    draw.line(
        [check_mid_x, check_mid_y, check_end_x, check_end_y],
        fill=white,
        width=check_width
    )
    
    # Rounded ends using small circles
    end_radius = max(1, check_width // 2)
    
    # Round start point
    draw.ellipse(
        [check_start_x - end_radius, check_start_y - end_radius,
         check_start_x + end_radius, check_start_y + end_radius],
        fill=white
    )
    
    # Round mid point
    draw.ellipse(
        [check_mid_x - end_radius, check_mid_y - end_radius,
         check_mid_x + end_radius, check_mid_y + end_radius],
        fill=white
    )
    
    # Round end point
    draw.ellipse(
        [check_end_x - end_radius, check_end_y - end_radius,
         check_end_x + end_radius, check_end_y + end_radius],
        fill=white
    )
    
    # Ensure icons directory exists
    icons_dir = 'icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Save icon
    filepath = os.path.join(icons_dir, filename)
    img.save(filepath, 'PNG')
    print(f"✓ Created {filename} ({size}x{size})")

def main():
    print("Creating blue shield with checkmark extension icons...")
    create_icon(16, 'icon16.png')
    create_icon(48, 'icon48.png')
    create_icon(128, 'icon128.png')
    print("\n✅ All icons created successfully!")
    print("You can now reload the extension in Chrome.")

if __name__ == '__main__':
    main()
