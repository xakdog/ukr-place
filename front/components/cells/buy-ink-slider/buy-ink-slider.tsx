import React, { useCallback, useContext } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { DotsHorizontalIcon } from "@heroicons/react/solid";

import { createButtonStyle } from "../../molecules/button/button";
import { FormattedPrice } from "../../molecules/formatted-price/formatted-price";
import { ContentWidthInput } from "../../molecules/content-width-input/content-width-input";
import { RangeSelector } from "../../molecules/range-selector/range-selector";
import { CharitySummary } from "../../../data/charities-list";
import { WalletContext } from "../../service/wallet-program/wallet-program";
import {
  BuyInkError,
  BuyInkErrorProps,
} from "../../molecules/buy-ink-error/buy-ink-error";
import { PublicKeyPreview } from "../../molecules/public-key-preview/public-key-preview";

type BuyInkSliderProps = {
  charity: CharitySummary;
  error: BuyInkErrorProps | null;
  ml: number;
  solPerML: number;

  onMlChange(amount: number): void;
  onDonateClick(): void;
};

export const BuyInkSlider: React.FC<BuyInkSliderProps> = ({
  charity,
  error,
  ml,
  solPerML,
  onMlChange,
  onDonateClick,
}) => {
  const wallet = useWallet();
  const { solanaPrice } = useContext(WalletContext);

  const filteredMl = isNaN(ml) ? 0 : ml;
  const priceInSol = filteredMl * solPerML;
  const priceInUsd = solanaPrice * priceInSol;
  const isCtaDisabled = !wallet.connected || isNaN(ml) || ml < 1;

  const isWalletDetected =
    wallet.wallets.find((w) => w.readyState === WalletReadyState.Installed) !==
    undefined;

  const onInputChange = useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) =>
      onMlChange(Math.abs(parseInt(ev.target.value))),
    [onMlChange]
  );

  const getInkButton = (
    <button
      disabled={isCtaDisabled}
      className={ctaWideButtonStyle}
      onClick={onDonateClick}
    >
      Donate to get ink
    </button>
  );

  const connectButton = <WalletMultiButton className={selectWalletStyle} />;

  const installPhantom = (
    <div className="flex flex-row space-x-2">
      <div className={moreWalletsButtonStyle}>
        <DotsHorizontalIcon className="h-4 w-4" />
        <WalletMultiButton className="absolute opacity-0" />
      </div>

      <a
        href="https://phantom.app/"
        target="_blank"
        rel="noreferrer"
        className={phantomButtonStyle}
      >
        Install Phantom wallet
      </a>
    </div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold leading-6 text-gray-900 text-center">
        <ContentWidthInput
          type="number"
          min={1}
          value={isNaN(ml) ? "" : ml}
          onChange={onInputChange}
          maxLength={7}
          className="
            px-2 font-bold appearance-none ring-2 ring-zinc-100 rounded text-center
            focus:outline-none focus:ring-zinc-200
            no-number-arrows
          "
        />

        <span className="ml-2">mL</span>
      </h3>

      <RangeSelector value={filteredMl} onUpdate={onMlChange} />

      <div
        className="
          flex justify-between items-end
          mt-4 flex-col
          space-y-1 sm:flex-row sm:space-y-0
        "
      >
        <div className="text-xl font-bold text-right sm:text-left flex flex-col sm:block">
          <span>
            Total: ≈ <FormattedPrice price={priceInUsd} currency="USD" />
          </span>{" "}
          <small className="font-normal">
            <FormattedPrice price={priceInSol} currency="SOL" />
          </small>
        </div>

        {!isWalletDetected
          ? installPhantom
          : !wallet.connected
          ? connectButton
          : getInkButton}
      </div>

      {error && <BuyInkError type={error.type} message={error.message} />}

      <div className="max-w-max text-xs mt-4">
        <b>
          <FormattedPrice price={priceInSol} currency="SOL" />
        </b>{" "}
        will be sent directly <b>to {charity.name}</b> fund{" "}
        <span className="underline break-words">
          <PublicKeyPreview publicKey={charity.solanaAddress} />
        </span>
        . You will be able to track your transaction, transfer is done by smart
        contract and completely transparent.
      </div>
    </div>
  );
};

const phantomButtonStyle = createButtonStyle({ color: "indigo" });
const moreWalletsButtonStyle = createButtonStyle({
  outline: true,
  color: "indigo",
  className: "overflow-hidden relative",
});

const selectWalletStyle = createButtonStyle({
  outline: true,
  color: "indigo",
  className: `
    w-full sm:w-fit
    font-bold text-lg sm:text-base
  `,
});

const ctaWideButtonStyle = createButtonStyle({
  color: "indigo",
  className: `
    w-full sm:w-fit 
    font-bold text-lg sm:text-base
  `,
});
