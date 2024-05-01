//createContext.js
import React, { createContext, useState, useContext } from "react";

const AppContext = createContext({
    clicks: 0,
    image: null,
    maskImg: null,
    setClicks: () => {},
    setImage: () => {},
    setMaskImg: () => {}
});

export const AppProvider = ({ children }) => {
    const [clicks, setClicks] = useState(0);
    const [image, setImage] = useState(null);
    const [maskImg, setMaskImg] = useState(null);

    const value = {
        clicks,
        image,
        maskImg,
        setClicks,
        setImage,
        setMaskImg
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

export default AppContext;