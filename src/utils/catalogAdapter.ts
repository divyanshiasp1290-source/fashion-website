import type { Collection, Product } from "../data/catalog";
import type { DbCategory, DbCollection, DbProduct } from "../types/database";

export function mapDbProductToCatalogProduct(
  db: DbProduct,
  categories: DbCategory[] = [],
  collections: DbCollection[] = []
): Product {
  const cat = db.category || categories.find((c) => c.id === db.category_id);
  const subcat = db.subcategory || categories.find((c) => c.id === db.subcategory_id);
  const col = db.collection || collections.find((c) => c.id === db.collection_id);

  // If cat has a parent_id, it is a subcategory; find its parent category
  const parentOfCat = cat?.parent_id ? categories.find((c) => c.id === cat.parent_id) : null;
  const parentOfSubcat = subcat?.parent_id ? categories.find((c) => c.id === subcat.parent_id) : null;

  // Determine Main Category
  const gender = (db.gender || "").trim();
  const mainCats: string[] = [];

  if (gender.toLowerCase() === "women") {
    mainCats.push("Women");
  } else if (gender.toLowerCase() === "men") {
    mainCats.push("Men");
  } else if (gender.toLowerCase() === "unisex") {
    mainCats.push("Women", "Men");
  }

  // Include parent category if it's special or if mainCats is empty
  const parentName = parentOfCat?.name || (!cat?.parent_id ? cat?.name : null);
  if (parentName) {
    if (["Sets & Tracksuits", "Archives", "New Arrivals"].includes(parentName)) {
      if (!mainCats.includes(parentName)) mainCats.push(parentName);
    } else if (mainCats.length === 0) {
      mainCats.push(parentName);
    }
  }

  if (parentOfSubcat && !mainCats.includes(parentOfSubcat.name)) {
    if (["Sets & Tracksuits", "Archives", "New Arrivals"].includes(parentOfSubcat.name)) {
      mainCats.push(parentOfSubcat.name);
    }
  }

  if (mainCats.length === 0) {
    mainCats.push("New Arrivals");
  }

  // Determine Subcategory
  let subCategoryName = "All";
  if (subcat?.name) {
    subCategoryName = subcat.name;
  } else if (cat?.parent_id && cat?.name) {
    subCategoryName = cat.name;
  } else if (cat?.name && !["Women", "Men", "New Arrivals", "Archives", "Sets & Tracksuits"].includes(cat.name)) {
    subCategoryName = cat.name;
  }

  const collectionSlug =
    col?.slug || (col?.name ? col.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "ss26");

  // Build comprehensive tags for filtering and search
  const tagSet = new Set<string>(db.tags || []);
  if (gender) tagSet.add(gender);
  if (gender.toLowerCase() === "unisex") {
    tagSet.add("Women");
    tagSet.add("Men");
    tagSet.add("Unisex");
  }
  mainCats.forEach((mc) => tagSet.add(mc));
  if (subCategoryName && subCategoryName !== "All") tagSet.add(subCategoryName);
  if (col?.name) tagSet.add(col.name);
  if (col?.season) tagSet.add(col.season);
  if (col?.slug) tagSet.add(col.slug.toUpperCase());
  if (db.new_arrival) {
    tagSet.add("NEW ARRIVAL");
    tagSet.add("New Arrivals");
  }
  if (db.featured) tagSet.add("BEST SELLERS");
  if (db.badge) tagSet.add(db.badge);

  // Robust size resolution: every product is one single product containing full size choices
  const invSizes =
    db.inventory && db.inventory.length > 0
      ? Array.from(new Set(db.inventory.map((i) => i.size).filter(Boolean)))
      : [];

  const lowerName = (db.name || "").toLowerCase();
  const lowerCat = (subCategoryName || "").toLowerCase();
  const isFootwear = lowerName.includes("slide") || lowerName.includes("shoe") || lowerCat.includes("shoe");
  const isAccessory = lowerName.includes("bag") || lowerCat.includes("accessor") || lowerName.includes("duffle");

  let sizes: string[];
  if (isFootwear) {
    const euSizes = invSizes.filter((s) => s.startsWith("EU"));
    sizes = Array.from(new Set([...euSizes, "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"])).sort();
  } else if (isAccessory) {
    sizes = ["OS"];
  } else {
    // Garment / Apparel: ALWAYS guarantee full standard size suite S, M, L, XL
    const standardApparel = ["S", "M", "L", "XL"];
    const validInvSizes = invSizes.filter(
      (s) => !["EU", "Default", "OS"].includes(s) && !s.startsWith("EU")
    );
    const combined = Array.from(new Set([...standardApparel, ...validInvSizes]));
    const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];
    sizes = combined.sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }

  const rawColors =
    db.inventory && db.inventory.length > 0
      ? Array.from(new Set(db.inventory.map((i) => i.color).filter((c) => Boolean(c) && c !== "Default")))
      : [];
  const colors = rawColors.length > 0 ? rawColors : ["Noir", "Ivory"];

  let images =
    db.images && db.images.length > 0
      ? [...db.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url).filter(Boolean)
      : ["https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028"];

  // Ensure Archival Heavy Hoodie displays its distinct hoodie photography instead of graphic tee photo
  if (
    db.slug === "mm-archival-450gsm-heavy-hoodie" ||
    db.name.toLowerCase().includes("heavy hoodie") ||
    db.id === "d0000000-0000-0000-0000-000000000012"
  ) {
    const hoodiePhoto = "https://www.maisonmakeeva.com/cdn/shop/files/D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833";
    if (images.length === 0 || images[0].includes("RebelBlack")) {
      images = [hoodiePhoto, ...images.filter((img) => !img.includes("D59A9997"))];
    }
  }

  return {
    id: db.id,
    handle: db.slug || db.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: db.name,
    price: Number(db.price),
    compareAt: db.compare_at_price ? Number(db.compare_at_price) : undefined,
    category: subCategoryName,
    mainCategory: mainCats.length === 1 ? mainCats[0] : mainCats,
    subCategory: subCategoryName,
    collection: collectionSlug,
    tags: Array.from(tagSet),
    badge: db.badge || (db.new_arrival ? "NEW ARRIVAL" : db.featured ? "BEST SELLERS" : undefined),
    description: db.description || "",
    story: db.story || db.short_description || "",
    materials: db.materials && db.materials.length > 0 ? db.materials : ["Heavy cotton"],
    sizes: sizes.length > 0 ? sizes : ["S", "M", "L", "XL"],
    colors: colors.length > 0 ? colors : ["Noir", "Ivory"],
    images: images.length > 0 ? images : ["https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028"],
    status: db.status || "active",
    new_arrival: Boolean(db.new_arrival),
    featured: Boolean(db.featured),
  };
}

export function mapDbCollectionToCatalogCollection(
  col: DbCollection,
  products: DbProduct[] = []
): Collection {
  // Extract category names from products assigned to this collection
  const assigned = products.filter((p) => p.collection_id === col.id);
  const derivedCategories = Array.from(
    new Set(
      assigned
        .map((p) => p.category?.name || (typeof p.category_id === "string" ? p.category_id : ""))
        .filter(Boolean)
    )
  );

  return {
    id: col.id,
    handle: col.slug || col.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: col.name,
    season: col.season || "Seasonal Drop",
    description: col.description || "A seasonal monograph with campaign gravity and collectible codes.",
    image:
      col.image ||
      assigned[0]?.images?.[0]?.image_url ||
      "https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666",
    categories: derivedCategories.length > 0 ? derivedCategories : ["Ready-to-Wear", "Atelier"],
    status: col.status || "active",
  };
}
