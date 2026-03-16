import React, { ReactNode } from "react";

import "./oph-ds-button.css";

type OphDsButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant: "primary" | "bordered";
};

export const OphDsButton = ({
  onClick,
  children,
  variant,
}: OphDsButtonProps) => {
  const className = variant
    ? `oph-ds-button oph-ds-button-${variant}`
    : "oph-ds-button";
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};
