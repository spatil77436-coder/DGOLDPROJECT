# pyrefly: ignore[missing-import]
from PIL import Image, ImageDraw
# pyrefly: ignore[missing-import]
import numpy as np

sp_orig = Image.open('frontend/public/supari-product.png').convert('RGBA')
img1 = Image.open(r'C:\Users\Sagar patil\.gemini\antigravity\brain\f8dff660-636d-486c-a2e9-51f608111812\.user_uploaded\media_1795439116411_679960a4.jpg').convert('RGBA')

w, h = sp_orig.size
print(f'Original size: {w}x{h}')

box_x1, box_y1, box_x2, box_y2 = 172, 452, 457, 620
box_w = box_x2 - box_x1
box_h = box_y2 - box_y1
print(f'Box: {box_w}x{box_h} at ({box_x1},{box_y1})')

src_w, src_h = img1.size
box_ratio = box_w / box_h
src_ratio = src_w / src_h

if src_ratio < box_ratio:
    crop_h = int(src_w / box_ratio)
    crop_y = (src_h - crop_h) // 2
    img1_cropped = img1.crop((0, crop_y, src_w, crop_y + crop_h))
else:
    crop_w = int(src_h * box_ratio)
    crop_x = (src_w - crop_w) // 2
    img1_cropped = img1.crop((crop_x, 0, crop_x + crop_w, src_h))

img1_resized = img1_cropped.resize((box_w, box_h), Image.Resampling.LANCZOS)

scale_factor = 4
mask_hires = Image.new('L', (box_w * scale_factor, box_h * scale_factor), 0)
draw_hires = ImageDraw.Draw(mask_hires)
draw_hires.rounded_rectangle(
    (0, 0, box_w * scale_factor - 1, box_h * scale_factor - 1),
    radius=20 * scale_factor, fill=255
)
mask = mask_hires.resize((box_w, box_h), Image.Resampling.LANCZOS)

result = sp_orig.copy()
result.paste(img1_resized, (box_x1, box_y1), mask)

sp_arr = np.array(sp_orig)
res_arr = np.array(result)
gold_condition = (sp_arr[:, :, 0] > 150) & (sp_arr[:, :, 1] > 100) & (sp_arr[:, :, 2] < 95) & (sp_arr[:, :, 0] > sp_arr[:, :, 2] + 50)
gold_mask = np.zeros((h, w), dtype=bool)
gold_mask[445:625, 168:462] = gold_condition[445:625, 168:462]
res_arr[gold_mask] = sp_arr[gold_mask]

final_img = Image.fromarray(res_arr)
final_img.save('frontend/public/supari-product.png')
print('Done! Saved to frontend/public/supari-product.png')
print(f'Final size: {final_img.size}, mode: {final_img.mode}')
