// import React, { useEffect, useState, useRef } from 'react';
// import { Tensor, InferenceSession } from 'onnxruntime-web';
// import { onnxMaskToImage } from './helpers/maskUtils';
// import { modelData } from './helpers/onnxModelAPI';

// interface ImageSegmenterProps {
//   imageSrc: string;
//   model: InferenceSession;
//   tensor: Tensor;
//   modelScale: {
//     height: number;
//     width: number;
//     samScale: number;
//   };
//   clicks: Array<{
//     x: number;
//     y: number;
//     clickType: number;
//   }>;
// }

// const ImageSegmenter = ({
//   imageSrc,
//   model,
//   tensor,
//   modelScale,
//   clicks = [] 
// }: ImageSegmenterProps) => {
//   const [maskImage, setMaskImage] = useState<HTMLImageElement | null>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     if (imageSrc) {
//       const image = new Image();
//       image.src = imageSrc;
//       image.onload = async () => {
//         const inputs = modelData({
//           clicks, 
//           tensor,
//           modelScale
//         });

//         if (inputs) {
//           const results = await model.run(inputs);
//           const output = results.mask_output; 
//           const maskImg = onnxMaskToImage(output.data as Float32Array, image.width, image.height);
//           setMaskImage(maskImg);
//         }
//       };
//     }
//   }, [imageSrc, model, tensor, modelScale, clicks]);

//   useEffect(() => {
//     if (maskImage && canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       if (ctx) {
//         ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//         ctx.drawImage(maskImage, 0, 0);
//       }
//     }
//   }, [maskImage]);

//   return (
//     <div>
//       <canvas ref={canvasRef} width={modelScale.width} height={modelScale.height} />
//     </div>
//   );
// };

// export default ImageSegmenter;

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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // useMemo to prevent recalculating inputs unless dependencies change
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
            if (results && results.mask_output && results.mask_output.data) {
              const output = results.mask_output;
              const maskImg = onnxMaskToImage(output.data as Float32Array, image.width, image.height);
              setMaskImage(maskImg);
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

  useEffect(() => {
    if (maskImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(maskImage, 0, 0);
      }
    }
  }, [maskImage]);

  return (
    <div>
      <canvas ref={canvasRef} width={modelScale.width} height={modelScale.height} />
    </div>
  );
};

export default ImageSegmenter;

