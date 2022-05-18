import React from "react";

const IsCryptoCurrency = (currency: string) =>
  currency.match(/BTC|ETH|SOL/) != null;

export const FormattedPrice: React.FC<{ price: number; currency: string }> = ({
  price,
  currency,
}) => {
  if (IsCryptoCurrency(currency)) {
    const formatter = new Intl.NumberFormat("en-US", {
      currency,
      style: "currency",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
    const priceInSol = formatter.format(price);

    return <span className="tabular-nums">{priceInSol}</span>;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    currency,
    style: "currency",
  });
  const priceInUsd = formatter.format(price);

  return <span className="tabular-nums">{priceInUsd}</span>;
};
