
from PIL import Image
from collections import Counter

image_path = "condo-justo/frontend/src/assets/condojusto.png"

def get_dominant_color(image_path, num_colors=5, threshold=240):
    img = Image.open(image_path)
    img = img.convert("RGB")
    pixels = img.getdata()

    # Filter out white and near-white pixels
    non_white_pixels = [pixel for pixel in pixels if not all(c > threshold for c in pixel)]

    if not non_white_pixels:
        return (0, 0, 0) # Fallback to black if no non-white pixels are found

    pixel_counts = Counter(non_white_pixels)
    most_common = pixel_counts.most_common(num_colors)

    # Iterate through most common colors to find a suitable non-white color
    for color, _ in most_common:
        if not all(c > threshold for c in color):
            return color
    
    return most_common[0][0] # Fallback to the most common if all are near-white

dominant_rgb = get_dominant_color(image_path)
hex_color = f"#{dominant_rgb[0]:02x}{dominant_rgb[1]:02x}{dominant_rgb[2]:02x}"
print(f"Dominant RGB color: {dominant_rgb}")
print(f"Dominant Hex color: {hex_color}")

