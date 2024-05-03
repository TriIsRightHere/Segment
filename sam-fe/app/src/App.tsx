/* @ts-ignore */
import npyjs from "npyjs";
import { InferenceSession, Tensor } from "onnxruntime-web";
import React, { useContext, useEffect, useState } from "react";
import "./assets/scss/App.scss";
import { handleImageScale } from "./components/helpers/scaleHelper";
import { modelScaleProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/onnxModelAPI";
import Stage from "./components/Stage";
import AppContext from "./components/hooks/createContext";
import ImageSegmenter from "./components/ImageSegmenter";
import { createConnection } from "net";
const ort = require("onnxruntime-web");

// Define image, embedding and model paths
const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx";

const App = () => {
  const {
    clicks: [clicks],
    image: [, setImage],
    maskImg: [, setMaskImg],
  } = useContext(AppContext)!;

  const [model, setModel] = useState<InferenceSession | null>(null);
  const [tensor, setTensor] = useState<Tensor | null>(null);
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState("");
  const [processedImage, setProcessedImage] = useState<string>('');

  useEffect(() => {
    // Initialize the ONNX model
    const initModel = async () => {
      try {
        const URL = MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
    };

    initModel();
  }, []);

  // const handleFileChange = (event: any) => {
  //   setSelectedFile(event.target.files[0]);
  // };
  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const objectURL = URL.createObjectURL(file);
      setImageSrc(objectURL);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("File uploaded and processed:", data);
      loadImage(new URL(data.image_url));
      loadNpyTensor(data.npy_url, "float32");  
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload image");
    }
  };

  const loadImage = async (url: URL) => {
    try {
      const img = new Image();
      img.src = url.href;
      img.onload = () => {
        const { height, width, samScale } = handleImageScale(img);
        setModelScale({
          height,  // original image height
          width,  // original image width
          samScale, // scaling factor for image resized to longest side 1024
        });
        img.width = width; 
        img.height = height; 
        setImage(img);
        
      };
    } catch (error) {
      console.log("Error loading image:", error);
    }
  };

  const loadNpyTensor = async (tensorFile: string, dType: string) => {
    let npLoader = new npyjs();
    try {
      const npArray = await npLoader.load(tensorFile);
      const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
      setTensor(tensor);
    } catch (error) {
      console.error("Error loading .npy file:", error);
    }
  };
  
  
  useEffect(() => {
    if (model && tensor && modelScale && clicks !== undefined) {
      runONNX();
    }
  }, [clicks, model, tensor, modelScale]);

  const runONNX = async () => {
        try {
          if (
            model === null ||
            clicks === null ||
            tensor === null ||
            modelScale === null
          )
            return;
          else {
            // Preapre the model input in the correct format for SAM. 
            // The modelData function is from onnxModelAPI.tsx.
            const feeds = modelData({
              clicks,
              tensor,
              modelScale,
            });
            if (feeds === undefined) return;
            // Run the SAM ONNX model with the feeds returned from modelData()
            const results = await model.run(feeds);
            const output = results[model.outputNames[0]];
            //console.log("output data:\n", output.data);
            // The predicted mask returned from the ONNX model is an array which is 
            // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
            setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
            // console.log(maskImg);
          }
        } catch (e) {
          console.log(e);
        }

  };
  const handleCutout = (cutout: any) => {
    // Handle cutout data
    console.log('Cutout data:', cutout);
  };
  return (

    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload}>Upload Image</button>
      <Stage/>
      {imageSrc && model && tensor && modelScale && (
    <ImageSegmenter
      imageSrc={imageSrc}
      model={model}
      tensor={tensor}
      modelScale={modelScale}
      clicks={clicks || []}
      onCutout={handleCutout}
    />
  )}
    </div>
  );
};

export default App;




