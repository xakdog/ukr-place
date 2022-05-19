import React from "react";
import { BuyInkErrors } from "../../service/wallet-program/use-wallet-ink";

export type BuyInkErrorProps = {
  type: BuyInkErrors;
  message: string;
};

const ERROR_MESSAGES: Record<BuyInkErrors, (msg: string) => JSX.Element> = {
  [BuyInkErrors.UNKNOWN]: (msg) => <>Unexpected error: {msg}</>,
  [BuyInkErrors.UNSUPPORTED_CHARITY]: (_msg) => (
    <>This charity is not yet supported by smart contract.</>
  ),
  [BuyInkErrors.INSUFFICIENT_FUNDS]: (_msg) => (
    <>Insufficient funds. Try buying smaller amount.</>
  ),
};

export const BuyInkError: React.FC<BuyInkErrorProps> = ({ type, message }) => {
  let error = ERROR_MESSAGES[type](message);

  return (
    <div className="w-full bg-red-600 text-white mt-4 ring-4 ring-red-600/10 py-1 px-3 rounded">
      {error}
    </div>
  );
};
