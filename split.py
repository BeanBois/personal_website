import cv2


img = cv2.imread('public/output.png', cv2.IMREAD_UNCHANGED)
space = 400

_img1 = img[:, :space, :]
cv2.imwrite('public/player_boy_0_.png', _img1)

_img2 = img[:, 450 - 25: 450*2 - 25, :]
cv2.imwrite('public/player_boy_1_.png', _img2)

_img3 = img[:, 450*2: 450*3 - 50, :]
cv2.imwrite('public/player_boy_2_.png', _img3)


_img4 = cv2.flip(_img3, 1)
cv2.imwrite('public/player_boy_3_.png', _img4)
