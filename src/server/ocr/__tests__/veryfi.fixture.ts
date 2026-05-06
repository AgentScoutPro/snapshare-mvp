import type { SnapShareContact } from "../types";

export const veryfiBusinessCardFixture = {
  name: "Maya Chen",
  first_name: "Maya",
  last_name: "Chen",
  company: "Brightline Studio",
  title: "Partnerships Lead",
  email: "MAYA@Brightline.Studio",
  phone_number: "(602) 555-0184",
  mobile_number: "(602) 555-0184",
  fax_number: "(602) 555-0185",
  website: "brightline.studio",
  address: "44 E Monroe St, Phoenix, AZ 85004",
  parsed_address: {
    street_address: "44 E Monroe St",
    city: "Phoenix",
    state: "AZ",
    postal_code: "85004",
    country: "US",
  },
  confidence_details: {
    name: { score: 0.97 },
    company: { score: 0.95 },
    title: { score: 0.93 },
    email: { score: 0.98 },
    phone_number: { score: 0.86 },
    website: { score: 0.91 },
    address: { score: 0.72 },
  },
};

export const normalizedContactFixture: SnapShareContact = {
  fullName: "Maya Chen",
  firstName: "Maya",
  lastName: "Chen",
  company: "Brightline Studio",
  jobTitle: "Partnerships Lead",
  email: "maya@brightline.studio",
  mobilePhone: "+16025550184",
  officePhone: "+16025550185",
  website: "https://brightline.studio",
  address1: "44 E Monroe St",
  city: "Phoenix",
  state: "AZ",
  postalCode: "85004",
  country: "US",
  notes: "",
  source: "SnapShare",
  confidence: {
    fullName: 0.97,
    company: 0.95,
    jobTitle: 0.93,
    email: 0.98,
    mobilePhone: 0.86,
    officePhone: 0.86,
    website: 0.91,
    address1: 0.72,
  },
  lowConfidenceFields: ["mobilePhone", "address1"],
};

export const multilineBusinessCardFixture = {
  name: "Jordan Patel",
  first_name: "Jordan",
  last_name: "Patel",
  company: "Northstar Events",
  title: "Founder",
  emails: ["JORDAN@NORTHSTAR.EVENTS"],
  phone_numbers: ["+1 415 555 0144", "415.555.0145"],
  website: "www.northstar.events",
  parsed_address: {
    street_address: "201 Spear St\nSuite 1100",
    city: "San Francisco",
    state: "ca",
    postal_code: "94105",
    country: "United States",
  },
  confidence_details: {
    name: { score: 0.94 },
    company: { score: 0.92 },
    title: { score: 0.77 },
    email: { score: 0.97 },
    phone_number: { score: 0.91 },
    website: { score: 0.9 },
    address: { score: 0.89 },
  },
};

export const incompleteBusinessCardFixture = {
  name: "Avery Brooks",
  company: "Civic Signal",
  title: "Director",
  email: "avery at civic signal",
  phone_number: "schedule a call",
  website: "not a website",
  confidence_details: {
    name: { score: 0.94 },
    company: { score: 0.82 },
    email: { score: 0.4 },
    phone_number: { score: 0.32 },
    website: { score: 0.48 },
  },
};

export const internationalBusinessCardFixture = {
  name: "Sofia Laurent",
  company: "Atelier Nova",
  title: "Creative Director",
  email: "SOFIA@ATELIERNOVA.FR",
  phone_number: "+33 1 42 68 00 00",
  website: "ateliernova.fr",
  parsed_address: {
    street_address: "18 Rue Montorgueil",
    city: "Paris",
    postal_code: "75002",
    country: "France",
  },
  confidence_details: {
    name: { score: 0.96 },
    company: { score: 0.94 },
    title: { score: 0.91 },
    email: { score: 0.95 },
    phone_number: { score: 0.93 },
    website: { score: 0.94 },
    address: { score: 0.9 },
  },
};

export const missingConfidenceBusinessCardFixture = {
  name: "No Confidence",
  company: "Quiet Fields",
  title: "Owner",
  email: "no-confidence@example.com",
  mobile_number: "(602) 555-0111",
  website: "quietfields.example",
  confidence_details: {},
};
