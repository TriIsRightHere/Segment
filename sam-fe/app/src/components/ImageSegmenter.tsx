

import React, { useContext, useEffect, useState } from 'react';
import { Tensor, InferenceSession } from 'onnxruntime-web';
import { onnxMaskToImage } from './helpers/maskUtils';
import { modelData } from './helpers/onnxModelAPI';
import AppContext from './hooks/createContext';
interface ImageSegmenterProps {
  imageSrc: string;
  model: InferenceSession;
  tensor: Tensor;
  modelScale: {
    height: number;
    width: number;
    samScale: number;
  };
  //clicks: Array<{ x: number; y: number; clickType: number; }>;
  onCutout: (cutout: any) => void; // Define the function signature for returning cutout
}

const ImageSegmenter = ({
  imageSrc,
  model,
  tensor,
  modelScale,
  //clicks:[clicks],
  onCutout,
}: ImageSegmenterProps) => {
  const [segmentedImage, setSegmentedImage] = useState<string | null>(null);
  const {clicks: [clicks]} = useContext(AppContext)
  
  
  useEffect(() => {
    console.log("Clicks received: ", clicks)
    const loadImageAndRunModel = async () => {
      if (imageSrc && model && tensor) {
        const image = new Image();
        image.src = imageSrc;
        image.onload = async () => {
          try {
            const inputs = modelData({
              clicks,
              tensor,
              modelScale
            });
            if (!inputs){
              console.error("No inputs invalid");
              return;
            }
            console.log("inputs: ",inputs)
            const results = await model.run(inputs);
            if (results && results.masks && results.masks.data) {
              const maskImg = onnxMaskToImage(results.masks.data as Float32Array, image.width, image.height);
              const segmentedImageDataUrl = createSegmentedImage(image, maskImg);
              setSegmentedImage(segmentedImageDataUrl);
              // Pass the cutout object to the parent component
              onCutout(segmentedImageDataUrl);
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
  }, [imageSrc, model, tensor, modelScale, onCutout]);
  //[imageSrc, model, tensor, modelScale]);

  const createSegmentedImage = (originalImage: HTMLImageElement, maskImage: HTMLImageElement): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // ctx.drawImage(maskImage, 0, 0);
    // ctx.globalCompositeOperation = 'source-in';
    // ctx.drawImage(originalImage, 0, 0);

    return canvas.toDataURL();
  };

  return (
    <div>
      {/* <img src={imageSrc} alt="Original Image" style={{ width: '100%', display: 'block' }} /> */}
      {segmentedImage && (
        <img src={segmentedImage} alt="Segmented Image" style={{ width: '100%', display: 'block' }} />
      )}
    </div>
  );
};

export default ImageSegmenter;
