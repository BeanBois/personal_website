import cv2
import numpy as np

image = cv2.imread('input.png', cv2.IMREAD_UNCHANGED)


# Load the PNG image
image = cv2.imread('input.png', cv2.IMREAD_UNCHANGED)

# Define a grayscale range to make transparent (e.g., 240-255 for light gray)
lower_gray_value = 222
upper_gray_value = 230

# Create a binary mask where gray pixels within the defined range are made transparent
mask = cv2.inRange(image[:, :, 0], lower_gray_value, upper_gray_value)
image[:, :, 3][mask > 0] = 0  # Set the alpha channel to 0 for matching pixels

# Save the image with gray pixels made transparent
cv2.imwrite('output.png', image)