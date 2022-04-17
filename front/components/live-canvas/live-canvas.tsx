import React, {useEffect, useRef, useState} from 'react';
import {
  PixelChange,
  TileChange,
  UniqueKey
} from "../../state/pixel-changes.atom";

export const IMAGE_WIDTH = 1280;
export const IMAGE_HEIGHT = 912;

export type AllCanvasUpdates = {
  tiles?: Record<UniqueKey, TileChange>,
  pixels?: Record<UniqueKey, PixelChange>,
};

type LiveCanvasProps = {
  updates: AllCanvasUpdates;
  onUpdateDone?(updates: AllCanvasUpdates): void;
};

const LiveCanvas: React.FC<LiveCanvasProps> = ({ updates, onUpdateDone }) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [isUpdating, setIsUpdating] = useState(false);

  const updatedTiles = updates.tiles ? Object.values(updates.tiles) : null;
  const updatedPixels = updates.pixels ? Object.values(updates.pixels) : null;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (isUpdating) return;

    if (updatedTiles < 1 && updatedPixels == null)
      return;

    const runUpdates = async () => {
      setIsUpdating(true);

      if (updatedTiles && updatedTiles.length > 0) {
        const updatesPromises = updatedTiles.map(async upd => {
          const image = await deserialize(upd.data);
          ctx.drawImage(image, upd.pos.x, upd.pos.y);
        });

        await Promise.all(updatesPromises);
        onUpdateDone?.(updates);
      }

      if (updatedPixels != null) {
        ctx.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
        updatedPixels.forEach(change => {
          ctx.fillStyle = change.color;
          ctx.fillRect(change.pos.x, change.pos.y, 1, 1);
        });
        onUpdateDone?.(updates);
      }

      setIsUpdating(false);
    };

    runUpdates()
      .catch(console.error);
  }, [isUpdating, canvasRef.current, updatedTiles, updatedPixels]);

  return <canvas
    className="absolute top-0 left-0"
    height={IMAGE_HEIGHT}
    width={IMAGE_WIDTH}
    ref={canvasRef}
    style={{ imageRendering: 'pixelated' }}
  />;
};

function deserialize(data: Blob): Promise<HTMLImageElement> {
  const img = new Image();

  return new Promise(resolve => {
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(data);
  });
}

export default LiveCanvas;
