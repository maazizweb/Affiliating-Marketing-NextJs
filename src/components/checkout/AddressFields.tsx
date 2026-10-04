import { Input, inputClass } from "@/components/ui/Input";
import type { WCAddress, WCCountry } from "@/types/woocommerce";

/** Uncontrolled address block; field names are `${prefix}_${field}` as read by the placeOrder action. */
export function AddressFields({
  prefix,
  countries,
  defaults,
  onCountryChange,
  withContact = false,
}: {
  prefix: "billing" | "shipping";
  countries: WCCountry[];
  defaults?: Partial<WCAddress>;
  onCountryChange?: (country: string) => void;
  withContact?: boolean;
}) {
  const id = (f: string) => `${prefix}_${f}`;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input id={id("first_name")} name={id("first_name")} label="First name" required autoComplete="given-name" defaultValue={defaults?.first_name} />
      <Input id={id("last_name")} name={id("last_name")} label="Last name" required autoComplete="family-name" defaultValue={defaults?.last_name} />
      {withContact && (
        <>
          <Input id={id("email")} name={id("email")} type="email" label="Email" required autoComplete="email" defaultValue={defaults?.email} />
          <Input id={id("phone")} name={id("phone")} type="tel" label="Phone" autoComplete="tel" defaultValue={defaults?.phone} />
        </>
      )}
      <Input className="sm:col-span-2" id={id("address_1")} name={id("address_1")} label="Address" required autoComplete="address-line1" defaultValue={defaults?.address_1} />
      <Input className="sm:col-span-2" id={id("address_2")} name={id("address_2")} label="Apartment, suite, etc." autoComplete="address-line2" defaultValue={defaults?.address_2} />
      <Input id={id("city")} name={id("city")} label="City" required autoComplete="address-level2" defaultValue={defaults?.city} />
      <Input id={id("state")} name={id("state")} label="State / region" autoComplete="address-level1" defaultValue={defaults?.state} />
      <Input id={id("postcode")} name={id("postcode")} label="Postcode" required autoComplete="postal-code" defaultValue={defaults?.postcode} />
      <div>
        <label htmlFor={id("country")} className="mb-1 block text-sm font-medium text-neutral-700">
          Country <span aria-hidden="true">*</span>
        </label>
        <select
          id={id("country")}
          name={id("country")}
          required
          autoComplete="country"
          defaultValue={defaults?.country ?? ""}
          onChange={onCountryChange && ((e) => onCountryChange(e.target.value))}
          className={inputClass}
        >
          <option value="" disabled>
            Select a country
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
