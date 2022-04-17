import bs58 from "bs58";
import {useEffect, useMemo, useState} from "react";
import {Keypair, PublicKey} from "@solana/web3.js";
import {AnchorProvider, Program} from "@project-serum/anchor";
import {AnchorWallet, useAnchorWallet, useConnection} from "@solana/wallet-adapter-react";

import UkrPlace from "../../types/idl/ukr_place.json";
import CanvasTile from "../../types/idl/canvas_tile.json";

export type WalletProgram = {
  provider: AnchorProvider,
  inkWallet: Keypair,
  anchorWallet: AnchorWallet,
  // TODO: use program directly
  // @ts-ignore
  ukrPlace: { id: PublicKey, program: Program<typeof UkrPlace> },
  // @ts-ignore
  canvasTile: { id: PublicKey, program: Program<typeof CanvasTile> },
};

export const useWalletProgram = (): WalletProgram | undefined => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  const [provider, setProvider] = useState<AnchorProvider>();
  // @ts-ignore
  const [ukrPlaceProgram, setUkrPlaceProgram] = useState<Program<typeof UkrPlace>>();
  // @ts-ignore
  const [canvasTileProgram, setCanvasTileProgram] = useState<Program<typeof CanvasTile>>();

  const inkWallet = useMemo(getWalletKey, []);
  const ukrPlaceId = useMemo(() => new PublicKey(UkrPlace.metadata.address), []);
  const canvasTileId = useMemo(() => new PublicKey(CanvasTile.metadata.address), []);

  const result = useMemo(() => {
    if (!provider) return undefined;
    if (!anchorWallet) return undefined;
    if (!ukrPlaceProgram) return undefined;
    if (!canvasTileProgram) return undefined;

    return {
      provider,
      inkWallet,
      anchorWallet,
      ukrPlace: { id: ukrPlaceId, program: ukrPlaceProgram },
      canvasTile: { id: canvasTileId, program: canvasTileProgram },
    };
  }, [provider, ukrPlaceProgram, canvasTileProgram]);

  useEffect(() => {
    if (!anchorWallet) return;

    const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());
    // @ts-ignore
    const ukrPlace = new Program(UkrPlace, UkrPlace.metadata.address, provider);
    // @ts-ignore
    const canvasTile = new Program(CanvasTile, UkrPlace.metadata.address, provider);

    setProvider(provider);
    // @ts-ignore
    setUkrPlaceProgram(ukrPlace);
    // @ts-ignore
    setCanvasTileProgram(canvasTile);
  }, [anchorWallet, inkWallet]);

  return result;
};

// TODO: not secure! Use SPL token
function getWalletKey() {
  // SSR fallback
  if (typeof window === 'undefined')
    return Keypair.generate();

  const localStorageKey = 'ink-wallet-key';
  const key = localStorage.getItem(localStorageKey);

  if (key)
    return Keypair.fromSecretKey(bs58.decode(key));

  const keyPair = Keypair.generate();
  localStorage.setItem('ink-wallet-key', bs58.encode(keyPair.secretKey));

  return keyPair;
}
