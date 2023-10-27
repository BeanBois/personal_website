import cv2
import numpy as np

# Load the image
image = cv2.imread('player_boy_sprite.png') #bgr format
background_color = [159, 80, 0]
# background_color = [255, 255, 255]

# Define a threshold for the color to consider as the background
threshold = 1  # You can adjust this threshold as needed

# Create a copy of the image in RGBA format
rgba_image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
print(rgba_image[0][0][:3])
# Iterate through each pixel
for y in range(rgba_image.shape[0]):
    for x in range(rgba_image.shape[1]):
        # Get the color of the current pixel
        pixel_color = rgba_image[y, x][:3]
        # Check if the color is close to the background color within the threshold
        if np.all(np.abs(np.array(pixel_color) - background_color) < threshold):
            # Make the pixel transparent (set alpha channel to 0)
            # rgba_image[y, x][3] = 0
            rgba_image[y,x] = [255,255,255,0]


# Check if red value is greater than 90 and update the binary image

cv2.imwrite('player_boy_sprite_transparent.png', rgba_image)

# Display the original and binary images
cv2.imshow('Original Image', image)
cv2.imshow('Binary Image', rgba_image)



cv2.waitKey(0)
cv2.destroyAllWindows()
