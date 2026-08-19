import styles from "./CAppFooter.module.css";

export interface IAppFooterProps {
  primary: string;
  secondary?: string;
  spacious?: boolean;
}

export function CAppFooter({
  primary,
  secondary,
  spacious = false,
}: IAppFooterProps) {
  return (
    <footer className={`${styles.footer} ${spacious ? styles.spacious : ""}`}>
      <span>{primary}</span>
      {secondary && <span>{secondary}</span>}
    </footer>
  );
}
