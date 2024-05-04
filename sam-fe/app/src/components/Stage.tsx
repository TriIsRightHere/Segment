import React, { useContext } from "react";
import * as _ from "underscore";
import Tool from "./Tool";
import { modelInputProps } from "./helpers/Interfaces";
import AppContext from "./hooks/createContext";

const Stage = () => {
  const {
    clicks: [, setClicks],
    image: [image],
  } = useContext(AppContext)!;

  const getClicks = (x: number, y: number): modelInputProps => {
    const clickType = 1;
    return { x, y, clickType };
  };

  // Get mouse position and scale the (x, y) coordinates back to the natural
  // scale of the image. Update the state of clicks with setClicks to trigger
  // the ONNX model to run and generate a new mask via a useEffect in App.tsx
  const handleMouseMove = _.throttle((e: any) => {
    let el = e.nativeEvent.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;
    const click = getClicks(x, y);
    //console.log(click);
    if (click) setClicks([click]);
  }, 15);

  const handleClick = _.throttle((e: any) => {
    let el = e.target;
    const rect = el.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const imageScale = image ? image.width / el.offsetWidth : 1;
    x *= imageScale;
    y *= imageScale;

    const clicks = getClicks(x, y);
    setClicks([clicks]); 
    console.log(clicks);
  },100);



  const flexCenterClasses = "flex items-center justify-center";
  return (
  <div className={`${flexCenterClasses} w-full h-full`} onClick={handleClick} style={{ cursor: 'pointer' }}>
    <div className={`${flexCenterClasses} relative w-[90%] h-[90%]`}>
      <Tool handleMouseMove={handleMouseMove} handleClick={handleClick}/>
    </div>
  </div>
  );
};

export default Stage;