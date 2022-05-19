import { useCallback, useEffect, useMemo, useState } from "react";
import { Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

import { WalletProgram } from "./use-wallet-program";
import UkrPlace from "../../../types/idl/ukr_place.json";

export enum InkWalletStatus {
  DOES_NOT_EXIST = "does-not-exist",
  NOT_READY = "not-ready",
  LOADING = "loading",
  READY = "ready",
}

export enum BuyInkErrors {
  UNKNOWN = "unknown",
  INSUFFICIENT_FUNDS = "insufficient-funds",
  UNSUPPORTED_CHARITY = "unsupported-charity",
}

type BuyInkCallbacks = {
  onTransactionSent(sig: string): void;
  onTransactionConfirmed(res: RpcResponseAndContext<SignatureResult>): void;

  onUserCancelled(): void;
  onError(type: BuyInkErrors, raw: Error): void;
};

const anchorFetchBalance = async (
  // @ts-ignore
  program: Program<typeof UkrPlace>,
  wallet: PublicKey
): Promise<number | null> => {
  try {
    const pixWalletData = await program.account.pixelWallet.fetch(wallet);
    return pixWalletData.availablePixels.toNumber();
  } catch (e: any) {
    if (e.message.startsWith("Account does not exist")) {
      return null;
    } else {
      throw e;
    }
  }
};

const anchorBuyTx = async (
  charityAccount: PublicKey,
  milliliters: number,
  inkWalletStatus: InkWalletStatus,
  ctx: WalletProgram
) => {
  if (inkWalletStatus === InkWalletStatus.NOT_READY)
    throw new Error("Wallet is not ready");

  const signers: Keypair[] = [];
  const tx = new Transaction();

  const ukrPlace = ctx.ukrPlace.program;
  const { inkWallet, anchorWallet: payerWallet } = ctx;

  if (inkWalletStatus === InkWalletStatus.DOES_NOT_EXIST) {
    const createAccount = await ukrPlace.methods
      .initialize()
      .accounts({
        user: payerWallet.publicKey,
        pixelWallet: inkWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([inkWallet])
      .instruction();

    tx.add(createAccount);
    signers.push(inkWallet);
  }

  const buyInk = await ukrPlace.methods
    .buyPixels(milliliters as any)
    .accounts({
      charity: charityAccount,
      user: payerWallet.publicKey,
      pixelWallet: inkWallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  tx.add(buyInk);

  return { tx, signers };
};

export const useWalletInk = (ctx: WalletProgram | undefined) => {
  const [inkBalance, setInkBalance] = useState(-1);
  const [inkWalletStatus, setInkWalletStatus] = useState(
    InkWalletStatus.NOT_READY
  );

  const userKey = ctx?.inkWallet.publicKey.toBase58();

  const fetchBalance = useCallback(() => {
    if (!ctx) return;

    setInkWalletStatus(InkWalletStatus.LOADING);

    anchorFetchBalance(ctx.ukrPlace.program, ctx.inkWallet.publicKey)
      .then((value) => {
        if (value == null) {
          setInkBalance(0);
          setInkWalletStatus(InkWalletStatus.DOES_NOT_EXIST);
          return;
        }

        setInkBalance(value);
        setInkWalletStatus(InkWalletStatus.READY);
      })
      .catch(console.error);
  }, [userKey]);

  const buy = useCallback(
    (
      milliliters: number,
      charityAccount: PublicKey,
      callbacks: BuyInkCallbacks
    ) => {
      if (!ctx) return;

      anchorBuyTx(charityAccount, milliliters, inkWalletStatus, ctx)
        .then(async ({ tx, signers }) => {
          const sendRes = await ctx.provider.sendAll([{ tx, signers }]);
          const sig = sendRes[0];

          console.debug("Success tx:", sig);
          callbacks.onTransactionSent(sig);

          const confirmRes = await ctx.provider.connection.confirmTransaction(
            sig
          );

          console.debug("Confirmation tx:", confirmRes);
          callbacks.onTransactionConfirmed(confirmRes);

          fetchBalance();
        })
        .catch((e) => {
          if (e.message.includes("User rejected the request.")) {
            return callbacks.onUserCancelled();
          }

          if (e.message.endsWith("custom program error: 0x1")) {
            return callbacks.onError(BuyInkErrors.INSUFFICIENT_FUNDS, e);
          }

          if (e.message.endsWith("custom program error: 0x1772")) {
            return callbacks.onError(BuyInkErrors.UNSUPPORTED_CHARITY, e);
          }

          callbacks.onError(BuyInkErrors.UNKNOWN, e);

          console.error("Buying ink error", e);
        });
    },
    [userKey, fetchBalance, inkWalletStatus]
  );

  useEffect(() => {
    fetchBalance();
  }, [userKey, fetchBalance]);

  return useMemo(
    () => ({
      buy,
      balance: inkBalance,
      refresh: fetchBalance,
      status: inkWalletStatus,
    }),
    [buy, inkBalance, fetchBalance, inkWalletStatus]
  );
};
