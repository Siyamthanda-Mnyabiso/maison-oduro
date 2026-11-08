export type Product = {
  name: string;
  variant: string;
  price: string;
};

// Product copy comes straight from the Figma design (Page 1, hi-fi).
// Swap these for real Maison Oduro elixirs when the catalogue is ready.
export const softsense: Product[] = [
  { name: "SoftSense™ High-Rise Shorts", variant: "Regular · Cherry Red", price: "R860" },
  { name: "SoftSense™ Multiway Long Sleeve Crop Top", variant: "Cherry Red", price: "R860" },
  { name: "SoftSense™ High-Rise Leggings", variant: "Regular · Cherry Red", price: "R1,040" },
  { name: "SoftSense Longline Sports Bra", variant: "Medium Support · Cherry Red", price: "R760" },
  { name: "SoftSense™ Multiway Long Sleeve Top", variant: "Cherry Red", price: "R790" },
];

export const vengeance: Product[] = [
  { name: "Vengeance Graphic T-Shirt", variant: "Oversized Fit · Black/Wash", price: "R720" },
  { name: "Vengeance Graphic T-Shirt", variant: "Oversized Fit · Smokey Grey/Wash", price: "R720" },
  { name: "Vengeance Graphic T-Shirt", variant: "Oversized Fit · Soft White/Wash", price: "R720" },
  { name: "Vengeance Graphic Tank", variant: "Oversized Fit · Black/Wash", price: "R580" },
  { name: "Vengeance Graphic Tank", variant: "Oversized Fit · White/Wash", price: "R580" },
];

export const productOptions = ["Premium", "Standard", "Roller-on"] as const;
export type ProductOption = (typeof productOptions)[number];

// Bottle shown for each format. Roller-on has no photo yet, so it reuses
// the Premium bottle. Drop a new file in /public/images and point it here.
export const optionImages: Record<ProductOption, string> = {
  Premium: "/images/elixir.jpg",
  Standard: "/images/elixir-standard.jpg",
  "Roller-on": "/images/elixir.jpg",
};

// Cart settings and copy
export const FREE_SHIPPING_THRESHOLD = 1500;

export const deliveryOptions = [
  { name: "Standard Shipping", price: "R170", eta: "Estimated 7-14 working days", note: "Free over R1,500" },
  { name: "Express Shipping", price: "R280", eta: "Estimated 4-6 working days", note: "" },
];

export const paymentMethods = ["Visa", "Mastercard", "American Express", "PayPal", "Apple Pay"];

// "Add a little extra" suggestions. Swap for real Maison Oduro add-ons.
export const cartExtras = [
  { name: "Discovery Set", price: "R630", image: "/images/elixir.jpg" },
  { name: "Travel Atomiser", price: "R360", image: "/images/elixir-standard.jpg" },
  { name: "Signature Gift Box", price: "R500", image: "/images/elixir.jpg" },
  { name: "Sample Trio", price: "R400", image: "/images/elixir-standard.jpg" },
  { name: "Leather Pouch", price: "R450", image: "/images/elixir.jpg" },
  { name: "Roller-on Refill", price: "R450", image: "/images/elixir-standard.jpg" },
];

export const popularTabs = ["Women", "Men", "Unisex"] as const;

export const popularCards = [
  { title: "Best Sellers", text: "The elixirs everyone keeps coming back to." },
  { title: "Gift Sets", text: "Beautifully boxed, ready to give." },
  { title: "New Arrivals", text: "Fresh from the house, just launched." },
  { title: "Discovery Set", text: "Try the full collection in travel sizes." },
];

export const navLinks = ["Elixirs", "Gifts", "Our story", "Journal"];

export const footerColumns = [
  { title: "Shop", links: ["Elixirs", "Gift sets", "Samples", "Best sellers"] },
  { title: "House", links: ["Our story", "Journal", "Stockists", "Contact"] },
  { title: "Care", links: ["Shipping", "Returns", "FAQs", "Fragrance guide"] },
  { title: "Follow", links: ["Instagram", "TikTok", "Pinterest"] },
];
