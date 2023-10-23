import imageio
import numpy as np

# Load the GIF image using imageio
gif_path = "input.gif"  # Replace with the path to your GIF file
gif_frames = imageio.get_reader(gif_path)

# Define the left and right regions (adjust these coordinates as needed)
width = gif_frames.get_data(0).shape[1]
left_box = (0, width // 2)
right_box = (width // 2, width)

# Create empty lists to store frames for the left and right halves
left_half_frames = []
right_half_frames = []

# Iterate through frames of the original GIF and split each frame
for frame in gif_frames:
    frame = np.array(frame)
    left_half = frame[:, left_box[0]:left_box[1], :]
    right_half = frame[:, right_box[0]:right_box[1], :]
    
    left_half_frames.append(left_half)
    right_half_frames.append(right_half)

# Save the left and right halves as animated GIFs
imageio.mimsave("left_half.gif", left_half_frames)
imageio.mimsave("right_half.gif", right_half_frames)

