import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { Vector } from "vecti";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import {
  pixelChangesActions,
  pixelChangesState,
  PixelSyncStatus,
} from "../../../state/pixel-changes.atom";

import { WalletProgram } from "../wallet-program/use-wallet-program";
import {
  pixelChangesTransform,
  TileChangeReq,
} from "../../../state/pixel-changes.transform";

export const PixelSync: React.FC<{
  ctx: WalletProgram;
  refreshInk(): void;
}> = ({ ctx, refreshInk }) => {
  const [state, setState] = useRecoilState(pixelChangesState);

  useEffect(() => {
    if (Object.keys(state.syncing).length === 0) return;
    if (state.syncStatus !== PixelSyncStatus.COMMIT_CHANGES) return;

    const runSync = async () => {
      const keysToUpdate = Object.keys(state.syncing);
      const changeReqs = pixelChangesTransform.groupTileChanges(state.syncing);

      setState(
        pixelChangesActions.setStatus(PixelSyncStatus.AWAITING_CONFIRMATION)
      );
      await anchor.syncTiles(ctx, changeReqs);
      setState(
        pixelChangesActions.setStatus(PixelSyncStatus.CHANGES_CONFIRMED)
      );

      refreshInk();
      setState(pixelChangesActions.cleanSyncing(keysToUpdate));
    };

    runSync()
      .catch(console.error)
      .finally(() =>
        setState(
          pixelChangesActions.setStatus(PixelSyncStatus.ACCEPTING_CHANGES)
        )
      );
  }, [state, ctx.inkWallet, state.syncStatus, refreshInk]);

  return null;
};

type TileData = { pixels: number[][]; position: { x: number; y: number } };

const anchor = {
  syncTiles: async (ctx: WalletProgram, changes: TileChangeReq[]) => {
    const changesWithPda = await Promise.all(
      changes.map((change) =>
        anchor.findPda(ctx, change.tilePos).then((pda) => ({ ...change, pda }))
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

    const res = await ctx.provider.sendAndConfirm(tx, signers);

    console.log("Success tx:", res);

    return res[0];
  },

  findPda: async (ctx: WalletProgram, pos: Vector) => {
    const seed = new TextEncoder().encode(`canvas-tile-${pos.x}:${pos.y}`);
    const [pda, _bump] = await PublicKey.findProgramAddress(
      [seed],
      ctx.ukrPlace.id
    );

    return pda;
  },

  getTiles: async (ctx: WalletProgram, pdas: PublicKey[]) => {
    const res = await ctx.canvasTile.program.account.canvasTile.fetchMultiple(
      pdas
    );

    return pdas
      .map((pda, idx) => ({ pda, tile: res[idx] }))
      .reduce((acc: Record<string, TileData | null>, { pda, tile }) => {
        acc[pda.toBase58()] = tile as TileData | null;

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

  paintPixelsIx: async (
    ctx: WalletProgram,
    pda: PublicKey,
    pos: Vector,
    image: number[][]
  ) => {
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
