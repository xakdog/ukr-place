import React, { useCallback, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import { CheckCircleIcon } from "@heroicons/react/outline";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useBuyInk } from "./use-buy-ink";
import { charitiesList, defaultCharity } from "../../../data/charities-list";

import { Spinner } from "../../molecules/spinner/spinner";
import { Button } from "../../molecules/button/button";
import { GenericPopup } from "../../cells/generic-popup/generic-popup";
import { TransactionSummary } from "../../molecules/transaction-summary/transaction-summary";
import { CharityCard } from "../../molecules/charity-card/charity-card";
import { BuyInkError } from "../../molecules/buy-ink-error/buy-ink-error";
import { BuyInkSlider } from "../../cells/buy-ink-slider/buy-ink-slider";

const PRICE_PER_ML_LAMPORTS = 2_500_000; // lamports
const PRICE_PER_ML_SOL = PRICE_PER_ML_LAMPORTS / LAMPORTS_PER_SOL;

export const BuyInkPopup: React.FC<{}> = () => {
  const [amount, setAmount] = useState(250);
  const [isOpen, setIsOpen] = useState(false);

  const [selectedCharityId, setSelectedCharityId] = useState(defaultCharity);
  const selectedCharity = useMemo(
    () => charitiesList.find((c) => c.id === selectedCharityId),
    [selectedCharityId]
  );

  if (!selectedCharity) {
    throw new Error("Charity with unknown id were selected");
  }

  const solana = useBuyInk({ solPerMl: PRICE_PER_ML_SOL });

  const buyInk = useCallback(
    () => solana.buyInk(amount, selectedCharity.solanaAddress),
    [solana.buyInk, selectedCharity.solanaAddress, amount]
  );

  const openPopup = useCallback(() => setIsOpen(true), [setIsOpen]);
  const closePopup = useCallback(() => {
    setIsOpen(false);

    if (solana.confirmed) {
      setTimeout(() => solana.reset(), 600);
    }
  }, [setIsOpen, solana.confirmed, solana.reset]);

  const amountSelectionScreen = (
    <>
      <BuyInkSlider
        ml={amount}
        error={solana.error}
        charity={selectedCharity}
        solPerML={PRICE_PER_ML_SOL}
        onMlChange={setAmount}
        onDonateClick={buyInk}
      />

      <div className="h-8 sm:h-6" />
      <DialogTitle>Send money to</DialogTitle>

      <div className="h-2" />
      <div className="flex justify-center flex-wrap">
        {charitiesList.map((charity) => (
          <CharityCard
            key={charity.id}
            summary={charity}
            isSelected={selectedCharityId === charity.id}
            onClick={() => setSelectedCharityId(charity.id)}
          />
        ))}
      </div>
    </>
  );

  const transactionAwaitingScreen = (
    <>
      <DialogTitle>Awaiting confirmation</DialogTitle>

      <div className="flex mt-8 justify-center">
        {!solana.error && <Spinner size="2xl" />}
        {solana.error && <XIcon className="w-20 h-20 text-red-600" />}
      </div>

      <TransactionSummary
        txId={solana.tx}
        charity={selectedCharity}
        solAmount={solana.solAmount}
      />

      {solana.error && (
        <BuyInkError type={solana.error.type} message={solana.error.message} />
      )}
    </>
  );

  const transactionConfirmedScreen = (
    <>
      <DialogTitle>Money sent</DialogTitle>

      <div className="flex mt-8 justify-center">
        <CheckCircleIcon className="w-20 h-20 text-indigo-400" />
      </div>

      <TransactionSummary
        txId={solana.tx}
        charity={selectedCharity}
        solAmount={solana.solAmount}
      />
    </>
  );

  const popupSize = solana.sending ? "max-w-lg" : "max-w-3xl";

  return (
    <>
      <Button onClick={openPopup} color="amber">
        Donate & get ink
      </Button>

      <GenericPopup
        isOpen={isOpen}
        onClose={closePopup}
        containerStyle={`${popupSize} py-7`}
      >
        <XIcon
          onClick={closePopup}
          className="w-6 h-6 absolute right-8 top-8 bg-zinc-50 text-zinc-800 rounded cursor-pointer "
        />
        {!solana.sending
          ? amountSelectionScreen
          : solana.confirmed
          ? transactionConfirmedScreen
          : transactionAwaitingScreen}
      </GenericPopup>
    </>
  );
};

const DialogTitle: React.FC = ({ children }) => (
  <Dialog.Title
    as="h3"
    className="text-2xl font-bold leading-6 text-gray-900 text-center"
  >
    {children}
  </Dialog.Title>
);
