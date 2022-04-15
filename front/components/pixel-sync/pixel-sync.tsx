import React, {useEffect} from "react";
import {useRecoilState} from "recoil";
import {Vector} from "vecti";
import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";

import {pixelChangesActions, pixelChangesState, PixelSyncStatus} from "../../state/pixel-changes.atom";

import {WalletProgram} from "../wallet-program/use-wallet-program";
import {pixelChangesTransform, TileChangeReq} from "../../state/pixel-changes.transform";

export const PixelSync: React.FC<{ ctx: WalletProgram; refreshInk(): void; }> = ({ ctx, refreshInk }) => {
  const [state, setState] = useRecoilState(pixelChangesState);

  useEffect(() => {
    if (Object.keys(state.syncing).length === 0) return;
    if (state.syncStatus !== PixelSyncStatus.COMMIT_CHANGES) return;

    const runShit = async () => {
      const keysToUpdate = Object.keys(state.syncing);
      const changeReqs = pixelChangesTransform.groupTileChanges(state.syncing);

      const res = await anchor.syncTiles(ctx, changeReqs);
      await ctx.provider.connection.confirmTransaction(res);

      refreshInk();
      setState(pixelChangesActions.cleanSyncing(keysToUpdate));

      const pdas = await Promise.all(changeReqs.map(change => anchor.findPda(ctx, change.tilePos)));
      const duck = await anchor.getTiles(ctx, pdas);

      const repaints = await Promise.all(Object
        .values(duck)
        .map((c) => pixelChangesTransform.colorsArrayToImage(c.pixels, new Vector(c.position.x, c.position.y)))
      );

      for (let repaint of repaints) {
        if (repaint) {
          const randomId = (Math.random() + 1).toString(36).substring(7);
          setState(pixelChangesActions.updateTile(repaint, randomId));
        }
      }
    };

    runShit()
      .catch(console.error);
  }, [state, ctx.inkWallet, state.syncStatus, refreshInk]);


  return null;
};

const anchor = {
  syncTiles: async (ctx: WalletProgram, changes: TileChangeReq[]) => {
    const changesWithPda = await Promise.all(
      changes.map(change =>
        anchor
          .findPda(ctx, change.tilePos)
          .then(pda => ({ ...change, pda }))
      )
    );

    const signers: Keypair[] = [];
    const tx = new Transaction();

    const allTilesPda = changesWithPda.map(({ pda }) => pda);
    const tileExist = await anchor.getTilesExistence(ctx, allTilesPda);

    for (let change of changesWithPda) {
      const { pda, tilePos, image } = change;
      const key = pda.toBase58();

      if (!tileExist[key]) {
        tx.add(await anchor.createTileIx(ctx, pda, tilePos));
      }

      tx.add(await anchor.paintPixelsIx(ctx, pda, tilePos, image));
    }

    signers.push(ctx.inkWallet);

    const res = await ctx.provider.sendAll([{ tx, signers }]);

    console.log("Success tx:", res);

    return res[0];
  },

  findPda: async (ctx: WalletProgram, pos: Vector) => {
    const seed = `canvas-tile-${pos.x}:${pos.y}`;
    const [pda, bump] = await PublicKey.findProgramAddress([seed], ctx.ukrPlace.id);

    return pda;
  },

  getTiles: async (ctx: WalletProgram, pdas: PublicKey[]) => {
    const res = await ctx.canvasTile.program.account.canvasTile.fetchMultiple(pdas);

    return pdas
      .map((pda, idx) => ({ pda, tile: res[idx] }))
      .reduce((acc, { pda, tile }): Record<string, { pixels: number[][], position: { x: number; y: number; } }> => {
        acc[pda.toBase58()] = tile;

        return acc;
      }, {});
  },

  getTilesExistence: async (ctx: WalletProgram, pdas: PublicKey[]) => {
    const res: Record<string, boolean> = {};
    const tiles = await anchor.getTiles(ctx, pdas);

    for (let key of Object.keys(tiles)) {
      res[key] = tiles[key] != null;
    }

    return res;
  },

  createTileIx: async (ctx: WalletProgram, pda: PublicKey, pos: Vector) => {
    return ctx.ukrPlace.program.methods
      .createTile(pos as any)
      .accounts({
        tile: pda,
        tileProgram: ctx.canvasTile.id,
        ownerProgram: ctx.ukrPlace.id,
        user: ctx.anchorWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
  },

  paintPixelsIx: async (ctx: WalletProgram, pda: PublicKey, pos: Vector, image: number[][]) => {
    return ctx.ukrPlace.program.methods
      .paintPixels(pos as any, image as any)
      .accounts({
        tile: pda,
        tileProgram: ctx.canvasTile.id,
        currentProgram: ctx.ukrPlace.id,

        user: ctx.anchorWallet.publicKey,
        pixelWallet: ctx.inkWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([ctx.inkWallet])
      .instruction();
  },
};
