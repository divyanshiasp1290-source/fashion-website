export type Product = {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAt?: number;
  category: string;
  collection: string;
  tags: string[];
  badge?: string;
  description: string;
  story: string;
  materials: string[];
  sizes: string[];
  colors: string[];
  images: string[];
};

export type Collection = {
  handle: string;
  title: string;
  season: string;
  description: string;
  image: string;
  categories: string[];
};

const cdn = (path: string) => `https://www.maisonmakeeva.com/cdn/shop/files/${path}`;

export const navGroups = {
  Men: [
    "Jackets",
    "Hoodies & Sweatshirts",
    "Shirts & T-shirts",
    "Trousers & Pants",
    "Socks",
    "Underwear",
    "Caps & Hats",
    "Shorts",
    "Shoes & Slides",
    "Belts",
    "Bags & Wallets",
  ],
  Women: [
    "Hoodies & Sweatshirts",
    "Shirts & T-Shirts",
    "Trousers & Pants",
    "Caps & Hats",
    "Socks & leggings",
    "Shorts",
    "Sandals & Slides",
    "Belts",
    "Bags & Wallets",
    "Bodysuits & Jumpsuits",
  ],
};

export const collections: Collection[] = [
  {
    handle: "ss26",
    title: "Maison Makeeva Spring Summer SS26",
    season: "New arrivals",
    description: "Ready to wear collection built around cultural artistry, thick cotton, velvet, denim, and amplified MM identity.",
    image: cdn("D59A9986_2048x.jpg?v=1763735666"),
    categories: ["Sets", "Jerseys", "Jumpsuits", "Bags", "T-Shirts"],
  },
  {
    handle: "ss24",
    title: "Maison Makeeva Spring Summer SS24",
    season: "Archive campaign",
    description: "Graphic street-luxury silhouettes with campaign attitude and collectible MM codes.",
    image: cdn("RebelBlack_1024x1024_crop_center.jpg?v=1717758768"),
    categories: ["T-Shirts", "Hoodies", "Shorts", "Caps"],
  },
  {
    handle: "athleisure-campaign",
    title: "Athleisure Campaign",
    season: "Campaign",
    description: "Performance-led jersey silhouettes and tracksuit sets shaped for movement, identity, and presence.",
    image: cdn("MM_pigalle-17_1024x1024_crop_center.png?v=1731458239"),
    categories: ["Jerseys", "Tracksuits", "Shorts"],
  },
];

export const products: Product[] = [
  {
    id: "gid://shopify/Product/mm-rfa-jersey-unisex",
    handle: "mm-r-f-a-jersey-unisex",
    title: "MM R-F-A - JERSEY Unisex",
    price: 65,
    category: "Shirts & T-shirts",
    collection: "ss26",
    tags: ["BEST SELLERS", "Unisex", "Jersey", "SS26"],
    badge: "BEST SELLERS",
    description: "A bold unisex jersey shaped around Maison Makeeva graphic codes and lightweight sports energy.",
    story: "Cut for an oversized editorial silhouette, the R-F-A Jersey brings Maison Makeeva’s visual language into a breathable ready-to-wear piece.",
    materials: ["100% polyester sports fabric", "Sublimated artwork", "Ribbed neckline"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Graphite", "Ivory print"],
    images: [cdn("D59A0059_1024x.jpg?v=1763488780"), cdn("D59A9575_1024x.jpg?v=1763488798")],
  },
  {
    id: "gid://shopify/Product/mm-bovinille-101",
    handle: "mm-bvinille-101-track-set-unisex",
    title: "MM Bovinille -101 TRACKSUIT SET UNISEX",
    price: 175,
    category: "Sets",
    collection: "ss26",
    tags: ["BEST SELLERS", "Combination sets", "tracksuit sets", "Unisex", "Maison Makeeva SS26"],
    badge: "BEST SELLERS",
    description: "Deep-bleach stonewashed set crafted from thick 300 GSM premium cotton for comfort, durability, and cultural artistry.",
    story: "A unified silhouette with high-contrast wash treatments and Maison Makeeva graphics, designed as a complete look rather than separates.",
    materials: ["300 GSM premium cotton", "Stonewashed finish", "Printed MM identity"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Deep bleach", "Washed black"],
    images: [cdn("D59A9978_1024x.jpg?v=1763606451"), cdn("D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833")],
  },
  {
    id: "gid://shopify/Product/mm-orion202",
    handle: "mm-orion202-stonewashed-denim-set",
    title: "MM Orion202 Stonewashed Denim Set",
    price: 250,
    category: "Sets",
    collection: "ss26",
    tags: ["BEST SELLERS", "stonewashed tracksuits", "Men", "Women", "Unisex"],
    badge: "BEST SELLERS",
    description: "Premium stonewashed denim set featuring Maison Makeeva’s signature DTS pattern prints and iconic M logo.",
    story: "A denim statement engineered with the density of workwear and the finish of a campaign piece.",
    materials: ["Premium denim", "Stonewashed treatment", "DTS pattern print"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed indigo", "Black print"],
    images: [cdn("D59A0120_1024x.jpg?v=1763739028"), cdn("D59A0128_023d8da9-46ee-4888-b62c-5da9ecbc7615_1024x.jpg?v=1763739045")],
  },
  {
    id: "gid://shopify/Product/mm-ntoube-302",
    handle: "mm-ntoube-302-tracksuit-set",
    title: "MM NTOUBE-302 TRACKSUIT SET UNISEX",
    price: 250,
    category: "Sets",
    collection: "ss26",
    tags: ["BEST SELLERS", "Tracksuits", "Unisex", "maison makeeva tracksuits"],
    badge: "BEST SELLERS",
    description: "Premium velvet tracksuit set with a soft, rich feel and detailed craftsmanship across every panel.",
    story: "NTOUBE-302 is the house’s plush uniform: elevated loungewear made precise, graphic, and evening-capable.",
    materials: ["Premium velvet", "Panel embroidery", "Elasticated waist"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Noir velvet", "Ivory mark"],
    images: [cdn("D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823"), cdn("D59A0072_633fa3a3-04e3-42ed-98af-f0326da2c3c7_1024x.jpg?v=1763737880")],
  },
  {
    id: "gid://shopify/Product/mm-roar",
    handle: "mm-roar-with-fierce-jersey",
    title: "MM ROAR-WITH-FIERCE JERSEY SET",
    price: 65,
    category: "Sets",
    collection: "athleisure-campaign",
    tags: ["BEST SELLERS", "Women", "Jersey", "Combination sets"],
    badge: "BEST SELLERS",
    description: "Cropped jersey and matching shorts in premium sports fabric, created for strength, culture, and identity.",
    story: "A fierce two-piece campaign look that compresses Maison Makeeva’s graphic confidence into a summer uniform.",
    materials: ["100% polyester sports fabric", "Sublimated print", "Cropped jersey"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory multi", "Noir"],
    images: [cdn("D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112"), cdn("D59A9677_1024x.jpg?v=1761573023")],
  },
  {
    id: "gid://shopify/Product/mm-monogram-jumpsuit",
    handle: "mm-monogram-jumpsuit",
    title: "MM Monogram Jumpsuit",
    price: 65,
    category: "Bodysuits & Jumpsuits",
    collection: "ss26",
    tags: ["Bodysuits & Jumpsuits", "JUMPSUIT", "Women", "womensbodysuit"],
    description: "One-piece silhouette featuring all-over sublimation print of the Maison Makeeva monogram.",
    story: "A body-conscious graphic layer built with comfort and cultural repetition, designed to hold its own under denim or alone.",
    materials: ["Stretch technical jersey", "All-over monogram print", "Contour seams"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Monogram noir"],
    images: [cdn("D59A9985_1024x.jpg?v=1763589060"), cdn("D59A0073_1024x.jpg?v=1763589060")],
  },
  {
    id: "gid://shopify/Product/mm-esande",
    handle: "mm-esande-t-shirt-unisex",
    title: "MM ESANDE T-SHIRT UNISEX",
    price: 125,
    category: "Shirts & T-shirts",
    collection: "ss26",
    tags: ["Unisex", "T-Shirt", "Men", "Women"],
    description: "Premium unisex tee with a gallery-scale MM artwork presence.",
    story: "ESANDE is built like a collectible graphic object: clean from afar, intricate at close range.",
    materials: ["Heavy cotton jersey", "Screen printed artwork", "Oversized fit"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Bone"],
    images: [cdn("D59A0164_1024x.jpg?v=1763740068"), cdn("D59A0172_1024x.jpg?v=1763740068")],
  },
  {
    id: "gid://shopify/Product/mm-agendia-007",
    handle: "mm-agendia-007-duffle-bag-unisex",
    title: "MM Agendia 007 Duffle Bag UNISEX",
    price: 535,
    category: "Bags & Wallets",
    collection: "ss26",
    tags: ["Unisex", "Bags & Wallets", "Travel"],
    description: "Statement duffle bag with Maison Makeeva scale, hardware, and travel presence.",
    story: "A campaign carryall for the customer who treats the airport, the studio, and the street as one runway.",
    materials: ["Structured shell", "Premium hardware", "Detachable strap"],
    sizes: ["OS"],
    colors: ["Noir"],
    images: [cdn("D59A0055_1024x.jpg?v=1761559327"), cdn("D59A0047_1024x.jpg?v=1761559283")],
  },
  {
    id: "gid://shopify/Product/mm-wakamania",
    handle: "mm-wakamania-reality-t-shirt",
    title: "MM Wakamania Reality T- Shirt",
    price: 105,
    category: "Shirts & T-shirts",
    collection: "ss24",
    tags: ["T-Shirt", "SS24", "Unisex"],
    description: "Graphic tee from the Wakamania world, cut for a relaxed street-luxury fit.",
    story: "A visual dispatch from the SS24 universe, pairing everyday wearability with a strong Maison Makeeva signature.",
    materials: ["Cotton jersey", "Printed front graphic", "Relaxed silhouette"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rebel black"],
    images: [cdn("RebelBlack_1024x1024_crop_center.jpg?v=1717758768"), cdn("Screenshot_2024-06-07_at_02.55.32_1170x.png?v=1717721757")],
  },
];

export const policies = [
  "Standard & Express Shipping Available for all orders.",
  "Support 24/7: contact us any time.",
  "30 Days Return: return within 30 days for an exchange.",
];

export const shopifyIntegrationNotes = [
  "Product IDs use gid-style handles for Shopify Storefront API mapping.",
  "Collections and tags mirror current Shopify navigation.",
  "Cart, wishlist, account, search, and checkout calls are isolated behind UI components for future Shopify theme conversion.",
];
