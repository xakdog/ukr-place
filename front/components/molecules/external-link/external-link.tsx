import React from "react";

export const ExternalLink: React.FC<{ href: string }> = ({
  href,
  children,
}) => {
  return (
    <a className="underline" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};
