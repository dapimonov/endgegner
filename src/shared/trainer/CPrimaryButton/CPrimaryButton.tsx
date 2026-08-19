import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./CPrimaryButton.module.css";

export interface IPrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  wide?: boolean;
}

export function CPrimaryButton({
  children,
  wide = false,
  className,
  ...buttonProps
}: IPrimaryButtonProps) {
  return (
    <button
      className={[
        styles.button,
        wide ? styles.wide : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
