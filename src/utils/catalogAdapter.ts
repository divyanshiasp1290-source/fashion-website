import type { Product } from "../data/catalog";
import type { DbCategory, DbCollection, DbProduct } from "../types/database";

export function mapDbProductToCatalogProduct(
  db: DbProduct,
  categories: DbCategory[] = [],
  collections: DbCollection[] = []
): Product {
  const cat = db.category || categories.find((c) => c.id === db.category_id);
  const subcat = db.subcategory || categories.find((c) => c.id === db.subcategory_id);
  const col = db.collection || collections.find((c) => c.id === db.collection_id);

  const mainCategoryName = cat?.name || "New Arrivals";
  const subCategoryName = subcat?.name || cat?.name || "T-Shirts";
  const collectionSlug = col?.slug || "ss26";

  const sizes =
    db.inventory && db.inventory.length > 0
      ? Array.from(new Set(db.inventory.map((i) => i.size)))
      : ["S", "M", "L", "XL"];

  const colors =
    db.inventory && db.inventory.length > 0
      ? Array.from(new Set(db.inventory.map((i) => i.color)))
      : ["Noir", "Ivory"];

  const images =
    db.images && db.images.length > 0
      ? [...db.images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url)
      : ["https://www.maisonmakeeva.com/cdn/shop/files/D59A0120_1024x.jpg?v=1763739028"];

  return {
    id: db.id,
    handle: db.slug,
    title: db.name,
    price: Number(db.price),
    compareAt: db.compare_at_price ? Number(db.compare_at_price) : undefined,
    category: subCategoryName,
    mainCategory: mainCategoryName,
    subCategory: subCategoryName,
    collection: collectionSlug,
    tags: db.tags || [],
    badge: db.badge || (db.new_arrival ? "NEW ARRIVAL" : db.featured ? "BEST SELLERS" : undefined),
    description: db.description || "",
    story: db.story || db.short_description || "",
    materials: db.materials || ["Heavy cotton"],
    sizes,
    colors,
    images,
  };
}
