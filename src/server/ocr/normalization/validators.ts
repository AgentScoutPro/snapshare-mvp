const US_COUNTRY_CODE = "1";

export function normalizeEmail(value?: string | null): string {
  const email = String(value ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
  return email;
}

export function normalizeUrl(value?: string | null): string {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw || /\s/.test(raw)) return "";
  const withProtocol = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function normalizePhone(value?: string | null): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 10) return `+${US_COUNTRY_CODE}${digits}`;
  if (digits.length === 11 && digits.startsWith(US_COUNTRY_CODE)) return `+${digits}`;
  if (hasPlus && digits.length >= 8 && digits.length <= 15) return `+${digits}`;

  return "";
}

export type NormalizedAddress = {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function normalizeAddress(value: unknown): Partial<NormalizedAddress> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const address = value as Record<string, unknown>;
    const street = String(address.street_address ?? address.address1 ?? address.street ?? "").trim();
    const streetLines = street
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    return removeEmpty({
      address1: streetLines[0] ?? "",
      address2: compact(address.address2) || streetLines[1],
      city: compact(address.city),
      state: compact(address.state).toUpperCase(),
      postalCode: compact(address.postal_code ?? address.postalCode ?? address.zip),
      country: normalizeCountry(address.country),
    });
  }

  const raw = compact(value);
  if (!raw) return {};

  const [address1 = "", city = "", region = ""] = raw
    .split(",")
    .map((part) => part.trim());
  const regionMatch = region.match(/^([A-Za-z]{2})\s+(.+)$/);

  return removeEmpty({
    address1,
    city,
    state: regionMatch?.[1]?.toUpperCase() ?? "",
    postalCode: regionMatch?.[2] ?? "",
    country: "US",
  });
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function compact(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeCountry(value: unknown): string {
  const country = compact(value);
  const lookup: Record<string, string> = {
    france: "FR",
    fr: "FR",
    us: "US",
    usa: "US",
    "united states": "US",
    "united states of america": "US",
  };

  return lookup[country.toLowerCase()] ?? country.toUpperCase();
}

function removeEmpty(address: NormalizedAddress): Partial<NormalizedAddress> {
  return Object.fromEntries(
    Object.entries(address).filter(([, value]) => value),
  ) as Partial<NormalizedAddress>;
}
