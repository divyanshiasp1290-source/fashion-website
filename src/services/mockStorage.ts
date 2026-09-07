import type {
  CreateOrderPayload,
  DbCategory,
  DbCollection,
  DbContactMessage,
  DbCustomer,
  DbInventory,
  DbNewsletterSubscriber,
  DbOrder,
  DbOrderItem,
  DbProduct,
  DbProductImage,
} from "../types/database";

const STORAGE_KEYS = {
  PRODUCTS: "mm_db_products_v1",
  CATEGORIES: "mm_db_categories_v1",
  COLLECTIONS: "mm_db_collections_v1",
  INVENTORY: "mm_db_inventory_v1",
  ORDERS: "mm_db_orders_v1",
  CUSTOMERS: "mm_db_customers_v1",
  CONTACT: "mm_db_contact_v1",
  NEWSLETTER: "mm_db_newsletter_v1",
};

// Initial Seed Categories
const INITIAL_CATEGORIES: DbCategory[] = [
  { id: "cat-1", name: "New Arrivals", slug: "new-arrivals", parent_id: null, sort_order: 1, description: "SS26 Runway Collection & Latest Atelier Drops", status: "active" },
  { id: "cat-2", name: "Women", slug: "women", parent_id: null, sort_order: 2, description: "Sculptural Draping & Tailored Feminine Silhouettes", status: "active" },
  { id: "cat-3", name: "Men", slug: "men", parent_id: null, sort_order: 3, description: "Heavy Cotton Cuts & Architectural Menswear", status: "active" },
  { id: "cat-4", name: "Sets & Tracksuits", slug: "sets-tracksuits", parent_id: null, sort_order: 4, description: "Two-Piece Uniforms in 300 GSM Cotton, Denim & Velvet", status: "active" },
  { id: "cat-5", name: "Archives", slug: "archives", parent_id: null, sort_order: 5, description: "House Retrospective, Monographs & Creative Milestones", status: "active" },

  // Women Subcategories
  { id: "cat-w-1", name: "T-Shirts", slug: "women-t-shirts", parent_id: "cat-2", sort_order: 1, status: "active" },
  { id: "cat-w-2", name: "Shirts", slug: "women-shirts", parent_id: "cat-2", sort_order: 2, status: "active" },
  { id: "cat-w-3", name: "Jackets", slug: "women-jackets", parent_id: "cat-2", sort_order: 3, status: "active" },
  { id: "cat-w-4", name: "Skirts & Mini Skirts", slug: "women-skirts-mini-skirts", parent_id: "cat-2", sort_order: 4, status: "active" },
  { id: "cat-w-5", name: "Hoodies & Sweatshirts", slug: "women-hoodies-sweatshirts", parent_id: "cat-2", sort_order: 5, status: "active" },
  { id: "cat-w-6", name: "Bodysuits & Jumpsuits", slug: "women-bodysuits-jumpsuits", parent_id: "cat-2", sort_order: 6, status: "active" },
  { id: "cat-w-7", name: "Shoes & Slides", slug: "women-shoes-slides", parent_id: "cat-2", sort_order: 7, status: "active" },
  { id: "cat-w-8", name: "Accessories", slug: "women-accessories", parent_id: "cat-2", sort_order: 8, status: "active" },

  // Men Subcategories
  { id: "cat-m-1", name: "T-Shirts", slug: "men-t-shirts", parent_id: "cat-3", sort_order: 1, status: "active" },
  { id: "cat-m-2", name: "Shirts", slug: "men-shirts", parent_id: "cat-3", sort_order: 2, status: "active" },
  { id: "cat-m-3", name: "Jackets", slug: "men-jackets", parent_id: "cat-3", sort_order: 3, status: "active" },
  { id: "cat-m-4", name: "Trousers & Pants", slug: "men-trousers-pants", parent_id: "cat-3", sort_order: 4, status: "active" },
  { id: "cat-m-5", name: "Hoodies & Sweatshirts", slug: "men-hoodies-sweatshirts", parent_id: "cat-3", sort_order: 5, status: "active" },
  { id: "cat-m-6", name: "Shoes & Slides", slug: "men-shoes-slides", parent_id: "cat-3", sort_order: 6, status: "active" },
  { id: "cat-m-7", name: "Accessories", slug: "men-accessories", parent_id: "cat-3", sort_order: 7, status: "active" },

  // Archives Subcategories
  { id: "cat-a-1", name: "History", slug: "archives-history", parent_id: "cat-5", sort_order: 1, status: "active" },
  { id: "cat-a-2", name: "Lookbooks", slug: "archives-lookbooks", parent_id: "cat-5", sort_order: 2, status: "active" },
  { id: "cat-a-3", name: "Creative Projects", slug: "archives-creative-projects", parent_id: "cat-5", sort_order: 3, status: "active" },
  { id: "cat-a-4", name: "Diary", slug: "archives-diary", parent_id: "cat-5", sort_order: 4, status: "active" },
  { id: "cat-a-5", name: "Evolution", slug: "archives-evolution", parent_id: "cat-5", sort_order: 5, status: "active" },
];

// Initial Seed Collections
const INITIAL_COLLECTIONS: DbCollection[] = [
  {
    id: "col-ss26",
    name: "Maison Makeeva Spring Summer SS26",
    slug: "ss26",
    season: "New arrivals",
    description: "Ready to wear collection built around cultural artistry, thick cotton, velvet, denim, and amplified MM identity.",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
    status: "active",
  },
  {
    id: "col-ss24",
    name: "Maison Makeeva Spring Summer SS24",
    slug: "ss24",
    season: "Archive campaign",
    description: "Graphic street-luxury silhouettes with campaign attitude and collectible MM codes.",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768",
    status: "active",
  },
  {
    id: "col-athleisure",
    name: "Athleisure Campaign",
    slug: "athleisure-campaign",
    season: "Campaign",
    description: "Performance-led jersey silhouettes and tracksuit sets shaped for movement, identity, and presence.",
    image: "https://www.maisonmakeeva.com/cdn/shop/files/MM_pigalle-17_1024x1024_crop_center.png?v=1731458239",
    status: "active",
  },
];

// Initial Seed Products
const INITIAL_PRODUCTS: DbProduct[] = [
  {
    id: "prod-1",
    name: "MM Orion202 Stonewashed Denim Set",
    slug: "mm-orion202-stonewashed-denim-set",
    sku: "MM-SS26-001",
    description: "Premium stonewashed denim set featuring Maison Makeeva’s signature DTS pattern prints and iconic M logo.",
    short_description: "Stonewashed denim set with DTS monogram.",
    story: "A denim statement engineered with the density of workwear and the finish of a campaign piece.",
    price: 250,
    gender: "Unisex",
    category_id: "cat-4",
    collection_id: "col-ss26",
    badge: "BEST SELLERS",
    materials: ["Premium denim", "Stonewashed treatment", "DTS pattern print"],
    tags: ["BEST SELLERS", "stonewashed tracksuits", "Men", "Women", "Unisex", "Sets & Tracksuits"],
    featured: true,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-1-1", product_id: "prod-1", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028", sort_order: 0, alt_text: "Orion202 Front" },
      { id: "img-1-2", product_id: "prod-1", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0128_023d8da9-46ee-4888-b62c-5da9ecbc7615_1024x.jpg?v=1763739045", sort_order: 1, alt_text: "Orion202 Detail" },
    ],
  },
  {
    id: "prod-2",
    name: "MM R-F-A - JERSEY Unisex",
    slug: "mm-r-f-a-jersey-unisex",
    sku: "MM-SS26-002",
    description: "A bold unisex jersey shaped around Maison Makeeva graphic codes and lightweight sports energy.",
    short_description: "Lightweight unisex sports-couture jersey.",
    story: "Cut for an oversized editorial silhouette, the R-F-A Jersey brings Maison Makeeva’s visual language into a breathable ready-to-wear piece.",
    price: 65,
    gender: "Unisex",
    category_id: "cat-3",
    subcategory_id: "cat-m-2",
    collection_id: "col-ss26",
    badge: "BEST SELLERS",
    materials: ["100% polyester sports fabric", "Sublimated artwork", "Ribbed neckline"],
    tags: ["BEST SELLERS", "Unisex", "Jersey", "SS26", "Men", "Women", "Shirts"],
    featured: true,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-2-1", product_id: "prod-2", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0059_1024x.jpg?v=1763488780", sort_order: 0, alt_text: "RFA Jersey Front" },
      { id: "img-2-2", product_id: "prod-2", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9575_1024x.jpg?v=1763488798", sort_order: 1, alt_text: "RFA Jersey Back" },
    ],
  },
  {
    id: "prod-3",
    name: "MM Bovinille -101 TRACKSUIT SET UNISEX",
    slug: "mm-bvinille-101-track-set-unisex",
    sku: "MM-SS26-003",
    description: "Deep-bleach stonewashed set crafted from thick 300 GSM premium cotton for comfort, durability, and cultural artistry.",
    short_description: "Deep-bleached 300 GSM cotton heavyweight tracksuit.",
    story: "A unified silhouette with high-contrast wash treatments and Maison Makeeva graphics, designed as a complete look rather than separates.",
    price: 175,
    gender: "Unisex",
    category_id: "cat-4",
    collection_id: "col-ss26",
    badge: "BEST SELLERS",
    materials: ["300 GSM premium cotton", "Stonewashed finish", "Printed MM identity"],
    tags: ["BEST SELLERS", "Combination sets", "tracksuit sets", "Unisex", "Maison Makeeva SS26", "Sets & Tracksuits"],
    featured: true,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-3-1", product_id: "prod-3", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9978_1024x.jpg?v=1763606451", sort_order: 0, alt_text: "Bovinille 101 Front" },
      { id: "img-3-2", product_id: "prod-3", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833", sort_order: 1, alt_text: "Bovinille 101 Editorial" },
    ],
  },
  {
    id: "prod-4",
    name: "MM NTOUBE-302 TRACKSUIT SET UNISEX",
    slug: "mm-ntoube-302-tracksuit-set",
    sku: "MM-SS26-004",
    description: "Premium velvet tracksuit set with a soft, rich feel and detailed craftsmanship across every panel.",
    short_description: "Architectural velvet tracksuit set with panel embroidery.",
    story: "NTOUBE-302 is the house’s plush uniform: elevated loungewear made precise, graphic, and evening-capable.",
    price: 250,
    gender: "Unisex",
    category_id: "cat-4",
    collection_id: "col-ss26",
    badge: "BEST SELLERS",
    materials: ["Premium velvet", "Panel embroidery", "Elasticated waist"],
    tags: ["BEST SELLERS", "Tracksuits", "Unisex", "maison makeeva tracksuits", "Sets & Tracksuits"],
    featured: false,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-4-1", product_id: "prod-4", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823", sort_order: 0, alt_text: "Ntoube 302 Front" },
      { id: "img-4-2", product_id: "prod-4", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0072_633fa3a3-04e3-42ed-98af-f0326da2c3c7_1024x.jpg?v=1763737880", sort_order: 1, alt_text: "Ntoube 302 Detail" },
    ],
  },
  {
    id: "prod-5",
    name: "MM ROAR-WITH-FIERCE JERSEY SET",
    slug: "mm-roar-with-fierce-jersey",
    sku: "MM-ATH-005",
    description: "Cropped jersey and matching shorts in premium sports fabric, created for strength, culture, and identity.",
    short_description: "Cropped sports jersey and shorts combination set.",
    story: "A fierce two-piece campaign look that compresses Maison Makeeva’s graphic confidence into a summer uniform.",
    price: 65,
    gender: "Women",
    category_id: "cat-4",
    collection_id: "col-athleisure",
    badge: "BEST SELLERS",
    materials: ["100% polyester sports fabric", "Sublimated print", "Cropped jersey"],
    tags: ["BEST SELLERS", "Unisex", "Jersey", "Combination sets", "Sets & Tracksuits"],
    featured: false,
    new_arrival: false,
    status: "active",
    images: [
      { id: "img-5-1", product_id: "prod-5", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112", sort_order: 0, alt_text: "Roar Jersey Front" },
      { id: "img-5-2", product_id: "prod-5", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9677_1024x.jpg?v=1761573023", sort_order: 1, alt_text: "Roar Jersey Back" },
    ],
  },
  {
    id: "prod-6",
    name: "MM Monogram Jumpsuit",
    slug: "mm-monogram-jumpsuit",
    sku: "MM-SS26-006",
    description: "One-piece silhouette featuring all-over sublimation print of the Maison Makeeva monogram.",
    short_description: "Second-skin monogram technical jumpsuit.",
    story: "A body-conscious graphic layer built with comfort and cultural repetition, designed to hold its own under denim or alone.",
    price: 65,
    gender: "Women",
    category_id: "cat-2",
    subcategory_id: "cat-w-6",
    collection_id: "col-ss26",
    materials: ["Stretch technical jersey", "All-over monogram print", "Contour seams"],
    tags: ["Bodysuits & Jumpsuits", "JUMPSUIT", "Women", "womensbodysuit"],
    featured: true,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-6-1", product_id: "prod-6", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9985_1024x.jpg?v=1763589060", sort_order: 0, alt_text: "Monogram Jumpsuit Front" },
      { id: "img-6-2", product_id: "prod-6", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0073_1024x.jpg?v=1763589060", sort_order: 1, alt_text: "Monogram Jumpsuit Detail" },
    ],
  },
  {
    id: "prod-7",
    name: "MM ESANDE T-SHIRT UNISEX",
    slug: "mm-esande-t-shirt-unisex",
    sku: "MM-SS26-007",
    description: "Premium unisex tee with a gallery-scale MM artwork presence.",
    short_description: "Heavyweight graphic cotton tee with screenprint artwork.",
    story: "ESANDE is built like a collectible graphic object: clean from afar, intricate at close range.",
    price: 125,
    gender: "Unisex",
    category_id: "cat-3",
    subcategory_id: "cat-m-1",
    collection_id: "col-ss26",
    materials: ["Heavy cotton jersey", "Screen printed artwork", "Oversized fit"],
    tags: ["Unisex", "T-Shirt", "Men", "Women", "T-Shirts"],
    featured: false,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-7-1", product_id: "prod-7", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0164_1024x.jpg?v=1763740068", sort_order: 0, alt_text: "Esande Tee Front" },
      { id: "img-7-2", product_id: "prod-7", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0172_1024x.jpg?v=1763740068", sort_order: 1, alt_text: "Esande Tee Back" },
    ],
  },
  {
    id: "prod-8",
    name: "MM Agendia 007 Duffle Bag UNISEX",
    slug: "mm-agendia-007-duffle-bag-unisex",
    sku: "MM-SS26-008",
    description: "Statement duffle bag with Maison Makeeva scale, hardware, and travel presence.",
    short_description: "Sculptural travel duffle with signature hardware.",
    story: "A campaign carryall for the customer who treats the airport, the studio, and the street as one runway.",
    price: 535,
    gender: "Unisex",
    category_id: "cat-3",
    subcategory_id: "cat-m-7",
    collection_id: "col-ss26",
    materials: ["Structured shell", "Premium hardware", "Detachable strap"],
    tags: ["Unisex", "Bags & Wallets", "Travel", "Accessories", "Men", "Women"],
    featured: true,
    new_arrival: false,
    status: "active",
    images: [
      { id: "img-8-1", product_id: "prod-8", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0055_1024x.jpg?v=1761559327", sort_order: 0, alt_text: "Agendia Bag Front" },
      { id: "img-8-2", product_id: "prod-8", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0047_1024x.jpg?v=1761559283", sort_order: 1, alt_text: "Agendia Bag Detail" },
    ],
  },
  {
    id: "prod-9",
    name: "MM Wakamania Reality T- Shirt",
    slug: "mm-wakamania-reality-t-shirt",
    sku: "MM-SS24-009",
    description: "Graphic tee from the Wakamania world, cut for a relaxed street-luxury fit.",
    short_description: "Archival Wakamania cotton tee.",
    story: "A visual dispatch from the SS24 universe, pairing everyday wearability with a strong Maison Makeeva signature.",
    price: 105,
    gender: "Unisex",
    category_id: "cat-5",
    subcategory_id: "cat-a-2",
    collection_id: "col-ss24",
    materials: ["Cotton jersey", "Printed front graphic", "Relaxed silhouette"],
    tags: ["T-Shirt", "SS24", "Unisex", "Archives", "T-Shirts", "Men", "Women"],
    featured: false,
    new_arrival: false,
    status: "active",
    images: [
      { id: "img-9-1", product_id: "prod-9", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768", sort_order: 0, alt_text: "Wakamania Front" },
    ],
  },
  {
    id: "prod-10",
    name: "MM Monolith Bleached Denim Jacket",
    slug: "mm-monolith-bleached-denim-jacket",
    sku: "MM-SS26-010",
    description: "Heavy 14oz stonewashed denim jacket engineered with boxy sculptural shoulders and antique brass hardware.",
    short_description: "14oz stonewashed denim jacket with antique brass hardware.",
    story: "Developed in our Paris atelier with deep mineral wash distressing and archival Makeeva typographic stamp across the yoke.",
    price: 295,
    gender: "Unisex",
    category_id: "cat-3",
    subcategory_id: "cat-m-3",
    collection_id: "col-ss26",
    badge: "NEW ARRIVAL",
    materials: ["14oz ring-spun denim", "Custom cast hardware", "Hand-finished bleach patina"],
    tags: ["Jackets", "Denim", "Unisex", "Men", "Women", "SS26", "Outerwear"],
    featured: true,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-10-1", product_id: "prod-10", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028", sort_order: 0, alt_text: "Monolith Denim Jacket Front" },
    ],
  },
  {
    id: "prod-11",
    name: "MM Sculptural Pleated Mini Skirt",
    slug: "mm-sculptural-pleated-mini-skirt",
    sku: "MM-SS26-011",
    description: "Structured architectural mini skirt with reinforced knife pleats and monogram waist detailing.",
    short_description: "Structured knife-pleated skirt with monogram waist detail.",
    story: "Designed to be paired with oversized jackets or the Monogram Jumpsuit for high-contrast runway proportions.",
    price: 165,
    gender: "Women",
    category_id: "cat-2",
    subcategory_id: "cat-w-4",
    collection_id: "col-ss26",
    badge: "EXCLUSIVE",
    materials: ["Heavy cotton twill", "Concealed side zipper", "Enamelled MM hardware"],
    tags: ["Skirts & Mini Skirts", "Women", "SS26", "Runway"],
    featured: false,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-11-1", product_id: "prod-11", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9664_52989f29-4f2f-4fa5-8112-24d611e627ea_1024x.jpg?v=1761580112", sort_order: 0, alt_text: "Sculptural Mini Skirt Front" },
    ],
  },
  {
    id: "prod-12",
    name: "MM Archival 450 GSM Heavy Hoodie",
    slug: "mm-archival-450gsm-heavy-hoodie",
    sku: "MM-SS24-012",
    description: "Ultra-heavyweight 450 GSM diagonal loopback fleece hoodie with double-layered architectural hood.",
    short_description: "450 GSM diagonal loopback fleece hoodie with high-density puff print.",
    story: "A house staple resurrected from the SS24 archive, showcasing high-density puff print and vintage cold-pigment garment dye.",
    price: 195,
    gender: "Unisex",
    category_id: "cat-3",
    subcategory_id: "cat-m-5",
    collection_id: "col-ss24",
    badge: "ARCHIVE REISSUE",
    materials: ["450 GSM combed cotton fleece", "Dense ribbing", "Puff embroidery print"],
    tags: ["Hoodies & Sweatshirts", "Men", "Women", "Unisex", "Archives", "Heavy Cotton"],
    featured: true,
    new_arrival: false,
    status: "active",
    images: [
      { id: "img-12-1", product_id: "prod-12", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/RebelBlack_1024x1024_crop_center.jpg?v=1717758768", sort_order: 0, alt_text: "Archival 450 GSM Hoodie Front" },
    ],
  },
  {
    id: "prod-13",
    name: "MM Architectural Wide-Leg Trousers",
    slug: "mm-architectural-wide-leg-trousers",
    sku: "MM-SS26-013",
    description: "Relaxed wide-leg trousers cut with front pinch-pleats and adjustable cinch waistband.",
    short_description: "Wool-cotton wide-leg tailored trousers with pinch pleats.",
    story: "Engineered to drape seamlessly over boots or slides, marrying tailored sophistication with casual streetwear presence.",
    price: 185,
    gender: "Men",
    category_id: "cat-3",
    subcategory_id: "cat-m-4",
    collection_id: "col-ss26",
    materials: ["Wool-cotton blend twill", "Deep side pockets", "Internal drawstring"],
    tags: ["Trousers & Pants", "Men", "SS26", "Tailored"],
    featured: false,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-13-1", product_id: "prod-13", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823", sort_order: 0, alt_text: "Architectural Trousers Front" },
    ],
  },
  {
    id: "prod-14",
    name: "MM Atelier Monogram Slides",
    slug: "mm-atelier-monogram-slides",
    sku: "MM-SS26-014",
    description: "Molded ergonomic luxury slides with textured Maison Makeeva monogram strap and dual-density foam sole.",
    short_description: "Ergonomic luxury slides with embossed monogram strap.",
    story: "Crafted for effortless studio comfort and elevated warm-weather styling.",
    price: 145,
    gender: "Unisex",
    category_id: "cat-3",
    subcategory_id: "cat-m-6",
    collection_id: "col-ss26",
    materials: ["Molded EVA footbed", "Embossed vegan leather upper", "Anti-slip grooved tread"],
    tags: ["Shoes & Slides", "Unisex", "Men", "Women", "Footwear", "SS26"],
    featured: false,
    new_arrival: true,
    status: "active",
    images: [
      { id: "img-14-1", product_id: "prod-14", image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0055_1024x.jpg?v=1761559327", sort_order: 0, alt_text: "Atelier Slides Front" },
    ],
  },
];

// Initial Seed Inventory
const INITIAL_INVENTORY: DbInventory[] = [
  { id: "inv-1", product_id: "prod-1", size: "S", color: "Washed indigo", stock_quantity: 12, low_stock_threshold: 5 },
  { id: "inv-2", product_id: "prod-1", size: "M", color: "Washed indigo", stock_quantity: 18, low_stock_threshold: 5 },
  { id: "inv-3", product_id: "prod-1", size: "L", color: "Washed indigo", stock_quantity: 3, low_stock_threshold: 5 }, // Low stock
  { id: "inv-4", product_id: "prod-1", size: "XL", color: "Washed indigo", stock_quantity: 2, low_stock_threshold: 5 }, // Low stock
  { id: "inv-5", product_id: "prod-2", size: "S", color: "Graphite", stock_quantity: 15, low_stock_threshold: 5 },
  { id: "inv-6", product_id: "prod-2", size: "M", color: "Graphite", stock_quantity: 24, low_stock_threshold: 5 },
  { id: "inv-7", product_id: "prod-2", size: "L", color: "Graphite", stock_quantity: 14, low_stock_threshold: 5 },
  { id: "inv-8", product_id: "prod-3", size: "M", color: "Deep bleach", stock_quantity: 16, low_stock_threshold: 5 },
  { id: "inv-9", product_id: "prod-3", size: "L", color: "Deep bleach", stock_quantity: 4, low_stock_threshold: 5 }, // Low stock
  { id: "inv-10", product_id: "prod-4", size: "M", color: "Noir velvet", stock_quantity: 9, low_stock_threshold: 3 },
  { id: "inv-11", product_id: "prod-6", size: "M", color: "Monogram noir", stock_quantity: 12, low_stock_threshold: 4 },
  { id: "inv-12", product_id: "prod-8", size: "OS", color: "Noir", stock_quantity: 6, low_stock_threshold: 2 },
  { id: "inv-13", product_id: "prod-10", size: "M", color: "Washed Indigo", stock_quantity: 8, low_stock_threshold: 3 },
  { id: "inv-14", product_id: "prod-11", size: "S", color: "Noir", stock_quantity: 7, low_stock_threshold: 3 },
  { id: "inv-15", product_id: "prod-12", size: "L", color: "Rebel Black", stock_quantity: 11, low_stock_threshold: 4 },
  { id: "inv-16", product_id: "prod-14", size: "EU 42", color: "Matte Noir", stock_quantity: 15, low_stock_threshold: 5 },
];

// Initial Seed Orders
const INITIAL_ORDERS: DbOrder[] = [
  {
    id: "ord-1",
    order_number: "MM-2026-8801",
    subtotal: 425.0,
    shipping: 0.0,
    total: 425.0,
    customer_name: "Camille Laurent",
    customer_email: "camille.laurent@ateliermakeeva.fr",
    customer_phone: "+33 6 12 34 56 78",
    shipping_address: {
      name: "Camille Laurent",
      address: "14 Avenue Montaigne",
      city: "Paris",
      postal_code: "75008",
      country: "France",
      phone: "+33 6 12 34 56 78",
    },
    order_status: "Confirmed",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    items: [
      {
        id: "item-1",
        order_id: "ord-1",
        product_id: "prod-1",
        product_name: "MM Orion202 Stonewashed Denim Set",
        quantity: 1,
        size: "M",
        color: "Washed indigo",
        price: 250.0,
        image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028",
      },
      {
        id: "item-2",
        order_id: "ord-1",
        product_id: "prod-3",
        product_name: "MM Bovinille -101 TRACKSUIT SET UNISEX",
        quantity: 1,
        size: "M",
        color: "Deep bleach",
        price: 175.0,
        image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9978_1024x.jpg?v=1763606451",
      },
    ],
  },
  {
    id: "ord-2",
    order_number: "MM-2026-8802",
    subtotal: 250.0,
    shipping: 0.0,
    total: 250.0,
    customer_name: "Marcus Sterling",
    customer_email: "marcus.sterling@editorial.co.uk",
    customer_phone: "+44 7700 900123",
    shipping_address: {
      name: "Marcus Sterling",
      address: "22 King Street",
      city: "Manchester",
      postal_code: "M2 4LQ",
      country: "United Kingdom",
      phone: "+44 7700 900123",
    },
    order_status: "Pending",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    items: [
      {
        id: "item-3",
        order_id: "ord-2",
        product_id: "prod-4",
        product_name: "MM NTOUBE-302 TRACKSUIT SET UNISEX",
        quantity: 1,
        size: "L",
        color: "Noir velvet",
        price: 250.0,
        image_url: "https://www.maisonmakeeva.com/cdn/shop/files/D59A9818_b34e4184-86c5-45ac-a25a-e18704e91632_1024x.jpg?v=1763737823",
      },
    ],
  },
];

// Initial Seed Customers
const INITIAL_CUSTOMERS: DbCustomer[] = [
  { id: "cust-1", email: "admin@maisonmakeeva.com", full_name: "Atelier Director", role: "admin", status: "active", created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "cust-2", email: "camille.laurent@ateliermakeeva.fr", full_name: "Camille Laurent", phone: "+33 6 12 34 56 78", role: "customer", status: "active", created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: "cust-3", email: "marcus.sterling@editorial.co.uk", full_name: "Marcus Sterling", phone: "+44 7700 900123", role: "customer", status: "active", created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
];

// Initial Seed Contact Messages
const INITIAL_CONTACT: DbContactMessage[] = [
  {
    id: "msg-1",
    name: "Jean-Paul Dubois",
    email: "jp.dubois@parisfashion.com",
    phone: "+33 1 42 68 55 00",
    message: "Inquiry regarding custom atelier fitting for Paris Fashion Week private presentation.",
    status: "unread",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "msg-2",
    name: "Aria Vance",
    email: "aria.v@monograph.nyc",
    phone: "+1 212 555 0199",
    message: "Editorial archive loan request for upcoming contemporary African design exhibition in New York.",
    status: "read",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// Initial Seed Newsletter
const INITIAL_NEWSLETTER: DbNewsletterSubscriber[] = [
  { id: "sub-1", email: "collector@archiveluxury.com", status: "active", subscribed_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "sub-2", email: "atelier.client@hautecouture.fr", status: "active", subscribed_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "sub-3", email: "studio@resn-contemporary.org", status: "active", subscribed_at: new Date(Date.now() - 10 * 86400000).toISOString() },
];

class MockStorageManager {
  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn("MockStorage quota or access error:", e);
    }
  }

  public init() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.setItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.setItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COLLECTIONS)) {
      this.setItem(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.setItem(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.setItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CONTACT)) {
      this.setItem(STORAGE_KEYS.CONTACT, INITIAL_CONTACT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEWSLETTER)) {
      this.setItem(STORAGE_KEYS.NEWSLETTER, INITIAL_NEWSLETTER);
    }
  }

  // --- PRODUCTS ---
  public getProducts(): DbProduct[] {
    this.init();
    const prods: DbProduct[] = this.getItem(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const invs: DbInventory[] = this.getInventory();
    const cats: DbCategory[] = this.getCategories();
    const cols: DbCollection[] = this.getCollections();

    return prods.map((p) => ({
      ...p,
      inventory: invs.filter((i) => i.product_id === p.id),
      category: cats.find((c) => c.id === p.category_id),
      subcategory: cats.find((c) => c.id === p.subcategory_id),
      collection: cols.find((c) => c.id === p.collection_id),
    }));
  }

  public saveProduct(product: Partial<DbProduct>): DbProduct {
    this.init();
    const list = this.getItem<DbProduct[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const id = product.id || `prod-${Date.now()}`;
    const slug = product.slug || (product.name ? product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `product-${id}`);
    const sku = product.sku || `MM-PROD-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullProduct: DbProduct = {
      id,
      name: product.name || "Untitled Silhouette",
      slug,
      sku,
      description: product.description || "",
      short_description: product.short_description || "",
      story: product.story || "",
      price: Number(product.price) || 0,
      compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : null,
      gender: product.gender || "Unisex",
      category_id: product.category_id || null,
      subcategory_id: product.subcategory_id || null,
      collection_id: product.collection_id || null,
      badge: product.badge || null,
      materials: product.materials || ["Heavy Cotton"],
      tags: product.tags || [],
      featured: Boolean(product.featured),
      new_arrival: Boolean(product.new_arrival),
      status: product.status || "active",
      images: product.images || [],
      created_at: product.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const existingIndex = list.findIndex((p) => p.id === id);
    if (existingIndex >= 0) {
      list[existingIndex] = fullProduct;
    } else {
      list.unshift(fullProduct);
    }
    this.setItem(STORAGE_KEYS.PRODUCTS, list);
    return fullProduct;
  }

  public deleteProduct(id: string): void {
    this.init();
    const list = this.getItem<DbProduct[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    this.setItem(STORAGE_KEYS.PRODUCTS, list.filter((p) => p.id !== id));
    // Cascade inventory
    const inv = this.getInventory();
    this.setItem(STORAGE_KEYS.INVENTORY, inv.filter((i) => i.product_id !== id));
  }

  // --- CATEGORIES ---
  public getCategories(): DbCategory[] {
    this.init();
    return this.getItem(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public saveCategory(cat: Partial<DbCategory>): DbCategory {
    this.init();
    const list = this.getCategories();
    const id = cat.id || `cat-${Date.now()}`;
    const slug = cat.slug || (cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id);

    const fullCat: DbCategory = {
      id,
      name: cat.name || "New Category",
      slug,
      parent_id: cat.parent_id || null,
      sort_order: cat.sort_order || list.length + 1,
      description: cat.description || null,
      status: cat.status || "active",
      created_at: cat.created_at || new Date().toISOString(),
    };

    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx] = fullCat;
    } else {
      list.push(fullCat);
    }
    this.setItem(STORAGE_KEYS.CATEGORIES, list);
    return fullCat;
  }

  public deleteCategory(id: string): void {
    this.init();
    const list = this.getCategories();
    // remove category and children
    this.setItem(STORAGE_KEYS.CATEGORIES, list.filter((c) => c.id !== id && c.parent_id !== id));
  }

  // --- COLLECTIONS ---
  public getCollections(): DbCollection[] {
    this.init();
    return this.getItem(STORAGE_KEYS.COLLECTIONS, INITIAL_COLLECTIONS);
  }

  public saveCollection(col: Partial<DbCollection>): DbCollection {
    this.init();
    const list = this.getCollections();
    const id = col.id || `col-${Date.now()}`;
    const slug = col.slug || (col.name ? col.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id);

    const fullCol: DbCollection = {
      id,
      name: col.name || "New Collection",
      slug,
      season: col.season || "SS26",
      description: col.description || "",
      image: col.image || "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
      status: col.status || "active",
      created_at: col.created_at || new Date().toISOString(),
    };

    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx] = fullCol;
    } else {
      list.push(fullCol);
    }
    this.setItem(STORAGE_KEYS.COLLECTIONS, list);
    return fullCol;
  }

  public deleteCollection(id: string): void {
    this.init();
    const list = this.getCollections();
    this.setItem(STORAGE_KEYS.COLLECTIONS, list.filter((c) => c.id !== id));
  }

  // --- INVENTORY ---
  public getInventory(): DbInventory[] {
    this.init();
    return this.getItem(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
  }

  public saveInventory(inv: Partial<DbInventory>): DbInventory {
    this.init();
    const list = this.getInventory();
    const id = inv.id || `inv-${Date.now()}`;
    const fullInv: DbInventory = {
      id,
      product_id: inv.product_id || "",
      size: inv.size || "M",
      color: inv.color || "Default",
      stock_quantity: Math.max(0, inv.stock_quantity ?? 0),
      low_stock_threshold: inv.low_stock_threshold ?? 5,
      updated_at: new Date().toISOString(),
    };

    const idx = list.findIndex((i) => i.id === id || (i.product_id === fullInv.product_id && i.size === fullInv.size && i.color === fullInv.color));
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...fullInv };
    } else {
      list.push(fullInv);
    }
    this.setItem(STORAGE_KEYS.INVENTORY, list);
    return fullInv;
  }

  public deleteInventory(id: string): void {
    this.init();
    const list = this.getInventory();
    this.setItem(STORAGE_KEYS.INVENTORY, list.filter((i) => i.id !== id));
  }

  // --- ORDERS ---
  public getOrders(): DbOrder[] {
    this.init();
    return this.getItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  public createOrder(order: CreateOrderPayload): DbOrder {
    this.init();
    const list = this.getOrders();
    const orderNumber = `MM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;
    const resolvedItems: DbOrderItem[] = (order.items || []).map((it, idx) => ({
      id: it.id || `item-${Date.now()}-${idx}`,
      order_id: orderId,
      product_id: it.product_id || null,
      product_name: it.product_name,
      quantity: it.quantity,
      size: it.size,
      color: it.color || null,
      price: it.price,
      image_url: it.image_url || null,
    }));

    const fullOrder: DbOrder = {
      ...order,
      id: orderId,
      order_number: orderNumber,
      order_status: order.order_status || "Pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: resolvedItems,
    };
    list.unshift(fullOrder);
    this.setItem(STORAGE_KEYS.ORDERS, list);
    return fullOrder;
  }

  public updateOrderStatus(id: string, status: DbOrder["order_status"]): DbOrder | null {
    this.init();
    const list = this.getOrders();
    const idx = list.findIndex((o) => o.id === id);
    if (idx >= 0) {
      list[idx].order_status = status;
      list[idx].updated_at = new Date().toISOString();
      this.setItem(STORAGE_KEYS.ORDERS, list);
      return list[idx];
    }
    return null;
  }

  // --- CUSTOMERS ---
  public getCustomers(): DbCustomer[] {
    this.init();
    return this.getItem(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  }

  public toggleCustomerStatus(id: string): DbCustomer | null {
    this.init();
    const list = this.getCustomers();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx].status = list[idx].status === "active" ? "disabled" : "active";
      this.setItem(STORAGE_KEYS.CUSTOMERS, list);
      return list[idx];
    }
    return null;
  }

  // --- CONTACT MESSAGES ---
  public getContactMessages(): DbContactMessage[] {
    this.init();
    return this.getItem(STORAGE_KEYS.CONTACT, INITIAL_CONTACT);
  }

  public createContactMessage(msg: Omit<DbContactMessage, "id" | "created_at" | "status">): DbContactMessage {
    this.init();
    const list = this.getContactMessages();
    const fullMsg: DbContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: "unread",
      created_at: new Date().toISOString(),
    };
    list.unshift(fullMsg);
    this.setItem(STORAGE_KEYS.CONTACT, list);
    return fullMsg;
  }

  public updateContactStatus(id: string, status: DbContactMessage["status"]): void {
    this.init();
    const list = this.getContactMessages();
    const idx = list.findIndex((m) => m.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      this.setItem(STORAGE_KEYS.CONTACT, list);
    }
  }

  // --- NEWSLETTER ---
  public getNewsletterSubscribers(): DbNewsletterSubscriber[] {
    this.init();
    return this.getItem(STORAGE_KEYS.NEWSLETTER, INITIAL_NEWSLETTER);
  }

  public addNewsletterSubscriber(email: string): { success: boolean; message: string } {
    this.init();
    const list = this.getNewsletterSubscribers();
    const cleanEmail = email.trim().toLowerCase();
    if (list.some((s) => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Client is already subscribed to Maison Makeeva private dispatches." };
    }
    const sub: DbNewsletterSubscriber = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      status: "active",
      subscribed_at: new Date().toISOString(),
    };
    list.unshift(sub);
    this.setItem(STORAGE_KEYS.NEWSLETTER, list);
    return { success: true, message: "Registered for Maison Makeeva private dispatches." };
  }

  public toggleNewsletterStatus(id: string): void {
    this.init();
    const list = this.getNewsletterSubscribers();
    const idx = list.findIndex((s) => s.id === id);
    if (idx >= 0) {
      list[idx].status = list[idx].status === "active" ? "unsubscribed" : "active";
      this.setItem(STORAGE_KEYS.NEWSLETTER, list);
    }
  }
}

export const mockStorage = new MockStorageManager();
