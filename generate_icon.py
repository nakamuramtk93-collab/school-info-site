from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    s = size
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 角丸マスク
    radius = int(s * 0.18)
    mask = Image.new('L', (s, s), 0)
    md = ImageDraw.Draw(mask)
    r = radius
    md.rectangle([r, 0, s-1-r, s-1], fill=255)
    md.rectangle([0, r, s-1, s-1-r], fill=255)
    md.ellipse([0, 0, r*2, r*2], fill=255)
    md.ellipse([s-1-r*2, 0, s-1, r*2], fill=255)
    md.ellipse([0, s-1-r*2, r*2, s-1], fill=255)
    md.ellipse([s-1-r*2, s-1-r*2, s-1, s-1], fill=255)

    # 白背景
    bg = Image.new('RGBA', (s, s), (255, 255, 255, 255))
    bg.putalpha(mask)
    img.paste(bg, mask=mask)

    draw = ImageDraw.Draw(img)

    # ===== 建物ブロック =====
    colors = [
        (220,  80,  70),   # 赤
        (235, 145,  60),   # 橙
        (240, 200,  80),   # 黄   ← 塔（3本目）
        ( 95, 175, 100),   # 緑   ← 塔（4本目）
        (100, 170, 220),   # 青
        (175, 130, 190),   # 紫
    ]

    margin_x = int(s * 0.07)
    total_w = s - margin_x * 2
    n = len(colors)
    bw = total_w / n
    gap = max(1, int(s * 0.008))

    building_top = int(s * 0.30)
    tower_top    = int(s * 0.12)
    bottom       = int(s * 0.88)

    # 塔は index 2（黄）と index 3（緑）
    tower_indices = {2, 3}

    for i, color in enumerate(colors):
        x0 = int(margin_x + bw * i) + gap
        x1 = int(margin_x + bw * (i + 1)) - gap
        y0 = tower_top if i in tower_indices else building_top
        draw.rectangle([x0, y0, x1, bottom], fill=color + (255,))

    # ===== 時計（塔の中央上部） =====
    # 塔 index2〜3 の中央X
    tower_x0 = int(margin_x + bw * 2) + gap
    tower_x1 = int(margin_x + bw * 4) - gap
    clock_cx = (tower_x0 + tower_x1) // 2
    clock_cy = int(tower_top + (building_top - tower_top) * 0.55)
    clock_r  = int(s * 0.10)

    draw.ellipse([clock_cx-clock_r, clock_cy-clock_r,
                  clock_cx+clock_r, clock_cy+clock_r],
                 fill=(255, 255, 255, 255),
                 outline=(180, 180, 180, 255),
                 width=max(1, int(s * 0.008)))

    lw = max(2, int(s * 0.018))
    draw.line([clock_cx, clock_cy,
               clock_cx, clock_cy - int(clock_r * 0.6)],
              fill=(80, 160, 100, 255), width=lw)
    draw.line([clock_cx, clock_cy,
               clock_cx + int(clock_r * 0.55), clock_cy],
              fill=(100, 180, 220, 255), width=lw)
    dot = max(2, int(s * 0.012))
    draw.ellipse([clock_cx-dot, clock_cy-dot,
                  clock_cx+dot, clock_cy+dot],
                 fill=(120, 120, 120, 255))

    img.putalpha(mask)
    return img

sizes = {
    "icon-192.png": 192,
    "icon-512.png": 512,
    "apple-touch-icon.png": 180,
    "favicon-32.png": 32,
}

output_dir = os.path.dirname(os.path.abspath(__file__))
for filename, size in sizes.items():
    icon = create_icon(size)
    if "apple" in filename or "favicon" in filename:
        bg = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        bg.paste(icon, mask=icon.split()[3])
        icon = bg
    icon.save(os.path.join(output_dir, filename))
    print(f"Generated: {filename} ({size}x{size})")
print("Done!")
