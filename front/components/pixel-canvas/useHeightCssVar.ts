import {useEffect} from "react";

export const useHeightCssVar = () => {
  useEffect(() => {
    const doc = document.documentElement;
    const appHeight = () => {
      doc.style.setProperty('--app-height', `${window.innerHeight}px`);
    };

    appHeight();
    window.addEventListener('resize', appHeight);

    return () => {
      doc.style.removeProperty('--app-height');
      window.removeEventListener('resize', appHeight);
    }
  }, []);
};
