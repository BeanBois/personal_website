#maybe not needed
import cv2
import numpy as np

# Read the binary image
image = cv2.imread('./gamma/collision_map_gamma.jpg', cv2.IMREAD_GRAYSCALE)
# Define a kernel for dilation (you can adjust the size as needed)
kernel = np.ones((2, 2), np.uint8)

# Perform dilation
dilated_image = cv2.erode(image, kernel, iterations=1)

cv2.imshow('og', image)
cv2.imshow('dilated', dilated_image)
cv2.waitKey(0)
# Save the dilated image
# cv2.imwrite('dilated_image.png', dilated_image)
