import React from 'react';
import {Vector} from "vecti";
import {useRecoilCallback, useRecoilValue, useSetRecoilState} from "recoil";

import {pixelChangesActions, pixelChangesState} from "../../state/pixel-changes.atom";
import {paletteColorState} from "../palette-bar/palette-bar";
import {canvasPosState} from "../../state/canvas-pos.atom";

const PixelPlaceBtn: React.FC = () => {
  const color = useRecoilValue(paletteColorState);
  const setPendingPixels = useSetRecoilState(pixelChangesState);

  const savePixel = useRecoilCallback(({snapshot}) => async () => {
    const pos = await snapshot.getPromise(canvasPosState);
    const randomId = (Math.random() + 1).toString(36).substring(7);

    const roundedPos = new Vector(
      Math.floor(pos.vector.x),
      Math.floor(pos.vector.y),
    );

    setPendingPixels(pixelChangesActions.paintPixel(color, roundedPos, randomId));
  }, [color, setPendingPixels]);

  if (color === 'transparent')
    return null;

  return <div className="
    absolute top-16 left-0 right-0
    flex justify-center
  ">
    <button onClick={savePixel} className="
        inline-flex justify-center px-4 py-2
        text-sm font-medium text-white
        bg-indigo-600 rounded-md bg-opacity-80 hover:bg-opacity-90
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75

        ring-white ring-2 ring-opacity-10 backdrop-blur
    ">
      Save the pixel
    </button>
  </div>;
};

export default PixelPlaceBtn;
