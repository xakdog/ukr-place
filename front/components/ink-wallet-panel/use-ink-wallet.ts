import bs58 from "bs58";
import {useCallback, useEffect, useState} from "react";
import {Keypair, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {AnchorProvider, Program} from "@project-serum/anchor";
import {useAnchorWallet, useConnection} from "@solana/wallet-adapter-react";

import UkrPlace from "../../types/idl/ukr_place.json";

export enum InkWalletStatus {
  DOES_NOT_EXIST='does-not-exist',
  LOADING='loading',
  REFRESHING='refreshing',
  READY='ready',
}

export const useInkWallet = () => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const [provider, setProvider] = useState<AnchorProvider>();
  const [inkProgram, setInkProgram] = useState<Program<UkrPlace>>();
  const [inkBalance, setInkBalance] = useState(-1);
  const [inkWallet, setInkWallet] = useState<Keypair>();
  const [inkWalletStatus, setInkWalletStatus] = useState(InkWalletStatus.LOADING);

  // TODO: parametrize
  const charityAccount = new PublicKey('66pJhhESDjdeBBDdkKmxYYd7q6GUggYPWjxpMKNX39KV');

  // TODO: really not secure, use SPL tokens instead
  useEffect(() => {
    const localStorageKey = 'ink-wallet-key';
    const key = localStorage.getItem(localStorageKey);

    if (key) {
      const keyPair = Keypair.fromSecretKey(bs58.decode(key));

      setInkWallet(keyPair);
    } else {
      const keyPair = Keypair.generate();

      localStorage.setItem('ink-wallet-key', bs58.encode(keyPair.secretKey));
      setInkWallet(keyPair);
    }
  }, [setInkWallet, inkWalletStatus]);


  useEffect(() => {
    if (!anchorWallet) return;

    const programID = new PublicKey(UkrPlace.metadata.address);
    const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
    const program =  new Program(UkrPlace, programID, provider);

    setProvider(provider);
    setInkProgram(program);
  }, [connection, anchorWallet]);

  const fetchBalance = useCallback(async () => {
    if (!inkProgram) return;
    if (!inkWallet) return;

    try {
      const pixWalletData = await inkProgram.account.pixelWallet.fetch(inkWallet.publicKey);
      const availablePixels = pixWalletData.availablePixels.toNumber();

      setInkBalance(availablePixels);
      setInkWalletStatus(InkWalletStatus.READY);
    } catch (e: Error) {
      console.log(e);
      console.log(e.message);
      console.log(e.message.startsWith('Account does not exist'));
      if (e.message.startsWith('Account does not exist')) {
        setInkWalletStatus(InkWalletStatus.DOES_NOT_EXIST);
      } else { throw e; }
    }
  }, [inkProgram, inkWallet]);

  useEffect(() => {
    console.log("MY WALLET", inkWallet)

    fetchBalance()
      .catch(console.error);
  }, [inkWallet, fetchBalance]);

  const buy = useCallback(async (milliliters: number) => {
    console.log({ provider, inkProgram, anchorWallet, inkWallet, inkWalletStatus })
    if (!provider) return;
    if (!inkProgram) return;
    if (!anchorWallet) return;
    if (!inkWallet) return;
    if (inkWalletStatus === InkWalletStatus.LOADING) return;

    const signers: Keypair[] = [];
    const tx = new Transaction();

    if (inkWalletStatus === InkWalletStatus.DOES_NOT_EXIST) {
      const createAccount = await inkProgram.methods.initialize()
        .accounts({
          user: anchorWallet.publicKey,
          pixelWallet: inkWallet?.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([inkWallet])
        .instruction();

      tx.add(createAccount);
      signers.push(inkWallet);
    }

    const buyInk = await inkProgram.methods.buyPixels(milliliters as any)
      .accounts({
        charity: charityAccount,
        user: anchorWallet.publicKey,
        pixelWallet: inkWallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(buyInk);

    console.log('TX', tx);

    const res = await provider.sendAll([{ tx, signers }]);
    setInkWalletStatus(InkWalletStatus.REFRESHING);

    console.log("WAITING!");
    console.log("Success tx:", res);
  }, [provider, inkProgram, inkWallet]);


  return { inkBalance, inkWalletKey: inkWallet?.publicKey, inkWalletStatus, buy };
};
