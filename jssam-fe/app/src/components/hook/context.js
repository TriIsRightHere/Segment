//context.js
import React, { useState } from "react";
import AppContext from "./createContext";

const AppContextProvider = (props) => {
  const [clicks, setClicks] = useState(null);
  const [image, setImage] = useState(null);
  const [maskImg, setMaskImg] = useState(null);

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
