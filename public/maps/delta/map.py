#
#import cv2
#import numpy as np
#
## Load the image
#image = cv2.imread('Hoenn_Secret_Base_Alpha.png')
#
## Define the target color in RGBA format
##target_color = (37, 96, 47)
#target_color = (47, 37, 96)
##target_color = (96, 47, 37)
#
#
## Create a mask where pixels matching the target color are set to 1
#mask = np.all(image == target_color, axis=2).astype(np.uint8)
#
## Save the binary image
#cv2.imwrite('binary_image.jpg', mask * 255)  # Convert 1s to 255 (white)
#
## Display the original and binary images
#cv2.imshow('Original Image', image)
#cv2.imshow('Binary Image', mask * 255)
#cv2.waitKey(0)
#cv2.destroyAllWindows()
#import cv2
#import numpy as np
#rgba(110,78,34,255)
#
## Load the image
#image = cv2.imread('Hoenn_Secret_Base_Alpha.png')
#
## Convert the image to grayscale
#gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#
## Apply a green threshold (adjust the threshold value as needed)
#green_threshold = 90  # You can adjust this value
#_, binary_image = cv2.threshold(gray_image, green_threshold, 255, cv2.THRESH_BINARY)
#
## Save the binary image
#cv2.imwrite('binary_image.jpg', binary_image)
#
## Display the original and binary images
#cv2.imshow('Original Image', image)
#cv2.imshow('Binary Image', binary_image)
#cv2.waitKey(0)
#cv2.destroyAllWindows()
import cv2
import numpy as np

# Load the image
image = cv2.imread('Hoenn_Secret_Base_Delta.png')
print(image[0,0]) #bgr format
binary_image = np.zeros(shape=(image.shape[0],image.shape[1]))
# Convert the image to grayscale
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#bgr format
# Apply a green threshold (adjust the threshold value as needed)
green_threshold = 90  # You can adjust this value
_, binary_image = cv2.threshold(gray_image, green_threshold, 255, cv2.THRESH_BINARY)



color_to_match = np.array([32, 72, 104])
color_to_match1 = np.array([64, 152, 184])
color_to_match2 = np.array([40, 96, 128])

#color_to_match = (88, 144 64)

# Iterate over the pixels to set binary_image[y, x] to 0 if image[y, x] matches the color
for y in range(image.shape[0]):
    for x in range(image.shape[1]):
        print(image[y, x])
        if np.array_equal(image[y, x], color_to_match) or\
                np.array_equal(image[y, x], color_to_match1) or\
                np.array_equal(image[y, x], color_to_match2):
            binary_image[y, x] = 255
            print('here')

# Check if red value is greater than 90 and update the binary image

cv2.imwrite('collision_map_delta.jpg', binary_image)

# Display the original and binary images
cv2.imshow('Original Image', image)
cv2.imshow('Binary Image', binary_image)



cv2.waitKey(0)
cv2.destroyAllWindows()
