import type { ReactNode } from "react";

import styles from "./CAppShell.module.css";

export interface IAppShellProps {
  children: ReactNode;
  className?: string;
}

export function CAppShell({ children, className }: IAppShellProps) {
  return (
    <main className={[styles.shell, className].filter(Boolean).join(" ")}>
      <div className={`${styles.ambient} ${styles.ambientOne}`} />
      <div className={`${styles.ambient} ${styles.ambientTwo}`} />
      {children}
    </main>
  );
}
