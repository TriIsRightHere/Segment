const handleImageScale = (image) => {
    const LONG_SIDE_LENGTH = 1024;
    let w = image.naturalWidth;
    let h = image.naturalHeight;
    const samScale = LONG_SIDE_LENGTH / Math.max(h, w);
    return { height: h, width: w, samScale };
};
  
export { handleImageScale };
