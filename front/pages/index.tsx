import { useState } from "react";
import type { NextPage } from "next";
import Head from "next/head";

import IntroPopup from "../components/organisms/intro-popup/intro-popup";
import InkWalletPanel from "../components/ink-wallet-panel/ink-wallet-panel";
import PixelCanvas from "../components/pixel-canvas/pixel-canvas";
import { FooterActions } from "../components/footer-actions/footer-actions";

const Home: NextPage = () => {
  const [isEditing, setIsEditing] = useState(true);

  return (
    <>
      <Head>
        <title>Support Ukraine with pixel art</title>
        <meta
          name="description"
          content="A crypto game inspired by Reddit place. You can buy ink and paint pixels. Money transferred directly to charity organisations, we don't take any cut."
        />
        <meta content="initial-scale=1.0, user-scalable=no" name="viewport" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ backgroundColor: "#121213" }}>
        <IntroPopup />
        <InkWalletPanel />
        <PixelCanvas onClick={() => setIsEditing(!isEditing)} />
      </main>

      <footer>{isEditing && <FooterActions />}</footer>
    </>
  );
};

export default Home;
