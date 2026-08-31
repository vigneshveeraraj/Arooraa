import styles from "./ChipOption.module.css";

interface ChipOptionProps {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label: string;
}

/**
 * A compact pill selector (W3.2A §11–14) for the finer qualification
 * fields (stage, product types, timeline, budget, contact method, contact
 * time) — same native-input-driven pattern as SelectableCard, just without
 * an icon/description, so a set of 5-9 options stays scannable instead of
 * repeating full cards everywhere.
 */
export function ChipOption({ type = "radio", name, value, checked, onChange, label }: ChipOptionProps) {
  const inputId = `${name}-${value}`;
  return (
    <label htmlFor={inputId} className={`${styles.chip} ${checked ? styles.selected : ""}`}>
      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className={styles.input}
      />
      <span>{label}</span>
      {checked ? (
        <span className={styles.checkMark} aria-hidden="true">
          ✓
        </span>
      ) : null}
    </label>
  );
}
