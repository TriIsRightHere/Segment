from diff_inpaint import Diff_inpaint

dif = Diff_inpaint()
# im = dif.inpaint("paint a solid green", "./uploads/city.jpg", "./output/city/45.png")
# im.save('./output/diff/test.png')

im2 = dif.inpaint("fill the image with solid green", "./uploads/mmw9pigvfbe91.png", "./output/mmw9pigvfbe91/31.png")
im2.save('./output/diff/test3.png')

