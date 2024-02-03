import cv2
import numpy as np
import os

def closing(image_path, kernel_size, save_path):
    # Convert relative paths to absolute paths
    image_path = os.path.abspath(image_path)
    save_path = os.path.abspath(save_path)

    # Read the image
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # Define the kernel for closing
    kernel = np.ones((kernel_size, kernel_size), np.uint8)

    # Perform closing operation
    # closed_img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
    # erosion = cv.erode(img,kernel,iterations = 1)
    closed_img = cv2.erode(img, kernel, iterations = 1)
    
    # Save the closed image
    cv2.imwrite(save_path, closed_img)
    
    # Display the original and closed images
    cv2.imshow('Original Image', img)
    cv2.imshow('Closed Image', closed_img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Example usage:
image_path = 'collision_map_gamma.jpg'
custom_kernel_size = 2
output_path = 'closed_image.jpg'
closing(image_path, custom_kernel_size, output_path)
