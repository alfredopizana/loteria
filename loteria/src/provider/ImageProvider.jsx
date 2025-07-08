import React, { createContext, useContext, useMemo, useCallback } from 'react';

// 1. Import your images.
// Make sure the path is correct based on your file structure.
import image1 from '../assets/cards/1_el_gallo.png';


// 2. Create a map of the images with unique IDs.
// Using a map/object is more robust than an array for non-numeric IDs.
const imageMap = {
  1: image1,

};

// 3. Create the context
const ImageContext = createContext(null);

/**
 * The ImageProvider component that makes the image retrieval function
 * available to all child components.
 */
export const ImageProvider = ({ children }) => {
  /**
   * Returns an <img> JSX element for a given imageId.
   * @param {string} imageId - The ID of the image to retrieve from the imageMap.
   * @param {object} props - Additional props to pass to the <img> element (e.g., alt, className).
   * @returns {JSX.Element|null} - The <img> element or null if the ID is not found.
   */
  const getImageById = useCallback((imageId, props = {}) => {
    const imageSrc = imageMap[imageId];

    if (!imageSrc) {
      console.warn(`Image with id "${imageId}" not found.`);
      return null; // Or return a placeholder image component
    }

    return <img src={imageSrc} {...props} alt={props.alt || `Image ${imageId}`} />;
  }, []);

  // useMemo ensures the context value object is not recreated on every render.
  const value = useMemo(() => ({ getImageById }), [getImageById]);

  return <ImageContext.Provider value={value}>{children}</ImageContext.Provider>;
};

/**
 * Custom hook to easily access the image context.
 */
export const useImages = () => {
  const context = useContext(ImageContext);
  if (context === undefined) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};