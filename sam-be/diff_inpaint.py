from diffusers import DiffusionPipeline
import torch
from PIL import Image

class Diff_inpaint() :
    def __init__(self):
        self.pipe = DiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-inpainting",
            variant="fp16",
            torch_dtype=torch.float16,
        )
        
    def inpaint(self, prompt: str, image_path: str, mask_path: str) :
        image = Image.open(image_path)
        mask = Image.open(mask_path)
        width, height = image.size

        width = closest_multiple_8(width)
        height = closest_multiple_8(height)
        print("w and h:", width, height)

        if torch.cuda.is_available():
            self.pipe = self.pipe.to("cuda")
            # image = image.to("cuda")
            # mask = mask.to("cuda")

        image = self.pipe(prompt=prompt, image=image, mask_image=mask, width=width, height=height).images[0]
        return image

def closest_multiple_8(n):
    return int(round(n / 8) * 8)