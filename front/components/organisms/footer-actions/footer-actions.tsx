import React from "react";
import PixelCoordinates from "../../molecules/pixel-coordinates/pixel-coordinates";
import PixelPlaceBtn from "../../cells/pixel-place-btn/pixel-place-btn";
import PaletteBar from "../../cells/palette-bar/palette-bar";

export const FooterActions: React.FC = () => (
  <div
    className="
    flex flex-col items-center
    absolute bottom-0 right-0 left-0
  "
  >
    <div
      className="
      m-auto w-fit
      flex flex-row gap-2
    "
    >
      <PixelCoordinates />
      <PixelPlaceBtn />
    </div>

    <PaletteBar />
  </div>
);
