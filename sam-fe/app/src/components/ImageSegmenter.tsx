import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Tensor, InferenceSession } from 'onnxruntime-web';
import { onnxMaskToImage } from './helpers/maskUtils';
import { modelData } from './helpers/onnxModelAPI';

interface ImageSegmenterProps {
  imageSrc: string;
  model: InferenceSession;
  tensor: Tensor;
  modelScale: {
    height: number;
    width: number;
    samScale: number;
  };
  clicks: Array<{
    x: number;
    y: number;
    clickType: number;
  }>;
}

const ImageSegmenter = ({
  imageSrc,
  model,
  tensor,
  modelScale,
  clicks = []
}: ImageSegmenterProps) => {
  const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
  const [segmentedImage, setSegmentedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const inputs = useMemo(() => modelData({
    clicks, tensor, modelScale
  }), [clicks, tensor, modelScale]);

  useEffect(() => {
    const loadImageAndRunModel = async () => {
      if (imageSrc && inputs) {
        const image = new Image();
        image.src = imageSrc;

        image.onload = async () => {
          try {
            const results = await model.run(inputs);
            if (results && results.masks && results.masks.data) {
              const output = results.masks;
              const maskImg = onnxMaskToImage(output.data as Float32Array, image.width, image.height);
              setMaskImage(maskImg);

              // Create a new image with the object isolated using the mask
              const segmentedImageDataUrl = createSegmentedImage(image, maskImg);
              setSegmentedImage(segmentedImageDataUrl);
            } else {
              console.error('mask_output or mask_output.data is missing from the results');
            }
          } catch (error) {
            console.error('Error during model execution:', error);
          }
        };

        image.onerror = () => {
          console.error('Failed to load image from URL:', imageSrc);
        };
      }
    };

    loadImageAndRunModel();
  }, [imageSrc, model, inputs]);

  const createSegmentedImage = (originalImage: HTMLImageElement, maskImage: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      // Apply the mask to the original image
      ctx.drawImage(originalImage, 0, 0);//original
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(maskImage, 0, 0);//mask

      // Convert the result to data URL
      return canvas.toDataURL();
    } else {
      console.error('Failed to create segmentedImage: Canvas context is null');
      return '';
    }
  };

  return (
    <>
      <div>
        {segmentedImage && (
          <img src={segmentedImage} alt="Segmented Image" />
        )}
        <canvas ref={canvasRef} width={modelScale.width} height={modelScale.height} />
      </div>
    </>
  );
};

export default ImageSegmenter;


