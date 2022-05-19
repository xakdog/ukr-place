import { useContext, useMemo } from "react";
import { WalletContext } from "../wallet-program/wallet-program";

export const useSolanaExplorerTx = (tx: string) => {
  const { network } = useContext(WalletContext);

  return useMemo(() => {
    const explorerUrl = "https://explorer.solana.com/tx/";

    return `${explorerUrl}${tx}?cluster=${network}`;
  }, [network, tx]);
};
