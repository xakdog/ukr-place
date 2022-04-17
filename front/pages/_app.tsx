import "../styles/globals.css";
import "../components/wallet-wrapper/wallet-wrapper.global.css";

import type {AppProps} from "next/app";
import {RecoilRoot} from "recoil";
import {WalletWrapper} from "../components/wallet-wrapper/wallet-wrapper";

function MyApp({ Component, pageProps }: AppProps) {
  return <RecoilRoot>
    <WalletWrapper>
      <Component {...pageProps} />
    </WalletWrapper>
  </RecoilRoot>;
}

export default MyApp
