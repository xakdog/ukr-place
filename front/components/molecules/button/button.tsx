import React, { ButtonHTMLAttributes } from "react";

type ButtonStyleProps = {
  className?: string;
  outline?: boolean;
  color: "indigo" | "amber" | "zinc";
  size?: "sm" | "md";
};

type ButtonVariations = {
  filled: string;
  outline: string;
};

export type ButtonProps = ButtonStyleProps &
  React.DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;

export const Button: React.FC<ButtonProps> = (props) => {
  const className = createButtonStyle(props);

  return <button {...props} className={className} />;
};

const SIZE_VARIATION: Record<
  Exclude<ButtonProps["size"], undefined>,
  string
> = {
  md: "px-4 py-2 text-md",
  sm: "px-2 py-1 text-sm",
};

const COLOR_VARIATIONS: Record<ButtonProps["color"], ButtonVariations> = {
  indigo: {
    filled: "bg-indigo-600 text-white",
    outline: "text-indigo-600 border-indigo-600 border-2",
  },
  amber: {
    filled: "bg-amber-400 text-zinc-900",
    outline: "text-amber-400 border-amber-400 border-2",
  },
  zinc: {
    filled: "bg-zinc-800 text-white",
    outline: "text-zinc-800 border-zinc-800 border-2",
  },
};

export const createButtonStyle = (props: ButtonStyleProps): string => {
  const extraStyle = props.className || "";
  const colorStyle = props.outline
    ? COLOR_VARIATIONS[props.color].outline
    : COLOR_VARIATIONS[props.color].filled;
  const sizeStyle = SIZE_VARIATION[props.size || "md"];

  return `
    inline-flex justify-center items-center ${sizeStyle}
    ${colorStyle}
    font-semibold rounded-md hover:bg-opacity-90
    focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
    disabled:bg-opacity-40 disabled:border-opacity-40
    ${extraStyle}
  `;
};
