from PIL import Image, ImageDraw, ImageFont, ImageFilter
from compose import draw_text, save, F
import os
src = Image.open("short_art2_raw.png").convert("RGBA")
# 9:16 crop around the robot, no stretching: 432 x 768 -> upscale 2.5x to 1080 x 1920
x0 = 688 - 216; crop = src.crop((x0, 0, x0 + 432, 768)).resize((1080, 1920), Image.LANCZOS)
crop = crop.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
im = crop
# darken the lower third a little so the bottom words read
ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
for y in range(1150, 1920):
    a = int(min(150, (y - 1150) * 0.30)); d.line([(0, y), (1080, y)], fill=(4, 12, 28, a))
im.alpha_composite(ov)
# "0" inside the red panel, "IN PRODUCTION" under it
f = ImageFont.truetype(F, 520)
zero = Image.new("RGBA", im.size, (0, 0, 0, 0)); zd = ImageDraw.Draw(zero)
bb = zd.textbbox((0, 0), "0", font=f); w = bb[2] - bb[0]
zd.text((540 - w / 2 - bb[0], 470 - bb[1]), "0", font=f, fill=(255, 92, 98, 255), stroke_width=10, stroke_fill=(4, 12, 28, 255))
glow = zero.filter(ImageFilter.GaussianBlur(26)); im.alpha_composite(glow); im.alpha_composite(zero)
draw_text(im, [("IN PRODUCTION", (255, 255, 255))], 1290, 98, 540, stroke=9)
save(im, "thumb_short_1080x1920.jpg")
print(os.path.getsize("thumb_short_1080x1920.jpg"))
