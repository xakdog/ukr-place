import {useRecoilState} from "recoil";
import React, {useEffect, useRef} from 'react';

import {pixelChangesActions, pixelChangesState} from "../../state/pixel-changes.atom";

const LiveCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [changes, setChanges] = useRecoilState(pixelChangesState);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const runUpdates = async () => {
      const randomUpdateIds = Object.keys(changes.updates)
      const randomUpdates = Object.values(changes.updates);

      const updatesPromises = randomUpdates.map(async upd => {
        const image = await deserialize(upd.data);
        ctx.drawImage(image, upd.pos.x, upd.pos.y);
      });
      await Promise.all(updatesPromises);

      if (randomUpdateIds.length > 0) {
        setChanges(pixelChangesActions.cleanUpdates(randomUpdateIds));
      }

      const previewChanges = Object.values(changes.syncing);
      previewChanges.forEach(change => {
        ctx.fillStyle = change.color;
        ctx.fillRect(change.pos.x, change.pos.y, 1, 1);
      });
    };

    runUpdates()
      .catch(console.error);
  }, [canvasRef.current, changes.updates, changes.syncing]);

  return <canvas style={{ imageRendering: 'pixelated' }} ref={canvasRef} height="912" width="1280" />;
};

function deserialize(data: Blob): Promise<HTMLImageElement> {
  const img = new Image();

  return new Promise(resolve => {
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(data);
  });
}

export default LiveCanvas;
