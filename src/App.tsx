import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns,
  Eye,
  Heart,
  LayoutGrid,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { CuratorModal } from "./components/CuratorModal";
import { GarmentAnatomy } from "./components/GarmentAnatomy";
import { MagneticCursor } from "./components/MagneticCursor";
import { ProductCard3D } from "./components/ProductCard3D";
import { ResnBrandIntro } from "./components/ResnBrandIntro";
import { RunwayLookbook } from "./components/RunwayLookbook";
import { SignatureHero } from "./components/SignatureHero";
import { collections, policies, products, type Collection, type Product } from "./data/catalog";
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

export default function App() {
  const [introVisible, setIntroVisible] = useState(true);
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [curatorProduct, setCuratorProduct] = useState<Product | null>(null);
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
    setWishlist((items) =>
      items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id]
    );
  };

  const addToCart = (product: Product, size = product.sizes[0] || "M") => {
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
    home: (
      <HomePage
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
      />
    ),
    collection: (
      <CollectionPage
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
      />
    ),
    product: (
      <ProductPage
        product={selectedProduct}
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
      />
    ),
    lookbook: (
      <LookbookPage
        go={go}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
      />
    ),
    about: <AboutPage go={go} />,
    contact: <ContactPage />,
    search: <SearchPage go={go} />,
    wishlist: (
      <WishlistPage
        products={wishedProducts}
        go={go}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
      />
    ),
    account: <AccountPage />,
    cart: <CartPage cart={cart} setCart={setCart} go={go} />,
  }[page];

  return (
    <div className="min-h-screen bg-bone text-ink selection:bg-chartreuse selection:text-ink cursor-default">
      {/* Cuberto-Style Magnetic Fluid Custom Cursor */}
      <MagneticCursor />

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
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        >
          {PageComponent}
        </motion.main>
      </AnimatePresence>

      <Footer go={go} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} go={go} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} go={go} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} go={go} />

      {/* Curator Quick-View Specimen Modal */}
      <CuratorModal
        product={curatorProduct}
        onClose={() => setCuratorProduct(null)}
        onAddToCart={addToCart}
        isWishlisted={curatorProduct ? wishlist.includes(curatorProduct.id) : false}
        onToggleWishlist={toggleWishlist}
      />

      {/* Resn-Style Avant-Garde Brand Entrance Preloader */}
      <AnimatePresence>
        {introVisible && <ResnBrandIntro onComplete={() => setIntroVisible(false)} />}
      </AnimatePresence>
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
      {/* Top Archival Runway Ticker Strip */}
      <div className="border-b border-white/10 bg-ink/90 text-ivory">
        <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between gap-3 px-4 text-[11px] uppercase tracking-[0.22em] font-mono sm:px-8">
          <div className="flex items-center gap-3 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-chartreuse animate-pulse" />
            <span className="truncate">PARIS ARCHIVE // SS26 PRESENTATION // CULTURAL ARTISTRY</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => go("collection")}
              className="text-[11px] uppercase tracking-[0.22em] text-chartreuse transition hover:underline"
            >
              Exhibition Catalog →
            </button>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <div className="border-b border-ivory/15 bg-ink/75 text-ivory backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <IconButton label="Account" onClick={() => go("account")}>
              <User size={18} />
            </IconButton>
            <IconButton label="Search" onClick={onSearch}>
              <Search size={18} />
            </IconButton>
          </div>

          <button
            onClick={() => go("home")}
            className="flex flex-col items-center group text-center"
          >
            <span className="font-display text-lg uppercase tracking-[0.16em] sm:text-xl transition-transform group-hover:scale-105">
              MM / Makeeva
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-chartreuse opacity-80">
              Atelier Paris
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <IconButton label={`Wishlist ${wishlistCount}`} onClick={() => go("wishlist")}>
              <Heart size={18} fill={wishlistCount > 0 ? "currentColor" : "none"} className={wishlistCount > 0 ? "text-chartreuse" : ""} />
            </IconButton>

            <button
              onClick={onCart}
              className="relative flex items-center gap-2 border border-ivory/25 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ivory transition hover:border-chartreuse hover:text-chartreuse"
              aria-label="Open cart bag"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-chartreuse px-1 text-[9px] font-bold text-ink">
                {cartCount}
              </span>
            </button>

            <button className="lg:hidden p-2" onClick={onMenu} aria-label="Open menu">
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Curated Mega-Menu Links */}
      <div className="hidden lg:block border-b border-ivory/15 bg-ink/75 text-ivory backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-center gap-8 px-4 font-mono text-xs uppercase tracking-[0.24em]">
          {shopifyMenus.map((menu) => (
            <button
              key={menu.label}
              onMouseEnter={() => setMega(menu.label)}
              onClick={() => go(menu.page)}
              className="transition hover:text-chartreuse hover:underline underline-offset-8"
            >
              {menu.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {mega && (
          <motion.div
            onMouseLeave={() => setMega(null)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="hidden border-t border-ivory/10 bg-ink/95 px-10 py-10 lg:block shadow-2xl backdrop-blur-2xl"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_1.2fr] gap-12">
              <div>
                <p className="mb-5 font-mono text-xs uppercase tracking-wideLuxury text-chartreuse">
                  {mega} Collection Study
                </p>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  {shopifyMenuMap[mega].columns.flatMap((column) => column.items).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setMega(null);
                        go("collection");
                      }}
                      className="text-left font-display text-lg text-ivory transition-colors duration-150 hover:text-chartreuse hover:translate-x-1"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {shopifyMenuMap[mega].columns.map((column) => (
                  <div key={column.title}>
                    <p className="mb-4 font-mono text-xs uppercase tracking-wideLuxury text-stone">
                      {column.title}
                    </p>
                    <div className="space-y-2.5">
                      {column.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setMega(null);
                            go("collection");
                          }}
                          className="block text-left text-sm text-ivory/80 transition-colors duration-150 hover:text-chartreuse"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border border-ivory/20 bg-parchment p-6 text-ink flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-taupe">Atelier Spotlight</span>
                    <h4 className="mt-2 font-display text-xl uppercase leading-tight">{shopifyMenuMap[mega].hero}</h4>
                    <p className="mt-2 font-editorial text-xs text-graphite/80">Crafted with cultural memory and tactile density.</p>
                  </div>
                  <button
                    onClick={() => {
                      setMega(null);
                      go(shopifyMenuMap[mega].page);
                    }}
                    className="mt-6 flex items-center justify-between border-t border-ink/20 pt-3 font-mono text-xs uppercase tracking-[0.18em] font-semibold transition hover:text-taupe"
                  >
                    <span>Enter Universe</span>
                    <ArrowRight size={14} />
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

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-ivory transition hover:text-chartreuse"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function KineticTicker() {
  const tickerItems = [
    "MAISON MAKEEVA",
    "SS26 SALON EXHIBITION",
    "300 GSM HEAVYWEIGHT COTTON",
    "STONEWASHED DENIM",
    "CULTURAL ARTISTRY",
    "PARIS · ACCRA · GLOBAL ATELIER",
    "VELVET ARCHIVES",
    "UNCOMPROMISING SILHOUETTES",
    "HIGH DEFINITION DTS EMBROIDERY",
  ];

  return (
    <div className="relative overflow-hidden border-y border-ivory/15 bg-ink py-3 text-ivory select-none">
      <div className="animate-marquee flex items-center gap-8">
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="flex items-center gap-8 shrink-0 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-ivory/90">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-chartreuse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HomePage({
  go,
  wishlist,
  toggleWishlist,
  addToCart,
  onCuratorInspect,
}: {
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  const primaryProduct = getPrimaryProduct(products);

  return (
    <>
      {/* Signature 3D Hero Stage with Cuberto + Resn Level Polish */}
      <SignatureHero go={go} />
      <KineticTicker />

      {/* Featured Campaign Collections Archive */}
      <FeaturedCollections go={go} />

      {/* Reimagined Salon Exhibition: New Arrivals with View Switcher (Clean 2D Cards) */}
      <SalonExhibition
        title="Salon Exhibition / New Arrivals"
        eyebrow="Spring Summer SS26 Monograph"
        description="Silhouettes cut from 300 GSM cotton, deep stonewashed denim, and rich velvet."
        items={products.slice(0, 6)}
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={onCuratorInspect}
      />

      {/* The Living Archive / Garment Anatomy Section */}
      <Reveal>
        <GarmentAnatomy
          featuredProduct={primaryProduct}
          onSelectProduct={(p) => go("product", p)}
          onAddToCart={addToCart}
        />
      </Reveal>

      {/* Full-Screen 3D Editorial Campaign Chamber */}
      <Reveal>
        <EditorialCampaign go={go} />
      </Reveal>

      {/* Runway Lookbook with Interactive Garment Hotspots */}
      <Reveal>
        <RunwayLookbook
          onSelectProduct={(p) => go("product", p)}
          onAddToCart={addToCart}
          onOpenCurator={onCuratorInspect}
        />
      </Reveal>

      {/* Best Sellers Exhibition */}
      <SalonExhibition
        title="Iconic House Silhouettes"
        eyebrow="Archive Best Sellers"
        description="Permanent codes and essential uniforms of Maison Makeeva."
        items={products.filter((p) => p.badge).slice(0, 6)}
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={onCuratorInspect}
      />

      <Reveal>
        <BrandPhilosophy />
      </Reveal>

      {/* Full-Screen 3D Visual Gallery Walkway */}
      <Reveal>
        <FashionGallery />
      </Reveal>

      <Reveal>
        <Newsletter />
      </Reveal>
      <Reveal>
        <PolicyStrip />
      </Reveal>
    </>
  );
}

function FeaturedCollections({ go }: { go: (page: Page) => void }) {
  return (
    <Section eyebrow="01 / Curated Collections" title="A house wardrobe with campaign gravity.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection, index) => (
          <motion.button
            key={collection.handle}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            onClick={() => go("collection")}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className={cx(
              "collection-card group relative overflow-hidden text-left border border-ink/15 bg-bone shadow-md",
              index === 1 && "lg:mt-16",
              index === 2 && "lg:-mt-6"
            )}
            data-cursor="view"
            data-cursor-text="COLLECTION"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
              <img
                src={collection.image}
                alt={collection.title}
                className="image-reveal h-full w-full object-cover"
              />
              <span className="absolute right-3 top-3 font-mono text-[10px] text-white/80 bg-ink/70 px-2 py-0.5 backdrop-blur-sm">
                0{index + 1}
              </span>
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6 text-ivory">
              <span className="font-mono text-[10px] uppercase tracking-wideLuxury text-chartreuse">
                {collection.season}
              </span>
              <h3 className="mt-1 font-display text-xl uppercase leading-tight tracking-[-0.02em]">
                {collection.title}
              </h3>
              <p className="mt-2 line-clamp-2 font-editorial text-xs text-ivory/80">
                {collection.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ivory group-hover:text-chartreuse transition-colors">
                <span>Explore Works</span>
                <ArrowRight size={12} />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </Section>
  );
}

function SalonExhibition({
  title,
  eyebrow,
  description,
  items,
  go,
  wishlist,
  toggleWishlist,
  addToCart,
  onCuratorInspect,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  items: Product[];
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  const [viewMode, setViewMode] = useState<"salon" | "grid" | "runway">("salon");

  return (
    <Section eyebrow={eyebrow} title={title}>
      {/* Top Controller: View Switcher */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-ink/15 pb-5 sm:flex-row sm:items-center">
        {description ? (
          <p className="max-w-xl font-editorial text-base text-graphite/80 italic">{description}</p>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 self-end">
          <span className="font-mono text-[10px] uppercase tracking-wider text-taupe mr-2">
            Display Mode:
          </span>
          <button
            onClick={() => setViewMode("salon")}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition",
              viewMode === "salon"
                ? "border-ink bg-ink text-ivory font-bold"
                : "border-ink/20 text-taupe hover:border-ink"
            )}
            title="Asymmetric Salon Exhibition"
          >
            <Columns size={12} />
            <span className="hidden sm:inline">Salon</span>
          </button>

          <button
            onClick={() => setViewMode("runway")}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition",
              viewMode === "runway"
                ? "border-ink bg-ink text-ivory font-bold"
                : "border-ink/20 text-taupe hover:border-ink"
            )}
            title="Horizontal Runway Stream"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">Runway</span>
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition",
              viewMode === "grid"
                ? "border-ink bg-ink text-ivory font-bold"
                : "border-ink/20 text-taupe hover:border-ink"
            )}
            title="Standard High-Density Grid"
          >
            <LayoutGrid size={12} />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>
      </div>

      {/* Render based on view mode (Clean, high-end 2D cards) */}
      {viewMode === "runway" ? (
        <div className="flex gap-5 overflow-x-auto pb-6 pt-2 scrollbar-thin">
          {items.map((product, idx) => (
            <ProductCard3D
              key={product.id}
              product={product}
              index={idx}
              wished={wishlist.includes(product.id)}
              onSelect={(p) => go("product", p)}
              onWish={() => toggleWishlist(product)}
              onAdd={addToCart}
              onCuratorInspect={onCuratorInspect}
              viewMode="runway"
            />
          ))}
        </div>
      ) : viewMode === "salon" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {items.map((product, idx) => (
            <ProductCard3D
              key={product.id}
              product={product}
              index={idx}
              wished={wishlist.includes(product.id)}
              onSelect={(p) => go("product", p)}
              onWish={() => toggleWishlist(product)}
              onAdd={addToCart}
              onCuratorInspect={onCuratorInspect}
              viewMode="salon"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {items.map((product, idx) => (
            <ProductCard3D
              key={product.id}
              product={product}
              index={idx}
              wished={wishlist.includes(product.id)}
              onSelect={(p) => go("product", p)}
              onWish={() => toggleWishlist(product)}
              onAdd={addToCart}
              onCuratorInspect={onCuratorInspect}
              viewMode="grid"
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function EditorialCampaign({ go }: { go: (page: Page) => void }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 20 });
  const tiltX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const floatZ = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

  const { scrollYProgress } = useScroll();
  const cameraZ = useTransform(scrollYProgress, [0.3, 0.6], [0, 30]);

  const handlePointer = (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      className="relative grid bg-ink text-ivory lg:grid-cols-2 overflow-hidden border-y border-ivory/15 select-none"
      style={{ perspective: "1400px" }}
      onPointerMove={handlePointer}
      onPointerLeave={handleLeave}
      data-cursor="view"
      data-cursor-text="EDITORIAL"
    >
      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          z: cameraZ,
          transformStyle: "preserve-3d",
        }}
        className="campaign-image-wrap min-h-[80vh] overflow-hidden relative p-4 sm:p-8 flex items-center justify-center will-change-transform"
      >
        <div className="relative aspect-[4/5] w-full max-w-lg overflow-hidden border border-ivory/20 shadow-2xl">
          <img
            src="https://www.maisonmakeeva.com/cdn/shop/files/D59A0094_be86ab79-e665-4d98-9937-31d9eb6de6c0_2048x.jpg?v=1763735979"
            alt="Maison Makeeva editorial campaign"
            className="h-full w-full object-cover filter contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 rounded bg-ink/85 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-chartreuse backdrop-blur-md">
            STUDY // MM-026
          </div>
        </div>

        {/* Floating 3D Specimen Plaque */}
        <motion.div
          style={{ x: floatZ, z: 80 }}
          className="absolute -bottom-2 right-6 sm:right-12 z-20 w-64 border border-ivory/25 bg-noir/90 p-4 shadow-2xl backdrop-blur-xl hidden sm:block"
        >
          <span className="font-mono text-[9px] uppercase tracking-wider text-chartreuse block">
            Couture Textile Note
          </span>
          <p className="mt-1 font-editorial text-xs text-ivory/80 italic">
            "Stonewashed indigo densified for architectural volume and cultural memory."
          </p>
        </motion.div>
      </motion.div>

      <div className="flex min-h-[65vh] flex-col justify-center px-6 py-20 sm:px-12 lg:px-20 bg-noir">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-chartreuse">
          Editorial Manifesto // SS26
        </span>
        <h2 className="mt-4 font-display text-3xl uppercase leading-none sm:text-5xl lg:text-6xl">
          The work of art, worn.
        </h2>
        <p className="mt-6 max-w-lg font-editorial text-base sm:text-lg leading-relaxed text-ivory/80">
          Maison Makeeva’s visual language moves between thick velvet, stonewashed denim, performance jerseys, and graphic storytelling. Every garment is engineered as an enduring image rather than disposable fashion.
        </p>

        <div className="mt-8 flex items-center gap-6">
          <button
            onClick={() => go("lookbook")}
            className="group flex items-center gap-3 border-b-2 border-chartreuse pb-1 font-mono text-xs uppercase tracking-[0.2em] text-chartreuse transition hover:text-white hover:border-white"
          >
            <span>View Monograph</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => go("collection")}
            className="font-mono text-xs uppercase tracking-[0.2em] text-ivory/70 transition hover:text-white"
          >
            Shop Current SS26
          </button>
        </div>
      </div>
    </section>
  );
}

function BrandPhilosophy() {
  return (
    <section className="bg-bone px-5 py-24 sm:px-10 lg:px-16 border-t border-ink/15">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-5xl text-center"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-taupe">
          Brand Philosophy & Cultural Heritage
        </p>
        <h2 className="mt-6 font-display text-2xl uppercase leading-tight sm:text-4xl lg:text-5xl">
          We are design and product obsessed. Uncompromising in the style, quality and fitting of every garment we create.
        </h2>
        <p className="mx-auto mt-8 max-w-3xl font-editorial text-lg leading-relaxed text-graphite/80 italic">
          "Creative director Makeeva Anye brings meticulous attention to detail and innovative design skills to each collection, ensuring every garment is not just clothing, but a work of art."
        </p>
        <div className="mt-8 flex justify-center items-center gap-6 font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">
          <span>PARIS ATELIER</span>
          <span className="h-1 w-1 rounded-full bg-taupe" />
          <span>ACCRA HERITAGE</span>
          <span className="h-1 w-1 rounded-full bg-taupe" />
          <span>GLOBAL COUTURE</span>
        </div>
      </motion.div>
    </section>
  );
}

function FashionGallery() {
  const images = [
    { src: "D59A9701_2048x.jpg?v=1763735600", title: "Plate 01 // Silhouette" },
    { src: "D59A0011_f8d37a1d-ef93-4094-889a-3a1efa1d8ed2_2048x.jpg?v=1763735775", title: "Plate 02 // Structure" },
    { src: "D59A0094_2048x.jpg?v=1761262011", title: "Plate 03 // Drape" },
    { src: "D59A0059_1024x1024_crop_center.jpg?v=1763488780", title: "Plate 04 // Identity" },
  ];

  return (
    <section
      className="bg-ink p-4 sm:p-10 border-t border-ivory/15 select-none"
      style={{ perspective: "1200px" }}
      data-cursor="view"
      data-cursor-text="GALLERY"
    >
      <div className="mb-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-ivory/60 border-b border-ivory/10 pb-4">
        <span>3D Visual Monograph Walkway</span>
        <span className="text-chartreuse">4 Perspectives</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((item, index) => (
          <motion.div
            key={item.src}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.04, z: 50 }}
            transition={{ delay: index * 0.08, duration: 0.6 }}
            viewport={{ once: true }}
            className={cx(
              "overflow-hidden group relative border border-ivory/15 bg-graphite shadow-xl cursor-pointer will-change-transform",
              index === 1 && "md:mt-12",
              index === 2 && "md:mt-6"
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            <img
              src={`https://www.maisonmakeeva.com/cdn/shop/files/${item.src}`}
              alt={item.title}
              className="h-[52vh] w-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[1.02] contrast-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="bg-ink/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ivory backdrop-blur-sm">
                {item.title}
              </span>
              <span className="text-chartreuse font-mono text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                INSPECT →
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CollectionPage({
  go,
  wishlist,
  toggleWishlist,
  addToCart,
  onCuratorInspect,
}: {
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [viewMode, setViewMode] = useState<"salon" | "grid" | "runway">("salon");

  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];

  const filtered = useMemo(() => {
    const next = category === "All" ? [...products] : products.filter((product) => product.category === category);
    if (sort === "Price, low to high") return next.sort((a, b) => a.price - b.price);
    if (sort === "Price, high to low") return next.sort((a, b) => b.price - a.price);
    if (sort === "Alphabetically, A-Z") return next.sort((a, b) => a.title.localeCompare(b.title));
    return next;
  }, [category, sort]);

  return (
    <PageShell eyebrow="Exhibition Catalog" title="Spring Summer SS26 Monograph">
      {/* Intro Quote */}
      <div className="collection-intro mb-8 grid gap-5 border-y border-ink/15 py-5 sm:grid-cols-[1fr_auto] sm:items-end bg-parchment/40 px-4">
        <p className="max-w-2xl font-editorial text-lg leading-snug text-graphite/90 sm:text-xl">
          Pieces made to hold the room. Explore the complete SS26 ready-to-wear archive filtered by textile, silhouette, and proportion.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-taupe">
          {filtered.length} / {products.length} works catalogued
        </p>
      </div>

      {/* Filter and View Controls */}
      <div className="mb-10 grid gap-6 border-b border-ink/15 pb-6 lg:grid-cols-[1fr_auto] items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cx(
                "border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wideLuxury transition",
                category === item ? "border-ink bg-ink text-ivory font-bold" : "border-ink/20 text-taupe hover:border-ink hover:text-ink"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {/* View Mode & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 border border-ink/20 p-1">
            <button
              onClick={() => setViewMode("salon")}
              className={cx("p-1.5", viewMode === "salon" ? "bg-ink text-ivory" : "text-taupe hover:text-ink")}
              title="Salon mode"
            >
              <Columns size={14} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cx("p-1.5", viewMode === "grid" ? "bg-ink text-ivory" : "text-taupe hover:text-ink")}
              title="Grid mode"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wideLuxury text-taupe">
            <SlidersHorizontal size={14} />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="bg-transparent font-mono outline-none text-ink cursor-pointer"
            >
              {["Featured", "Price, low to high", "Price, high to low", "Alphabetically, A-Z"].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Catalog Render */}
      <div
        className={cx(
          "grid gap-x-4 gap-y-10",
          viewMode === "salon"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}
      >
        {filtered.map((product, idx) => (
          <ProductCard3D
            key={product.id}
            product={product}
            index={idx}
            wished={wishlist.includes(product.id)}
            onSelect={(p) => go("product", p)}
            onWish={() => toggleWishlist(product)}
            onAdd={addToCart}
            onCuratorInspect={onCuratorInspect}
            viewMode={viewMode}
          />
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
  onCuratorInspect,
}: {
  product: Product;
  go: (page: Page, product?: Product) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product, size?: string) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  const [size, setSize] = useState(product.sizes[0] || "M");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const related = products
    .filter((item) => item.id !== product.id && (item.category === product.category || item.collection === product.collection))
    .slice(0, 4);

  useEffect(() => {
    setActiveImage(0);
    setSize(product.sizes[0] || "M");
  }, [product.id]);

  const handleAdd = () => {
    addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <>
      <section className="product-detail-shell grid min-h-screen bg-ivory pt-24 sm:pt-28 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Gallery Left */}
        <div className="product-detail-gallery bg-ink p-3 sm:p-6">
          <div className="product-desktop-images hidden gap-4 md:grid md:grid-cols-2">
            {product.images.map((image, idx) => (
              <motion.div
                key={image}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative overflow-hidden bg-graphite"
              >
                <img
                  src={image}
                  alt={product.title}
                  className="product-detail-image min-h-[65vh] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute bottom-3 left-3 bg-ink/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ivory">
                  ANGLE 0{idx + 1}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="product-carousel relative overflow-hidden md:hidden">
            <img
              src={product.images[activeImage] || product.images[0]}
              alt={product.title}
              className="product-detail-image h-full w-full object-cover"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                  className="carousel-arrow carousel-arrow-prev"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev + 1) % product.images.length)}
                  className="carousel-arrow carousel-arrow-next"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Specimen Details Right */}
        <aside className="product-detail-info sticky top-20 h-fit px-6 py-10 sm:px-10 lg:px-14 bg-bone border-l border-ink/10">
          <div className="flex items-center justify-between border-b border-ink/15 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">
              Object {products.findIndex((item) => item.id === product.id) + 1} // SS26
            </span>
            <button
              onClick={() => onCuratorInspect(product)}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-chartreuse bg-ink px-2.5 py-1 transition hover:bg-graphite"
            >
              <Eye size={12} />
              <span>Deep Specimen Inspect</span>
            </button>
          </div>

          <p className="mt-6 font-mono text-[11px] uppercase tracking-wideLuxury text-taupe">
            {product.category} · {product.collection.toUpperCase()}
          </p>

          <h1 className="mt-2 font-display text-3xl uppercase leading-none sm:text-5xl">
            {product.title}
          </h1>

          <p className="mt-4 font-mono text-xl font-medium text-ink">
            {formatMoney(product.price)}
          </p>

          <p className="mt-6 font-editorial text-base leading-relaxed text-graphite/80">
            {product.description}
          </p>

          {/* Silhouette Gauge */}
          <div className="mt-6 border-y border-ink/10 py-4 font-mono text-xs">
            <div className="flex justify-between text-taupe uppercase text-[10px]">
              <span>Silhouette Cut</span>
              <span className="text-ink font-semibold">Oversized Editorial</span>
            </div>
            <div className="mt-2 flex gap-1">
              <span className="h-1.5 flex-1 bg-ink/20" />
              <span className="h-1.5 flex-1 bg-ink/20" />
              <span className="h-1.5 flex-1 bg-chartreuse" />
              <span className="h-1.5 flex-1 bg-ink/20" />
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wideLuxury font-mono">
              <span className="text-taupe">Select Proportion</span>
              <span className="text-taupe underline cursor-pointer">Size Guide</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  onClick={() => setSize(item)}
                  className={cx(
                    "border py-3 font-mono text-xs transition",
                    size === item
                      ? "border-ink bg-ink text-ivory font-bold shadow-sm"
                      : "border-ink/20 hover:border-ink text-ink"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Bag and Wishlist Actions */}
          <div className="mt-8 grid grid-cols-[1fr_auto] items-center gap-3">
            <button
              onClick={handleAdd}
              className={cx(
                "flex items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-[0.2em] font-medium transition duration-300",
                added ? "bg-chartreuse text-ink" : "bg-ink text-ivory hover:bg-graphite"
              )}
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>Added to Object Bag</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-chartreuse" />
                  <span>Acquire Silhouette — {formatMoney(product.price)}</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className="flex h-12 w-12 items-center justify-center border border-ink/20 text-ink transition hover:border-ink hover:text-chartreuse"
              aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                size={20}
                fill={wishlist.includes(product.id) ? "currentColor" : "none"}
                className={wishlist.includes(product.id) ? "text-chartreuse fill-chartreuse" : ""}
              />
            </button>
          </div>

          {/* Accordion Monograph Details */}
          <div className="mt-10 space-y-4 border-t border-ink/15 pt-8">
            <Detail title="Atelier Story" content={product.story} />
            <Detail title="Materials & Grammage" content={product.materials.join(", ")} />
            <Detail title="Color & Treatment" content={product.colors.join(", ")} />
            <Detail title="Complimentary Courier" content="Shipped internationally via tracked express delivery in signature Maison Makeeva dust-protective garment bags." />
          </div>
        </aside>
      </section>

      {/* Related Silhouettes Rail */}
      <SalonExhibition
        title="Curator's Pairing"
        eyebrow="Complete the Uniform"
        description="Suggested garments styled to balance proportions and cultural presence."
        items={related}
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={onCuratorInspect}
      />
    </>
  );
}

function Detail({ title, content }: { title: string; content: string }) {
  return (
    <div className="border-b border-ink/10 pb-4">
      <p className="font-mono text-[10px] uppercase tracking-wideLuxury text-taupe">{title}</p>
      <p className="mt-1.5 font-editorial text-sm leading-relaxed text-graphite/85">{content}</p>
    </div>
  );
}

function LookbookPage({
  go,
  addToCart,
  onCuratorInspect,
}: {
  go: (page: Page, product?: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  return (
    <PageShell eyebrow="Campaign Lookbook" title="SS26 Runway Monograph">
      <RunwayLookbook
        onSelectProduct={(p) => go("product", p)}
        onAddToCart={addToCart}
        onOpenCurator={onCuratorInspect}
      />

      {/* Campaign Studies Archives */}
      <div className="mt-20 space-y-20 border-t border-ink/15 pt-20">
        {collections.map((collection, index) => (
          <motion.article
            key={collection.handle}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={cx("grid items-center gap-10 lg:grid-cols-2", index % 2 === 1 && "lg:[&>*:first-child]:order-2")}
          >
            <div className="overflow-hidden border border-ink/15 bg-graphite shadow-xl">
              <img
                src={collection.image}
                alt={collection.title}
                className="h-[75vh] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="pb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-chartreuse bg-ink px-3 py-1">
                {collection.season}
              </span>
              <h2 className="mt-5 font-display text-3xl uppercase leading-none sm:text-5xl">
                {collection.title}
              </h2>
              <p className="mt-6 max-w-xl font-editorial text-lg leading-relaxed text-graphite/80 italic">
                "{collection.description}"
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {collection.categories.map((c) => (
                  <span key={c} className="border border-ink/20 px-2.5 py-1 font-mono text-[10px] text-taupe">
                    {c}
                  </span>
                ))}
              </div>
              <button
                onClick={() => go("collection")}
                className="mt-8 flex items-center gap-3 border-b border-ink pb-1 font-mono text-xs uppercase tracking-[0.2em] font-semibold transition hover:text-taupe"
              >
                <span>Shop This Campaign</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </PageShell>
  );
}

function AboutPage({ go }: { go: (page: Page) => void }) {
  return (
    <PageShell eyebrow="About The House" title="Cultural memory, tailored defiance.">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden border border-ink/15 bg-graphite shadow-2xl">
          <img
            src="https://www.maisonmakeeva.com/cdn/shop/files/D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833"
            alt="Maison Makeeva craft"
            className="h-[80vh] w-full object-cover"
          />
          <span className="absolute bottom-4 left-4 bg-ink/80 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ivory">
            FOUNDER ATELIER ARCHIVE
          </span>
        </div>

        <div className="grid content-center gap-8">
          {[
            [
              "Brand Story",
              "Maison Makeeva is an avant-garde ready-to-wear fashion house where uncompromising fit meets graphic cultural storytelling. Born between Paris ateliers and Accra creative energy.",
            ],
            [
              "Founder Vision",
              "Makeeva Anye’s creative direction is meticulous, identity-driven, and built around garments that hold sculptural presence on the runway and on the street.",
            ],
            [
              "Craftsmanship & Weight",
              "We prioritize heavy cotton densities (300 GSM), durable stonewashed denims, custom DTS discharge prints, and architectural contour seams made to last decades.",
            ],
            [
              "Philosophy",
              "Every garment is treated as an image: practical enough to wear every day, uncompromising enough to be remembered as art.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="border-t border-ink/15 pt-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">{title}</span>
              <p className="mt-3 font-display text-xl leading-relaxed sm:text-2xl text-ink">{body}</p>
            </div>
          ))}

          <div className="mt-4 pt-6 border-t border-ink/15 flex gap-4">
            <button
              onClick={() => go("collection")}
              className="bg-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ivory hover:bg-graphite transition"
            >
              Explore Collection
            </button>
            <button
              onClick={() => go("lookbook")}
              className="border border-ink px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ivory transition"
            >
              View Monograph
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell eyebrow="Client Services" title="Maison Makeeva Concierge">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="grid gap-4 bg-ivory p-6 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-taupe">Direct Enquiry</p>
          {["Name", "Email", "Order / Archive Code"].map((field) => (
            <input
              key={field}
              placeholder={field}
              className="border-b border-ink/30 bg-transparent py-4 font-mono text-xs outline-none placeholder:text-taupe focus:border-ink"
            />
          ))}
          <textarea
            placeholder="Enquiry Details"
            rows={5}
            className="border-b border-ink/30 bg-transparent py-4 font-mono text-xs outline-none placeholder:text-taupe focus:border-ink"
          />
          <button className="mt-4 bg-ink px-6 py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite">
            Dispatch Enquiry
          </button>
        </form>

        <div className="space-y-8">
          <Info
            title="Customer Support Concierge"
            lines={["Dedicated 24/7 client care", "maisonmakeeva@gmail.com", "WhatsApp concierge available for fitting advice"]}
          />
          <Info
            title="International Shipping"
            lines={["Express worldwide tracked courier dispatch", "3-5 business day order processing", "30-day archival exchange guarantee"]}
          />
          <Info
            title="Global Coordinates"
            lines={["Paris Atelier: 48.8566° N, 2.3522° E", "Accra Studio: 5.6037° N, 0.1870° W"]}
          />
        </div>
      </div>
    </PageShell>
  );
}

function SearchPage({ go }: { go: (page: Page, product?: Product) => void }) {
  const [query, setQuery] = useState("");
  const results = products.filter((product) =>
    `${product.title} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <PageShell eyebrow="Archive Search" title="Find a silhouette">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
        placeholder="Search Sets, Tracksuits, Jerseys, Denim, Bags..."
        className="w-full border-b-2 border-ink bg-transparent py-5 font-display text-2xl outline-none placeholder:text-taupe sm:text-4xl"
      />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(query ? results : products.slice(0, 4)).map((product) => (
          <button
            key={product.id}
            onClick={() => go("product", product)}
            className="text-left border border-ink/15 bg-bone p-3 group transition hover:shadow-lg"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-parchment">
              <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-taupe">{product.category}</p>
            <p className="mt-1 font-display text-sm uppercase">{product.title}</p>
            <p className="mt-1 font-mono text-xs font-semibold">{formatMoney(product.price)}</p>
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
  onCuratorInspect,
}: {
  products: Product[];
  go: (page: Page, product?: Product) => void;
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  return (
    <PageShell eyebrow="Saved Artifacts" title="Your Curated Selection">
      {wished.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wished.map((product, idx) => (
            <ProductCard3D
              key={product.id}
              product={product}
              index={idx}
              wished
              onSelect={(p) => go("product", p)}
              onWish={() => toggleWishlist(product)}
              onAdd={addToCart}
              onCuratorInspect={onCuratorInspect}
            />
          ))}
        </div>
      ) : (
        <EmptyState title="No saved pieces in your archive yet." action="Explore SS26 Collection" onClick={() => go("collection")} />
      )}
    </PageShell>
  );
}

function AccountPage() {
  return (
    <PageShell eyebrow="Client Portal" title="Maison Makeeva Account">
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="bg-ivory p-6 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Sign In</p>
          <input placeholder="Email" className="mt-8 w-full border-b border-ink/30 bg-transparent py-4 font-mono text-xs outline-none" />
          <input placeholder="Password" type="password" className="mt-4 w-full border-b border-ink/30 bg-transparent py-4 font-mono text-xs outline-none" />
          <button className="mt-8 w-full bg-ink px-6 py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite">
            Access Client Profile
          </button>
        </form>
        <div className="bg-parchment p-6 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Atelier Membership</p>
          <h2 className="mt-5 font-display text-2xl sm:text-3xl uppercase leading-tight">
            Create a Maison Makeeva client archive.
          </h2>
          <div className="mt-8 grid gap-3 font-mono text-xs">
            {["Historical Order Tracking", "Saved Fitting Proportions", "VIP Private Salon Access", "Archival Drops Invitation"].map((item) => (
              <p key={item} className="flex items-center gap-3 text-ink">
                <Check size={16} className="text-chartreuse" /> {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function CartPage({
  cart,
  setCart,
  go,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: Page, product?: Product) => void;
}) {
  return (
    <PageShell eyebrow="Current Bag" title="Your Curated Pieces">
      <CartContent cart={cart} setCart={setCart} go={go} />
    </PageShell>
  );
}

function CartContent({
  cart,
  setCart,
  go,
  compact = false,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: Page, product?: Product) => void;
  compact?: boolean;
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const update = (item: CartItem, qty: number) =>
    setCart((items) => (qty <= 0 ? items.filter((entry) => entry !== item) : items.map((entry) => (entry === item ? { ...entry, qty } : entry))));

  if (!cart.length)
    return <EmptyState title="Your bag is currently empty." action="Discover SS26 Silhouettes" onClick={() => go("collection")} />;

  return (
    <div className={cx("grid gap-10", compact ? "grid-cols-1 gap-8" : "lg:grid-cols-[1fr_420px]")}>
      <div className="space-y-5">
        {/* Items list */}
        {cart.map((item) => (
          <div
            key={`${item.product.id}-${item.size}`}
            className="grid grid-cols-[100px_1fr] gap-5 border border-ink/15 bg-bone p-4"
          >
            <img src={item.product.images[0]} alt={item.product.title} className="aspect-[3/4] w-full object-cover" />
            <div className="flex flex-col justify-between">
              <div>
                <p className="font-display text-sm uppercase">{item.product.title}</p>
                <p className="mt-1 font-mono text-[10px] text-taupe uppercase">
                  Proportion: {item.size} · {item.product.category}
                </p>
                <p className="mt-2 font-mono text-sm font-semibold">{formatMoney(item.product.price)}</p>
              </div>
              <div className="mt-4 flex w-fit items-center border border-ink/20 font-mono text-xs">
                <button onClick={() => update(item, item.qty - 1)} className="p-2.5 hover:bg-ink/10">
                  <Minus size={12} />
                </button>
                <span className="px-3">{item.qty}</span>
                <button onClick={() => update(item, item.qty + 1)} className="p-2.5 hover:bg-ink/10">
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit bg-ivory p-6 sm:p-8 border border-ink/15 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Order Summary</p>
        <div className="mt-6 space-y-4 font-mono text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-sm">{formatMoney(subtotal)}</span>
          </div>
          <input
            placeholder="Atelier Voucher Code"
            className="w-full border-b border-ink/30 bg-transparent py-3 font-mono text-xs outline-none placeholder:text-taupe"
          />
        </div>
        <button className="mt-8 w-full bg-ink px-6 py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite">
          Proceed with Shopify Checkout
        </button>
        <p className="mt-4 font-mono text-[10px] leading-relaxed text-taupe">
          Shopify Payments, tax calculations, and customs clearance are integrated directly for seamless checkout.
        </p>
      </aside>
    </div>
  );
}

function Newsletter() {
  return (
    <section className="bg-parchment px-5 py-20 sm:px-10 lg:px-16 border-t border-ink/15">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">
            Atelier Dispatch
          </span>
          <h2 className="mt-4 font-display text-2xl leading-tight sm:text-4xl uppercase">
            Private Salon & Archival Drops.
          </h2>
          <p className="mt-2 font-editorial text-sm text-graphite/80">
            Receive early access to limited edition pieces, runway monographs, and private studio presentations.
          </p>
        </div>
        <form className="flex border-b-2 border-ink">
          <input
            placeholder="Enter client email address"
            className="min-w-0 flex-1 bg-transparent py-4 font-mono text-xs outline-none placeholder:text-taupe"
          />
          <button className="px-6 font-mono text-xs uppercase tracking-wideLuxury font-semibold hover:text-taupe transition">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer({ go }: { go: (page: Page) => void }) {
  return (
    <footer className="bg-ink px-5 py-16 text-ivory sm:px-10 lg:px-16 border-t border-ivory/15">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl uppercase tracking-[0.16em]">Maison Makeeva</p>
          <p className="mt-4 max-w-md font-editorial text-sm leading-relaxed text-ivory/70">
            Ready-to-wear luxury fashion house exploring cultural identity, heavy fabrics, and sculptural street-couture silhouettes.
          </p>
          <div className="mt-6 flex gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-chartreuse">
            <span>PARIS</span> · <span>ACCRA</span> · <span>WORLDWIDE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          {pageLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => go(link.page)}
              className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-chartreuse transition"
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => go("wishlist")} className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-chartreuse transition">
            Wishlist
          </button>
          <button onClick={() => go("cart")} className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-chartreuse transition">
            Bag
          </button>
        </div>

        <div className="font-mono text-xs leading-relaxed text-ivory/65 space-y-2">
          <p className="hover:text-ivory cursor-pointer">Terms & Conditions</p>
          <p className="hover:text-ivory cursor-pointer">Privacy & Archival Policy</p>
          <p className="hover:text-ivory cursor-pointer">Courier & Returns Matrix</p>
          <p className="text-chartreuse">CURRENCY: EUR / USD / GBP</p>
        </div>
      </div>

      <div className="mt-14 pt-8 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-ivory/45 gap-4">
        <p>© 2026 Maison Makeeva. Uncompromising Craft. All rights reserved.</p>
        <p>Curated for contemporary art & runway collectors.</p>
      </div>
    </footer>
  );
}

function PolicyStrip() {
  return (
    <section className="grid border-y border-ink/10 bg-bone md:grid-cols-3">
      {policies.map((policy) => (
        <div key={policy} className="border-ink/10 p-6 text-center font-mono text-[11px] uppercase leading-relaxed tracking-wideLuxury md:border-r">
          {policy}
        </div>
      ))}
    </section>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -8%" }}
      transition={{ duration: 0.8, ease: easeOutExpo }}
    >
      {children}
    </motion.div>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="px-5 py-20 sm:px-10 lg:px-16 max-w-[1700px] mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl uppercase leading-none sm:text-4xl lg:text-5xl">{title}</h2>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>{children}</motion.div>
    </motion.section>
  );
}

function PageShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="min-h-screen px-5 pb-20 pt-32 sm:px-10 lg:px-16 max-w-[1700px] mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-12 max-w-5xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-taupe">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl uppercase leading-none sm:text-5xl lg:text-6xl">{title}</h1>
      </motion.div>
      {children}
    </section>
  );
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="border-t border-ink/15 pt-6">
      <p className="font-mono text-[10px] uppercase tracking-wideLuxury text-taupe">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-2 font-editorial text-sm leading-relaxed text-graphite/80">
          {line}
        </p>
      ))}
    </div>
  );
}

function EmptyState({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return (
    <div className="grid min-h-[40vh] place-items-center bg-ivory p-10 text-center border border-ink/15">
      <div>
        <h2 className="font-display text-2xl uppercase">{title}</h2>
        <button
          onClick={onClick}
          className="mt-6 inline-block border-b-2 border-ink pb-1 font-mono text-xs uppercase tracking-[0.2em] font-semibold hover:text-taupe transition"
        >
          {action} →
        </button>
      </div>
    </div>
  );
}

function MobileMenu({ open, onClose, go }: { open: boolean; onClose: () => void; go: (page: Page, product?: Product) => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="fixed inset-0 z-[110] overflow-y-auto bg-ink p-6 text-ivory"
        >
          <div className="flex items-center justify-between border-b border-ivory/15 pb-6">
            <p className="font-display text-lg uppercase tracking-[0.18em]">Maison Makeeva</p>
            <button onClick={onClose} aria-label="Close menu" className="p-1 text-ivory hover:text-chartreuse">
              <X size={24} />
            </button>
          </div>

          <div className="mt-8 space-y-8">
            {shopifyMenus.map((menu) => (
              <div key={menu.label} className="border-b border-ivory/10 pb-6">
                <button
                  onClick={() => {
                    onClose();
                    go(menu.page);
                  }}
                  className="text-left font-display text-2xl uppercase tracking-[0.12em] text-ivory hover:text-chartreuse transition"
                >
                  {menu.label}
                </button>
                <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                  {menu.columns.flatMap((column) => column.items).slice(0, 4).map((item) => (
                    <button
                      key={`${menu.label}-${item}`}
                      onClick={() => {
                        onClose();
                        go(menu.page);
                      }}
                      className="text-left text-[11px] uppercase tracking-wide text-stone hover:text-ivory"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-4 border-t border-ivory/15 pt-6 font-mono text-xs uppercase tracking-wideLuxury text-stone">
            <button onClick={() => { onClose(); go("search"); }} className="block text-left hover:text-ivory">Search</button>
            <button onClick={() => { onClose(); go("wishlist"); }} className="block text-left hover:text-ivory">Wishlist</button>
            <button onClick={() => { onClose(); go("cart"); }} className="block text-left hover:text-ivory">Bag</button>
            <button onClick={() => { onClose(); go("account"); }} className="block text-left hover:text-ivory">Account</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchOverlay({ open, onClose, go }: { open: boolean; onClose: () => void; go: (page: Page, product?: Product) => void }) {
  const [query, setQuery] = useState("");
  const results = products.filter(
    (product) => product.title.toLowerCase().includes(query.toLowerCase()) || product.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] bg-bone p-5 pt-20 sm:p-10 sm:pt-24 backdrop-blur-lg"
        >
          <button onClick={onClose} className="absolute right-6 top-6 p-2 text-ink hover:text-taupe" aria-label="Close search">
            <X size={24} />
          </button>
          <div className="mx-auto max-w-4xl">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Search by silhouette, material, or code..."
              className="w-full border-b-2 border-ink bg-transparent pb-4 font-display text-2xl outline-none sm:text-4xl"
            />
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wideLuxury text-taupe">
              <span className="mr-2">Popular Searches:</span>
              {["Tracksuit", "Denim", "Jersey", "Jumpsuit", "Duffle Bag", "Velvet"].map((trend) => (
                <button
                  key={trend}
                  onClick={() => setQuery(trend)}
                  className="border border-ink/20 px-2.5 py-1 hover:border-ink hover:text-ink"
                >
                  {trend}
                </button>
              ))}
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              {(query ? results : products.slice(0, 4)).map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onClose();
                    go("product", product);
                  }}
                  className="text-left border border-ink/10 bg-ivory p-3 group hover:shadow-lg transition"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-parchment">
                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <p className="mt-3 font-mono text-[9px] uppercase tracking-wider text-taupe">{product.category}</p>
                  <p className="mt-1 font-display text-xs uppercase leading-snug">{product.title}</p>
                  <p className="mt-1 font-mono text-xs font-semibold">{formatMoney(product.price)}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  go,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: Page, product?: Product) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] bg-ink/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-bone p-6 sm:p-8 border-l border-ink/15 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between border-b border-ink/15 pb-4">
              <div>
                <p className="font-display text-2xl uppercase">Object Bag</p>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-taupe">
                  Maison Makeeva SS26
                </span>
              </div>
              <button onClick={onClose} aria-label="Close cart" className="p-2 text-ink hover:text-taupe">
                <X size={20} />
              </button>
            </div>
            <CartContent
              compact
              cart={cart}
              setCart={setCart}
              go={(page, product) => {
                onClose();
                go(page, product);
              }}
            />
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
