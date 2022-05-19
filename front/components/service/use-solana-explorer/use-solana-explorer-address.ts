import { useContext, useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { WalletContext } from "../wallet-program/wallet-program";

export const useSolanaExplorerAddress = (publicKey: PublicKey) => {
  const { network } = useContext(WalletContext);

  return useMemo(() => {
    const explorerUrl = "https://explorer.solana.com/address/";
    const base58Key = publicKey.toBase58();

    return `${explorerUrl}${base58Key}?cluster=${network}`;
  }, [network, publicKey]);
};
