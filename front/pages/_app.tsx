import "core-js/actual";

import "../styles/globals.css";
import "../components/service/wallet-wrapper/wallet-wrapper.global.css";

import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import { WalletWrapper } from "../components/service/wallet-wrapper/wallet-wrapper";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <WalletWrapper>
        <Component {...pageProps} />
      </WalletWrapper>
    </RecoilRoot>
  );
}

export default MyApp;
