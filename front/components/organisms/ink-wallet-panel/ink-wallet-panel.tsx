import React, { useContext } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/solid";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useCollapsingBlock } from "./use-collapsing-block";
import { WalletContext } from "../../service/wallet-program/wallet-program";
import { ExternalLink } from "../../molecules/external-link/external-link";
import { createButtonStyle } from "../../molecules/button/button";
import { BuyInkPopup } from "../buy-ink-popup/buy-ink-popup";

const isScreenSmall = () =>
  typeof window === "object" && window.innerWidth < 640;

const InkWalletPanel: React.FC = () => {
  const wallet = useWallet();
  const { ink } = useContext(WalletContext);
  const { isCollapsed, toggleCollapsed } = useCollapsingBlock(isScreenSmall);

  const displayBalance = ink?.balance ? Math.max(ink?.balance, 0) : 0;
  const collapsedStyle = "w-fit left-auto mr-6 right-4 py-2";

  return (
    <div
      className={`
        ink-panel
        absolute left-0 right-0 mx-auto top-6 sm:mr-0 sm:right-6 p-4 mb-8 z-10
        max-w-xs
        flex flex-col gap-1
        bg-zinc-900 select-none
        rounded-lg drop-shadow-xl ring-4 ring-black/10
        transition ease-in-out
        ${isCollapsed ? collapsedStyle : ""}
      `}
    >
      {isCollapsed ? (
        <CollapsedContent
          displayBalance={displayBalance}
          onClick={toggleCollapsed}
        />
      ) : (
        <FullContent
          onClick={toggleCollapsed}
          displayBalance={displayBalance}
          showWalletButton={wallet.connected}
        />
      )}
    </div>
  );
};

const CollapsedContent: React.FC<{
  onClick(): void;
  displayBalance: number;
}> = ({ displayBalance, onClick }) => (
  <div className="flex flex-row w-fit" onClick={onClick}>
    <h3 onClick={onClick} className={titleStyle}>
      {displayBalance} mL
    </h3>

    <ChevronDownIcon className="h-7 w-7 ml-2 mt-px -mr-1 text-white opacity-60" />
  </div>
);

const FullContent: React.FC<{
  displayBalance: number;
  onClick(): void;
  showWalletButton: boolean;
}> = ({ displayBalance, showWalletButton, onClick }) => {
  const buttonStyle = createButtonStyle({ color: "zinc", size: "sm" });

  return (
    <>
      <div className="flex">
        <h3 onClick={onClick} className={titleStyle}>
          {displayBalance} mL of ink
        </h3>
        {showWalletButton && <WalletMultiButton className={buttonStyle} />}
        {!showWalletButton && (
          <ChevronUpIcon
            onClick={onClick}
            className="h-7 w-7 ml-2 mt-px -mr-1 text-white opacity-60 cursor-pointer"
          />
        )}
      </div>

      <Explanation />
      <BuyInkPopup />
    </>
  );
};

const Explanation: React.FC = () => (
  <p className="my-2 text-sm text-zinc-100">
    Create pixel art and support Ukraine. We&nbsp;transfer your money to:{" "}
    <ExternalLink href="https://www.comebackalive.in.ua/">
      Come back alive
    </ExternalLink>
    ,{" "}
    <ExternalLink href="https://donate.thedigital.gov.ua/">
      government
    </ExternalLink>
    ,{" "}
    <ExternalLink href="https://palianytsia.com.ua/">Palianytsia</ExternalLink>.
  </p>
);

const titleStyle = `
  flex-1
  text-xl font-bold text-zinc-100
  cursor-pointer
`;

export default InkWalletPanel;
