import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CuratorModal } from "./components/CuratorModal";
import { GlobalAtelierScene3D } from "./components/HeroScene3D";
import { MagneticCursor } from "./components/MagneticCursor";
import { ProductCard3D } from "./components/ProductCard3D";
import { ResnBrandIntro } from "./components/ResnBrandIntro";
import { RunwayLookbook } from "./components/RunwayLookbook";
import { ScrollReveal, ScrollDriven3D, refreshScrollTriggers } from "./components/ScrollAnimations";
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
    label: "SS26 Monograph",
    page: "collection",
    hero: "Spring Summer SS26 Presentation",
    columns: [
      { title: "Silhouettes", items: ["All SS26 Works", "Bovinille 101 Set", "Orion202 Denim", "Ntoube 302 Velvet"] },
      { title: "Key Pieces", items: ["Monogram Jumpsuit", "R-F-A Jersey", "Esande Tee", "Agendia Duffle"] },
    ],
  },
  {
    label: "Sets & Tracksuits",
    page: "collection",
    hero: "Architectural two-piece uniforms",
    columns: [
      { title: "Fabrics", items: ["300 GSM Heavy Cotton", "Stonewashed Denim", "Velvet Contour", "Sports Fabric"] },
      { title: "Edits", items: ["Bleached Monolith", "Archival Sets", "Unisex Cuts", "Runway Uniforms"] },
    ],
  },
  {
    label: "Jerseys & Tops",
    page: "collection",
    hero: "Graphic street-luxury silhouettes",
    columns: [
      { title: "Styles", items: ["R-F-A Sports Jersey", "Roar-With-Fierce Set", "Esande Gallery Tee", "Wakamania Reality"] },
      { title: "Details", items: ["Sublimated Graphics", "Ribbed Collars", "Oversized Drape", "Breathable Mesh"] },
    ],
  },
  {
    label: "Denim & Outerwear",
    page: "collection",
    hero: "Stonewashed artisanal pieces",
    columns: [
      { title: "Denim Studio", items: ["Orion202 Denim Set", "Bleached Indigo", "Workwear Contour", "DTS Pattern Print"] },
      { title: "Craft", items: ["Artisanal Wash", "Custom Mill Weave", "Heavyweight Density", "Double Topstitch"] },
    ],
  },
  {
    label: "Bags & Carryalls",
    page: "collection",
    hero: "Campaign travel silhouettes",
    columns: [
      { title: "Collection", items: ["Agendia 007 Duffle", "Structured Shell", "Detachable Hardware", "Atelier Travel"] },
      { title: "Finishes", items: ["Noir Matte", "Engineered Straps", "Dust Protective Bags", "Courier Ready"] },
    ],
  },
  {
    label: "Lookbook",
    page: "lookbook",
    hero: "Maison Makeeva runway monograph",
    columns: [
      { title: "Campaign Studies", items: ["SS26 Paris Presentation", "SS24 Archive", "Athleisure Campaign", "Runway Looks"] },
      { title: "House Heritage", items: ["Cultural Artistry", "Atelier Paris", "Studio Accra", "Curator Monograph"] },
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
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const go = (next: Page, product?: Product, category?: string) => {
    if (product) setSelectedProduct(product);
    if (category) setActiveCategory(category);
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => refreshScrollTriggers(), 400);
    return () => window.clearTimeout(timer);
  }, [page, introVisible]);

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
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
    ),
    collection: (
      <CollectionPage
        go={go}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
        initialCategory={activeCategory}
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
    <div className="relative min-h-screen bg-bone text-ink selection:bg-chartreuse selection:text-ink cursor-default">
      {/* Global 3D Fabric Simulation, 3D Camera, Dynamic Lighting & Parallax Background */}
      <GlobalAtelierScene3D className="fixed inset-0 pointer-events-none z-[2]" />

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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="relative z-10 will-change-transform"
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
  go: (page: Page, product?: Product, category?: string) => void;
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
      <div className="border-b border-white/15 bg-black text-white">
        <div className="mx-auto flex h-8 sm:h-9 max-w-[1600px] items-center justify-between gap-2 px-3 font-mono text-xs uppercase tracking-[0.14em] sm:tracking-[0.22em] sm:px-8">
          <div className="flex items-center gap-2 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-chartreuse animate-pulse shrink-0" />
            <span className="truncate text-white/90 font-medium">MAISON MAKEEVA // SS26 ATELIER</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => go("collection")}
              className="font-mono text-xs uppercase tracking-[0.14em] sm:tracking-[0.2em] text-chartreuse hover:underline font-semibold"
            >
              Exhibition Catalog →
            </button>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <div className="border-b border-white/10 bg-black/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1600px] items-center justify-between px-3 sm:px-8 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <IconButton label="Search" onClick={onSearch}>
              <Search size={18} />
            </IconButton>
          </div>

          <button
            onClick={() => go("home")}
            className="flex flex-col items-center group text-center min-w-0"
          >
            <span className="font-display text-sm sm:text-2xl uppercase font-bold tracking-[0.08em] sm:tracking-[0.18em] transition-transform group-hover:scale-105 text-white truncate">
              Maison Makeeva
            </span>
          </button>

          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <IconButton label="Account" onClick={() => go("account")}>
              <User size={18} />
            </IconButton>

            <IconButton label={`Wishlist ${wishlistCount}`} onClick={() => go("wishlist")}>
              <Heart size={18} fill={wishlistCount > 0 ? "currentColor" : "none"} className={wishlistCount > 0 ? "text-chartreuse fill-chartreuse" : ""} />
            </IconButton>

            <button
              onClick={onCart}
              className="relative flex items-center gap-1.5 border border-white/30 px-2 sm:px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-white transition hover:border-chartreuse hover:text-chartreuse hover:bg-white/5"
              aria-label="Open cart bag"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-chartreuse px-1 text-[11px] sm:text-xs font-bold text-ink">
                {cartCount}
              </span>
            </button>

            <button className="lg:hidden p-1.5 text-white hover:text-chartreuse" onClick={onMenu} aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Curated Mega-Menu Links */}
      <div className="hidden lg:block border-b border-white/15 bg-black text-white">
        <div className="mx-auto flex h-11 max-w-[1600px] items-center justify-center gap-9 px-4 font-mono text-xs uppercase tracking-[0.22em]">
          {shopifyMenus.map((menu) => (
            <button
              key={menu.label}
              onMouseEnter={() => setMega(menu.label)}
              onClick={() => go(menu.page)}
              className="transition hover:text-chartreuse hover:underline underline-offset-8 text-white/90 font-medium"
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="hidden border-t border-white/20 bg-black px-10 py-10 lg:block shadow-2xl"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[1fr_1.2fr] gap-12">
              <div>
                <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-wideLuxury text-chartreuse">
                  {mega} Collection Study
                </p>
                <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                  {shopifyMenuMap[mega].columns.flatMap((column) => column.items).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setMega(null);
                        go("collection", undefined, item.includes("Set") ? "Sets" : item.includes("Jersey") ? "Shirts & T-shirts" : item.includes("Duffle") ? "Bags & Wallets" : "All");
                      }}
                      className="text-left font-display text-base text-white/90 transition-colors duration-150 hover:text-chartreuse hover:translate-x-1"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {shopifyMenuMap[mega].columns.map((column) => (
                  <div key={column.title}>
                    <p className="mb-4 font-mono text-xs uppercase tracking-wideLuxury text-white/60 font-medium">
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
                          className="block text-left font-sans text-sm text-white/85 transition-colors duration-150 hover:text-chartreuse"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="border border-ivory/20 bg-parchment p-6 text-ink flex flex-col justify-between shadow-xl">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-taupe font-semibold">Atelier Spotlight</span>
                    <h4 className="mt-2 font-display text-xl uppercase font-bold leading-tight text-ink">{shopifyMenuMap[mega].hero}</h4>
                    <p className="mt-2 font-sans text-xs text-graphite/90">Crafted with cultural memory and tactile density.</p>
                  </div>
                  <button
                    onClick={() => {
                      setMega(null);
                      go(shopifyMenuMap[mega].page);
                    }}
                    className="mt-6 flex items-center justify-between border-t border-ink/20 pt-3 font-mono text-xs uppercase tracking-[0.18em] font-semibold transition hover:text-chartreuse text-ink"
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
      className="p-1.5 sm:p-2 text-white/80 transition hover:text-white hover:scale-105 active:scale-95 flex items-center justify-center"
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
    "SS26 ATELIER EXHIBITION",
    "300 GSM HEAVYWEIGHT COTTON",
    "STONEWASHED DENIM",
    "CULTURAL ARTISTRY",
    "PARIS · ACCRA · GLOBAL ATELIER",
    "VELVET ARCHIVES",
    "UNCOMPROMISING SILHOUETTES",
    "HIGH DEFINITION DTS EMBROIDERY",
  ];

  return (
    <div className="relative z-10 overflow-hidden border-y border-ivory/15 bg-ink py-3 text-ivory select-none">
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
  go: (page: Page, product?: Product, category?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
  activeCategory?: string;
  setActiveCategory?: (cat: string) => void;
}) {
  return (
    <>
      {/* 1. Cinematic 3D Hero with Liquid-like Motion */}
      <SignatureHero go={go} />

      {/* 2. Kinetic Ticker Ribbon */}
      <KineticTicker />

      {/* Curated Campaign Collections */}
      <div id="featured-collections">
        <ScrollDriven3D depth={40}>
          <ScrollReveal variant="fadeUp">
            <FeaturedCollections go={go} />
          </ScrollReveal>
        </ScrollDriven3D>
      </div>

      {/* Curated SS26 Exhibition Grid */}
      <div id="atelier-exhibition">
        <ScrollDriven3D depth={50}>
          <ScrollReveal variant="fadeUp">
            <AtelierExhibition
              title="New Arrivals SS26"
              eyebrow="Curated Atelier Exhibition"
              description="Silhouettes cut from 300 GSM cotton, stonewashed denim, and rich velvet."
              items={products.slice(0, 6)}
              go={go}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              onCuratorInspect={onCuratorInspect}
            />
          </ScrollReveal>
        </ScrollDriven3D>
      </div>

      {/* Interactive Runway Lookbook */}
      <ScrollDriven3D depth={45}>
        <ScrollReveal variant="fadeUp">
          <RunwayLookbook
            onSelectProduct={(p) => go("product", p)}
            onAddToCart={addToCart}
            onOpenCurator={onCuratorInspect}
          />
        </ScrollReveal>
      </ScrollDriven3D>

      {/* Minimal Dispatch Newsletter */}
      <Newsletter go={go} />

      {/* Discreet Policy Strip */}
      <PolicyStrip />
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
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-6 text-ivory">
              <span className="font-mono text-xs uppercase tracking-wideLuxury text-chartreuse font-semibold">
                {collection.season}
              </span>
              <h3 className="mt-1 font-display text-xl uppercase leading-tight tracking-[-0.02em] text-white">
                {collection.title}
              </h3>
              <p className="mt-2 line-clamp-2 font-editorial text-sm sm:text-base text-ivory/95 leading-normal">
                {collection.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-white group-hover:text-chartreuse group-hover:underline transition-colors">
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

function AtelierExhibition({
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
  const [viewMode, setViewMode] = useState<"atelier" | "grid" | "runway">("atelier");

  return (
    <Section eyebrow={eyebrow} title={title}>
      {/* Top Controller: View Switcher */}
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-ink/15 pb-5 sm:flex-row sm:items-center">
        {description ? (
          <p className="max-w-2xl font-editorial text-lg sm:text-xl md:text-2xl text-graphite/90 italic font-medium leading-relaxed">{description}</p>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2 self-end">
          <span className="font-mono text-xs uppercase tracking-wider text-taupe mr-2 font-medium">
            Display Mode:
          </span>
          <button
            onClick={() => setViewMode("atelier")}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition",
              viewMode === "atelier"
                ? "border-chartreuse bg-chartreuse text-ink font-bold shadow-sm"
                : "border-ink/20 text-taupe hover:border-chartreuse hover:text-chartreuse"
            )}
            title="Asymmetric Atelier Exhibition"
          >
            <Columns size={12} />
            <span className="hidden sm:inline">Atelier</span>
          </button>

          <button
            onClick={() => setViewMode("runway")}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition",
              viewMode === "runway"
                ? "border-chartreuse bg-chartreuse text-ink font-bold shadow-sm"
                : "border-ink/20 text-taupe hover:border-chartreuse hover:text-chartreuse"
            )}
            title="Horizontal Runway Stream"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">Runway</span>
          </button>

          <button
            onClick={() => setViewMode("grid")}
            className={cx(
              "flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition",
              viewMode === "grid"
                ? "border-chartreuse bg-chartreuse text-ink font-bold shadow-sm"
                : "border-ink/20 text-taupe hover:border-chartreuse hover:text-chartreuse"
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
      ) : viewMode === "atelier" ? (
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
              viewMode="atelier"
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

function CollectionPage({
  go,
  wishlist,
  toggleWishlist,
  addToCart,
  onCuratorInspect,
  initialCategory,
}: {
  go: (page: Page, product?: Product, category?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory || "All");
  const [sort, setSort] = useState("Featured");
  const [viewMode, setViewMode] = useState<"atelier" | "grid" | "runway">("atelier");

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      c[p.category] = (c[p.category] || 0) + 1;
    });
    return c;
  }, []);

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
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse font-semibold">
          {filtered.length} / {products.length} works catalogued
        </p>
      </div>

      {/* Filter and View Controls */}
      <div className="mb-10 grid gap-6 border-b border-ink/15 pb-6 lg:grid-cols-[1fr_auto] items-center">
        {/* Category Pills: Horizontal swipeable rail on mobile, wrapping on desktop */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={cx(
                "inline-flex items-center gap-2 border px-3.5 py-2 font-mono text-xs uppercase tracking-wideLuxury transition shrink-0 whitespace-nowrap min-h-[38px]",
                category === item
                  ? "border-chartreuse bg-ink text-chartreuse font-bold shadow-sm ring-1 ring-chartreuse"
                  : "border-ink/20 text-graphite hover:border-chartreuse hover:text-chartreuse bg-white/40"
              )}
            >
              <span>{item}</span>
              <span
                className={cx(
                  "rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold",
                  category === item ? "bg-chartreuse text-ink font-bold" : "bg-ink/10 text-taupe"
                )}
              >
                {counts[item] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* View Mode & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-1 border border-ink/20 p-1">
            <button
              onClick={() => setViewMode("atelier")}
              className={cx("p-1.5 transition", viewMode === "atelier" ? "bg-ink text-chartreuse font-bold border border-chartreuse" : "text-taupe hover:text-ink")}
              title="Atelier mode"
              aria-label="Atelier mode"
            >
              <Columns size={14} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cx("p-1.5 transition", viewMode === "grid" ? "bg-ink text-chartreuse font-bold border border-chartreuse" : "text-taupe hover:text-ink")}
              title="Grid mode"
              aria-label="Grid mode"
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
              aria-label="Sort products"
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
          "grid gap-x-3 sm:gap-x-4 gap-y-8 sm:gap-y-10",
          viewMode === "atelier"
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
  go: (page: Page, product?: Product, category?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product, size?: string) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  const [size, setSize] = useState(product.sizes[0] || "M");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 45) {
      setActiveImage((prev) => (prev + 1) % product.images.length);
    } else if (diff < -45) {
      setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

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
      <section className="product-detail-shell grid min-h-screen bg-ivory pt-20 sm:pt-28 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Gallery Left */}
        <div className="product-detail-gallery bg-ink p-2 sm:p-6">
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
                <span className="absolute bottom-3 left-3 bg-ink/80 px-2.5 py-1 font-mono text-xs uppercase tracking-[0.16em] text-ivory font-semibold">
                  ANGLE 0{idx + 1}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel with Touch Swipe and Pagination */}
          <div
            className="product-carousel relative overflow-hidden md:hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={product.images[activeImage] || product.images[0]}
              alt={product.title}
              className="product-detail-image h-full w-full object-cover"
            />

            {/* Angle Indicator Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-ink/80 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-ivory backdrop-blur-md font-semibold">
              <span>ANGLE 0{activeImage + 1}</span>
              <span className="text-white/40">/</span>
              <span className="text-chartreuse font-medium">0{product.images.length}</span>
            </div>

            {/* Pagination dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-ink/80 px-2.5 py-1.5 rounded-full backdrop-blur-md">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={cx(
                      "h-1.5 rounded-full transition-all",
                      activeImage === i ? "w-4 bg-chartreuse" : "w-1.5 bg-white/40"
                    )}
                    aria-label={`View angle ${i + 1}`}
                  />
                ))}
              </div>
            )}

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
        <aside className="product-detail-info sticky top-20 h-fit px-4 py-8 sm:px-10 lg:px-14 bg-bone border-l border-ink/10 pb-36 md:pb-10">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-taupe font-medium">
            <button onClick={() => go("home")} className="hover:text-ink transition">Maison Makeeva</button>
            <span>/</span>
            <button onClick={() => go("collection", undefined, product.category)} className="hover:text-ink transition">{product.category}</button>
            <span>/</span>
            <span className="text-ink font-semibold truncate max-w-[180px]">{product.title}</span>
          </nav>

          <div className="flex items-center justify-between border-b border-ink/15 pb-4">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-taupe font-semibold">
              Object {products.findIndex((item) => item.id === product.id) + 1} // SS26
            </span>
            <button
              onClick={() => onCuratorInspect(product)}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-chartreuse bg-ink px-3 py-1.5 transition hover:bg-graphite border border-white/10 font-semibold"
            >
              <Eye size={14} className="text-chartreuse" />
              <span>Deep Specimen Inspect</span>
            </button>
          </div>

          <p className="mt-6 font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">
            {product.category} · {product.collection.toUpperCase()}
          </p>

          <h1 className="mt-2 font-display text-3xl uppercase leading-none sm:text-5xl">
            {product.title}
          </h1>

          <p className="mt-4 font-mono text-xl font-bold text-chartreuse">
            {formatMoney(product.price)}
          </p>

          <p className="mt-6 font-editorial text-lg sm:text-xl leading-relaxed text-graphite/90">
            {product.description}
          </p>

          {/* Silhouette Gauge */}
          <div className="mt-6 border-y border-ink/10 py-4 font-mono text-xs">
            <div className="flex justify-between text-taupe uppercase text-xs font-medium">
              <span>Silhouette Cut</span>
              <span className="text-chartreuse font-semibold">Oversized Editorial</span>
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
              <span className="text-chartreuse underline cursor-pointer font-medium">Size Guide</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  onClick={() => setSize(item)}
                  className={cx(
                    "border py-3 font-mono text-xs transition",
                    size === item
                      ? "border-chartreuse bg-ink text-chartreuse font-bold shadow-sm"
                      : "border-ink/20 hover:border-chartreuse hover:text-chartreuse text-ink bg-white/40"
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
                "flex items-center justify-center gap-2 py-4 font-mono text-xs uppercase tracking-[0.2em] font-semibold transition duration-300",
                added ? "bg-chartreuse text-ink border border-chartreuse font-bold shadow-md" : "bg-ink text-white hover:bg-chartreuse hover:text-ink"
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
              className={cx(
                "flex h-12 w-12 items-center justify-center border transition",
                wishlist.includes(product.id)
                  ? "border-chartreuse bg-ink text-chartreuse"
                  : "border-ink/20 text-ink hover:border-chartreuse hover:text-chartreuse hover:bg-ink/5"
              )}
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

      {/* Mobile Sticky Buy Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-ink/15 bg-bone/95 px-4 py-3 pb-[max(0.75rem,calc(0.75rem+env(safe-area-inset-bottom)))] backdrop-blur-md md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="min-w-0">
          <p className="font-display text-xs uppercase truncate font-bold">{product.title}</p>
          <div className="flex items-center gap-2 font-mono text-xs text-graphite">
            <span className="font-bold text-chartreuse">{formatMoney(product.price)}</span>
            <span>·</span>
            <span className="text-taupe">{size}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => toggleWishlist(product)}
            className={cx(
              "flex h-10 w-10 items-center justify-center border transition",
              wishlist.includes(product.id) ? "border-chartreuse bg-ink text-chartreuse" : "border-ink/20 text-ink"
            )}
            aria-label="Wishlist"
          >
            <Heart size={16} fill={wishlist.includes(product.id) ? "currentColor" : "none"} className={wishlist.includes(product.id) ? "text-chartreuse" : ""} />
          </button>
          <button
            onClick={handleAdd}
            className={cx(
              "flex items-center gap-1.5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold transition",
              added ? "bg-chartreuse text-ink font-bold" : "bg-ink text-white"
            )}
          >
            {added ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <span>Acquire</span>
            )}
          </button>
        </div>
      </div>

      {/* Related Silhouettes Rail */}
      <AtelierExhibition
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
      <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">{title}</p>
      <p className="mt-1.5 font-editorial text-base sm:text-lg leading-relaxed text-graphite/90">{content}</p>
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
      <div className="mt-12 sm:mt-20 space-y-12 sm:space-y-20 border-t border-ink/15 pt-12 sm:pt-20">
        {collections.map((collection, index) => (
          <motion.article
            key={collection.handle}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className={cx("grid items-center gap-6 sm:gap-10 lg:grid-cols-2", index % 2 === 1 && "lg:[&>*:first-child]:order-2")}
          >
            <div className="overflow-hidden border border-ink/15 bg-graphite shadow-xl">
              <img
                src={collection.image}
                alt={collection.title}
                className="h-[50vh] sm:h-[75vh] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            <div className="pb-4 sm:pb-8">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-white bg-ink px-3 py-1 font-semibold">
                {collection.season}
              </span>
              <h2 className="mt-4 sm:mt-5 font-display text-2xl sm:text-4xl lg:text-5xl uppercase leading-none">
                {collection.title}
              </h2>
              <p className="mt-4 sm:mt-6 max-w-xl font-editorial text-lg sm:text-xl md:text-2xl leading-relaxed text-graphite/90 italic">
                "{collection.description}"
              </p>
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                {collection.categories.map((c) => (
                  <span key={c} className="border border-ink/20 px-2.5 py-1 font-mono text-xs text-taupe font-medium">
                    {c}
                  </span>
                ))}
              </div>
              <button
                onClick={() => go("collection")}
                className="mt-6 sm:mt-8 flex items-center gap-3 border-b border-ink pb-1 font-mono text-xs uppercase tracking-[0.2em] font-semibold transition hover:text-taupe"
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
      <div className="grid gap-8 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden border border-ink/15 bg-graphite shadow-2xl">
          <img
            src="https://www.maisonmakeeva.com/cdn/shop/files/D59A9997_8517fa4c-8149-4287-9bae-edb77c7a48af_2048x.jpg?v=1763735833"
            alt="Maison Makeeva craft"
            className="h-[50vh] sm:h-[80vh] w-full object-cover"
          />
          <span className="absolute bottom-4 left-4 bg-ink/80 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-ivory font-semibold">
            FOUNDER ATELIER ARCHIVE
          </span>
        </div>

        <div className="grid content-center gap-6 sm:gap-8">
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
            <div key={title} className="border-t border-ink/15 pt-5 sm:pt-6">
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">{title}</span>
              <p className="mt-2 sm:mt-3 font-display text-lg sm:text-2xl leading-relaxed text-ink">{body}</p>
            </div>
          ))}

          <div className="mt-4 pt-6 border-t border-ink/15 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => go("collection")}
              className="bg-ink px-6 sm:px-8 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-[0.2em] text-ivory hover:bg-graphite transition text-center min-h-[44px]"
            >
              Explore Collection
            </button>
            <button
              onClick={() => go("lookbook")}
              className="border border-ink px-6 sm:px-8 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ivory transition text-center min-h-[44px]"
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
      <div className="grid gap-6 sm:gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="grid gap-4 bg-ivory p-4 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-taupe font-semibold">Direct Enquiry</p>
          {["Name", "Email", "Order / Archive Code"].map((field) => (
            <input
              key={field}
              placeholder={field}
              className="border-b border-ink/30 bg-transparent py-3 sm:py-4 font-mono text-xs outline-none placeholder:text-taupe focus:border-ink"
            />
          ))}
          <textarea
            placeholder="Enquiry Details"
            rows={4}
            className="border-b border-ink/30 bg-transparent py-3 sm:py-4 font-mono text-xs outline-none placeholder:text-taupe focus:border-ink"
          />
          <button className="mt-4 bg-ink px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite min-h-[44px]">
            Dispatch Enquiry
          </button>
        </form>

        <div className="space-y-6 sm:space-y-8">
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
        className="w-full border-b-2 border-ink bg-transparent py-4 sm:py-5 font-display text-xl sm:text-4xl outline-none placeholder:text-taupe focus:border-chartreuse transition"
      />
      <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {(query ? results : products.slice(0, 4)).map((product) => (
          <button
            key={product.id}
            onClick={() => go("product", product)}
            className="text-left border border-ink/15 bg-bone p-2.5 sm:p-3 group transition hover:shadow-lg"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-parchment">
              <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <p className="mt-2 sm:mt-3 font-mono text-xs uppercase tracking-wider text-taupe truncate font-medium">{product.category}</p>
            <p className="mt-1 font-display text-xs sm:text-sm uppercase truncate">{product.title}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <form className="bg-ivory p-4 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Sign In</p>
          <input placeholder="Email" className="mt-6 sm:mt-8 w-full border-b border-ink/30 bg-transparent py-3 sm:py-4 font-mono text-xs outline-none" />
          <input placeholder="Password" type="password" className="mt-4 w-full border-b border-ink/30 bg-transparent py-3 sm:py-4 font-mono text-xs outline-none" />
          <button className="mt-6 sm:mt-8 w-full bg-ink px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite min-h-[44px]">
            Access Client Profile
          </button>
        </form>
        <div className="bg-parchment p-4 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Atelier Membership</p>
          <h2 className="mt-4 sm:mt-5 font-display text-xl sm:text-3xl uppercase leading-tight">
            Create a Maison Makeeva client archive.
          </h2>
          <div className="mt-6 sm:mt-8 grid gap-3 font-mono text-xs">
            {["Historical Order Tracking", "Saved Fitting Proportions", "VIP Private Atelier Access", "Archival Drops Invitation"].map((item) => (
              <p key={item} className="flex items-center gap-3 text-ink">
                <Check size={16} className="text-ink shrink-0" /> {item}
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
            className="grid grid-cols-[72px_1fr] sm:grid-cols-[100px_1fr] gap-3 sm:gap-5 border border-ink/15 bg-bone p-3 sm:p-4"
          >
            <img src={item.product.images[0]} alt={item.product.title} className="aspect-[3/4] w-full object-cover" />
            <div className="flex flex-col justify-between">
              <div>
                <p className="font-display text-xs sm:text-sm uppercase leading-snug">{item.product.title}</p>
                <p className="mt-1 font-mono text-xs text-taupe uppercase truncate font-medium">
                  Proportion: {item.size} · {item.product.category}
                </p>
                <p className="mt-1.5 sm:mt-2 font-mono text-xs sm:text-sm font-semibold text-chartreuse">{formatMoney(item.product.price)}</p>
              </div>
              <div className="mt-3 sm:mt-4 flex w-fit items-center border border-ink/20 font-mono text-xs">
                <button onClick={() => update(item, item.qty - 1)} className="p-2 sm:p-2.5 hover:bg-ink/10" aria-label="Decrease quantity">
                  <Minus size={12} />
                </button>
                <span className="px-2.5 sm:px-3 text-xs">{item.qty}</span>
                <button onClick={() => update(item, item.qty + 1)} className="p-2 sm:p-2.5 hover:bg-ink/10" aria-label="Increase quantity">
                  <Plus size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit bg-ivory p-4 sm:p-8 border border-ink/15 shadow-sm">
        <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Order Summary</p>
        <div className="mt-4 sm:mt-6 space-y-4 font-mono text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-sm">{formatMoney(subtotal)}</span>
          </div>
        </div>
        <button className="mt-6 sm:mt-8 w-full bg-chartreuse px-4 sm:px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-wideLuxury text-ink font-bold transition hover:bg-white hover:text-ink shadow-sm min-h-[44px]">
          Proceed with Shopify Checkout
        </button>
        <p className="mt-3 sm:mt-4 font-mono text-xs leading-relaxed text-taupe">
          Shopify Payments, tax calculations, and customs clearance are integrated directly for seamless checkout.
        </p>
      </aside>
    </div>
  );
}

function Newsletter({ go }: { go?: (page: Page) => void }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  return (
    <section className="relative z-10 bg-parchment/90 backdrop-blur-sm px-4 py-14 sm:px-10 sm:py-20 lg:px-16 border-t border-ink/15">
      <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">
            Atelier Dispatch
          </span>
          <h2 className="mt-2 sm:mt-4 font-display text-xl leading-tight sm:text-4xl uppercase">
            Private Atelier & Archival Drops.
          </h2>
          <p className="mt-2 font-editorial text-sm sm:text-base text-graphite/90">
            Receive early access to limited edition pieces, runway monographs, and private studio presentations.
          </p>
        </div>
        <div>
          {subscribed ? (
            <div className="flex items-center gap-3 border-b-2 border-chartreuse py-3 sm:py-4 text-chartreuse font-mono text-xs uppercase tracking-wider">
              <Check size={16} />
              <span>Registered for Maison Makeeva private dispatches.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex border-b-2 border-ink focus-within:border-chartreuse transition">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter client email address"
                required
                type="email"
                className="min-w-0 flex-1 bg-transparent py-3 sm:py-4 font-mono text-xs outline-none placeholder:text-taupe"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 font-mono text-xs uppercase tracking-wideLuxury font-semibold text-chartreuse hover:text-ink transition shrink-0 min-h-[44px]"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer({ go }: { go: (page: Page) => void }) {
  return (
    <footer className="relative z-10 bg-ink px-4 py-12 text-ivory sm:px-10 sm:py-16 border-t border-ivory/15">
      <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl sm:text-2xl uppercase tracking-[0.16em]">Maison Makeeva</p>
          <p className="mt-3 sm:mt-4 max-w-md font-editorial text-sm sm:text-base leading-relaxed text-ivory/85">
            Ready-to-wear luxury fashion house exploring cultural identity, heavy fabrics, and sculptural street-couture silhouettes.
          </p>
          <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4 font-mono text-xs uppercase tracking-[0.16em] sm:tracking-[0.18em] text-chartreuse font-semibold">
            <span>PARIS</span> · <span>ACCRA</span> · <span>WORLDWIDE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 font-mono text-xs">
          {pageLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => go(link.page)}
              className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-chartreuse transition py-1"
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => go("wishlist")} className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-chartreuse transition py-1">
            Wishlist
          </button>
          <button onClick={() => go("cart")} className="text-left uppercase tracking-wideLuxury text-ivory/75 hover:text-chartreuse transition py-1">
            Bag
          </button>
        </div>

        <div className="font-mono text-xs leading-relaxed text-ivory/65 space-y-2 md:col-span-2 lg:col-span-1">
          <p className="hover:text-chartreuse cursor-pointer transition">Terms & Conditions</p>
          <p className="hover:text-chartreuse cursor-pointer transition">Privacy & Archival Policy</p>
          <p className="hover:text-chartreuse cursor-pointer transition">Courier & Returns Matrix</p>
          <p className="text-chartreuse font-semibold">CURRENCY: EUR / USD / GBP</p>
        </div>
      </div>

      <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between font-mono text-xs text-ivory/60 gap-3 text-center sm:text-left font-medium">
        <p>© 2026 Maison Makeeva. Uncompromising Craft. All rights reserved.</p>
        <p>Curated for contemporary art & runway collectors.</p>
      </div>
    </footer>
  );
}

function PolicyStrip() {
  return (
    <section className="relative z-10 grid border-y border-ink/10 bg-bone/90 backdrop-blur-sm sm:grid-cols-3">
      {policies.map((policy, idx) => (
        <div
          key={policy}
          className={cx(
            "border-ink/10 p-4 sm:p-6 text-center font-mono text-xs sm:text-sm uppercase leading-relaxed tracking-wideLuxury font-medium",
            idx < policies.length - 1 && "border-b sm:border-b-0 sm:border-r"
          )}
        >
          {policy}
        </div>
      ))}
    </section>
  );
}

function Reveal({ children }: { children: React.ReactNode }) {
  return <ScrollReveal variant="fadeUp">{children}</ScrollReveal>;
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="relative z-10 px-4 py-14 sm:px-10 sm:py-20 lg:px-16 max-w-[1700px] mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-6 sm:mb-10 flex flex-col justify-between gap-3 sm:gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">{eyebrow}</p>
          <h2 className="mt-2 sm:mt-3 font-display text-2xl uppercase leading-none sm:text-4xl lg:text-5xl">{title}</h2>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>{children}</motion.div>
    </motion.section>
  );
}

function PageShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="relative z-10 min-h-screen px-4 pb-16 pt-24 sm:px-10 sm:pb-20 sm:pt-32 lg:px-16 max-w-[1700px] mx-auto">
      <motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-8 sm:mb-12 max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">{eyebrow}</p>
        <h1 className="mt-2 sm:mt-3 font-display text-2xl xs:text-3xl uppercase leading-none sm:text-5xl lg:text-6xl break-words">{title}</h1>
      </motion.div>
      {children}
    </section>
  );
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="border-t border-ink/15 pt-6">
      <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">{title}</p>
      {lines.map((line) => (
        <p key={line} className="mt-2 font-editorial text-base sm:text-lg leading-relaxed text-graphite/90">
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
          className="mt-6 inline-block border-b-2 border-chartreuse text-ink pb-1 font-mono text-xs uppercase tracking-[0.2em] font-semibold hover:text-chartreuse transition"
        >
          {action} →
        </button>
      </div>
    </div>
  );
}

function MobileMenu({
  open,
  onClose,
  go,
}: {
  open: boolean;
  onClose: () => void;
  go: (page: Page, product?: Product, category?: string) => void;
}) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const categoryShortcuts = [
    { label: "Sets & Tracksuits", count: "4 pieces" },
    { label: "Denim & Outerwear", count: "3 pieces" },
    { label: "Jerseys & Tops", count: "2 pieces" },
    { label: "Bags & Carryalls", count: "1 piece" },
  ];

  const toggleExpand = (label: string) => {
    setExpandedMenu((prev) => (prev === label ? null : label));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.45, ease: easeOutExpo }}
          className="fixed inset-0 z-[110] overflow-y-auto bg-black p-4 sm:p-6 text-ivory flex flex-col justify-between pt-safe pb-safe"
        >
          <div>
            <div className="flex items-center justify-between border-b border-ivory/15 pb-4 sm:pb-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center border border-chartreuse font-mono text-xs font-bold text-chartreuse">
                  MM
                </span>
                <p className="font-display text-base sm:text-lg uppercase tracking-[0.16em]">Maison Makeeva</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 text-ivory hover:text-chartreuse transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={22} />
              </button>
            </div>

            {/* Direct Category Shortcuts for Mobile */}
            <div className="mt-5 border-b border-ivory/10 pb-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-ivory/60 mb-3 font-semibold">
                Shop By Category
              </p>
              <div className="grid grid-cols-2 gap-2">
                {categoryShortcuts.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => {
                      onClose();
                      go("collection", undefined, cat.label);
                    }}
                    className="border border-ivory/15 bg-white/[0.04] p-3 text-left hover:border-chartreuse hover:bg-white/[0.08] transition group min-h-[52px]"
                  >
                    <span className="font-mono text-xs uppercase tracking-wider text-ivory block leading-tight font-medium group-hover:text-chartreuse transition truncate">
                      {cat.label}
                    </span>
                    <span className="font-mono text-xs text-chartreuse mt-1 block font-medium">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Expandable Navigation Menus */}
            <div className="mt-5 space-y-3">
              {shopifyMenus.map((menu) => {
                const isExpanded = expandedMenu === menu.label;
                return (
                  <div key={menu.label} className="border-b border-ivory/10 pb-3">
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => {
                          onClose();
                          go(menu.page);
                        }}
                        className="text-left font-display text-xl sm:text-2xl uppercase tracking-[0.12em] text-ivory hover:text-chartreuse transition flex-1 py-1"
                      >
                        {menu.label}
                      </button>
                      <button
                        onClick={() => toggleExpand(menu.label)}
                        className="p-2 text-ivory/60 hover:text-chartreuse transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label={`Toggle ${menu.label} subcategories`}
                      >
                        <ChevronDown
                          size={18}
                          className={cx("transition-transform duration-200", isExpanded && "rotate-180 text-chartreuse")}
                        />
                      </button>
                    </div>

                    {/* Accordion Sub-Items */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden pl-3 pt-2 space-y-2 border-l border-chartreuse/40 mt-2"
                        >
                          {menu.columns.flatMap((col) => col.items).map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                onClose();
                                go(
                                  "collection",
                                  undefined,
                                  item.includes("Set")
                                    ? "Sets & Tracksuits"
                                    : item.includes("Jersey")
                                    ? "Jerseys & Tops"
                                    : item.includes("Duffle")
                                    ? "Bags & Carryalls"
                                    : "All"
                                );
                              }}
                              className="block text-left font-sans text-xs text-white/80 hover:text-chartreuse py-1.5 transition truncate w-full"
                            >
                              {item}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Utility Actions */}
          <div className="mt-8 border-t border-ivory/15 pt-5 font-mono text-xs uppercase tracking-wideLuxury text-stone grid grid-cols-2 gap-2">
            <button
              onClick={() => { onClose(); go("search"); }}
              className="flex items-center justify-center gap-2 p-3 border border-ivory/10 text-center hover:text-chartreuse hover:border-chartreuse transition min-h-[44px]"
            >
              <Search size={14} /> Search
            </button>
            <button
              onClick={() => { onClose(); go("wishlist"); }}
              className="flex items-center justify-center gap-2 p-3 border border-ivory/10 text-center hover:text-chartreuse hover:border-chartreuse transition min-h-[44px]"
            >
              <Heart size={14} /> Wishlist
            </button>
            <button
              onClick={() => { onClose(); go("cart"); }}
              className="flex items-center justify-center gap-2 p-3 border border-ivory/10 text-center hover:text-chartreuse hover:border-chartreuse transition min-h-[44px]"
            >
              <ShoppingBag size={14} /> Bag
            </button>
            <button
              onClick={() => { onClose(); go("account"); }}
              className="flex items-center justify-center gap-2 p-3 border border-ivory/10 text-center hover:text-chartreuse hover:border-chartreuse transition min-h-[44px]"
            >
              <User size={14} /> Account
            </button>
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
          className="fixed inset-0 z-[130] bg-bone p-4 pt-16 sm:p-10 sm:pt-24 backdrop-blur-lg overflow-y-auto pt-safe pb-safe"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 text-ink hover:text-chartreuse transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close search"
          >
            <X size={22} />
          </button>
          <div className="mx-auto max-w-4xl">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Search by silhouette, material, or code..."
              className="w-full border-b-2 border-ink bg-transparent pb-3 sm:pb-4 font-display text-xl sm:text-4xl outline-none focus:border-chartreuse transition"
            />
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wideLuxury text-taupe font-medium">
              <span className="mr-2 self-center font-semibold">Popular Searches:</span>
              {["Tracksuit", "Denim", "Jersey", "Jumpsuit", "Duffle Bag", "Velvet"].map((trend) => (
                <button
                  key={trend}
                  onClick={() => setQuery(trend)}
                  className="border border-ink/20 px-3 py-1 text-xs hover:border-chartreuse hover:text-chartreuse transition min-h-[32px]"
                >
                  {trend}
                </button>
              ))}
            </div>
            <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {(query ? results : products.slice(0, 4)).map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onClose();
                    go("product", product);
                  }}
                  className="text-left border border-ink/10 bg-ivory p-2.5 sm:p-3 group hover:border-chartreuse/60 hover:shadow-lg transition"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-parchment">
                    <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <p className="mt-2 sm:mt-3 font-mono text-xs uppercase tracking-wider text-taupe truncate font-medium">{product.category}</p>
                  <p className="mt-1 font-display text-xs uppercase leading-snug group-hover:text-chartreuse transition truncate">{product.title}</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-chartreuse">{formatMoney(product.price)}</p>
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
            className="ml-auto h-full w-full max-w-xl overflow-y-auto bg-bone p-4 sm:p-8 border-l border-ink/15 shadow-2xl pt-safe pb-safe"
          >
            <div className="mb-6 sm:mb-8 flex items-center justify-between border-b border-ink/15 pb-4">
              <div>
                <p className="font-display text-xl sm:text-2xl uppercase">Object Bag</p>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse font-semibold">
                  Maison Makeeva SS26
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="p-2 text-ink hover:text-chartreuse transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
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
