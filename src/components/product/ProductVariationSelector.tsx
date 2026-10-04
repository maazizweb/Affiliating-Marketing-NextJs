"use client";

/** Controlled, presentational picker: one radio-like button group per variation attribute. */
export function ProductVariationSelector({
  attributes,
  selected,
  onChange,
}: {
  attributes: { name: string; options: string[] }[];
  selected: Record<string, string>;
  onChange: (name: string, option: string) => void;
}) {
  return (
    <div className="space-y-4">
      {attributes.map((attr) => (
        <fieldset key={attr.name}>
          <legend className="mb-2 text-sm font-medium">
            {attr.name}
            {selected[attr.name] && <span className="font-normal text-neutral-500">: {selected[attr.name]}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {attr.options.map((option) => {
              const active = selected[attr.name] === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange(attr.name, option)}
                  className={`rounded-md border px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 hover:border-neutral-500"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
