import { Dispatch, SetStateAction, createContext } from "react";
import { modelInputProps } from "../helpers/Interfaces";

interface contextProps {
  // clicks: [
  //   clicks: modelInputProps[] | null,
  //   setClicks: (e: modelInputProps[] | null) => void
  // ];
  clicks: [
    clicks: modelInputProps[],
    setClicks: Dispatch<SetStateAction<modelInputProps[]>>
  ];
  image: [
    image: HTMLImageElement | null,
    setImage: (e: HTMLImageElement | null) => void
  ];
  maskImg: [
    maskImg: HTMLImageElement | null,
    setMaskImg: (e: HTMLImageElement | null) => void
  ];
}

const defaultState: contextProps = {
  clicks: [[], () => {}],  // Add Clicks prop
  image: [null, () => {}],
  maskImg: [null, () => {}]
};
// const AppContext = createContext<contextProps | null>(null);
const AppContext = createContext<contextProps>(defaultState);

export default AppContext;