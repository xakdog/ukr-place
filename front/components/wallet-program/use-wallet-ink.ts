import {useCallback, useEffect, useMemo, useState} from "react";
import {Program} from "@project-serum/anchor";
import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";

import {WalletProgram} from "./use-wallet-program";
import UkrPlace from "../../types/idl/ukr_place.json";

export enum InkWalletStatus {
  DOES_NOT_EXIST='does-not-exist',
  NOT_READY='not-ready',
  LOADING='loading',
  READY='ready',
}

const anchorFetchBalance = async (
  // @ts-ignore
  program: Program<typeof UkrPlace>,
  wallet: PublicKey
): Promise<number | null> => {
  try {
    const pixWalletData = await program.account.pixelWallet.fetch(wallet);
    return pixWalletData.availablePixels.toNumber();
  } catch (e: any) {
    if (e.message.startsWith('Account does not exist')) {
      return null;
    } else { throw e; }
  }
};

const anchorBuy = async (
  charityAccount: PublicKey,
  milliliters: number,
  inkWalletStatus: InkWalletStatus,
  ctx: WalletProgram,
) => {
  if (inkWalletStatus === InkWalletStatus.NOT_READY) return;

  const signers: Keypair[] = [];
  const tx = new Transaction();

  const ukrPlace = ctx.ukrPlace.program;
  const {provider, inkWallet, anchorWallet: payerWallet} = ctx;

  if (inkWalletStatus === InkWalletStatus.DOES_NOT_EXIST) {
    const createAccount = await ukrPlace.methods.initialize()
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

  const buyInk = await ukrPlace.methods.buyPixels(milliliters as any)
    .accounts({
      charity: charityAccount,
      user: payerWallet.publicKey,
      pixelWallet: inkWallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  tx.add(buyInk);

  const res = await provider.sendAndConfirm(tx, signers);

  console.log("Success tx:", res);

  return res;
};


export const useWalletInk = (ctx: WalletProgram | undefined) => {
  const [inkBalance, setInkBalance] = useState(-1);
  const [inkWalletStatus, setInkWalletStatus] = useState(InkWalletStatus.NOT_READY);

  const userKey = ctx?.inkWallet.publicKey.toBase58();

  useEffect(() => {
    fetchBalance();
  }, [userKey]);

  const fetchBalance = useCallback(() => {
    if (!ctx) return;

    setInkWalletStatus(InkWalletStatus.LOADING);

    anchorFetchBalance(ctx.ukrPlace.program, ctx.inkWallet.publicKey)
      .then(value => {
        if (value == null) {
          setInkWalletStatus(InkWalletStatus.DOES_NOT_EXIST);
          return;
        }

        setInkBalance(value);
        setInkWalletStatus(InkWalletStatus.READY);
      })
      .catch(console.error)
  }, [userKey]);

  const buy = useCallback((milliliters: number) => {
    if (!ctx) return;

    // TODO: parametrize
    const charityAccount = new PublicKey('66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV');

    anchorBuy(charityAccount, milliliters, inkWalletStatus, ctx)
      .then(sig => {
        const isUpdated = sig != null && sig.length > 0;

        if (isUpdated) {
          fetchBalance();
        } else {
          console.error(new Error("Not ready!"));
        }
      })
      .catch(console.error);
  }, [userKey, fetchBalance, inkWalletStatus]);

  return useMemo(() => ({
    buy,
    balance: inkBalance,
    refresh: fetchBalance,
    status: inkWalletStatus,
  }), [buy, inkBalance, fetchBalance, inkWalletStatus]);
};
