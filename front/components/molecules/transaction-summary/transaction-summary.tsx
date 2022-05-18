import React from "react";

import { createButtonStyle } from "../button/button";
import { FormattedPrice } from "../formatted-price/formatted-price";
import { CharitySummary } from "../../../data/charities-list";
import { useSolanaExplorerTx } from "../../service/use-solana-explorer/use-solana-explorer-tx";

export const TransactionSummary: React.FC<{
  charity: CharitySummary;
  txId: string;
  solAmount: number;
}> = ({ txId, charity, solAmount }) => {
  const explorerLink = useSolanaExplorerTx(txId);

  return (
    <>
      <div className="mt-8">
        <div className="flex justify-between">
          <div>
            <div className="text-lg font-bold mt-2">Recipient:</div>
            <a
              className="text-xs underline"
              href={charity.officialUrl}
              target="_blank"
              rel="noreferrer"
            >
              {charity.name}
            </a>
          </div>

          <div className="text-xl font-bold mt-2">
            <FormattedPrice price={solAmount} currency="SOL" />
          </div>
        </div>

        {txId && (
          <>
            <div className="text-lg font-bold mt-2">Transaction id:</div>
            <div className="w-fit max-w-full break-words text-xs">
              {txId || "Awaiting for approval"}
            </div>
          </>
        )}
      </div>

      {txId && (
        <div className="flex mt-6 justify-center">
          <a
            className={indigoButtonStyle}
            href={explorerLink}
            target="_blank"
            rel="noreferrer"
          >
            Track transaction
          </a>
        </div>
      )}
    </>
  );
};

const indigoButtonStyle = createButtonStyle({ color: "indigo" });
