//Interfaces.js
import { Tensor } from "onnxruntime-web";

const modelScaleProps = {
    samScale: 0,
    height: 0,
    width: 0
  };
  
  const modelInputProps = {
    x: 0,
    y: 0,
    clickType: 0
  };
  
  const modeDataProps = {
    clicks: [],
    tensor: null,
    modelScale: modelScaleProps
  };
  
  const ToolProps = {
    handleMouseMove: () => {}
  };
  
  export { modelScaleProps, modelInputProps, modeDataProps, ToolProps };
  
