"use client";

export function ProductQuantitySelector({
  value,
  onChange,
  max,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled?: boolean;
}) {
  const step = (delta: number) => onChange(Math.min(Math.max(value + delta, 1), max));
  const btn =
    "h-10 w-10 text-lg hover:bg-neutral-100 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-neutral-900";
  return (
    <div role="group" aria-label="Quantity" className="inline-flex items-center rounded-md border border-neutral-300">
      <button type="button" className={btn} onClick={() => step(-1)} disabled={disabled || value <= 1} aria-label="Decrease quantity">
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={value}
        disabled={disabled}
        aria-label="Quantity"
        onChange={(e) => onChange(Math.min(Math.max(Math.trunc(Number(e.target.value)) || 1, 1), max))}
        className="h-10 w-12 [appearance:textfield] border-x border-neutral-300 text-center text-sm [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className={btn} onClick={() => step(1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
