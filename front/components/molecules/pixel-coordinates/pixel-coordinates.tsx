import React from "react";
import { useRecoilValue } from "recoil";
import { canvasPosState } from "../../../state/canvas-pos.atom";
import {
  pixelChangesState,
  PixelSyncStatus,
} from "../../../state/pixel-changes.atom";

const MAX_PIXELS = 8;

const PixelCoordinates: React.FC = () => {
  const pos = useRecoilValue(canvasPosState);
  const { syncing, syncStatus } = useRecoilValue(pixelChangesState);
  const isPending = syncStatus === PixelSyncStatus.AWAITING_CONFIRMATION;
  const paintedPixels = Object.keys(syncing).length;

  return (
    <div
      className={`
    self-center ${isPending ? "animate-pulse" : ""}
    bg-zinc-800 py-1 px-2 rounded-md
    text-white font-semibold text-bold tabular-nums
  `}
    >
      ({pos.vector.x}, {pos.vector.y}){" "}
      <span className="font-medium text-zinc-200">
        {paintedPixels}&thinsp;/&thinsp;{MAX_PIXELS}
      </span>
    </div>
  );
};

export default PixelCoordinates;
