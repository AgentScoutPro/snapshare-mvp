import type { CapturedContact, UserProfile } from "./types";

export function contactToVCardProfile(contact: CapturedContact): UserProfile {
  return {
    name: contact.name,
    title: contact.title,
    company: contact.company,
    email: contact.email,
    phone: contact.phone,
    website: contact.website,
    notes: contact.notes,
  };
}

export function buildVCard(profile: UserProfile): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCardText(profile.name)}`,
    `N:${escapeStructuredName(profile.name)}`,
    profile.company ? `ORG:${escapeVCardText(profile.company)}` : "",
    profile.title ? `TITLE:${escapeVCardText(profile.title)}` : "",
    profile.phone ? `TEL;TYPE=CELL:${escapeVCardText(profile.phone)}` : "",
    profile.email ? `EMAIL;TYPE=INTERNET:${escapeVCardText(profile.email)}` : "",
    profile.website ? `URL:${escapeVCardText(profile.website)}` : "",
    profile.notes ? `NOTE:${escapeVCardText(profile.notes)}` : "",
    "END:VCARD",
  ].filter(Boolean);

  return `${lines.join("\r\n")}\r\n`;
}

export function createVCardFileName(profile: Pick<UserProfile, "name">): string {
  const safeName = profile.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${safeName || "snapshare-contact"}.vcf`;
}

function escapeStructuredName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts.slice(0, -1).join(" ");
  const last = parts.length > 1 ? parts[parts.length - 1] : "";
  return `${escapeVCardText(last)};${escapeVCardText(first || name)};;;`;
}

function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
