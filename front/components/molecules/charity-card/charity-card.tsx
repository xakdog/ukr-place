import React from "react";
import Image from "next/image";
import { ExternalLinkIcon } from "@heroicons/react/solid";

import { CharitySummary } from "../../../data/charities-list";
import { PublicKeyPreview } from "../public-key-preview/public-key-preview";
import { useSolanaExplorerAddress } from "../../service/use-solana-explorer/use-solana-explorer-address";

type CharityCardProps = {
  summary: CharitySummary;
  isSelected?: boolean;
  onClick?(): void;
};

export const CharityCard: React.FC<CharityCardProps> = (props) => {
  const explorerLink = useSolanaExplorerAddress(props.summary.solanaAddress);

  return (
    <div
      onClick={props.onClick}
      className={`
        w-72 sm:w-52 h-fit p-4 mt-4 mx-2 space-y-3.5 rounded
        text-xs
        transition-shadow transition-colors
        cursor-default ring-2 bg-white
        
        hover:shadow-2xl
    
        ${
          props.isSelected
            ? "shadow-xl ring-amber-400"
            : "shadow-md ring-zinc-200"
        }
      `}
    >
      <img src={props.summary.logoUrl} alt={`${props.summary.name} logo`} />

      <div>{props.summary.shortDescription}</div>

      <div className="flex justify-between opacity-40">
        <a
          className="flex cursor-pointer"
          target="_blank"
          rel="noreferrer"
          href={props.summary.officialUrl}
          tabIndex={-1}
        >
          Learn more <ExternalLinkIcon className="h-3 w-3 ml-0.5 mt-0.5" />
        </a>
        <a
          className="cursor-pointer"
          target="_blank"
          rel="noreferrer"
          href={explorerLink}
          tabIndex={-1}
        >
          <PublicKeyPreview short publicKey={props.summary.solanaAddress} />
        </a>
      </div>
    </div>
  );
};
