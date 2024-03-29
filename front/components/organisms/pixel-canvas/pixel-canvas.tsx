import React, { useCallback, useMemo, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Image from "next/image";

import { useHeightCssVar } from "./use-height-css-var";
import { useCanvasNav } from "./use-canvas-nav";
import styles from "./pixel-canvas.module.css";

import LiveCanvas, {
  AllCanvasUpdates,
  IMAGE_HEIGHT,
  IMAGE_WIDTH,
} from "../../cells/live-canvas/live-canvas";
import { paletteColorState } from "../../cells/palette-bar/palette-bar";
import { canvasPosState } from "../../../state/canvas-pos.atom";
import {
  pixelChangesActions,
  pixelChangesState,
} from "../../../state/pixel-changes.atom";

const PixelCanvas: React.FC<{ onClick(): void }> = ({ onClick }) => {
  const imgRef = useRef<HTMLDivElement | null>(null);

  useHeightCssVar();
  useCanvasNav({ container: imgRef, onClick });

  const [changes, setChanges] = useRecoilState(pixelChangesState);

  const userPixelUpdates = useMemo(
    () => ({ pixels: changes.syncing }),
    [changes.syncing]
  );
  const baseCanvasUpdates = useMemo(
    () => ({ tiles: changes.updates }),
    [changes.updates]
  );

  const afterBaseUpdate = useCallback(
    (updates: AllCanvasUpdates) => {
      if (updates.tiles) {
        const updatedTileIds = Object.keys(updates.tiles);
        setChanges(pixelChangesActions.cleanUpdates(updatedTileIds));
      }
    },
    [setChanges]
  );

  return (
    <div className={styles.container} data-testid="pixel-canvas">
      <div className={styles.content} ref={imgRef}>
        <PlacedPixel />
        <Image
          className={styles.mapOverlay}
          height={IMAGE_HEIGHT}
          width={IMAGE_WIDTH}
          src="/ukraine-outline.svg"
        />
        <LiveCanvas
          updates={baseCanvasUpdates}
          onUpdateDone={afterBaseUpdate}
        />
        <LiveCanvas updates={userPixelUpdates} />
      </div>
    </div>
  );
};

const PlacedPixel: React.FC = () => {
  const color = useRecoilValue(paletteColorState);
  const pos = useRecoilValue(canvasPosState);

  const opacity = pos.outOfBounds ? 0 : 1;
  const transform = `translate(${pos.vector.x}px, ${pos.vector.y}px)`;

  if (color === "transparent") return null;

  return (
    <div
      className={styles.pixel}
      style={{ opacity, transform, backgroundColor: color }}
    />
  );
};

export default PixelCanvas;
