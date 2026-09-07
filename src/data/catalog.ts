export type Product = {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAt?: number;
  category: string;
  mainCategory: string | string[];
  subCategory?: string;
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

export type CategoryNode = {
  name: string;
  handle: string;
  subcategories: string[];
  description: string;
};

const cdn = (path: string) => `https://www.maisonmakeeva.com/cdn/shop/files/${path}`;

export const categoryStructure: CategoryNode[] = [
  {
    name: "New Arrivals",
    handle: "new-arrivals",
    subcategories: [],
    description: "SS26 Runway Collection & Latest Atelier Drops",
  },
  {
    name: "Women",
    handle: "women",
    subcategories: [
      "T-Shirts",
      "Shirts",
      "Jackets",
      "Skirts & Mini Skirts",
      "Hoodies & Sweatshirts",
      "Bodysuits & Jumpsuits",
      "Shoes & Slides",
      "Accessories",
    ],
    description: "Sculptural Draping & Tailored Feminine Silhouettes",
  },
  {
    name: "Men",
    handle: "men",
    subcategories: [
      "T-Shirts",
      "Shirts",
      "Jackets",
      "Trousers & Pants",
      "Hoodies & Sweatshirts",
      "Shoes & Slides",
      "Accessories",
    ],
    description: "Heavy Cotton Cuts & Architectural Menswear",
  },
  {
    name: "Sets & Tracksuits",
    handle: "sets-tracksuits",
    subcategories: [],
    description: "Two-Piece Uniforms in 300 GSM Cotton, Denim & Velvet",
  },
  {
    name: "Archives",
    handle: "archives",
    subcategories: [
      "History",
      "Lookbooks",
      "Creative Projects",
      "Diary",
      "Evolution",
    ],
    description: "House Retrospective, Monographs & Creative Milestones",
  },
];

export const navGroups: Record<string, string[]> = {
  "New Arrivals": [],
  "Women": [
    "T-Shirts",
    "Shirts",
    "Jackets",
    "Skirts & Mini Skirts",
    "Hoodies & Sweatshirts",
    "Bodysuits & Jumpsuits",
    "Shoes & Slides",
    "Accessories",
  ],
  "Men": [
    "T-Shirts",
    "Shirts",
    "Jackets",
    "Trousers & Pants",
    "Hoodies & Sweatshirts",
    "Shoes & Slides",
    "Accessories",
  ],
  "Sets & Tracksuits": [],
  "Archives": [
    "History",
    "Lookbooks",
    "Creative Projects",
    "Diary",
    "Evolution",
  ],
};

export type ArchiveSection = {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  description: string;
  quote: string;
  image: string;
  highlights: string[];
};

export const archiveSections: Record<string, ArchiveSection> = {
  "History": {
    id: "history",
    title: "House Heritage & Origins",
    subtitle: "From Accra to Paris — The Maison Makeeva Odyssey",
    year: "2020 — Present",
    description: "Founded on the synthesis of cultural artistry and structural minimalism, Maison Makeeva began as an independent studio crafting limited run textiles with deep-rooted African heritage and Parisian couture sensibilities.",
    quote: "We don't borrow history; we weave continuity into every thread.",
    image: cdn("D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833"),
    highlights: ["Founding Atelier in Accra", "Migration of Codes to Paris Studio", "Development of Signature 300 GSM Heavy Cotton", "Archival Monogram Genesis"],
  },
  "Lookbooks": {
    id: "lookbooks",
    title: "Runway Monographs & Lookbooks",
    subtitle: "Complete Editorial Documentation of Every Season",
    year: "SS24 — SS26",
    description: "Explore the complete seasonal lookbooks showcasing architectural styling, runway proportions, and curated combinations straight from the showroom floor.",
    quote: "Silhouettes engineered to hold the room.",
    image: cdn("D59A9986_2048x.jpg?v=1763735666"),
    highlights: ["SS26 Monograph Presentation", "SS24 Rebel Black Archive", "Athleisure Movement Campaign", "Digital Runway Specimen Series"],
  },
  "Creative Projects": {
    id: "creative-projects",
    title: "Creative Projects & Material Experiments",
    subtitle: "Tactile Research, DTS Printing & 3D Garment Specimen Lab",
    year: "Continuous R&D",
    description: "Our creative laboratory explores experimental textile manipulation — from proprietary discharge pigment wash formulas to interactive 3D digital garment anatomy.",
    quote: "Bridging the tactile reality of heavy cotton with computational luxury.",
    image: cdn("D59A0120_1024x.jpg?v=1763739028"),
    highlights: ["Proprietary DTS Discharge Printing", "Stonewashed Indigo Mineral Baths", "Interactive 3D Garment Anatomy", "Monogram Jacquard Weave Trials"],
  },
  "Diary": {
    id: "diary",
    title: "The Atelier Diary",
    subtitle: "Unfiltered Dispatches from the Cutting Table",
    year: "2025 — 2026",
    description: "Chronicles, notes, and visual fragments recorded in real-time during collection development. Musings on proportion, weight, sound of fabric, and studio atmosphere.",
    quote: "A notebook kept between fabric scissors and warm espresso.",
    image: cdn("MM_pigalle-17_1024x1024_crop_center.png?v=1731458239"),
    highlights: ["Paris Fashion Week Off-Calendar Notes", "Accra Weaving Guild Sessions", "Midnight Dye Testing Dispatches", "Notes on Unisex Proportion"],
  },
  "Evolution": {
    id: "evolution",
    title: "Evolution & Silhouette Chronology",
    subtitle: "The Structural Progression of the House Wardrobe",
    year: "Retrospective",
    description: "Tracing the evolution of the Maison Makeeva uniform: how sportswear turned into sculptural couture, and how basic jersey transformed into campaign monuments.",
    quote: "Progress isn't reinvention; it's refinement under pressure.",
    image: cdn("RebelBlack_1024x1024_crop_center.jpg?v=1717758768"),
    highlights: ["The 2024 Streetwear Prototype", "The 2025 Velvet Transition", "The 2026 Bleached Monolith Era", "Future Projections of African Luxury"],
  },
};

export const collections: Collection[] = [
  {
    handle: "ss26",
    title: "Maison Makeeva Spring Summer SS26",
    season: "New arrivals",
    description: "Ready to wear collection built around cultural artistry, thick cotton, velvet, denim, and amplified MM identity.",
    image: cdn("D59A9986_2048x.jpg?v=1763735666"),
    categories: ["Sets & Tracksuits", "T-Shirts", "Shirts", "Bodysuits & Jumpsuits", "Accessories"],
  },
  {
    handle: "ss24",
    title: "Maison Makeeva Spring Summer SS24",
    season: "Archive campaign",
    description: "Graphic street-luxury silhouettes with campaign attitude and collectible MM codes.",
    image: cdn("RebelBlack_1024x1024_crop_center.jpg?v=1717758768"),
    categories: ["T-Shirts", "Hoodies & Sweatshirts", "Archives"],
  },
  {
    handle: "athleisure-campaign",
    title: "Athleisure Campaign",
    season: "Campaign",
    description: "Performance-led jersey silhouettes and tracksuit sets shaped for movement, identity, and presence.",
    image: cdn("MM_pigalle-17_1024x1024_crop_center.png?v=1731458239"),
    categories: ["Sets & Tracksuits", "Shirts"],
  },
];

export const products: Product[] = [
  {
    id: "gid://shopify/Product/mm-rfa-jersey-unisex",
    handle: "mm-r-f-a-jersey-unisex",
    title: "MM R-F-A - JERSEY Unisex",
    price: 65,
    category: "Shirts",
    mainCategory: ["Men", "Women"],
    subCategory: "Shirts",
    collection: "ss26",
    tags: ["BEST SELLERS", "Unisex", "Jersey", "SS26", "Men", "Women", "Shirts"],
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
    category: "Sets & Tracksuits",
    mainCategory: "Sets & Tracksuits",
    collection: "ss26",
    tags: ["BEST SELLERS", "Combination sets", "tracksuit sets", "Unisex", "Maison Makeeva SS26", "Sets & Tracksuits"],
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
    category: "Sets & Tracksuits",
    mainCategory: "Sets & Tracksuits",
    collection: "ss26",
    tags: ["BEST SELLERS", "stonewashed tracksuits", "Men", "Women", "Unisex", "Sets & Tracksuits"],
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
    category: "Sets & Tracksuits",
    mainCategory: "Sets & Tracksuits",
    collection: "ss26",
    tags: ["BEST SELLERS", "Tracksuits", "Unisex", "maison makeeva tracksuits", "Sets & Tracksuits"],
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
    category: "Sets & Tracksuits",
    mainCategory: "Sets & Tracksuits",
    collection: "athleisure-campaign",
    tags: ["BEST SELLERS", "Unisex", "Jersey", "Combination sets", "Sets & Tracksuits"],
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
    mainCategory: "Women",
    subCategory: "Bodysuits & Jumpsuits",
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
    category: "T-Shirts",
    mainCategory: ["Men", "Women"],
    subCategory: "T-Shirts",
    collection: "ss26",
    tags: ["Unisex", "T-Shirt", "Men", "Women", "T-Shirts"],
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
    category: "Accessories",
    mainCategory: ["Men", "Women"],
    subCategory: "Accessories",
    collection: "ss26",
    tags: ["Unisex", "Bags & Wallets", "Travel", "Accessories", "Men", "Women"],
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
    category: "T-Shirts",
    mainCategory: ["Men", "Women"],
    subCategory: "T-Shirts",
    collection: "ss24",
    tags: ["T-Shirt", "SS24", "Unisex", "Archives", "T-Shirts", "Men", "Women"],
    description: "Graphic tee from the Wakamania world, cut for a relaxed street-luxury fit.",
    story: "A visual dispatch from the SS24 universe, pairing everyday wearability with a strong Maison Makeeva signature.",
    materials: ["Cotton jersey", "Printed front graphic", "Relaxed silhouette"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rebel black"],
    images: [cdn("RebelBlack_1024x1024_crop_center.jpg?v=1717758768"), cdn("Screenshot_2024-06-07_at_02.55.32_1170x.png?v=1717721757")],
  },
  {
    id: "gid://shopify/Product/mm-monolith-jacket",
    handle: "mm-monolith-bleached-denim-jacket",
    title: "MM Monolith Bleached Denim Jacket",
    price: 295,
    category: "Jackets",
    mainCategory: ["Men", "Women"],
    subCategory: "Jackets",
    collection: "ss26",
    tags: ["Jackets", "Denim", "Unisex", "Men", "Women", "SS26", "Outerwear"],
    badge: "NEW ARRIVAL",
    description: "Heavy 14oz stonewashed denim jacket engineered with boxy sculptural shoulders and antique brass hardware.",
    story: "Developed in our Paris atelier with deep mineral wash distressing and archival Makeeva typographic stamp across the yoke.",
    materials: ["14oz ring-spun denim", "Custom cast hardware", "Hand-finished bleach patina"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Washed Indigo", "Faded Bone"],
    images: [cdn("D59A0120_1024x.jpg?v=1763739028"), cdn("D59A0128_023d8da9-46ee-4888-b62c-5da9ecbc7615_1024x.jpg?v=1763739045")],
  },
  {
    id: "gid://shopify/Product/mm-sculptural-mini-skirt",
    handle: "mm-sculptural-pleated-mini-skirt",
    title: "MM Sculptural Pleated Mini Skirt",
    price: 165,
    category: "Skirts & Mini Skirts",
    mainCategory: "Women",
    subCategory: "Skirts & Mini Skirts",
    collection: "ss26",
    tags: ["Skirts & Mini Skirts", "Women", "SS26", "Runway"],
    badge: "EXCLUSIVE",
    description: "Structured architectural mini skirt with reinforced knife pleats and monogram waist detailing.",
    story: "Designed to be paired with oversized jackets or the Monogram Jumpsuit for high-contrast runway proportions.",
    materials: ["Heavy cotton twill", "Concealed side zipper", "Enamelled MM hardware"],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Noir", "Raw Twill"],
    images: [cdn("D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112"), cdn("D59A9677_1024x.jpg?v=1761573023")],
  },
  {
    id: "gid://shopify/Product/mm-archival-hoodie",
    handle: "mm-archival-450gsm-heavy-hoodie",
    title: "MM Archival 450 GSM Heavy Hoodie",
    price: 195,
    category: "Hoodies & Sweatshirts",
    mainCategory: ["Men", "Women"],
    subCategory: "Hoodies & Sweatshirts",
    collection: "ss24",
    tags: ["Hoodies & Sweatshirts", "Men", "Women", "Unisex", "Archives", "Heavy Cotton"],
    badge: "ARCHIVE REISSUE",
    description: "Ultra-heavyweight 450 GSM diagonal loopback fleece hoodie with double-layered architectural hood.",
    story: "A house staple resurrected from the SS24 archive, showcasing high-density puff print and vintage cold-pigment garment dye.",
    materials: ["450 GSM combed cotton fleece", "Dense ribbing", "Puff embroidery print"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Rebel Black", "Washed Slate"],
    images: [cdn("RebelBlack_1024x1024_crop_center.jpg?v=1717758768"), cdn("D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833")],
  },
  {
    id: "gid://shopify/Product/mm-architectural-trousers",
    handle: "mm-architectural-wide-leg-trousers",
    title: "MM Architectural Wide-Leg Trousers",
    price: 185,
    category: "Trousers & Pants",
    mainCategory: "Men",
    subCategory: "Trousers & Pants",
    collection: "ss26",
    tags: ["Trousers & Pants", "Men", "SS26", "Tailored"],
    description: "Relaxed wide-leg trousers cut with front pinch-pleats and adjustable cinch waistband.",
    story: "Engineered to drape seamlessly over boots or slides, marrying tailored sophistication with casual streetwear presence.",
    materials: ["Wool-cotton blend twill", "Deep side pockets", "Internal drawstring"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir Velvet", "Charcoal Twill"],
    images: [cdn("D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823"), cdn("D59A0072_633fa3a3-04e3-42ed-98af-f0326da2c3c7_1024x.jpg?v=1763737880")],
  },
  {
    id: "gid://shopify/Product/mm-monogram-slides",
    handle: "mm-atelier-monogram-slides",
    title: "MM Atelier Monogram Slides",
    price: 145,
    category: "Shoes & Slides",
    mainCategory: ["Men", "Women"],
    subCategory: "Shoes & Slides",
    collection: "ss26",
    tags: ["Shoes & Slides", "Unisex", "Men", "Women", "Footwear", "SS26"],
    description: "Molded ergonomic luxury slides with textured Maison Makeeva monogram strap and dual-density foam sole.",
    story: "Crafted for effortless studio comfort and elevated warm-weather styling.",
    materials: ["Molded EVA footbed", "Embossed vegan leather upper", "Anti-slip grooved tread"],
    sizes: ["EU 38", "EU 40", "EU 42", "EU 44"],
    colors: ["Matte Noir", "Bone Ivory"],
    images: [cdn("D59A0055_1024x.jpg?v=1761559327"), cdn("D59A0047_1024x.jpg?v=1761559283")],
  },
];

export const policies = [
  "Standard & Express Shipping Available for all orders.",
  "Support 24/7: contact us any time.",
  "30 Days Return: return within 30 days for an exchange.",
];

export const shopifyIntegrationNotes = [
  "Product IDs use gid-style handles for Shopify Storefront API mapping.",
  "Category structure implements 5 primary categories (New Arrivals, Women, Men, Sets & Tracksuits, Archives).",
  "Subcategories accurately reflect ready-to-wear silhouettes and archival monographs.",
  "Cart, wishlist, account, search, and checkout calls are isolated behind UI components for future Shopify theme conversion.",
];
