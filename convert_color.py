
from colormath.color_objects import sRGBColor, HSLColor, LabColor
from colormath.color_conversions import convert_color

rgb_r, rgb_g, rgb_b = 0, 137, 59

# Convert RGB to HSL
srgb_color = sRGBColor(rgb_r, rgb_g, rgb_b, is_upscaled=True)
hsl_color = convert_color(srgb_color, HSLColor)
print(f"HSL color: {hsl_color.hsl_h}, {hsl_color.hsl_s}, {hsl_color.hsl_l}")

# For Oklch, colormath doesn't have a direct Oklch object.
# We can convert to Lab and then manually calculate Oklch, or use an external tool/library.
# For simplicity and direct CSS usage, HSL is often sufficient.
# If Oklch is strictly required, a more complex implementation or external service would be needed.

# Manual approximation for Oklch (requires more advanced color science)
# For now, we will stick to HSL or direct hex/rgb if Oklch is not easily achievable with colormath.

# Let's try to get a more CSS-friendly HSL output
h = round(hsl_color.hsl_h)
s = round(hsl_color.hsl_s * 100)
l = round(hsl_color.hsl_l * 100)
print(f"CSS HSL: hsl({h} {s}% {l}%)")

