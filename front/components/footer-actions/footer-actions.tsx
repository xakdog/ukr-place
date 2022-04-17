import React from "react";
import PixelCoordinates from "../pixel-coordinates/pixel-coordinates";
import PixelPlaceBtn from "../pixel-place-btn/pixel-place-btn";
import PaletteBar from "../palette-bar/palette-bar";

export const FooterActions: React.FC = () =>
  <div className="
    flex flex-col items-center
    absolute bottom-0 right-0 left-0
  ">
    <div className="
      m-auto w-fit
      flex flex-row gap-2
    ">
      <PixelCoordinates />
      <PixelPlaceBtn />
    </div>

    <PaletteBar />
  </div>;
