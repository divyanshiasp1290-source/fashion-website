import type { Product } from "./data/catalog";

export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);

export const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const getPrimaryProduct = (products: Product[]) =>
  products.find((product) => product.handle === "mm-orion202-stonewashed-denim-set") ?? products[0];
