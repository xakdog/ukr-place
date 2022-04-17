import React, {useCallback} from 'react';
import {useRecoilCallback, useRecoilState, useRecoilValue} from "recoil";
import {PaperAirplaneIcon, PlusIcon, TrashIcon} from "@heroicons/react/outline";

import {pixelChangesActions, pixelChangesState, PixelSyncStatus} from "../../state/pixel-changes.atom";
import {paletteColorState} from "../palette-bar/palette-bar";
import {canvasPosState} from "../../state/canvas-pos.atom";
import {useWallet} from "@solana/wallet-adapter-react";

const PixelPlaceBtn: React.FC = () => {
  const wallet = useWallet();
  const color = useRecoilValue(paletteColorState);
  const [pixelState, setPixelState] = useRecoilState(pixelChangesState);

  const isPending = pixelState.syncStatus === PixelSyncStatus.AWAITING_CONFIRMATION;
  const isTrashEnabled = !isPending && Object.keys(pixelState.syncing).length > 0;
  const isSendEnabled = !isPending && Object.keys(pixelState.syncing).length > 0;
  const isAddAvailable = !isPending && Object.keys(pixelState.syncing).length < 8;

  const paintPixel = useCallback(() => {
    setPixelState(pixelChangesActions.setStatus(PixelSyncStatus.COMMIT_CHANGES));
  }, []);

  const cleanPixels = useCallback(() => {
    setPixelState(pixelChangesActions.cleanSyncing('all'));
  }, []);

  const savePixel = useRecoilCallback(({snapshot}) => async () => {
    const pos = await snapshot.getPromise(canvasPosState);
    const randomId = (Math.random() + 1).toString(36).substring(7);

    setPixelState(pixelChangesActions.paintPixel(color, pos.vector, randomId));
  }, [color, setPixelState]);

  if (!wallet.connected)
    return null;

  if (color === 'transparent')
    return null;

  return <>
    <button onClick={savePixel} disabled={!isAddAvailable} className={buttonStyle} title="Paint draft">
      <PlusIcon className="h-5 w-5" />
    </button>

    <button onClick={paintPixel} disabled={!isSendEnabled} className={buttonStyle} title="Publish pixels">
      <PaperAirplaneIcon className="h-5 w-5" />
    </button>

    <button onClick={cleanPixels} disabled={!isTrashEnabled} className={buttonStyle} title="Erase pixels">
      <TrashIcon className="h-5 w-5" />
    </button>
  </>;
};

const buttonStyle = `
  inline-flex justify-center items-center px-3
  text-sm font-medium text-zinc-100 disabled:text-opacity-40
  rounded-md bg-zinc-900 bg-opacity-80 hover:bg-opacity-90 disabled:hover:bg-opacity-80
  focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75

  ring-white ring-2 ring-opacity-10 backdrop-blur
`;

export default PixelPlaceBtn;
