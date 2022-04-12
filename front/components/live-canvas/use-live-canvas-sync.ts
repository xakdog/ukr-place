import {useEffect, useMemo} from "react";
import {useRecoilState} from "recoil";

import {AbstractCanvasSyncer} from "./fake-syncer";
import {pixelChangesActions, pixelChangesState, PixelSyncStatus} from "../../state/pixel-changes.atom";

const setStatusConfirmed = pixelChangesActions.setStatus(PixelSyncStatus.CHANGES_CONFIRMED);
const setStatusAwaitingConfirm = pixelChangesActions.setStatus(PixelSyncStatus.AWAITING_CONFIRMATION);
const setStatusAcceptingChanges = pixelChangesActions.setStatus(PixelSyncStatus.CHANGES_CONFIRMED);

export const useLiveCanvasSync = (buildSyncer: () => AbstractCanvasSyncer) => {
  const [pixels, updatePixels] = useRecoilState(pixelChangesState);
  const syncer = useMemo(() => buildSyncer(), [buildSyncer]);

  useEffect(() => console.warn("Syncer changed"), [syncer]);

  useEffect(() => {
    syncer.setCallbacks({
      onUpdate: (changes, key) => updatePixels(pixelChangesActions.updateTile(changes, key)),

      onPaintRequest: () => updatePixels(setStatusAwaitingConfirm),
      onPaintSuccess: (lockPeriod) => {
        updatePixels(setStatusConfirmed);

        setTimeout(() => updatePixels(setStatusAcceptingChanges), lockPeriod);
      },
      onPaintError: () => {},
    });
    syncer.run();

    return () => syncer.stop();
  }, [syncer, updatePixels]);

  useEffect(() => {
    if (pixels.syncStatus === PixelSyncStatus.COMMIT_CHANGES) {
      syncer.paintPixels(pixels.syncing);
    }
  }, [pixels.syncStatus, pixels.syncing, syncer]);
};
