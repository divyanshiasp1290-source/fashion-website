import { AnimatePresence, motion, useScroll, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { collections, policies, products, type Product } from "./data/catalog";
import { cx, formatMoney, getPrimaryProduct } from "./utils";

type Page = "home" | "collection" | "product" | "lookbook" | "about" | "contact" | "search" | "wishlist" | "account" | "cart";

type CartItem = {
  product: Product;
  size: string;
  qty: number;
};

const pageLinks: Array<{ page: Page; label: string }> = [
  { page: "home", label: "Home" },
  { page: "collection", label: "Collections" },
  { page: "lookbook", label: "Lookbook" },
  { page: "about", label: "About" },
  { page: "contact", label: "Contact" },
];

type MenuColumn = {
  title: string;
  items: string[];
};

type ShopMenu = {
  label: string;
  page: Page;
  columns: MenuColumn[];
  hero?: string;
};

const shopifyMenus: ShopMenu[] = [
  {
    label: "New Arrivals",
    page: "collection",
    hero: "Spring Summer SS26",
    columns: [
      { title: "New Season", items: ["Women", "Men", "Bags", "Accessories"] },
      { title: "Highlights", items: ["Best Sellers", "Campaign Picks", "New Drops"] },
    ],
  },
  {
    label: "Rockstud",
    page: "collection",
    hero: "Icon wardrobe edits",
    columns: [
      { title: "Shoes", items: ["Sandals", "Pumps", "Sneakers"] },
      { title: "Bags", items: ["Rockstud Bags", "Clutches", "Mini Bags"] },
    ],
  },
  {
    label: "Women",
    page: "collection",
    hero: "Women's ready to wear",
    columns: [
      { title: "Ready To Wear", items: ["New Arrivals", "Dresses", "Jackets", "Trousers"] },
      { title: "Accessories", items: ["Bags", "Shoes", "Jewellery"] },
    ],
  },
  {
    label: "Men",
    page: "collection",
    hero: "Men's ready to wear",
    columns: [
      { title: "Ready To Wear", items: ["Jackets", "Knitwear", "Trousers", "Shirts"] },
      { title: "Accessories", items: ["Shoes", "Bags", "Small Leather Goods"] },
    ],
  },
  {
    label: "Bags",
    page: "collection",
    hero: "Carryall signatures",
    columns: [
      { title: "Shop By Style", items: ["Totes", "Shoulder Bags", "Mini Bags", "Travel"] },
      { title: "Signature", items: ["Rockstud", "VLogo", "Quilted"] },
    ],
  },
  {
    label: "Gifts",
    page: "collection",
    hero: "Maison gifting",
    columns: [
      { title: "Gifts For Her", items: ["Bags", "Jewellery", "Small Leather Goods"] },
      { title: "Gifts For Him", items: ["Shoes", "Accessories", "Fragrances"] },
    ],
  },
  {
    label: "Fragrances",
    page: "collection",
    hero: "Beauty ready category",
    columns: [
      { title: "Fragrances", items: ["For Her", "For Him", "Candles", "Gift Sets"] },
      { title: "Best Sellers", items: ["Signature Scents", "New Releases"] },
    ],
  },
  {
    label: "V-Universe",
    page: "lookbook",
    hero: "Brand universe",
    columns: [
      { title: "Explore", items: ["Campaigns", "Stories", "Events"] },
      { title: "Discovery", items: ["Maison", "Shows", "Heritage"] },
    ],
  },
];

const shopifyMenuMap = Object.fromEntries(shopifyMenus.map((menu) => [menu.label, menu])) as Record<ShopMenu["label"], ShopMenu>;

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOutExpo } },
};

function App() {
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product>(getPrimaryProduct(products));
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const go = (next: Page, product?: Product) => {
    if (product) setSelectedProduct(product);
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((items) => (items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id]));
  };

  const addToCart = (product: Product, size = product.sizes[0]) => {
    setCart((items) => {
      const existing = items.find((item) => item.product.id === product.id && item.size === size);
      if (existing) {
        return items.map((item) => (item === existing ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...items, { product, size, qty: 1 }];
    });
    setCartOpen(true);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const wishedProducts = products.filter((product) => wishlist.includes(product.id));

  const PageComponent = {
    home: <HomePage go={go} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />,
    collection: <CollectionPage go={go} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />,
    product: <ProductPage product={selectedProduct} go={go} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />,
    lookbook: <LookbookPage go={go} />,
    about: <AboutPage />,
    contact: <ContactPage />,
    search: <SearchPage go={go} />,
    wishlist: <WishlistPage products={wishedProducts} go={go} toggleWishlist={toggleWishlist} addToCart={addToCart} />,
    account: <AccountPage />,
    cart: <CartPage cart={cart} setCart={setCart} go={go} />,
  }[page];

  return (
    <div className="min-h-screen bg-bone text-ink">
      <Navigation
        page={page}
        go={go}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onMenu={() => setMenuOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onCart={() => go("cart")}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={page}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: easeOutExpo }}
        >
          {PageComponent}
        </motion.main>
      </AnimatePresence>
      <Footer go={go} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} go={go} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} go={go} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} go={go} />
    </div>
  );
}

function Navigation({
  page,
  go,
  cartCount,
  wishlistCount,
  onMenu,
  onSearch,
  onCart,
}: {
  page: Page;
  go: (page: Page, product?: Product) => void;
  cartCount: number;
  wishlistCount: number;
  onMenu: () => void;
  onSearch: () => void;
  onCart: () => void;
}) {
  const [mega, setMega] = useState<ShopMenu["label"] | null>(null);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-white/10 bg-ink/80 text-ivory">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-3 px-4 text-[11px] uppercase tracking-[0.24em] sm:gap-5">
          <p className="truncate">Maison Makeeva — Spring Summer SS26</p>
          <button onClick={() => go("collection")} className="text-[11px] uppercase tracking-[0.24em] transition hover:text-stone">
            Shop Now
          </button>
        </div>
      </div>
      <div className="border-b border-ivory/15 bg-ink/35 text-ivory backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <IconButton label="Account" onClick={() => go("account")}> 
              <User size={18} />
            </IconButton>
            <IconButton label="Search" onClick={onSearch}>
              <Search size={18} />
            </IconButton>
          </div>
          <button onClick={() => go("home")} className="font-display text-base uppercase tracking-[0.22em] sm:text-lg">
            Maison Makeeva
          </button>
          <div className="flex items-center gap-3">
            <IconButton label={`Wishlist ${wishlistCount}`} onClick={() => go("wishlist")}>
              <Heart size={18} />
            </IconButton>
            <button onClick={onCart} className="relative p-2" aria-label="Open cart">
              <ShoppingBag size={19} />
              <span className="absolute -right-1 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-ivory px-1 text-[10px] text-ink">
                {cartCount}
              </span>
            </button>
            <button className="lg:hidden" onClick={onMenu} aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block border-b border-ivory/15 bg-ink/35 text-ivory">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-center gap-8 px-4 text-[11px] uppercase tracking-[0.24em]">
          {shopifyMenus.map((menu) => (
            <button key={menu.label} onMouseEnter={() => setMega(menu.label)} className="transition hover:text-stone">
              {menu.label}
            </button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {mega && (
          <motion.div
            onMouseLeave={() => setMega(null)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden border-t border-ivory/10 bg-ink/95 px-10 py-9 lg:block"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_1.2fr] gap-12">
              <div>
                <p className="mb-5 text-xs uppercase tracking-wideLuxury text-stone">{mega}</p>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  {shopifyMenuMap[mega].columns.flatMap((column) => column.items).map((item) => (
                    <button key={item} onClick={() => go("collection")} className="text-left font-display text-lg text-ivory transition-colors duration-150 hover:text-stone">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {shopifyMenuMap[mega].columns.map((column) => (
                  <div key={column.title}>
                    <p className="mb-4 text-xs uppercase tracking-wideLuxury text-stone">{column.title}</p>
                    <div className="space-y-3">
                      {column.items.map((item) => (
                        <button key={item} onClick={() => go("collection")} className="block text-left text-base text-ivory transition-colors duration-150 hover:text-stone">
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rounded bg-parchment p-6 text-ink">
                  <p className="mb-4 text-xs uppercase tracking-wideLuxury text-stone">{shopifyMenuMap[mega].hero}</p>
                  <button onClick={() => go(shopifyMenuMap[mega].page)} className="font-display text-lg uppercase tracking-[0.18em]">
                    Discover
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MegaEditorial({ go }: { go: (page: Page, product?: Product) => void }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {collections.map((collection) => (
        <button key={collection.handle} onClick={() => go("collection")} className="group text-left">
          <div className="aspect-[3/4] overflow-hidden bg-graphite">
            <img src={collection.image} alt={collection.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          </div>
          <p className="mt-3 text-xs uppercase tracking-wideLuxury text-stone">{collection.season}</p>
          <h3 className="font-display text-base">{collection.title}</h3>
        </button>
      ))}
    </div>
  );
}

function IconButton({ label, children, onClick, hideMobile = false }: { label: string; children: React.ReactNode; onClick: () => void; hideMobile?: boolean }) {
  return (
    <button onClick={onClick} className={cx("p-2 transition hover:text-stone", hideMobile && "hidden sm:block")} aria-label={label} title={label}>
      {children}
    </button>
  );
}

function HomePage({
  go,
  wishlist,
  toggleWishlist,
  addToCart,
}: {
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
}) {
  return (
    <>
      <Hero go={go} />
      <FeaturedCollections go={go} />
      <ProductRail title="New Arrivals" subtitle="Spring Summer SS26" products={products.slice(0, 6)} go={go} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />
      <EditorialCampaign go={go} />
      <ProductRail title="Best Sellers" subtitle="Iconic MM silhouettes" products={products.filter((p) => p.badge).slice(0, 6)} go={go} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />
      <LookbookPreview go={go} />
      <BrandPhilosophy />
      <FashionGallery />
      <Newsletter />
      <PolicyStrip />
    </>
  );
}

function Hero({ go }: { go: (page: Page) => void }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 120]);

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink text-ivory">
      <motion.img
        style={{ y }}
        src="https://www.maisonmakeeva.com/cdn/shop/files/D59A9986_2048x.jpg?v=1763735666"
        alt="Maison Makeeva premium luxury hero"
        className="absolute inset-0 h-[115%] w-full object-cover object-[50%_18%] opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/10 to-ink/95" />
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative z-10 flex min-h-[92vh] flex-col justify-center px-5 sm:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
          <p className="text-[9px] uppercase tracking-[0.24em] text-white/80">Maison Makeeva</p>
          <h1 className="mt-3 font-display text-[7vw] uppercase leading-[0.9] tracking-[0.02em] text-white sm:text-[4.5rem] lg:text-[5.5rem]">
            Maison Makeeva — Spring Summer SS26
          </h1>
          <button onClick={() => go("collection")} className="mt-8 rounded-none border border-white/20 bg-black/70 px-8 py-3 text-[11px] uppercase tracking-[0.22em] text-white transition hover:bg-black">
            Explore
          </button>
        </div>
      </motion.div>
    </section>
  );
}

function FeaturedCollections({ go }: { go: (page: Page) => void }) {
  return (
    <Section eyebrow="Our campaigns & collections" title="A house wardrobe with campaign gravity.">
      <div className="grid grid-cols-2 gap-1 sm:gap-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <motion.button
            key={collection.handle}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            onClick={() => go("collection")}
            className={cx("group relative overflow-hidden text-left", index === 1 && "lg:mt-20")}
          >
            <div className="aspect-[1/1] overflow-hidden bg-parchment">
              <img src={collection.image} alt={collection.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/70 via-ink/30 to-transparent p-4">
              <p className="text-xs uppercase tracking-wideLuxury text-ivory">{collection.season}</p>
              <h3 className="font-display text-lg uppercase leading-tight">{collection.title}</h3>
              <button onClick={() => go("collection")} className="mt-2 text-[11px] uppercase tracking-[0.18em] text-ivory">
                Discover More
              </button>
            </div>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}

function ProductRail({
  title,
  subtitle,
  products: railProducts,
  go,
  wishlist,
  toggleWishlist,
  addToCart,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
}) {
  return (
    <Section eyebrow={subtitle} title={title}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {railProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            go={go}
            wished={wishlist.includes(product.id)}
            onWish={() => toggleWishlist(product)}
            onAdd={() => addToCart(product)}
          />
        ))}
      </div>
    </Section>
  );
}

function ProductCard({
  product,
  go,
  wished,
  onWish,
  onAdd,
}: {
  product: Product;
  go: (page: Page, product?: Product) => void;
  wished: boolean;
  onWish: () => void;
  onAdd: () => void;
}) {
  return (
    <motion.article variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="group">
      <button onClick={() => go("product", product)} className="relative block w-full overflow-hidden bg-parchment">
        <img src={product.images[0]} alt={product.title} className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105" />
        {product.badge && <span className="absolute left-3 top-3 bg-ink px-3 py-1 text-[10px] uppercase tracking-wideLuxury text-ivory">{product.badge}</span>}
      </button>
      <div className="mt-4 flex items-start justify-between gap-3">
        <button onClick={() => go("product", product)} className="text-left">
          <p className="text-[11px] uppercase tracking-wideLuxury text-taupe">{product.category}</p>
          <h3 className="mt-1 text-sm uppercase leading-5">{product.title}</h3>
          <p className="mt-2 text-sm">{formatMoney(product.price)}</p>
        </button>
        <button onClick={onWish} className={cx("p-1", wished && "text-taupe")} aria-label="Add to wishlist">
          <Heart size={18} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>
      <button onClick={onAdd} className="mt-4 w-full border border-ink px-3 py-3 text-[11px] uppercase tracking-wideLuxury transition hover:bg-ink hover:text-ivory">
        Quick add
      </button>
    </motion.article>
  );
}

function EditorialCampaign({ go }: { go: (page: Page) => void }) {
  return (
    <section className="grid bg-ink text-ivory lg:grid-cols-2">
      <div className="min-h-[80vh] overflow-hidden">
        <img src="https://www.maisonmakeeva.com/cdn/shop/files/D59A0094_be86ab79-e665-4d98-9937-31d9eb6de6c0_2048x.jpg?v=1763735979" alt="Maison Makeeva editorial campaign" className="h-full w-full object-cover" />
      </div>
      <div className="flex min-h-[70vh] flex-col justify-center px-6 py-20 sm:px-12 lg:px-20">
        <p className="text-xs uppercase tracking-wideLuxury text-stone">Editorial Campaign</p>
        <h2 className="mt-6 font-display text-3xl uppercase leading-none sm:text-5xl">The work of art, worn.</h2>
        <p className="mt-8 max-w-lg font-editorial text-base leading-7 text-ivory/75">
          Maison Makeeva’s visual language moves between velvet, denim, jersey, and graphic storytelling. Every garment is treated as a complete image.
        </p>
        <button onClick={() => go("lookbook")} className="mt-10 flex w-fit items-center gap-3 border-b border-ivory pb-2 text-xs uppercase tracking-wideLuxury">
          View lookbook <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function LookbookPreview({ go }: { go: (page: Page) => void }) {
  return (
    <section className="px-5 py-20 sm:px-10 lg:px-16">
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <img src="https://www.maisonmakeeva.com/cdn/shop/files/D59A0002_2048x.jpg?v=1763735642" alt="Lookbook preview" className="h-[75vh] w-full object-cover" />
        <div className="flex flex-col justify-between bg-parchment p-6 sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-wideLuxury text-taupe">Lookbook Preview</p>
            <h2 className="mt-5 font-display text-2xl uppercase leading-none sm:text-4xl">SS26 in motion</h2>
          </div>
          <button onClick={() => go("lookbook")} className="mt-10 flex w-fit items-center gap-3 border-b border-ink pb-2 text-xs uppercase tracking-wideLuxury">
            Enter campaign <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

function BrandPhilosophy() {
  return (
    <section className="bg-bone px-5 py-24 sm:px-10 lg:px-16">
      <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="mx-auto max-w-5xl text-center">
        <p className="text-xs uppercase tracking-wideLuxury text-taupe">Brand Philosophy</p>
        <h2 className="mt-6 font-display text-2xl leading-tight sm:text-4xl">
          We are design and product obsessed. Uncompromising in the style, quality and fitting of every garment we create.
        </h2>
        <p className="mx-auto mt-8 max-w-3xl font-editorial text-base leading-8 text-graphite/70">
          Creative director Makeeva Anye brings meticulous attention to detail and innovative design skills to each collection, ensuring every garment is not just clothing, but a work of art.
        </p>
      </motion.div>
    </section>
  );
}

function FashionGallery() {
  const images = [
    "D59A9701_2048x.jpg?v=1763735600",
    "D59A0011_f8d37a1d-ef93-4094-889a-3a1efa1d8ed2_2048x.jpg?v=1763735775",
    "D59A0094_2048x.jpg?v=1761262011",
    "D59A0059_1024x1024_crop_center.jpg?v=1763488780",
  ];
  return (
    <section className="grid grid-cols-2 gap-1 bg-ink p-1 md:grid-cols-4">
      {images.map((image, index) => (
        <motion.img
          key={image}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.08, duration: 0.7 }}
          viewport={{ once: true }}
          src={`https://www.maisonmakeeva.com/cdn/shop/files/${image}`}
          alt="Maison Makeeva fashion gallery"
          className={cx("h-[45vh] w-full object-cover", index === 1 && "md:mt-16", index === 2 && "md:mt-8")}
        />
      ))}
    </section>
  );
}

function CollectionPage({
  go,
  wishlist,
  toggleWishlist,
  addToCart,
}: {
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
}) {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = useMemo(() => {
    const next = category === "All" ? [...products] : products.filter((product) => product.category === category);
    if (sort === "Price, low to high") return next.sort((a, b) => a.price - b.price);
    if (sort === "Price, high to low") return next.sort((a, b) => b.price - a.price);
    if (sort === "Alphabetically, A-Z") return next.sort((a, b) => a.title.localeCompare(b.title));
    return next;
  }, [category, sort]);

  return (
    <PageShell eyebrow="Collections" title="Spring Summer SS26 ready to wear">
      <div className="mb-10 grid gap-6 border-y border-ink/15 py-6 lg:grid-cols-[1fr_auto]">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={cx("border px-4 py-2 text-xs uppercase tracking-wideLuxury", category === item ? "border-ink bg-ink text-ivory" : "border-ink/20")}>
              {item}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-xs uppercase tracking-wideLuxury">
          <SlidersHorizontal size={16} />
          <select value={sort} onChange={(event) => setSort(event.target.value)} className="bg-transparent outline-none">
            {["Featured", "Best selling", "Alphabetically, A-Z", "Price, low to high", "Price, high to low", "Date, new to old"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} go={go} wished={wishlist.includes(product.id)} onWish={() => toggleWishlist(product)} onAdd={() => addToCart(product)} />
        ))}
      </div>
    </PageShell>
  );
}

function ProductPage({
  product,
  go,
  wishlist,
  toggleWishlist,
  addToCart,
}: {
  product: Product;
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product, size?: string) => void;
}) {
  const [size, setSize] = useState(product.sizes[0]);
  const related = products.filter((item) => item.id !== product.id && (item.category === product.category || item.collection === product.collection)).slice(0, 4);

  return (
    <>
      <section className="grid min-h-screen bg-ivory pt-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-1 bg-ink p-1 md:grid-cols-2">
          {product.images.map((image) => (
            <motion.img key={image} initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }} animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }} transition={{ duration: 0.8 }} src={image} alt={product.title} className="min-h-[65vh] w-full object-cover" />
          ))}
        </div>
        <aside className="sticky top-16 h-fit px-5 py-10 sm:px-10 lg:px-14">
          <p className="text-xs uppercase tracking-wideLuxury text-taupe">{product.category}</p>
          <h1 className="mt-4 font-display text-2xl uppercase leading-none sm:text-4xl">{product.title}</h1>
          <p className="mt-6 text-lg">{formatMoney(product.price)}</p>
          <p className="mt-8 font-editorial text-base leading-7 text-graphite/75">{product.description}</p>
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wideLuxury">
              <span>Select size</span>
              <button className="border-b border-ink">Size guide</button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((item) => (
                <button key={item} onClick={() => setSize(item)} className={cx("border py-3 text-sm", size === item ? "border-ink bg-ink text-ivory" : "border-ink/20")}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto]">
            <button onClick={() => addToCart(product, size)} className="bg-ink px-6 py-4 text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite">
              Add to cart
            </button>
            <button onClick={() => toggleWishlist(product)} className="border border-ink px-6 py-4" aria-label="Wishlist">
              <Heart fill={wishlist.includes(product.id) ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="mt-10 space-y-4 border-t border-ink/15 pt-8">
            <Detail title="Product Story" content={product.story} />
            <Detail title="Materials" content={product.materials.join(", ")} />
            <Detail title="Color" content={product.colors.join(", ")} />
          </div>
        </aside>
      </section>
      <ProductRail title="Related Products" subtitle="Complete the look" products={related} go={go} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />
    </>
  );
}

function Detail({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wideLuxury text-taupe">{title}</p>
      <p className="mt-2 text-sm leading-7 text-graphite/75">{content}</p>
    </div>
  );
}

function LookbookPage({ go }: { go: (page: Page, product?: Product) => void }) {
  return (
    <PageShell eyebrow="Lookbook" title="Maison Makeeva campaign studies">
      <div className="grid gap-16">
        {collections.map((collection, index) => (
          <motion.article key={collection.handle} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className={cx("grid items-end gap-6 lg:grid-cols-2", index % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
            <img src={collection.image} alt={collection.title} className="h-[80vh] w-full object-cover" />
            <div className="pb-8">
              <p className="text-xs uppercase tracking-wideLuxury text-taupe">{collection.season}</p>
              <h2 className="mt-4 font-display text-2xl uppercase leading-none sm:text-4xl">{collection.title}</h2>
              <p className="mt-6 max-w-xl font-editorial text-base leading-7 text-graphite/70">{collection.description}</p>
              <button onClick={() => go("collection")} className="mt-8 flex items-center gap-3 border-b border-ink pb-2 text-xs uppercase tracking-wideLuxury">
                Shop the story <ArrowRight size={16} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}

function AboutPage() {
  return (
    <PageShell eyebrow="About The Store" title="Designed with precision, culture, and product obsession.">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <img src="https://www.maisonmakeeva.com/cdn/shop/files/D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833" alt="Maison Makeeva craft" className="h-[75vh] w-full object-cover" />
        <div className="grid content-center gap-8">
          {[
            ["Brand Story", "Maison Makeeva is a ready-to-wear fashion house where uncompromising fit meets graphic cultural storytelling."],
            ["Founder Vision", "Makeeva Anye’s creative direction is meticulous, identity-driven, and built around garments that hold artistic presence."],
            ["Craftsmanship", "Premium cotton, denim, velvet, sports fabric, sublimation print, panel detail, and proportion define the wardrobe."],
            ["Philosophy", "Every garment is treated as clothing and object: practical enough to wear, strong enough to remember."],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-ink/15 pt-6">
              <p className="text-xs uppercase tracking-wideLuxury text-taupe">{title}</p>
              <p className="mt-3 font-display text-lg leading-snug sm:text-xl">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell eyebrow="Contact" title="Maison Makeeva client services">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr]">
        <form className="grid gap-4 bg-ivory p-6 sm:p-10">
          {["Name", "Email", "Order number"].map((field) => (
            <input key={field} placeholder={field} className="border-b border-ink/30 bg-transparent py-4 outline-none placeholder:text-taupe" />
          ))}
          <textarea placeholder="Message" rows={6} className="border-b border-ink/30 bg-transparent py-4 outline-none placeholder:text-taupe" />
          <button className="mt-4 bg-ink px-6 py-4 text-xs uppercase tracking-wideLuxury text-ivory">Send enquiry</button>
        </form>
        <div className="space-y-8">
          <Info title="Customer Support" lines={["Support 24/7", "maisonmakeeva@gmail.com", "WhatsApp concierge available for order assistance"]} />
          <Info title="Store Information" lines={["International shipping", "3-5 business day order processing", "30 day return and exchange window"]} />
          <Info title="Social" lines={["Instagram", "Facebook", "YouTube"]} />
          <div className="grid h-56 place-items-center bg-parchment text-xs uppercase tracking-wideLuxury text-taupe">Map module ready for Shopify theme integration</div>
        </div>
      </div>
    </PageShell>
  );
}

function SearchPage({ go }: { go: (page: Page, product?: Product) => void }) {
  const [query, setQuery] = useState("");
  const results = products.filter((product) => `${product.title} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <PageShell eyebrow="Search" title="Find a silhouette">
      <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search Hoodies, Jackets, T-Shirt, Trousers..." className="w-full border-b border-ink bg-transparent py-5 font-display text-lg outline-none placeholder:text-taupe sm:text-2xl" />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(query ? results : products.slice(0, 4)).map((product) => (
          <button key={product.id} onClick={() => go("product", product)} className="text-left">
            <img src={product.images[0]} alt={product.title} className="aspect-[3/4] w-full object-cover" />
            <p className="mt-3 text-sm uppercase">{product.title}</p>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

function WishlistPage({
  products: wished,
  go,
  toggleWishlist,
  addToCart,
}: {
  products: Product[];
  go: (page: Page, product?: Product) => void;
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
}) {
  return (
    <PageShell eyebrow="Wishlist" title="Your saved Maison Makeeva pieces">
      {wished.length ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4">
          {wished.map((product) => (
            <ProductCard key={product.id} product={product} go={go} wished onWish={() => toggleWishlist(product)} onAdd={() => addToCart(product)} />
          ))}
        </div>
      ) : (
        <EmptyState title="No saved pieces yet" action="Discover SS26" onClick={() => go("collection")} />
      )}
    </PageShell>
  );
}

function AccountPage() {
  return (
    <PageShell eyebrow="Account" title="Client account">
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="bg-ivory p-6 sm:p-10">
          <p className="text-xs uppercase tracking-wideLuxury text-taupe">Log in</p>
          <input placeholder="Email" className="mt-8 w-full border-b border-ink/30 bg-transparent py-4 outline-none" />
          <input placeholder="Password" type="password" className="mt-4 w-full border-b border-ink/30 bg-transparent py-4 outline-none" />
          <button className="mt-8 w-full bg-ink px-6 py-4 text-xs uppercase tracking-wideLuxury text-ivory">Log in</button>
        </form>
        <div className="bg-parchment p-6 sm:p-10">
          <p className="text-xs uppercase tracking-wideLuxury text-taupe">Register</p>
          <h2 className="mt-5 font-display text-2xl sm:text-3xl">Create a Maison Makeeva client profile.</h2>
          <div className="mt-8 grid gap-3 text-sm">
            {["Order history", "Saved addresses", "Wishlist sync", "Early campaign access"].map((item) => (
              <p key={item} className="flex items-center gap-3"><Check size={16} /> {item}</p>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function CartPage({ cart, setCart, go }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; go: (page: Page, product?: Product) => void }) {
  return (
    <PageShell eyebrow="Cart" title="Shopping bag">
      <CartContent cart={cart} setCart={setCart} go={go} />
    </PageShell>
  );
}

function CartContent({ cart, setCart, go }: { cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; go: (page: Page, product?: Product) => void }) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const update = (item: CartItem, qty: number) => setCart((items) => (qty <= 0 ? items.filter((entry) => entry !== item) : items.map((entry) => (entry === item ? { ...entry, qty } : entry))));

  if (!cart.length) return <EmptyState title="Your cart is currently empty." action="Continue shopping" onClick={() => go("collection")} />;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        {cart.map((item) => (
          <div key={`${item.product.id}-${item.size}`} className="grid grid-cols-[110px_1fr] gap-5 border-b border-ink/15 pb-5">
            <img src={item.product.images[0]} alt={item.product.title} className="aspect-[3/4] w-full object-cover" />
            <div>
              <p className="text-sm uppercase">{item.product.title}</p>
              <p className="mt-2 text-sm text-taupe">Size {item.size}</p>
              <p className="mt-2">{formatMoney(item.product.price)}</p>
              <div className="mt-5 flex w-fit items-center border border-ink/20">
                <button onClick={() => update(item, item.qty - 1)} className="p-3"><Minus size={14} /></button>
                <span className="px-3 text-sm">{item.qty}</span>
                <button onClick={() => update(item, item.qty + 1)} className="p-3"><Plus size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit bg-ivory p-6 sm:p-8">
        <p className="text-xs uppercase tracking-wideLuxury text-taupe">Order Summary</p>
        <div className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
          <input placeholder="Coupon code" className="w-full border-b border-ink/30 bg-transparent py-4 outline-none" />
        </div>
        <button className="mt-8 w-full bg-ink px-6 py-4 text-xs uppercase tracking-wideLuxury text-ivory">Checkout with Shopify</button>
        <p className="mt-4 text-xs leading-6 text-taupe">Shopify Payments, checkout, taxes, and duties are ready to connect in theme conversion.</p>
      </aside>
    </div>
  );
}

function Newsletter() {
  return (
    <section className="bg-parchment px-5 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-wideLuxury text-taupe">Newsletter</p>
          <h2 className="mt-4 font-display text-2xl leading-none sm:text-4xl">Get 15% off your second purchase.</h2>
        </div>
        <form className="flex border-b border-ink">
          <input placeholder="Email address" className="min-w-0 flex-1 bg-transparent py-4 outline-none placeholder:text-taupe" />
          <button className="px-4 text-xs uppercase tracking-wideLuxury">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

function Footer({ go }: { go: (page: Page) => void }) {
  return (
    <footer className="bg-ink px-5 py-14 text-ivory sm:px-10 lg:px-16">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl uppercase tracking-[0.16em]">Maison Makeeva</p>
          <p className="mt-6 max-w-md text-sm leading-7 text-ivory/65">Luxury ready-to-wear, campaign collections, sets, jerseys, bags, and MM-coded silhouettes.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {pageLinks.map((link) => (
            <button key={link.page} onClick={() => go(link.page)} className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-ivory">
              {link.label}
            </button>
          ))}
          <button onClick={() => go("wishlist")} className="text-left uppercase tracking-wideLuxury text-ivory/75">Wishlist</button>
          <button onClick={() => go("cart")} className="text-left uppercase tracking-wideLuxury text-ivory/75">Cart</button>
        </div>
        <div className="text-sm leading-7 text-ivory/65">
          <p>Terms & Conditions</p>
          <p>Privacy Policy</p>
          <p>Shipping & Returns</p>
          <p>USD EUR GBP</p>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-ivory/45">Copyright © 2024 Maison Makeeva. All rights reserved.</p>
    </footer>
  );
}

function PolicyStrip() {
  return (
    <section className="grid border-y border-ink/10 bg-bone md:grid-cols-3">
      {policies.map((policy) => (
        <div key={policy} className="border-ink/10 p-6 text-center text-xs uppercase leading-6 tracking-wideLuxury md:border-r">
          {policy}
        </div>
      ))}
    </section>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-20 sm:px-10 lg:px-16">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-wideLuxury text-taupe">{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl uppercase leading-none sm:text-4xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function PageShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="min-h-screen px-5 pb-20 pt-32 sm:px-10 lg:px-16">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12 max-w-5xl">
        <p className="text-xs uppercase tracking-wideLuxury text-taupe">{eyebrow}</p>
        <h1 className="mt-4 font-display text-3xl uppercase leading-none sm:text-5xl">{title}</h1>
      </motion.div>
      {children}
    </section>
  );
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="border-t border-ink/15 pt-6">
      <p className="text-xs uppercase tracking-wideLuxury text-taupe">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-2 text-sm leading-7">{line}</p>
      ))}
    </div>
  );
}

function EmptyState({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return (
    <div className="grid min-h-[40vh] place-items-center bg-ivory p-10 text-center">
      <div>
        <h2 className="font-display text-2xl">{title}</h2>
        <button onClick={onClick} className="mt-8 border-b border-ink pb-2 text-xs uppercase tracking-wideLuxury">{action}</button>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose, go }: { open: boolean; onClose: () => void; go: (page: Page, product?: Product) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.55, ease: easeOutExpo }} className="fixed inset-0 z-[80] overflow-y-auto bg-ink p-5 text-ivory">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg uppercase tracking-[0.18em]">Maison Makeeva</p>
            <button onClick={onClose} aria-label="Close menu"><X /></button>
          </div>
          <div className="mt-8 space-y-8">
            {shopifyMenus.map((menu) => (
              <div key={menu.label} className="border-b border-ivory/15 pb-6">
                <button onClick={() => { onClose(); go(menu.page); }} className="text-left font-display text-2xl uppercase tracking-[0.18em]">
                  {menu.label}
                </button>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {menu.columns.flatMap((column) => column.items).slice(0, 6).map((item) => (
                    <button key={`${menu.label}-${item}`} onClick={() => { onClose(); go(menu.page); }} className="block text-left text-sm uppercase tracking-wideLuxury text-stone transition hover:text-ivory">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-4 border-t border-ivory/15 pt-6 text-sm uppercase tracking-wideLuxury text-taupe">
            <button onClick={() => { onClose(); go("search"); }} className="block text-left">Search</button>
            <button onClick={() => { onClose(); go("wishlist"); }} className="block text-left">Wishlist</button>
            <button onClick={() => { onClose(); go("cart"); }} className="block text-left">Cart</button>
            <button onClick={() => { onClose(); go("account"); }} className="block text-left">Account</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ open, onClose, go }: { open: boolean; onClose: () => void; go: (page: Page, product?: Product) => void }) {
  const [query, setQuery] = useState("");
  const results = products.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-bone p-5 pt-20 sm:p-10 sm:pt-24">
          <button onClick={onClose} className="absolute right-5 top-5" aria-label="Close search"><X /></button>
          <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search Maison Makeeva" className="w-full border-b border-ink bg-transparent pb-5 font-display text-2xl outline-none sm:text-4xl" />
          <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-wideLuxury text-taupe">
            {["Hoodies", "Jackets", "T-Shirt", "Trousers"].map((trend) => (
              <button key={trend} onClick={() => setQuery(trend)}>{trend}</button>
            ))}
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {(query ? results : products.slice(0, 4)).map((product) => (
              <button key={product.id} onClick={() => { onClose(); go("product", product); }} className="text-left">
                <img src={product.images[0]} alt={product.title} className="aspect-[3/4] w-full object-cover" />
                <p className="mt-3 text-xs uppercase tracking-wideLuxury">{product.title}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ open, onClose, cart, setCart, go }: { open: boolean; onClose: () => void; cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; go: (page: Page, product?: Product) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[85] bg-ink/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.5, ease: easeOutExpo }} className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-bone p-5 sm:p-8">
            <div className="mb-8 flex items-center justify-between">
              <p className="font-display text-xl">Cart</p>
              <button onClick={onClose} aria-label="Close cart"><X /></button>
            </div>
            <CartContent cart={cart} setCart={setCart} go={(page, product) => { onClose(); go(page, product); }} />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Root() {
  return <App />;
}
