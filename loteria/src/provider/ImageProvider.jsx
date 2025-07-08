import React, { createContext, useContext, useMemo, useCallback } from 'react';

// 1. Import your images.
// Make sure the path is correct based on your file structure.
import image_1 from '../assets/cards/1_el_gallo.png';
import image_2 from '../assets/cards/2_el_diablito.png';
import image_3 from '../assets/cards/3_la_dama.png';
import image_4 from '../assets/cards/4_el_catrin.png';
import image_5 from '../assets/cards/5_el_paraguas.png';
import image_6 from '../assets/cards/6_la_sirena.png';
import image_7 from '../assets/cards/7_la_escalera.png';
import image_8 from '../assets/cards/8_la_botella.png';
import image_9 from '../assets/cards/9_el_barril.png';
import image_10 from '../assets/cards/10_el_arbol.png';
import image_11 from '../assets/cards/11_el_melon.png';
import image_12 from '../assets/cards/12_el_valiente.png';
import image_13 from '../assets/cards/13_el_gorrito.png';
import image_14 from '../assets/cards/14_la_muerte.png';
import image_15 from '../assets/cards/15_la_pera.png';
import image_16 from '../assets/cards/16_la_bandera.png';
import image_17 from '../assets/cards/17_el_bandolon.png';
import image_18 from '../assets/cards/18_el_violoncello.png';
import image_19 from '../assets/cards/19_la_garza.png';
import image_20 from '../assets/cards/20_el_pajarito.png';
import image_21 from '../assets/cards/21_la_mano.png';
import image_22 from '../assets/cards/22_la_bota.png';
import image_23 from '../assets/cards/23_la_luna.png';
import image_24 from '../assets/cards/24_el_cotorro.png';
import image_25 from '../assets/cards/25_el_borracho.png';
import image_26 from '../assets/cards/26_el_negrito.png';
import image_27 from '../assets/cards/27_el_corazon.png';
import image_28 from '../assets/cards/28_la_sandia.png';
import image_29 from '../assets/cards/29_el_tambor.png';
import image_30 from '../assets/cards/30_el_camaron.png';
import image_31 from '../assets/cards/31_las_jaras.png';
import image_32 from '../assets/cards/32_el_musico.png';
import image_33 from '../assets/cards/33_la_arana.png';
import image_34 from '../assets/cards/34_el_soldado.png';
import image_35 from '../assets/cards/35_la_estrella.png';
import image_36 from '../assets/cards/36_el_cazo.png';
import image_37 from '../assets/cards/37_el_mundo.png';
import image_38 from '../assets/cards/38_el_apache.png';
import image_39 from '../assets/cards/39_el_nopal.png';
import image_40 from '../assets/cards/40_el_alacran.png';
import image_41 from '../assets/cards/41_la_rosa.png';
import image_42 from '../assets/cards/42_la_calavera.png';
import image_43 from '../assets/cards/43_la_campana.png';
import image_44 from '../assets/cards/44_el_cantarito.png';
import image_45 from '../assets/cards/45_el_venado.png';
import image_46 from '../assets/cards/46_el_sol.png';
import image_47 from '../assets/cards/47_la_corona.png';
import image_48 from '../assets/cards/48_la_chalupa.png';
import image_49 from '../assets/cards/49_el_pino.png';
import image_50 from '../assets/cards/50_el_pescado.png';
import image_51 from '../assets/cards/51_la_palma.png';
import image_52 from '../assets/cards/52_la_maceta.png';
import image_53 from '../assets/cards/53_el_arpa.png';
import image_54 from '../assets/cards/54_la_rana.png';


// 2. Create a map of the images with unique IDs.
// Using a map/object is more robust than an array for non-numeric IDs.
const imageMap = {
  1: image_1,
  2: image_2,
  3: image_3,
  4: image_4,
  5: image_5,
  6: image_6,
  7: image_7,
  8: image_8,
  9: image_9,
  10: image_10,
  11: image_11,
  12: image_12,
  13: image_13,
  14: image_14,
  15: image_15,
  16: image_16,
  17: image_17,
  18: image_18,
  19: image_19,
  20: image_20,
  21: image_21,
  22: image_22,
  23: image_23,
  24: image_24,
  25: image_25,
  26: image_26,
  27: image_27,
  28: image_28,
  29: image_29,
  30: image_30,
  31: image_31,
  32: image_32,
  33: image_33,
  34: image_34,
  35: image_35,
  36: image_36,
  37: image_37,
  38: image_38,
  39: image_39,
  40: image_40,
  41: image_41,
  42: image_42,
  43: image_43,
  44: image_44,
  45: image_45,
  46: image_46,
  47: image_47,
  48: image_48,
  49: image_49,
  50: image_50,
  51: image_51,
  52: image_52,
  53: image_53,
  54: image_54,
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

    return <img src={imageSrc} {...props} alt={props.alt || `Image ${imageId}`} className='aspect-[10/13] w-auto max-h-full max-w-full h-full object-cover'/>;
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