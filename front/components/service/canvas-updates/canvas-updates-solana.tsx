import React, { useCallback, useEffect } from "react";
import { Vector } from "vecti";
import { useSetRecoilState } from "recoil";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { AnchorWallet, useConnection } from "@solana/wallet-adapter-react";

import {
  pixelChangesActions,
  pixelChangesState,
  TileChange,
} from "../../../state/pixel-changes.atom";
import { pixelChangesTransform } from "../../../state/pixel-changes.transform";

import CanvasTile from "../../../types/idl/canvas_tile.json";

/**
 * Subscribes for changes on Solana blockchain and updates the LiveCanvas component.
 * @constructor
 */
export const CanvasUpdatesSolana: React.FC = () => {
  const { connection } = useConnection();
  const updatePixels = useSetRecoilState(pixelChangesState);

  const updateTile = useCallback(
    (changes: TileChange) => {
      const randomId = (Math.random() + 1).toString(36).substring(7);
      updatePixels(pixelChangesActions.updateTile(changes, randomId));
    },
    [updatePixels]
  );

  useEffect(() => {
    const programId = new PublicKey(CanvasTile.metadata.address);
    const provider = new AnchorProvider(
      connection,
      {} as AnchorWallet,
      AnchorProvider.defaultOptions()
    );
    const canvasTile = new Program(
      // @ts-ignore
      CanvasTile,
      CanvasTile.metadata.address,
      provider
    );

    connection
      .getProgramAccounts(programId)
      .then((res) =>
        res.map((rec) =>
          canvasTile.coder.accounts.decode(
            "CanvasTile",
            rec.account.data as Buffer
          )
        )
      )
      .then((res) =>
        Promise.all(
          res.map((c) =>
            pixelChangesTransform.colorsArrayToImage(
              c.pixels,
              new Vector(c.position.x, c.position.y)
            )
          )
        )
      )
      .then((res) => {
        res.forEach((r) => r && updateTile(r));
      })
      .catch(console.error);

    connection.onProgramAccountChange(programId, (change) => {
      const acc = canvasTile.coder.accounts.decode(
        "CanvasTile",
        change.accountInfo.data as Buffer
      );
      const tile = pixelChangesTransform.colorsArrayToImage(
        acc.pixels,
        new Vector(acc.position.x, acc.position.y)
      );

      tile.then((t) => t && updateTile(t)).catch(console.error);
    });
  }, [connection, updateTile]);

  return null;
};
