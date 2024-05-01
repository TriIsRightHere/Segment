/* @ts-ignore */
// import npyjs from "npyjs";
// import { InferenceSession, Tensor } from "onnxruntime-web";
// import React, { useContext, useEffect, useState } from "react";
// import "./assets/scss/App.scss";
// import { handleImageScale } from "./components/helpers/scaleHelper";
// import { modelScaleProps } from "./components/helpers/Interfaces";
// import { onnxMaskToImage } from "./components/helpers/maskUtils";
// import { modelData } from "./components/helpers/onnxModelAPI";
// import Stage from "./components/Stage";
// import AppContext from "./components/hooks/createContext";
// const ort = require("onnxruntime-web");

// // Define image, embedding and model paths
// const IMAGE_PATH = "/assets/data/dogs.jpg";
// const IMAGE_EMBEDDING = "/assets/data/dogs_embedding.npy";
// const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx";

// const App = () => {
//   const {
//     clicks: [clicks],
//     image: [, setImage],
//     maskImg: [, setMaskImg],
//   } = useContext(AppContext)!;
//   const [model, setModel] = useState<InferenceSession | null>(null); // ONNX model
//   const [tensor, setTensor] = useState<Tensor | null>(null); // Image embedding tensor

//   // The ONNX model expects the input to be rescaled to 1024. 
//   // The modelScale state variable keeps track of the scale values.
//   const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

//   // Initialize the ONNX model. load the image, and load the SAM
//   // pre-computed image embedding
//   useEffect(() => {
//     // Initialize the ONNX model
//     const initModel = async () => {
//       try {
//         if (MODEL_DIR === undefined) return;
//         const URL: string = MODEL_DIR;
//         const model = await InferenceSession.create(URL);
//         setModel(model);
//       } catch (e) {
//         console.log(e);
//       }
//     };
//     initModel();

//     // Load the image
//     const url = new URL(IMAGE_PATH, location.origin);
//     loadImage(url);

//     // Load the Segment Anything pre-computed embedding
//     Promise.resolve(loadNpyTensor(IMAGE_EMBEDDING, "float32")).then(
//       (embedding) => setTensor(embedding)
//     );
//   }, []);

//   const loadImage = async (url: URL) => {
//     try {
//       const img = new Image();
//       img.src = url.href;
//       img.onload = () => {
//         const { height, width, samScale } = handleImageScale(img);
//         setModelScale({
//           height: height,  // original image height
//           width: width,  // original image width
//           samScale: samScale, // scaling factor for image which has been resized to longest side 1024
//         });
//         img.width = width; 
//         img.height = height; 
//         setImage(img);
//       };
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Decode a Numpy file into a tensor. 
//   const loadNpyTensor = async (tensorFile: string, dType: string) => {
//     let npLoader = new npyjs();
//     const npArray = await npLoader.load(tensorFile);
//     const tensor = new ort.Tensor(dType, npArray.data, npArray.shape);
//     return tensor;
//   };

//   // Run the ONNX model every time clicks has changed
//   useEffect(() => {
//     runONNX();
//   }, [clicks]);

//   const runONNX = async () => {
//     try {
//       if (
//         model === null ||
//         clicks === null ||
//         tensor === null ||
//         modelScale === null
//       )
//         return;
//       else {
//         // Preapre the model input in the correct format for SAM. 
//         // The modelData function is from onnxModelAPI.tsx.
//         const feeds = modelData({
//           clicks,
//           tensor,
//           modelScale,
//         });
//         if (feeds === undefined) return;
//         // Run the SAM ONNX model with the feeds returned from modelData()
//         const results = await model.run(feeds);
//         const output = results[model.outputNames[0]];
//         // The predicted mask returned from the ONNX model is an array which is 
//         // rendered as an HTML image using onnxMaskToImage() from maskUtils.tsx.
//         setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
//       }
//     } catch (e) {
//       console.log(e);
//     }
//   };

//   return <Stage />;
// };

// export default App;


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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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

  const loadImage = async (url) => {
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

  const loadNpyTensor = async (tensorFile, dType) => {
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
      const feeds = {
        clicks,
        tensor,
        modelScale,
      };
      const results = await model.run(feeds);
      const output = results[model.outputNames[0]];
      setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
    } catch (e) {
      console.log("Error running ONNX model:", e);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload}>Upload Image</button>
      <Stage />
    </div>
  );
};

export default App;