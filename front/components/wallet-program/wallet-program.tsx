import React from "react";
import {useWalletProgram, WalletProgram} from "./use-wallet-program";
import {useWalletInk} from "./use-wallet-ink";
import {PixelSync} from "../pixel-sync/pixel-sync";
import {CanvasSyncer} from "../live-canvas/canvas-syncer";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";

export type WalletProps = {
  network: WalletAdapterNetwork,
  ctx: WalletProgram | undefined,
  ink: ReturnType<typeof useWalletInk> | undefined,
};

export const WalletContext = React.createContext<WalletProps>({
  ctx: undefined,
  ink: undefined,
  network: WalletAdapterNetwork.Devnet,
});

export const WalletContextProvider: React.FC<{ network: WalletAdapterNetwork }> = props => {
  const ctx = useWalletProgram();
  const ink = useWalletInk(ctx);
  const network = props.network;

  return <WalletContext.Provider value={{ ctx, ink, network }}>
    {props.children}

    {ctx && <PixelSync ctx={ctx} refreshInk={ink.refresh} />}

    <CanvasSyncer />
  </WalletContext.Provider>;
};
