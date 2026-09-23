export const LISTING_TYPES = ["For Sale", "For Rent"] as const;

export const PROPERTY_TYPES = [
  "Apartment",
  "Independent House",
  "Villa",
  "Plot/Land",
  "Commercial",
  "PG/Hostel",
  "Other",
];

export const RENT_FREQUENCIES = ["Monthly", "Yearly"];

export const AMENITIES = [
  "Parking",
  "Furnished",
  "Power Backup",
  "Water Supply",
  "Security",
  "Lift",
  "Garden",
  "Gym",
];

export interface HousingListingBody {
  title: string;
  listing_type: "For Sale" | "For Rent";
  property_type?: string | null;
  price?: number | null;
  rent_frequency?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqft?: number | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  pin_code?: string | null;
  amenities: string[];
  description?: string | null;
  poc_name?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  photo_urls: string[];
}

/** Shared by the create and edit routes so the column list can't drift between the two. */
export function sanitizeHousingListingBody(body: HousingListingBody) {
  return {
    title: body.title.trim(),
    listing_type: body.listing_type,
    property_type: body.property_type || null,
    price: body.price ?? null,
    rent_frequency: body.listing_type === "For Rent" ? body.rent_frequency || null : null,
    bedrooms: body.bedrooms ?? null,
    bathrooms: body.bathrooms ?? null,
    area_sqft: body.area_sqft ?? null,
    address_line1: body.address_line1?.trim() || null,
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    pin_code: body.pin_code?.trim() || null,
    amenities: body.amenities ?? [],
    description: body.description?.trim() || null,
    poc_name: body.poc_name?.trim() || null,
    email: body.email?.trim() || null,
    mobile_number: body.mobile_number?.trim() || null,
    whatsapp_number: body.whatsapp_number?.trim() || null,
    photo_urls: body.photo_urls ?? [],
  };
}

export function housingListingModerationText(body: HousingListingBody) {
  return [body.title, body.description, body.property_type, body.amenities?.join(", ")].filter(Boolean).join("\n\n");
}
