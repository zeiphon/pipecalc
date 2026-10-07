import { useState, type InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  /** Accept zero and negative values (default: positive only). */
  allowNonPositive?: boolean;
}

/**
 * Number input that keeps the typed text while editing, so partial entries
 * like "12." or an empty field don't fight the user. Valid values are
 * committed as you type; invalid text is reverted on blur.
 */
export function NumberField({ value, onChange, allowNonPositive, className = '', ...rest }: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(value);
  const parsed = Number(text);
  const valid = text.trim() !== '' && Number.isFinite(parsed) && (allowNonPositive || parsed > 0);

  return (
    <input
      type="text"
      inputMode="decimal"
      enterKeyHint="done"
      autoComplete="off"
      value={text}
      aria-invalid={!valid}
      className={`${className} ${valid ? '' : 'ring-2 ring-red-500'}`}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const next = e.target.value.replace(',', '.');
        setDraft(next);
        const n = Number(next);
        if (next.trim() !== '' && Number.isFinite(n) && (allowNonPositive || n > 0)) onChange(n);
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      {...rest}
    />
  );
}
