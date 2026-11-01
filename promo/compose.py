from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sys
F = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"
def draw_text(base, parts, y, size, cx, stroke=8):
    d = ImageDraw.Draw(base); f = ImageFont.truetype(F, size)
    widths = [d.textlength(t, font=f) for t, _ in parts]; gap = size * 0.28
    total = sum(widths) + gap * (len(parts) - 1); x = cx - total / 2
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
    xx = x
    for (t, c), w in zip(parts, widths):
        g.text((xx, y), t, font=f, fill=c + (255,)); xx += w + gap
    glow = glow.filter(ImageFilter.GaussianBlur(14)); base.alpha_composite(glow)
    d = ImageDraw.Draw(base); xx = x
    for (t, c), w in zip(parts, widths):
        d.text((xx, y), t, font=f, fill=c + (255,), stroke_width=stroke, stroke_fill=(4, 12, 28, 255)); xx += w + gap
    return x, total
def save(img, path, q=92):
    img = img.convert("RGB"); img.save(path, "JPEG", quality=q, optimize=True)
if __name__ == "__main__":
    # long form 1280x720
    im = Image.open("long_art_blend.png").convert("RGBA").resize((1280, 720), Image.LANCZOS)
    parts = [("BUY", (255, 90, 95)), ("OR", (255, 255, 255)), ("RENT?", (60, 235, 215))]
    x, tot = draw_text(im, parts, 22, 118, 640)
    print("long text span", round(x), round(x + tot))
    save(im, "thumb_long_1280x720.jpg")
