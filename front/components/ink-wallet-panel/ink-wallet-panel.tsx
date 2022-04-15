import React, {useCallback, useEffect, useState} from 'react';
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {ChevronDownIcon} from "@heroicons/react/solid";
import {useInkWallet} from "./use-ink-wallet";

const INK_AMOUNT_ML = 32;

const InkWalletPanel: React.FC = () => {
  const wallet = useWallet();
  const inkWallet = useInkWallet();

  const [collapsed, setCollapsed] = useState(false);
  const onClick = useCallback(async () => inkWallet.buy(INK_AMOUNT_ML), [inkWallet])
  const toggleCollapsed = useCallback(() => setCollapsed(!collapsed), [collapsed]);

  const isSmallScreen = typeof window === 'object' && window.innerWidth < 640;

  useEffect(() => {
    if (isSmallScreen)
      setCollapsed(true);
  }, [isSmallScreen]);

  const title =
    inkWallet.inkBalance < 0 ?
      <>Buy ink, support&nbsp;Ukraine!</> :
      (collapsed && isSmallScreen) ?
      <>{inkWallet.inkBalance} mL</> :
      <>{inkWallet.inkBalance} mL of ink</>;

  const collapsedContent = <>
    <div className="flex flex-row w-fit" onClick={toggleCollapsed}>
      <h3 className="
        flex-1
        text-xl font-bold text-zinc-100
        cursor-pointer
      ">
        {title}
      </h3>
      <ChevronDownIcon className="h-7 w-7 ml-2 mt-px -mr-1 text-white opacity-60" />
    </div>
  </>;

  const fullContent = <>
    <div className="flex">
      <h3 onClick={toggleCollapsed} className="
        flex-1
        text-xl font-bold text-zinc-100
        cursor-pointer
      ">
        {title}
      </h3>
      {wallet.connected && <WalletMultiButton className={walletButtonStyle} />}
    </div>

    <p className="
      my-2
      text-sm	text-zinc-100
    ">
      All money are donated directly to organisations that support Ukrainian
      people. <a href="#" className="underline">Track our transactions.</a>
    </p>

    {wallet.connected && <button onClick={onClick} className={ctaButtonStyle}>
      Buy ink ({INK_AMOUNT_ML} mL)
    </button>}

    {!wallet.connected && <WalletMultiButton className={ctaButtonStyle} />}
  </>;

  const collapsedStyle = "w-fit left-auto right-4 py-2";

  return <div className={`
    ink-panel
    absolute left-0 right-0 mx-auto top-6 sm:mr-0 sm:right-6 p-4 mb-8 z-10
    max-w-xs
    flex flex-col gap-1
    bg-zinc-900 select-none
    rounded-lg drop-shadow-xl ring-4 ring-black/10
    transition ease-in-out
    ${collapsed ? collapsedStyle : ""}
  `}>
    {collapsed ? collapsedContent : fullContent}
  </div>;
};

const ctaButtonStyle = `
  inline-flex justify-center items-center px-4 py-2
  font-semibold text-zinc-900
  bg-amber-400 rounded-md hover:bg-opacity-90
  focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
`;

const walletButtonStyle = `
  inline-flex flex-row items-center
  font-semibold text-zinc-100 text-sm
  px-2 py-1 rounded
  bg-zinc-800
`;

export default InkWalletPanel;
