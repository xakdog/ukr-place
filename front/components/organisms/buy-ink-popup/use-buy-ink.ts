import { useCallback, useContext, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";

import { WalletContext } from "../../service/wallet-program/wallet-program";
import { BuyInkErrorProps } from "../../molecules/buy-ink-error/buy-ink-error";

export const useBuyInk = ({ solPerMl }: { solPerMl: number }) => {
  const { ink } = useContext(WalletContext);
  const [tx, setTx] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<BuyInkErrorProps | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solAmount, setSolAmount] = useState(0);

  const reset = useCallback(
    (amount = 0, sending = false) => {
      setError(null);
      setSending(sending);
      setTx("");
      setConfirmed(false);
      setSolAmount(amount * solPerMl);
    },
    [setError, setConfirmed, setTx, setError, solPerMl]
  );

  const buyInk = useCallback(
    (amount: number, solanaAddress: PublicKey) => {
      reset(amount, true);

      amount &&
        ink?.buy(amount, solanaAddress, {
          onError(type, rawError) {
            setError({ type, message: rawError.message });
          },
          onUserCancelled() {
            setSending(false);
          },
          onTransactionSent(sig) {
            setTx(sig);
          },
          onTransactionConfirmed(_res) {
            setConfirmed(true);
          },
        });
    },
    [setError, ink?.buy, reset]
  );

  return useMemo(
    () => ({
      error,
      sending,
      tx,
      confirmed,
      solAmount,
      buyInk,
      reset,
    }),
    [error, sending, tx, confirmed, solAmount, buyInk, reset]
  );
};
