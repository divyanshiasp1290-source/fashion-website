import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns,
  Eye,
  Globe,
  Heart,
  LayoutGrid,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CuratorModal } from "./components/CuratorModal";
import { GlobalAtelierScene3D } from "./components/HeroScene3D";
import { ProductCard3D } from "./components/ProductCard3D";
import { ResnBrandIntro } from "./components/ResnBrandIntro";
import { RunwayLookbook } from "./components/RunwayLookbook";
import { ScrollReveal, ScrollDriven3D, refreshScrollTriggers } from "./components/ScrollAnimations";
import { SignatureHero } from "./components/SignatureHero";
import { collections as staticCollections, policies, products as staticProducts, categoryStructure, navGroups, archiveSections, type ArchiveSection, type Collection, type Product } from "./data/catalog";
import { cx, formatMoney, getPrimaryProduct } from "./utils";
import { AdminPanel } from "./components/admin/AdminPanel";
import { CheckoutModal } from "./components/CheckoutModal";
import { MaisonMakeevaLogo } from "./components/MaisonMakeevaLogo";
import { useAuth } from "./context/AuthContext";
import { api } from "./services/api";
import { mapDbCollectionToCatalogCollection, mapDbProductToCatalogProduct } from "./utils/catalogAdapter";
import type { DbCategory, DbOrder } from "./types/database";

type Page = "home" | "collection" | "product" | "lookbook" | "about" | "contact" | "search" | "wishlist" | "account" | "cart" | "admin";

type CartItem = {
  product: Product;
  size: string;
  qty: number;
};

const pageLinks: Array<{ page: Page; label: string }> = [
  { page: "home", label: "Home" },
  { page: "collection", label: "Collections" },
  { page: "lookbook", label: "Archives & Lookbook" },
  { page: "about", label: "About" },
  { page: "contact", label: "Contact" },
];

type ShopMenu = {
  label: string;
  page: Page;
  hero: string;
};

const shopifyMenus: ShopMenu[] = [
  {
    label: "New Arrivals",
    page: "collection",
    hero: "Spring Summer SS26 Monograph Drop",
  },
  {
    label: "Women",
    page: "collection",
    hero: "Sculptural Draping & Tailored Feminine Silhouettes",
  },
  {
    label: "Men",
    page: "collection",
    hero: "Heavy Cotton Cuts & Architectural Menswear",
  },
  {
    label: "Sets & Tracksuits",
    page: "collection",
    hero: "Architectural Two-Piece Co-ord Uniforms",
  },
  {
    label: "Archives",
    page: "lookbook",
    hero: "House Retrospective & Creative Monograph",
  },
];

const shopifyMenuMap = Object.fromEntries(shopifyMenus.map((menu) => [menu.label, menu])) as Record<string, ShopMenu>;

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0.85, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOutExpo } },
};

export default function App() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(staticProducts);
  const [siteCollections, setSiteCollections] = useState<Collection[]>(() => {
    return staticCollections.map((c) => ({
      ...c,
      status: "active" as const,
    }));
  });
  const [siteCategories, setSiteCategories] = useState<DbCategory[]>([]);
  const [introVisible, setIntroVisible] = useState(true);
  const [page, setPage] = useState<Page>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [curatorProduct, setCuratorProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(getPrimaryProduct(staticProducts));
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeSubCategory, setActiveSubCategory] = useState<string>("All");
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("mm_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("mm_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // URL / History Routing for /admin & Secret Shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path === "/admin" || hash === "#admin") {
        setPage("admin");
      }
    };
    handlePopState();
    window.addEventListener("popstate", handlePopState);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setPage("admin");
        window.history.pushState(null, "", "/admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem("mm_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Load dynamic catalog from Supabase / Mock adapter
  useEffect(() => {
    let isMounted = true;
    async function loadDynamicCatalog() {
      try {
        const [dbProds, dbCats, dbCols] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getCollections(),
        ]);
        if (isMounted) {
          if (dbCats && dbCats.length > 0) {
            setSiteCategories(dbCats);
          }
          if (dbProds && dbProds.length > 0) {
            const mapped = dbProds.map((db) => mapDbProductToCatalogProduct(db, dbCats, dbCols));
            setCatalogProducts(mapped);
            setSelectedProduct((prev) => mapped.find((m) => m.id === prev.id) || mapped[0] || prev);
          }
          if (dbCols && dbCols.length > 0) {
            const mappedCols = dbCols.map((c) => mapDbCollectionToCatalogCollection(c, dbProds || []));
            setSiteCollections(mappedCols);
          }
        }
      } catch (err) {
        console.warn("Dynamic catalog fetch fallback to static catalog:", err);
      }
    }
    loadDynamicCatalog();

    // Multi-tab and real-time synchronization
    const handleSync = () => {
      loadDynamicCatalog();
    };

    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("mm-catalog-sync", handleSync);

    const bc = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("mm-catalog-sync") : null;
    if (bc) {
      bc.onmessage = () => {
        handleSync();
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("mm-catalog-sync", handleSync);
      if (bc) {
        bc.close();
      }
    };
  }, [page]);

  // Public collections: filter out inactive collections (Requirement 5 & 6)
  const activeCollections = useMemo(() => {
    return siteCollections.filter((c) => c.status !== "inactive");
  }, [siteCollections]);

  // Public categories: filter out inactive categories
  const activeDbCategories = useMemo(() => {
    return siteCategories.filter((c) => c.status !== "inactive");
  }, [siteCategories]);

  // Active Main Categories (top-level, parent_id === null)
  const activeMainCategories = useMemo(() => {
    if (activeDbCategories.length === 0) return [];
    return activeDbCategories
      .filter((c) => !c.parent_id)
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [activeDbCategories]);

  // Dynamic Navigation Groups (mapping each main category name to array of subcategory names)
  const dynamicNavGroups = useMemo<Record<string, string[]>>(() => {
    const groups: Record<string, string[]> = { ...navGroups };

    if (activeDbCategories.length > 0) {
      activeMainCategories.forEach((mainCat) => {
        const dbSubs = activeDbCategories
          .filter((c) => c.parent_id === mainCat.id)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((c) => c.name);

        const staticSubs = groups[mainCat.name] || [];
        const combined = Array.from(new Set([...dbSubs, ...staticSubs]));
        groups[mainCat.name] = combined;
      });
    }
    return groups;
  }, [activeDbCategories, activeMainCategories]);

  // Dynamic Menus for Desktop Navbar & Mobile Navigation
  const dynamicShopifyMenus = useMemo<ShopMenu[]>(() => {
    if (activeMainCategories.length === 0) {
      return shopifyMenus;
    }

    return activeMainCategories.map((mainCat) => {
      const existing = shopifyMenuMap[mainCat.name];
      return {
        label: mainCat.name,
        page: mainCat.name === "Archives" ? "lookbook" : "collection",
        hero: mainCat.description || existing?.hero || `${mainCat.name} Atelier Collection`,
      };
    });
  }, [activeMainCategories]);

  const go = (next: Page, product?: Product, category?: string, subCategory?: string) => {
    if (product) setSelectedProduct(product);
    if (category !== undefined) setActiveCategory(category);
    if (subCategory !== undefined) setActiveSubCategory(subCategory);
    setPage(next);
    setMenuOpen(false);
    if (next === "admin") {
      window.history.pushState(null, "", "/admin");
    } else if (window.location.pathname === "/admin") {
      window.history.pushState(null, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => refreshScrollTriggers(), 400);
    return () => window.clearTimeout(timer);
  }, [page, introVisible]);

  const toggleWishlist = (product: Product) => {
    setWishlist((items) => {
      const next = items.includes(product.id) ? items.filter((id) => id !== product.id) : [...items, product.id];
      try {
        localStorage.setItem("mm_wishlist", JSON.stringify(next));
      } catch {}
      return next;
    });
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
  const wishedProducts = catalogProducts.filter((product) => wishlist.includes(product.id));

  // If viewing admin panel, render dedicated admin portal
  if (page === "admin") {
    return <AdminPanel onBackToStore={() => go("home")} />;
  }

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
        products={catalogProducts}
        collections={activeCollections}
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
        initialSubCategory={activeSubCategory}
        products={catalogProducts}
        categories={activeMainCategories}
        navGroups={dynamicNavGroups}
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
        products={catalogProducts}
      />
    ),
    lookbook: (
      <LookbookPage
        go={go}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
        activeSection={activeSubCategory}
        collections={activeCollections}
      />
    ),
    about: <AboutPage go={go} />,
    contact: <ContactPage />,
    search: <SearchPage go={go} products={catalogProducts} />,
    wishlist: (
      <WishlistPage
        products={wishedProducts}
        go={go}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        onCuratorInspect={(prod) => setCuratorProduct(prod)}
      />
    ),
    account: <AccountPage go={go} />,
    cart: <CartPage cart={cart} setCart={setCart} go={go} onCheckout={() => setCheckoutOpen(true)} />,
    admin: <AdminPanel onBackToStore={() => go("home")} />,
  }[page];

  return (
    <div className="relative min-h-screen bg-bone text-ink selection:bg-chartreuse selection:text-ink cursor-default overflow-x-hidden w-full max-w-full">
      {/* Global 3D Fabric Simulation, 3D Camera, Dynamic Lighting & Parallax Background */}
      <GlobalAtelierScene3D className="fixed inset-0 pointer-events-none z-[2]" />

      <Navigation
        page={page}
        go={go}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        onMenu={() => setMenuOpen(true)}
        onSearch={() => setSearchOpen(true)}
        onCart={() => go("cart")}
        menus={dynamicShopifyMenus}
        navGroups={dynamicNavGroups}
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
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        go={go}
        menus={dynamicShopifyMenus}
        navGroups={dynamicNavGroups}
        mainCategories={activeMainCategories}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} go={go} products={catalogProducts} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} go={go} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />

      {/* Curator Quick-View Specimen Modal */}
      <CuratorModal
        product={curatorProduct}
        onClose={() => setCuratorProduct(null)}
        onAddToCart={addToCart}
        isWishlisted={curatorProduct ? wishlist.includes(curatorProduct.id) : false}
        onToggleWishlist={toggleWishlist}
      />

      {/* Cashless Direct Atelier Order Placement Modal (Without Payment Gateway) */}
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        onOrderSuccess={() => {
          setCart([]);
          setCheckoutOpen(false);
        }}
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
  menus = shopifyMenus,
  navGroups: activeNavGroups = navGroups,
}: {
  page: Page;
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  cartCount: number;
  wishlistCount: number;
  onMenu: () => void;
  onSearch: () => void;
  onCart: () => void;
  menus?: ShopMenu[];
  navGroups?: Record<string, string[]>;
}) {
  const [mega, setMega] = useState<ShopMenu["label"] | null>(null);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Top Archival Runway Ticker Strip */}
      <div className="border-b border-white/15 bg-black text-white overflow-hidden">
        <div className="mx-auto flex h-7 sm:h-9 max-w-[1600px] items-center justify-between gap-2 px-2.5 sm:px-8 font-mono text-[10px] sm:text-xs uppercase tracking-[0.06em] sm:tracking-[0.22em]">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
            <span className="h-1.5 w-1.5 rounded-full bg-chartreuse animate-pulse shrink-0" />
            <span className="truncate text-white/90 font-medium">
              <span className="hidden sm:inline">MAISON MAKEEVA // </span>SS26 ATELIER
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => go("collection", undefined, "New Arrivals", "All")}
              className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.06em] sm:tracking-[0.2em] text-chartreuse hover:underline font-semibold whitespace-nowrap"
            >
              Exhibition Catalog →
            </button>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <div className="border-b border-white/10 bg-black/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1600px] items-center justify-between px-2.5 sm:px-8 gap-2">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <IconButton label="Search" onClick={onSearch}>
              <Search size={18} />
            </IconButton>
          </div>

          <button
            onClick={() => go("home")}
            className="flex items-center gap-1.5 sm:gap-3 group text-center shrink-0 min-w-0"
            aria-label="Maison Makeeva Home"
          >
            <MaisonMakeevaLogo className="h-5 w-5 sm:h-7 sm:w-7 shrink-0 text-white group-hover:text-chartreuse transition-colors" />
            <span className="font-display text-xs xs:text-sm sm:text-2xl uppercase font-bold tracking-[0.04em] sm:tracking-[0.18em] transition-transform group-hover:scale-[1.02] text-white whitespace-nowrap">
              Maison Makeeva
            </span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden lg:flex items-center gap-1 sm:gap-2">
              <IconButton label="Account" onClick={() => go("account")}>
                <User size={18} />
              </IconButton>

              <IconButton label={`Wishlist ${wishlistCount}`} onClick={() => go("wishlist")}>
                <Heart size={18} fill={wishlistCount > 0 ? "currentColor" : "none"} className={wishlistCount > 0 ? "text-chartreuse fill-chartreuse" : ""} />
              </IconButton>
            </div>

            <button
              onClick={onCart}
              className="relative flex items-center gap-1.5 border border-white/30 px-2 sm:px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-white transition hover:border-chartreuse hover:text-chartreuse hover:bg-white/5 shrink-0"
              aria-label="Open cart bag"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Bag</span>
              <span className="flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-chartreuse px-1 text-[10px] sm:text-xs font-bold text-ink">
                {cartCount}
              </span>
            </button>

            <button className="lg:hidden p-1.5 text-white hover:text-chartreuse shrink-0" onClick={onMenu} aria-label="Open menu">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Curated Mega-Menu Links */}
      <div className="hidden lg:block border-b border-white/15 bg-black text-white">
        <div className="mx-auto flex h-11 max-w-[1600px] items-center justify-center gap-9 px-4 font-mono text-xs uppercase tracking-[0.22em]">
          {menus.map((menu) => {
            const hasSubs = (activeNavGroups[menu.label]?.length ?? 0) > 0;
            return (
              <button
                key={menu.label}
                onMouseEnter={() => {
                  if (hasSubs) {
                    setMega(menu.label);
                  } else {
                    setMega(null);
                  }
                }}
                onClick={() => {
                  setMega(null);
                  if (menu.label === "Archives") {
                    go("lookbook", undefined, "Archives", "Lookbooks");
                  } else {
                    go(menu.page, undefined, menu.label, "All");
                  }
                }}
                className="transition hover:text-chartreuse hover:underline underline-offset-8 text-white/90 font-medium"
              >
                {menu.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {mega && (activeNavGroups[mega]?.length ?? 0) > 0 && (
          <motion.div
            onMouseLeave={() => setMega(null)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="hidden border-t border-white/20 bg-black px-10 py-10 lg:block shadow-2xl"
          >
            <div className="mx-auto grid max-w-[1400px] grid-cols-[1.4fr_1fr] gap-12">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-mono text-xs font-semibold uppercase tracking-wideLuxury text-chartreuse">
                    {mega} — Sub Categories ({activeNavGroups[mega].length})
                  </p>
                  <button
                    onClick={() => {
                      setMega(null);
                      if (mega === "Archives") {
                        go("lookbook", undefined, "Archives", "Lookbooks");
                      } else {
                        go("collection", undefined, mega, "All");
                      }
                    }}
                    className="font-mono text-xs uppercase tracking-wider text-white/60 hover:text-chartreuse transition flex items-center gap-1"
                  >
                    View All {mega} <ArrowRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {activeNavGroups[mega].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setMega(null);
                        if (mega === "Archives") {
                          go("lookbook", undefined, "Archives", item);
                        } else {
                          go("collection", undefined, mega, item);
                        }
                      }}
                      className="group flex items-center justify-between border-b border-white/10 pb-2.5 text-left transition-colors duration-150 hover:border-chartreuse"
                    >
                      <span className="font-display text-sm uppercase tracking-wide text-white/90 group-hover:text-chartreuse group-hover:translate-x-1 transition-transform">
                        {item}
                      </span>
                      <ArrowRight size={12} className="text-chartreuse opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-ivory/20 bg-parchment p-8 text-ink flex flex-col justify-between shadow-xl">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-taupe font-semibold">Atelier Spotlight</span>
                  <h4 className="mt-2 font-display text-2xl uppercase font-bold leading-tight text-ink">
                    {menus.find((m) => m.label === mega)?.hero || mega}
                  </h4>
                  <p className="mt-3 font-sans text-xs text-graphite/90 leading-relaxed">
                    Crafted with cultural memory, architectural drape, and tactile density. Explore our curated {mega.toLowerCase()} catalog.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setMega(null);
                    if (mega === "Archives") {
                      go("lookbook", undefined, "Archives", "Lookbooks");
                    } else {
                      go(menus.find((m) => m.label === mega)?.page || "collection", undefined, mega, "All");
                    }
                  }}
                  className="mt-6 flex items-center justify-between border-t border-ink/20 pt-3 font-mono text-xs uppercase tracking-[0.18em] font-semibold transition hover:text-chartreuse text-ink"
                >
                  <span>Explore {mega}</span>
                  <ArrowRight size={14} />
                </button>
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
  products = staticProducts,
  collections = [],
}: {
  go: (page: Page, product?: Product, category?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
  activeCategory?: string;
  setActiveCategory?: (cat: string) => void;
  products?: Product[];
  collections?: Collection[];
}) {
  // Dynamically curate items marked as New Arrival (by Admin toggle, badge, or tag)
  const newArrivalItems = useMemo(() => {
    const markedNew = products.filter(
      (p) =>
        p.new_arrival ||
        p.badge === "NEW ARRIVAL" ||
        p.tags.includes("NEW ARRIVAL") ||
        p.tags.includes("New Arrivals")
    );
    const markedIds = new Set(markedNew.map((p) => p.id));
    const backfill = products.filter((p) => !markedIds.has(p.id));
    return [...markedNew, ...backfill].slice(0, 6);
  }, [products]);

  // Dynamically curate items marked as Featured / Star-marked by Admin
  const featuredItems = useMemo(() => {
    // Strictly display only products star-marked / featured by the admin
    const starred = products.filter((p) => Boolean(p.featured));
    // Graceful fallback only if the store has zero starred items configured yet
    if (starred.length === 0) return products.slice(0, 4);
    return starred;
  }, [products]);

  return (
    <>
      {/* 1. Cinematic 3D Hero with Liquid-like Motion */}
      <SignatureHero go={go} />

      {/* 2. Kinetic Ticker Ribbon */}
      <KineticTicker />

      {/* Curated Campaign Collections */}
      <div id="featured-collections">
        <FeaturedCollections collections={collections} go={go} />
      </div>

      {/* Curated SS26 Exhibition Grid (New Arrivals) */}
      <div id="atelier-exhibition">
        <AtelierExhibition
          title="New Arrivals SS26"
          eyebrow="Curated Atelier Exhibition"
          description="Silhouettes cut from 300 GSM cotton, stonewashed denim, and rich velvet."
          items={newArrivalItems}
          go={go}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          onCuratorInspect={onCuratorInspect}
        />
      </div>

      {/* Featured Products Spotlight (Star-Marked Atelier Icons) */}
      <div id="featured-products">
        <AtelierExhibition
          title="Featured Atelier Icons"
          eyebrow="03 / Star-Marked Spotlight"
          description="Master silhouettes spotlighted by the Maison for standout proportion, collector codes, and material depth."
          items={featuredItems}
          go={go}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          onCuratorInspect={onCuratorInspect}
        />
      </div>

      {/* Interactive Runway Lookbook */}
      <div id="runway-lookbook">
        <RunwayLookbook
          onSelectProduct={(p) => go("product", p)}
          onAddToCart={addToCart}
          onOpenCurator={onCuratorInspect}
        />
      </div>

      {/* Minimal Dispatch Newsletter */}
      <Newsletter go={go} />

      {/* Discreet Policy Strip */}
      <PolicyStrip />
    </>
  );
}

function FeaturedCollections({ collections = [], go }: { collections?: Collection[]; go: (page: Page) => void }) {
  const displayCollections = collections.length > 0 ? collections : staticCollections;
  return (
    <Section eyebrow="01 / Curated Collections" title="A house wardrobe with campaign gravity.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayCollections.map((collection, index) => (
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
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
}) {
  // Balanced responsive grid that adapts cleanly to item count without empty ghost columns or tiny cards
  const gridLayoutClass = useMemo(() => {
    if (items.length === 1) return "grid grid-cols-1 max-w-md mx-auto";
    if (items.length === 2) return "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto";
    if (items.length === 3) return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6";
    return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6";
  }, [items.length]);

  return (
    <Section eyebrow={eyebrow} title={title}>
      {/* Editorial Header with subtle direct collection link */}
      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-3 border-b border-ink/15 pb-4 sm:flex-row sm:items-end">
        {description ? (
          <p className="max-w-2xl font-editorial text-lg sm:text-xl md:text-2xl text-graphite/90 italic font-medium leading-relaxed">{description}</p>
        ) : (
          <div />
        )}

        <button
          onClick={() => go("collection", undefined, eyebrow.includes("Star") ? "All" : "New Arrivals", "All")}
          className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-taupe hover:text-chartreuse transition font-semibold self-start sm:self-auto shrink-0 pb-1"
        >
          <span>Explore All Works</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1 text-chartreuse" />
        </button>
      </div>

      {/* Clean, Full-Width, Balanced Luxury Product Grid */}
      <div className={gridLayoutClass}>
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
  initialSubCategory,
  products = staticProducts,
  categories = [],
  navGroups: activeNavGroups = navGroups,
}: {
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
  initialCategory?: string;
  initialSubCategory?: string;
  products?: Product[];
  categories?: DbCategory[];
  navGroups?: Record<string, string[]>;
}) {
  const [mainCategory, setMainCategory] = useState(initialCategory || "All");
  const [subCategory, setSubCategory] = useState(initialSubCategory || "All");
  const [sort, setSort] = useState("Featured");
  const [viewMode, setViewMode] = useState<"atelier" | "grid" | "runway">("atelier");

  useEffect(() => {
    if (initialCategory) {
      setMainCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialSubCategory) {
      setSubCategory(initialSubCategory);
    }
  }, [initialSubCategory]);

  const mainCategories = useMemo(() => {
    if (categories && categories.length > 0) {
      return ["All", ...categories.map((c) => c.name)];
    }
    return ["All", "New Arrivals", "Women", "Men", "Sets & Tracksuits", "Archives"];
  }, [categories]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: products.length };
    c["New Arrivals"] = products.filter(
      (p) =>
        p.new_arrival ||
        p.badge === "NEW ARRIVAL" ||
        p.collection === "ss26" ||
        p.tags.includes("SS26") ||
        p.tags.includes("NEW ARRIVAL") ||
        p.tags.includes("New Arrivals") ||
        p.mainCategory === "New Arrivals"
    ).length;
    c["Women"] = products.filter((p) => {
      const isWomen = Array.isArray(p.mainCategory) ? p.mainCategory.includes("Women") : p.mainCategory === "Women";
      return isWomen || p.tags.includes("Women");
    }).length;
    c["Men"] = products.filter((p) => {
      const isMen = Array.isArray(p.mainCategory) ? p.mainCategory.includes("Men") : p.mainCategory === "Men";
      return isMen || p.tags.includes("Men") || p.tags.includes("Unisex");
    }).length;
    c["Sets & Tracksuits"] = products.filter((p) => {
      const isSets = Array.isArray(p.mainCategory) ? p.mainCategory.includes("Sets & Tracksuits") : p.mainCategory === "Sets & Tracksuits";
      return isSets || p.category === "Sets & Tracksuits" || p.tags.includes("Sets & Tracksuits");
    }).length;
    c["Archives"] = products.filter((p) => p.collection === "ss24" || p.collection === "athleisure-campaign" || p.tags.includes("Archives")).length;

    if (categories && categories.length > 0) {
      categories.forEach((cat) => {
        if (c[cat.name] === undefined) {
          c[cat.name] = products.filter((p) => {
            const isMatch = Array.isArray(p.mainCategory) ? p.mainCategory.includes(cat.name) : p.mainCategory === cat.name;
            return isMatch || p.category === cat.name || p.tags.includes(cat.name);
          }).length;
        }
      });
    }

    products.forEach((p) => {
      if (p.subCategory) {
        c[p.subCategory] = (c[p.subCategory] || 0) + 1;
      }
      if (p.category && !c[p.category]) {
        c[p.category] = (c[p.category] || 0) + 1;
      }
    });
    return c;
  }, [products, categories]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (mainCategory === "All") {
      // show all without mainCategory filter
    } else if (mainCategory === "New Arrivals") {
      list = list.filter(
        (p) =>
          p.new_arrival ||
          p.badge === "NEW ARRIVAL" ||
          p.collection === "ss26" ||
          p.tags.includes("SS26") ||
          p.tags.includes("NEW ARRIVAL") ||
          p.tags.includes("New Arrivals") ||
          p.mainCategory === "New Arrivals"
      );
    } else if (mainCategory === "Women") {
      list = list.filter((p) => {
        const isWomen = Array.isArray(p.mainCategory) ? p.mainCategory.includes("Women") : p.mainCategory === "Women";
        return isWomen || p.tags.includes("Women");
      });
    } else if (mainCategory === "Men") {
      list = list.filter((p) => {
        const isMen = Array.isArray(p.mainCategory) ? p.mainCategory.includes("Men") : p.mainCategory === "Men";
        return isMen || p.tags.includes("Men") || p.tags.includes("Unisex");
      });
    } else if (mainCategory === "Sets & Tracksuits") {
      list = list.filter((p) => {
        const isSets = Array.isArray(p.mainCategory) ? p.mainCategory.includes("Sets & Tracksuits") : p.mainCategory === "Sets & Tracksuits";
        return isSets || p.category === "Sets & Tracksuits" || p.tags.includes("Sets & Tracksuits");
      });
    } else if (mainCategory === "Archives") {
      list = list.filter((p) => p.collection === "ss24" || p.collection === "athleisure-campaign" || p.tags.includes("Archives"));
    } else {
      // Dynamic custom categories like "beach"
      list = list.filter((p) => {
        const isMatch = Array.isArray(p.mainCategory) ? p.mainCategory.includes(mainCategory) : p.mainCategory === mainCategory;
        return isMatch || p.category === mainCategory || p.tags.includes(mainCategory);
      });
    }

    if (subCategory && !subCategory.startsWith("All")) {
      list = list.filter((p) => {
        return (
          p.subCategory === subCategory ||
          p.category === subCategory ||
          p.tags.includes(subCategory)
        );
      });
    }

    if (sort === "Price, low to high") return list.sort((a, b) => a.price - b.price);
    if (sort === "Price, high to low") return list.sort((a, b) => b.price - a.price);
    if (sort === "Alphabetically, A-Z") return list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [mainCategory, subCategory, sort, products]);

  const activeSubcategories = activeNavGroups[mainCategory] || [];
  const currentArchiveSection = mainCategory === "Archives" && subCategory && archiveSections[subCategory] ? archiveSections[subCategory] : null;

  return (
    <PageShell eyebrow="Exhibition Catalog" title="Spring Summer SS26 Monograph">
      {/* Intro Quote */}
      <div className="collection-intro mb-8 grid gap-5 border-y border-ink/15 py-5 sm:grid-cols-[1fr_auto] sm:items-end bg-parchment/40 px-4">
        <p className="max-w-2xl font-editorial text-lg leading-snug text-graphite/90 sm:text-xl">
          Pieces made to hold the room. Explore the complete ready-to-wear archive filtered by category, silhouette, and proportion.
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse font-semibold">
          {filtered.length} / {products.length} works catalogued
        </p>
      </div>

      {/* Filter and View Controls */}
      <div className="mb-8 border-b border-ink/15 pb-6 space-y-4">
        {/* Tier 1: Main Category Selector */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wideLuxury text-taupe mb-2 font-semibold">
            Main Category
          </p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {mainCategories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMainCategory(item);
                  setSubCategory("All");
                }}
                className={cx(
                  "inline-flex items-center gap-1.5 sm:gap-2 border px-2.5 sm:px-3.5 py-1.5 sm:py-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider transition shrink-0 whitespace-nowrap min-h-[32px] sm:min-h-[36px]",
                  mainCategory === item
                    ? "border-chartreuse bg-ink text-chartreuse font-bold shadow-sm ring-1 ring-chartreuse"
                    : "border-ink/20 text-graphite hover:border-chartreuse hover:text-chartreuse bg-white/40"
                )}
              >
                <span>{item}</span>
                <span
                  className={cx(
                    "rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-mono font-semibold",
                    mainCategory === item ? "bg-chartreuse text-ink font-bold" : "bg-ink/10 text-taupe"
                  )}
                >
                  {counts[item] !== undefined ? counts[item] : 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tier 2: Sub Category Selector (if main category has subcategories) */}
        {activeSubcategories.length > 0 && (
          <div className="pt-3 border-t border-ink/10">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[11px] uppercase tracking-wideLuxury text-taupe font-semibold">
                {mainCategory} Sub Categories
              </p>
              {subCategory !== "All" && (
                <button
                  onClick={() => setSubCategory("All")}
                  className="font-mono text-[11px] text-chartreuse hover:underline uppercase tracking-wider font-semibold"
                >
                  Reset Filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {["All " + mainCategory, ...activeSubcategories].map((item) => {
                const isSelected = item === "All " + mainCategory ? subCategory === "All" : subCategory === item;
                const displayCount = item === "All " + mainCategory ? (counts[mainCategory] || 0) : (counts[item] !== undefined ? counts[item] : 0);

                return (
                  <button
                    key={item}
                    onClick={() => {
                      if (item === "All " + mainCategory) {
                        setSubCategory("All");
                      } else {
                        setSubCategory(item);
                      }
                    }}
                    className={cx(
                      "inline-flex items-center gap-1.5 sm:gap-2 border px-2 sm:px-3 py-1 sm:py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider transition shrink-0 whitespace-nowrap min-h-[28px] sm:min-h-[32px]",
                      isSelected
                        ? "border-chartreuse bg-chartreuse text-ink font-bold shadow-sm"
                        : "border-ink/15 text-graphite hover:border-ink hover:text-ink bg-white/60"
                    )}
                  >
                    <span>{item}</span>
                    {displayCount > 0 && (
                      <span
                        className={cx(
                          "rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono font-semibold",
                          isSelected ? "bg-ink text-chartreuse" : "bg-ink/10 text-taupe"
                        )}
                      >
                        {displayCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* View Mode & Sort Dropdown */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full pt-2 border-t border-ink/10">
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

      {/* Archival Record Spotlight Box */}
      {currentArchiveSection && (
        <div className="mb-8 border border-ink/20 bg-parchment p-6 sm:p-8 text-ink shadow-md">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-chartreuse bg-ink px-2.5 py-1 font-semibold">
                Archival Record · {currentArchiveSection.year}
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl uppercase font-bold text-ink">
                {currentArchiveSection.title}
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-wider text-taupe font-medium">
                {currentArchiveSection.subtitle}
              </p>
              <p className="mt-3 max-w-2xl font-editorial text-base sm:text-lg text-graphite/90 leading-relaxed italic">
                "{currentArchiveSection.quote}"
              </p>
              <p className="mt-3 max-w-2xl font-sans text-sm text-graphite leading-relaxed">
                {currentArchiveSection.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentArchiveSection.highlights.map((h) => (
                  <span key={h} className="border border-ink/20 bg-white/60 px-2.5 py-1 font-mono text-xs text-graphite font-medium">
                    {h}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => go("lookbook", undefined, "Archives", currentArchiveSection.title)}
              className="bg-ink px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ivory hover:bg-graphite transition shrink-0 self-start lg:self-center"
            >
              Open Full Monograph →
            </button>
          </div>
        </div>
      )}

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
  products = staticProducts,
}: {
  product: Product;
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  wishlist: string[];
  toggleWishlist: (product: Product) => void;
  addToCart: (product: Product, size?: string) => void;
  onCuratorInspect: (product: Product) => void;
  products?: Product[];
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
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-taupe font-medium flex-wrap">
            <button onClick={() => go("home")} className="hover:text-ink transition">Maison Makeeva</button>
            <span>/</span>
            {product.mainCategory && (
              <>
                <button
                  onClick={() => go("collection", undefined, Array.isArray(product.mainCategory) ? product.mainCategory[0] : product.mainCategory, "All")}
                  className="hover:text-ink transition"
                >
                  {Array.isArray(product.mainCategory) ? product.mainCategory[0] : product.mainCategory}
                </button>
                <span>/</span>
              </>
            )}
            {product.subCategory && (
              <>
                <button
                  onClick={() => {
                    const main = Array.isArray(product.mainCategory) ? product.mainCategory[0] : (product.mainCategory || "All");
                    go("collection", undefined, main, product.subCategory);
                  }}
                  className="hover:text-ink transition"
                >
                  {product.subCategory}
                </button>
                <span>/</span>
              </>
            )}
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
            {Array.isArray(product.mainCategory) ? product.mainCategory.join(" & ") : product.mainCategory}{product.subCategory ? ` · ${product.subCategory}` : ""} · {product.collection.toUpperCase()}
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
  activeSection,
  collections = [],
}: {
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  addToCart: (product: Product) => void;
  onCuratorInspect: (product: Product) => void;
  activeSection?: string;
  collections?: Collection[];
}) {
  const displayCollections = collections.length > 0 ? collections : staticCollections;
  const archiveTabs = ["All Archives", "History", "Lookbooks", "Creative Projects", "Diary", "Evolution"];
  const [currentTab, setCurrentTab] = useState(() => {
    if (activeSection && archiveTabs.includes(activeSection)) return activeSection;
    return "All Archives";
  });

  useEffect(() => {
    if (activeSection && archiveTabs.includes(activeSection)) {
      setCurrentTab(activeSection);
    }
  }, [activeSection]);

  const selectedArchive = currentTab !== "All Archives" && currentTab !== "Lookbooks" ? archiveSections[currentTab] : null;

  return (
    <PageShell eyebrow="House Archives & Lookbook" title="Maison Makeeva Archival Retrospective">
      {/* Archive Subcategory Tabs */}
      <div className="mb-10 border-b border-ink/15 pb-4">
        <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe mb-3 font-semibold">
          Archives Record Category
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {archiveTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={cx(
                "inline-flex items-center gap-1.5 sm:gap-2 border px-2.5 sm:px-4 py-1.5 sm:py-2 font-mono text-[11px] sm:text-xs uppercase tracking-wider transition shrink-0 whitespace-nowrap min-h-[32px] sm:min-h-[36px]",
                currentTab === tab
                  ? "border-chartreuse bg-ink text-chartreuse font-bold shadow-sm ring-1 ring-chartreuse"
                  : "border-ink/20 text-graphite hover:border-chartreuse hover:text-chartreuse bg-white/40"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Specific Archive Detail Section */}
      {selectedArchive && (
        <motion.div
          key={selectedArchive.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 border border-ink/20 bg-parchment p-6 sm:p-10 shadow-xl"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.24em] text-white bg-ink px-3 py-1 font-semibold">
                Archival Record // {selectedArchive.year}
              </span>
              <h2 className="mt-4 font-display text-3xl sm:text-5xl uppercase leading-none">
                {selectedArchive.title}
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-wider text-taupe font-semibold">
                {selectedArchive.subtitle}
              </p>
              <p className="mt-6 font-editorial text-xl sm:text-2xl leading-relaxed text-graphite/90 italic">
                "{selectedArchive.quote}"
              </p>
              <p className="mt-4 font-sans text-base leading-relaxed text-graphite">
                {selectedArchive.description}
              </p>
              <div className="mt-6 space-y-2 border-t border-ink/15 pt-5">
                <p className="font-mono text-xs uppercase tracking-wider text-taupe font-semibold">Archival Markers:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedArchive.highlights.map((item) => (
                    <span key={item} className="border border-ink/20 bg-white/70 px-3 py-1 font-mono text-xs text-graphite font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => go("collection", undefined, "Archives", selectedArchive.title)}
                  className="bg-ink px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-ivory hover:bg-graphite transition"
                >
                  View Archival Pieces in Catalog
                </button>
                <button
                  onClick={() => setCurrentTab("Lookbooks")}
                  className="border border-ink px-6 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-ink hover:bg-ink hover:text-ivory transition"
                >
                  Explore Seasonal Lookbooks
                </button>
              </div>
            </div>

            <div className="overflow-hidden border border-ink/20 bg-graphite shadow-2xl">
              <img
                src={selectedArchive.image}
                alt={selectedArchive.title}
                className="h-[45vh] sm:h-[65vh] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Seasonal Campaign Studies */}
      {(currentTab === "All Archives" || currentTab === "Lookbooks") && (
        <>
          {/* Campaign Studies Archives */}
          <div className="space-y-12 sm:space-y-20">
            <div className="mb-2">
              <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold">
                01 // Seasonal Campaign Studies
              </h3>
            </div>
            {displayCollections.map((collection, index) => (
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
                    onClick={() => go("collection", undefined, "Archives", "All")}
                    className="mt-6 sm:mt-8 flex items-center gap-3 border-b border-ink pb-1 font-mono text-xs uppercase tracking-[0.2em] font-semibold transition hover:text-taupe"
                  >
                    <span>Shop This Campaign</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {/* All Archives: Other Archive Records Matrix */}
          {currentTab === "All Archives" && (
            <div className="mt-16 sm:mt-24 border-t border-ink/15 pt-12 sm:pt-16">
              <h3 className="font-mono text-xs uppercase tracking-[0.24em] text-taupe font-semibold mb-6">
                02 // Historical & Atelier Chronicle Records
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(archiveSections)
                  .filter(([key]) => key !== "Lookbooks")
                  .map(([key, item]) => (
                    <div
                      key={key}
                      onClick={() => setCurrentTab(key)}
                      className="border border-ink/15 bg-parchment/60 p-5 cursor-pointer hover:border-chartreuse transition group flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-taupe font-semibold">
                          {item.year}
                        </span>
                        <h4 className="mt-2 font-display text-lg uppercase font-bold group-hover:text-chartreuse transition">
                          {item.title}
                        </h4>
                        <p className="mt-2 font-editorial text-xs text-graphite line-clamp-3">
                          {item.description}
                        </p>
                      </div>
                      <span className="mt-4 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-chartreuse font-semibold">
                        Read Record <ArrowRight size={12} />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
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
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", code: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name && !formData.email) return;
    setSending(true);
    try {
      await api.createContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.code,
        message: formData.message,
      });
    } catch (err) {
      console.warn("Contact dispatch fallback:", err);
    } finally {
      setSending(false);
      setSubmitted(true);
    }
  };

  return (
    <PageShell eyebrow="Client Services" title="Maison Makeeva Concierge">
      <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Direct Enquiry Form */}
        <div className="bg-ivory p-6 sm:p-10 border border-ink/15 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-taupe font-semibold mb-6">
            Direct Enquiry
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-10 text-center space-y-4"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chartreuse text-ink">
                <Check size={24} className="stroke-[3]" />
              </div>
              <h3 className="font-display text-2xl uppercase font-bold text-ink">
                Enquiry Dispatched
              </h3>
              <p className="font-editorial text-base text-graphite max-w-sm mx-auto leading-relaxed">
                Your message has been dispatched to our Paris atelier. Our client concierge will respond within 24 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", code: "", message: "" });
                }}
                className="mt-6 inline-block font-mono text-xs uppercase tracking-wider text-taupe hover:text-ink underline underline-offset-4"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-taupe mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                  className="w-full border-b border-ink/30 bg-transparent py-2.5 font-mono text-xs outline-none placeholder:text-taupe/60 focus:border-ink transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-taupe mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@domain.com"
                  className="w-full border-b border-ink/30 bg-transparent py-2.5 font-mono text-xs outline-none placeholder:text-taupe/60 focus:border-ink transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-taupe mb-1">
                  Order / Archive Code <span className="text-taupe/60">(Optional)</span>
                </label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. MM-SS26-09"
                  className="w-full border-b border-ink/30 bg-transparent py-2.5 font-mono text-xs outline-none placeholder:text-taupe/60 focus:border-ink transition"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-taupe mb-1">
                  Enquiry Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Inquire regarding bespoke sizing, orders, or appointments..."
                  className="w-full border-b border-ink/30 bg-transparent py-2.5 font-mono text-xs outline-none placeholder:text-taupe/60 focus:border-ink transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-4 bg-ink px-6 py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-chartreuse hover:text-ink font-semibold flex items-center justify-center gap-2"
              >
                <span>Dispatch Enquiry</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>

        {/* Contact Details Column */}
        <div className="space-y-6">
          {/* Paris Address */}
          <div className="border border-ink/15 bg-white/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider font-semibold mb-2 text-taupe">
              <MapPin size={16} className="text-chartreuse" />
              <span>Address</span>
            </div>
            <h3 className="font-display text-2xl uppercase tracking-wide text-ink font-bold">
              Paris
            </h3>
            <p className="mt-2 font-editorial text-lg sm:text-xl text-graphite leading-relaxed">
              29 rue tronchet 75008 paris France
            </p>
          </div>

          {/* Direct Communication */}
          <div className="border border-ink/15 bg-white/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 text-taupe font-mono text-xs uppercase tracking-wider font-semibold mb-1">
                <Mail size={15} className="text-chartreuse" />
                <span>Contact Email</span>
              </div>
              <a
                href="mailto:Maisonmakeeva@gmail.com"
                className="font-mono text-sm sm:text-base text-ink hover:text-chartreuse underline underline-offset-4 transition font-medium"
              >
                Maisonmakeeva@gmail.com
              </a>
            </div>

            <div className="pt-4 border-t border-ink/10">
              <div className="flex items-center gap-2 text-taupe font-mono text-xs uppercase tracking-wider font-semibold mb-1">
                <Phone size={15} className="text-chartreuse" />
                <span>Telephone</span>
              </div>
              <a
                href="tel:+33758955956"
                className="font-mono text-sm sm:text-base text-ink hover:text-chartreuse transition font-semibold"
              >
                +33 758 95 59 56
              </a>
            </div>
          </div>

          {/* Other Cities */}
          <div className="border border-ink/15 bg-white/70 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-taupe font-mono text-xs uppercase tracking-wider font-semibold mb-3">
              <Globe size={15} className="text-chartreuse" />
              <span>Other Cities</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="border border-ink/10 bg-ivory p-3.5 text-center">
                <p className="font-display text-sm uppercase font-bold text-ink">Manchester</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-taupe mt-0.5">UK</p>
              </div>
              <div className="border border-ink/10 bg-ivory p-3.5 text-center">
                <p className="font-display text-sm uppercase font-bold text-ink">Atlanta</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-taupe mt-0.5">USA</p>
              </div>
              <div className="border border-ink/10 bg-ivory p-3.5 text-center">
                <p className="font-display text-sm uppercase font-bold text-ink">Douala</p>
                <p className="font-mono text-[11px] uppercase tracking-wider text-taupe mt-0.5">Cameroon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function SearchPage({
  go,
  products = staticProducts,
}: {
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  products?: Product[];
}) {
  const [query, setQuery] = useState("");
  const results = products.filter((product: Product) => {
    const main = Array.isArray(product.mainCategory) ? product.mainCategory.join(" ") : (product.mainCategory || "");
    const sub = product.subCategory || "";
    return `${product.title} ${product.category} ${main} ${sub} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
  });
  return (
    <PageShell eyebrow="Archive Search" title="Find a silhouette">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoFocus
        placeholder="Search T-Shirts, Jackets, Hoodies, Sets, Archives..."
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
            <p className="mt-2 sm:mt-3 font-mono text-xs uppercase tracking-wider text-taupe truncate font-medium">{product.subCategory || product.category}</p>
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

function AccountPage({ go }: { go: (page: Page) => void }) {
  const { user, login, signUp, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [myOrders, setMyOrders] = useState<DbOrder[]>([]);

  useEffect(() => {
    if (user) {
      api.getOrders().then((all) => {
        const mine = all.filter(
          (o) => o.customer_id === user.id || o.customer_email.toLowerCase() === user.email.toLowerCase()
        );
        setMyOrders(mine);
      });
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (isRegister) {
        const res = await signUp(email, password, fullName);
        if (!res.success) setErrorMsg(res.error || "Registration failed. Please try again.");
      } else {
        const res = await login(email, password);
        if (!res.success) setErrorMsg(res.error || "Login failed. Please check your credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell eyebrow="Client Portal" title="Maison Makeeva Account">
      {user ? (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Client Profile Box */}
          <div className="bg-ivory p-6 sm:p-10 border border-ink/15 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-ink/10 pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Active Dossier</span>
                <h3 className="font-display text-2xl uppercase font-bold text-ink mt-1">
                  {user.full_name || user.email}
                </h3>
              </div>
              <span className="bg-chartreuse text-ink font-mono text-xs px-2.5 py-1 uppercase font-bold">
                Client
              </span>
            </div>

            <div className="font-mono text-xs space-y-2 text-graphite">
              <p><span className="text-taupe uppercase">Email:</span> {user.email}</p>
              <p><span className="text-taupe uppercase">Membership Status:</span> Active Atelier Member</p>
            </div>

            <button
              onClick={logout}
              className="w-full border border-ink/20 py-3 font-mono text-xs uppercase tracking-wider hover:bg-ink hover:text-ivory transition"
            >
              Sign Out of Client Archive
            </button>
          </div>

          {/* Historical Order Tracking */}
          <div className="bg-parchment p-6 sm:p-10 border border-ink/15 shadow-sm space-y-5">
            <div>
              <span className="font-mono text-xs uppercase tracking-wideLuxury text-taupe">Order Tracking</span>
              <h3 className="font-display text-xl uppercase font-bold text-ink mt-1">
                Your Atelier Orders ({myOrders.length})
              </h3>
            </div>

            {myOrders.length === 0 ? (
              <div className="p-6 border border-ink/10 bg-ivory text-center font-mono text-xs text-taupe">
                No orders registered under this client email yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {myOrders.map((ord) => (
                  <div key={ord.id} className="border border-ink/15 bg-ivory p-3.5 font-mono text-xs space-y-2.5">
                    <div className="flex items-center justify-between border-b border-ink/10 pb-2">
                      <div>
                        <p className="font-bold text-ink">{ord.order_number}</p>
                        <p className="text-[10px] text-taupe">{new Date(ord.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-chartreuse">{formatMoney(ord.total)}</p>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 border border-ink/20 font-semibold">
                          {ord.order_status}
                        </span>
                      </div>
                    </div>

                    {/* Client Order Items with Image and Details */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {ord.items.map((item, iIdx) => (
                          <div key={item.id || iIdx} className="flex items-center gap-2.5 bg-[#f5f4ef] p-1.5 border border-ink/10">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="h-10 w-8 object-cover border border-ink/10 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-8 bg-ink/5 border border-ink/10 flex items-center justify-center shrink-0 text-[10px] text-taupe font-bold">
                                MM
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-ink text-[11px] truncate">{item.product_name}</p>
                              <p className="text-[10px] text-taupe">
                                Size: <span className="text-graphite font-semibold">{item.size}</span>
                                {item.color && item.color !== "Default" && (
                                  <> · Color: <span className="text-graphite font-semibold">{item.color}</span></>
                                )}
                                {" "}· Qty: <span className="text-graphite font-semibold">{item.quantity}</span>
                                {" "}· <span className="text-graphite font-semibold">{formatMoney(item.price)}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <form onSubmit={handleAuth} className="bg-ivory p-4 sm:p-10 border border-ink/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">
                {isRegister ? "Client Registration" : "Sign In"}
              </p>
              <button
                type="button"
                onClick={() => { setIsRegister(!isRegister); setErrorMsg(null); }}
                className="font-mono text-xs text-chartreuse hover:underline uppercase"
              >
                {isRegister ? "Already registered? Sign In" : "New Client? Register"}
              </button>
            </div>

            {errorMsg && (
              <p className="p-2 border border-red-500/30 bg-red-50 text-red-600 font-mono text-xs">
                {errorMsg}
              </p>
            )}

            {isRegister && (
              <input
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-b border-ink/30 bg-transparent py-3 font-mono text-xs outline-none focus:border-ink"
              />
            )}

            <input
              required
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-ink/30 bg-transparent py-3 font-mono text-xs outline-none focus:border-ink"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-ink/30 bg-transparent py-3 font-mono text-xs outline-none focus:border-ink"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-wideLuxury text-ivory transition hover:bg-graphite min-h-[44px] font-semibold"
            >
              {loading ? "Processing..." : isRegister ? "Create Client Archive" : "Access Client Profile"}
            </button>
          </form>

          <div className="bg-parchment p-4 sm:p-10 border border-ink/15 shadow-sm">
            <p className="font-mono text-xs uppercase tracking-wideLuxury text-taupe font-semibold">Atelier Membership</p>
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
      )}
    </PageShell>
  );
}

function CartPage({
  cart,
  setCart,
  go,
  onCheckout,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: Page, product?: Product) => void;
  onCheckout?: () => void;
}) {
  return (
    <PageShell eyebrow="Current Bag" title="Your Curated Pieces">
      <CartContent cart={cart} setCart={setCart} go={go} onCheckout={onCheckout} />
    </PageShell>
  );
}

function CartContent({
  cart,
  setCart,
  go,
  compact = false,
  onCheckout,
}: {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: Page, product?: Product) => void;
  compact?: boolean;
  onCheckout?: () => void;
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
        <button
          onClick={onCheckout}
          className="mt-6 sm:mt-8 w-full bg-chartreuse px-4 sm:px-6 py-3.5 sm:py-4 font-mono text-xs uppercase tracking-wideLuxury text-ink font-bold transition hover:bg-white hover:text-ink shadow-sm min-h-[44px]"
        >
          Proceed to Atelier Order Placement
        </button>
        <p className="mt-3 sm:mt-4 font-mono text-xs leading-relaxed text-taupe">
          Direct atelier order registration. Invoicing or bespoke collection details are confirmed directly without online payment processing.
        </p>
      </aside>
    </div>
  );
}

function Newsletter({ go }: { go?: (page: Page) => void }) {
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const res = await api.subscribeNewsletter(email);
    setStatusMsg(res.message);
    setTimeout(() => {
      setEmail("");
      setStatusMsg(null);
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
          {statusMsg ? (
            <div className="flex items-center gap-3 border-b-2 border-chartreuse py-3 sm:py-4 text-chartreuse font-mono text-xs uppercase tracking-wider">
              <Check size={16} />
              <span>{statusMsg}</span>
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
          <div className="flex items-center gap-3 mb-3">
            <MaisonMakeevaLogo className="h-7 sm:h-8 w-auto text-chartreuse shrink-0" />
            <p className="font-display text-xl sm:text-2xl uppercase tracking-[0.16em]">Maison Makeeva</p>
          </div>
          <p className="mt-3 sm:mt-4 max-w-md font-editorial text-sm sm:text-base leading-relaxed text-ivory/85">
            Ready-to-wear luxury fashion house exploring cultural identity, heavy fabrics, and sculptural street-couture silhouettes.
          </p>
          <div className="mt-4 sm:mt-6 flex flex-wrap gap-3 sm:gap-4 font-mono text-xs uppercase tracking-[0.16em] sm:tracking-[0.18em] text-chartreuse font-semibold">
            <span>PARIS</span> · <span>MANCHESTER</span> · <span>ATLANTA</span> · <span>DOUALA</span>
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
      viewport={{ once: true, margin: "120px" }}
      variants={{ hidden: { opacity: 0.85 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
      className="relative z-10 px-4 py-8 sm:px-10 sm:py-14 lg:px-16 max-w-[1700px] mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-5 sm:mb-8 flex flex-col justify-between gap-3 sm:gap-4 md:flex-row md:items-end">
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
  menus = shopifyMenus,
  navGroups: activeNavGroups = navGroups,
  mainCategories = [],
}: {
  open: boolean;
  onClose: () => void;
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  menus?: ShopMenu[];
  navGroups?: Record<string, string[]>;
  mainCategories?: DbCategory[];
}) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const categoryShortcuts = useMemo(() => {
    if (mainCategories && mainCategories.length > 0) {
      return mainCategories.map((cat) => {
        const subsCount = activeNavGroups[cat.name]?.length ?? 0;
        return {
          label: cat.name,
          count: subsCount > 0 ? `${subsCount} Subcategories` : (cat.description || "Collection"),
        };
      });
    }
    return [
      { label: "New Arrivals", count: "SS26" },
      { label: "Women", count: "8 Subcategories" },
      { label: "Men", count: "7 Subcategories" },
      { label: "Sets & Tracksuits", count: "Collection" },
      { label: "Archives", count: "5 Records" },
    ];
  }, [mainCategories, activeNavGroups]);

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
              <div className="flex items-center gap-3">
                <MaisonMakeevaLogo className="h-7 w-auto text-chartreuse shrink-0" />
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
                      if (cat.label === "Archives") {
                        go("lookbook", undefined, "Archives", "Lookbooks");
                      } else {
                        go("collection", undefined, cat.label, "All");
                      }
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
              {menus.map((menu) => {
                const isExpanded = expandedMenu === menu.label;
                const subs = activeNavGroups[menu.label] || [];
                const hasSubs = subs.length > 0;

                return (
                  <div key={menu.label} className="border-b border-ivory/10 pb-3">
                    <div className="flex items-center justify-between w-full">
                      <button
                        onClick={() => {
                          onClose();
                          if (menu.label === "Archives") {
                            go("lookbook", undefined, "Archives", "Lookbooks");
                          } else {
                            go(menu.page, undefined, menu.label, "All");
                          }
                        }}
                        className="text-left font-display text-xl sm:text-2xl uppercase tracking-[0.12em] text-ivory hover:text-chartreuse transition flex-1 py-1"
                      >
                        {menu.label}
                      </button>
                      {hasSubs ? (
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
                      ) : (
                        <ArrowRight size={16} className="text-white/30 mr-2" />
                      )}
                    </div>

                    {/* Accordion Sub-Items */}
                    <AnimatePresence>
                      {isExpanded && hasSubs && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden pl-3 pt-2 space-y-1.5 border-l border-chartreuse/40 mt-2"
                        >
                          {subs.map((item) => (
                            <button
                              key={item}
                              onClick={() => {
                                onClose();
                                if (menu.label === "Archives") {
                                  go("lookbook", undefined, "Archives", item);
                                } else {
                                  go("collection", undefined, menu.label, item);
                                }
                              }}
                              className="block text-left font-sans text-sm text-white/80 hover:text-chartreuse py-1.5 transition truncate w-full"
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

function SearchOverlay({
  open,
  onClose,
  go,
  products = staticProducts,
}: {
  open: boolean;
  onClose: () => void;
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  products?: Product[];
}) {
  const [query, setQuery] = useState("");
  const results = products.filter((product: Product) => {
    const main = Array.isArray(product.mainCategory) ? product.mainCategory.join(" ") : (product.mainCategory || "");
    const sub = product.subCategory || "";
    return `${product.title} ${product.category} ${main} ${sub} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
  });

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
              placeholder="Search by category, silhouette, or material..."
              className="w-full border-b-2 border-ink bg-transparent pb-3 sm:pb-4 font-display text-xl sm:text-4xl outline-none focus:border-chartreuse transition"
            />
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wideLuxury text-taupe font-medium">
              <span className="mr-2 self-center font-semibold">Categories:</span>
              {["New Arrivals", "Women", "Men", "Sets & Tracksuits", "Archives", "T-Shirts", "Jackets", "Hoodies & Sweatshirts"].map((trend) => (
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
                  <p className="mt-2 sm:mt-3 font-mono text-xs uppercase tracking-wider text-taupe truncate font-medium">{product.subCategory || product.category}</p>
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
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  go: (page: Page, product?: Product, category?: string, subCategory?: string) => void;
  onCheckout?: () => void;
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
              onCheckout={onCheckout}
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
