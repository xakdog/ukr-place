import React from "react";
import { PublicKey } from "@solana/web3.js";

type PublicKeyPreviewProps = {
  short?: boolean;
  publicKey: PublicKey;
};

export const PublicKeyPreview: React.FC<PublicKeyPreviewProps> = ({
  short,
  publicKey,
}) => {
  const fullKey = publicKey.toBase58();

  if (short) {
    const beginning = fullKey.slice(0, 4);
    const ending = fullKey.slice(-4);
    const shortRepr = `${beginning}..${ending}`;

    return <>{shortRepr}</>;
  }

  return <>{fullKey}</>;
};
