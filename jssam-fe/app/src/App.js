import React, { useContext, useState, useEffect } from "react";
import "./App.css";
import { InferenceSession, Tensor } from "onnxruntime-web";
import npyjs from "npyjs";
import { handleImageScale } from "./components/helpers/scale";
import { modelScaleProps } from "./components/helpers/Interfaces";
import { onnxMaskToImage } from "./components/helpers/maskUtils";
import { modelData } from "./components/helpers/modelAPI";
import AppContext from "./components/hook/createContext";
const ort = require("onnxruntime-web");
// import * as ort from "onnxruntime-web";

const App = () => {
  const { setMaskImage } = useContext(AppContext);
  const [clicks, setClicks] = useState([]); // Tracks clicks for processing
  const [model, setModel] = useState(null); // Manages the ONNX model instance
  const [isLoading, setIsLoading] = useState(false); // Controls UI loading indicators
  const [imageURL, setImageURL] = useState(''); // Stores URL of the loaded image
  const [npyURL, setNpyURL] = useState(''); // Stores URL of the numpy file
  const [selectedFile, setSelectedFile] = useState(null); // Handles file selection
  const [modelScale, setModelScale] = useState(<modelScaleProps></modelScaleProps>); // Stores image scaling data

  // Initialize the ONNX model on component mount
  useEffect(() => {
    const initModel = async () => {
      try {
        const MODEL_DIR = "/model/sam_onnx_quantized_example.onnx";
        const model = await InferenceSession.create(MODEL_DIR);
        setModel(model);
      } catch (e) {
        console.error("Failed to initialize the ONNX model", e);
      }
    };
    initModel();
  }, []);

  // Handles file input changes
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handles file submission and uploads
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        setImageURL(result.image_url);
        setNpyURL(result.npy_url);
        await loadImage(result.image_url);
        await loadNpyData(result.npy_url);
      } else {
        alert('Server response: ' + result.message);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loads image and sets scaling properties
  const loadImage = async (url) => {
    try {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const scaleProps = handleImageScale(img);
        setModelScale(scaleProps);
      };
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

  // Loads numpy data and triggers model execution
  const loadNpyData = async (url) => {
    try {
      const npLoader = new npyjs();
      const npArray = await npLoader.load(url);
      const tensor = new Tensor("float32", npArray.data, npArray.shape);
      runONNX(tensor);
    } catch (error) {
      console.error("Error loading .npy file:", error);
    }
  };

  // Triggered by changes to clicks; runs the model
  useEffect(() => {
    runONNX();
  }, [clicks]);

  // ONNX model execution
  const runONNX = async (tensor) => {
    if (!model || !modelScale || !tensor) return;
    const inputData = modelData({
      tensor: tensor,
      modelScale: modelScale
    });

    try {
      const output = await model.run({input: inputData});
      const maskImage = onnxMaskToImage(output);
      setMaskImage(maskImage);
    } catch (error) {
      console.error("Error during ONNX inference:", error);
    }
  };

  // Component's render method
  return (
    <div className="App">
      <header className="App-header">
        {isLoading ? (
          <p>Image is being processed, please wait...</p>
        ) : (
          <>
            {imageURL && <img src={imageURL} alt="Uploaded" />}
            <form onSubmit={handleSubmit}>
              <input type="file" onChange={handleFileChange} />
              <button type="submit">Upload</button>
            </form>
          </>
        )}
      </header>
    </div>
  );
};

export default App;


// import React, { useContext, useEffect, useState } from "react";
// import './App.css';
// import { InferenceSession, Tensor } from "onnxruntime-web";
// import npyjs from "npyjs";
// import { handleImageScale } from "./components/helpers/scale";
// import { modelScaleProps } from "./components/helpers/Interfaces";
// import { onnxMaskToImage } from "./components/helpers/maskUtils";
// import { modelData } from "./components/helpers/modelAPI";
// import Stage from "./components/Stage";
// import AppContext from "./components/hooks/createContext";
// const ort = require("onnxruntime-web");



// function App() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [imageURL, setImageURL] = useState('');
//   const [embedURL, setEmbedURL]  =useState('');
  

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     if (!selectedFile) {
//       alert('Please select a file first!');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', selectedFile);

//     setIsLoading(true); // Start loading

//     try {
//       const response = await fetch('http://localhost:5000/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();
//       if (response.ok) {
//         setImageURL(result.fileUrl); // Assuming the server sends back the URL of the image
        
//       } else {
//         alert('Response from server: ' + result.message);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('An error occurred while uploading the file.');
//     } finally {
//       setIsLoading(false); // End loading
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         {isLoading ? (
//           <p>Image is being processed, please wait a minute...</p>
//         ) : imageURL ? (
//           <>
//             <p>Image uploaded successfully!</p>
//             <img src={imageURL} alt="Uploaded" />
//           </>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <input type="file" onChange={handleFileChange} />
//             <button type="submit">Upload</button>
//           </form>
//         )}
//       </header>
//     </div>
//   );
// }

// export default App;
//App.js