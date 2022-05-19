import React, { useEffect, useState } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { useWalletInk } from "./use-wallet-ink";
import { useWalletProgram, WalletProgram } from "./use-wallet-program";
import { PixelSync } from "../pixel-sync/pixel-sync";
import { CanvasUpdatesSolana } from "../canvas-updates/canvas-updates-solana";

export type WalletProps = {
  network: WalletAdapterNetwork;
  ctx: WalletProgram | undefined;
  ink: ReturnType<typeof useWalletInk> | undefined;
  solanaPrice: number;
};

export const WalletContext = React.createContext<WalletProps>({
  ctx: undefined,
  ink: undefined,
  network: WalletAdapterNetwork.Devnet,
  solanaPrice: 0,
});

export const WalletContextProvider: React.FC<{
  network: WalletAdapterNetwork;
}> = (props) => {
  const ctx = useWalletProgram();
  const ink = useWalletInk(ctx);
  const [solanaPrice, setSolanaPrice] = useState(0);
  const network = props.network;

  useEffect(() => {
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd"
    )
      .then((response): Promise<{ solana: { usd: number } }> => response.json())
      .then((json) => setSolanaPrice(json.solana.usd))
      .catch(console.error);
  }, [setSolanaPrice]);

  return (
    <WalletContext.Provider value={{ ctx, ink, network, solanaPrice }}>
      {props.children}

      {ctx && <PixelSync ctx={ctx} refreshInk={ink.refresh} />}

      <CanvasUpdatesSolana />
    </WalletContext.Provider>
  );
};
