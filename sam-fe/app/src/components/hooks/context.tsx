import React, { useState } from "react";
import { modelInputProps } from "../helpers/Interfaces";
import AppContext from "./createContext";

const AppContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  //const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [clicks, setClicks] = useState<Array<modelInputProps>>([]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);

  return (
    <AppContext.Provider
      value={{
        clicks: [clicks, setClicks],
        image: [image, setImage],
        maskImg: [maskImg, setMaskImg],
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;