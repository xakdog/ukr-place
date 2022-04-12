import React from 'react';
import {useRecoilValue} from "recoil";

import {canvasPosState} from "../../state/canvas-pos.atom";

const PixelCoordinates: React.FC = () => {
  const pos = useRecoilValue(canvasPosState);
  const x = Math.floor(pos.vector.x);
  const y = Math.floor(pos.vector.y);

  return <div className="
    absolute top-6 right-0 left-0 m-auto w-fit
    bg-zinc-800 py-1 px-2 rounded
    text-white font-semibold text-bold tabular-nums
  ">
    ({x}, {y})
  </div>;
};

export default PixelCoordinates;

