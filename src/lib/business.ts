export const BUSINESS_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const BUSINESS_CATEGORIES = [
  "Printing Shop",
  "T Shirt Printing Services",
  "Grocery Store",
  "Restaurant",
  "Salon & Spa",
  "Electronics",
  "Clothing & Apparel",
  "Home Services",
  "Tutoring",
  "Other",
];

export interface BusinessListingBody {
  name: string;
  pin_code?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  street?: string | null;
  landmark?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  poc_name?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  categories: string[];
  open_days: string[];
  open_time?: string | null;
  close_time?: string | null;
  photo_urls: string[];
}

/** Shared by the create and edit routes so the column list can't drift between the two. */
export function sanitizeBusinessListingBody(body: BusinessListingBody) {
  return {
    name: body.name.trim(),
    pin_code: body.pin_code?.trim() || null,
    address_line1: body.address_line1?.trim() || null,
    address_line2: body.address_line2?.trim() || null,
    street: body.street?.trim() || null,
    landmark: body.landmark?.trim() || null,
    area: body.area?.trim() || null,
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    poc_name: body.poc_name?.trim() || null,
    mobile_number: body.mobile_number?.trim() || null,
    whatsapp_number: body.whatsapp_number?.trim() || null,
    email: body.email?.trim() || null,
    categories: body.categories ?? [],
    open_days: body.open_days ?? [],
    open_time: body.open_time || null,
    close_time: body.close_time || null,
    photo_urls: body.photo_urls ?? [],
  };
}

export function businessListingModerationText(body: BusinessListingBody) {
  return [body.name, body.address_line1, body.address_line2, body.categories?.join(", ")].filter(Boolean).join("\n\n");
}
