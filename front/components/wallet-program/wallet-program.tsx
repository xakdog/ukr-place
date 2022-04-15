import React from "react";
import {useWalletProgram, WalletProgram} from "./use-wallet-program";
import {useWalletInk} from "./use-wallet-ink";
import {PixelSync} from "../pixel-sync/pixel-sync";

export type WalletProps = {
  ctx: WalletProgram | undefined,
  ink: ReturnType<typeof useWalletInk> | undefined,
};

export const WalletContext = React.createContext<WalletProps>({ ctx: undefined, ink: undefined });

export const WalletContextProvider: React.FC = props => {
  const ctx = useWalletProgram();
  const ink = useWalletInk(ctx);

  return <WalletContext.Provider value={{ ctx, ink }}>
    {props.children}
    {ctx && <PixelSync ctx={ctx} refreshInk={ink.refresh} />}
  </WalletContext.Provider>;
};
