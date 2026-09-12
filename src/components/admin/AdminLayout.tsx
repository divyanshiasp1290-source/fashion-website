import { AnimatePresence, motion } from "framer-motion";
import {
  Boxes,
  Eye,
  FolderTree,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { isSupabaseConfigured } from "../../lib/supabase";
import { MaisonMakeevaLogo } from "../MaisonMakeevaLogo";

export type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "collections"
  | "inventory"
  | "orders"
  | "customers"
  | "messages"
  | "newsletter";

type AdminLayoutProps = {
  activeSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onBackToStore: () => void;
  children: React.ReactNode;
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeSection,
  onSelectSection,
  onBackToStore,
  children,
}) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSupa = isSupabaseConfigured();

  const navItems: Array<{ id: AdminSection; label: string; icon: React.FC<{ size?: number; className?: string }> }> = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "categories", label: "Categories", icon: FolderTree },
    { id: "collections", label: "Collections", icon: Layers },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "messages", label: "Contact Inquiries", icon: Inbox },
    { id: "newsletter", label: "Newsletter", icon: Mail },
  ];

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f8f7f4] text-ink flex">
      {/* Desktop Sidebar: Fixed & Locked in Place */}
      <aside className="hidden lg:flex w-64 xl:w-72 h-screen sticky top-0 flex-col justify-between border-r border-gray-200 bg-white p-5 shrink-0 text-ink shadow-sm z-20 overflow-y-auto select-none">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="border-b border-gray-100 pb-5">
            <div className="flex items-center gap-3">
              <MaisonMakeevaLogo className="h-8 w-auto text-ink shrink-0" />
              <h2 className="font-display text-sm sm:text-base uppercase tracking-[0.14em] font-bold text-ink leading-tight">
                Maison Makeeva
              </h2>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5 font-mono text-sm uppercase tracking-wide">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 transition-all text-left ${
                    isActive
                      ? "bg-ink text-white font-bold shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-ink font-medium"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-white" : "text-gray-500"} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3.5 border border-gray-200 bg-gray-50 hover:bg-red-50 hover:border-red-200 hover:text-red-600 font-mono text-sm uppercase tracking-wide text-gray-600 transition duration-150 font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="relative w-72 max-w-[80vw] h-full bg-white border-r border-gray-200 p-5 flex flex-col justify-between z-10 text-ink shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <MaisonMakeevaLogo className="h-7 w-auto text-ink shrink-0" />
                    <h2 className="font-display text-sm uppercase tracking-wider text-ink font-bold">
                      Maison Makeeva
                    </h2>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-ink p-1">
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-1.5 font-mono text-sm uppercase tracking-wide">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectSection(item.id);
                          setMobileOpen(false);
                        }}
                        className={`w-full flex items-center gap-3.5 px-3.5 py-3 transition text-left ${
                          isActive
                            ? "bg-ink text-white font-bold"
                            : "text-gray-600 hover:bg-gray-100 hover:text-ink font-medium"
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onBackToStore();
                  }}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-ink hover:text-white transition"
                >
                  <Eye size={14} />
                  <span>Storefront</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 py-1.5 font-mono text-xs uppercase tracking-wider text-gray-500 hover:text-red-600 transition"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 shrink-0 border-b border-gray-200 bg-white/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-ink"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display text-base sm:text-xl uppercase tracking-wider text-ink font-bold truncate">
              {navItems.find((n) => n.id === activeSection)?.label}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs">
            <div className="hidden sm:flex items-center gap-2 border border-gray-200 px-3 py-1.5 bg-gray-50 text-gray-700">
              <span className={`h-2 w-2 rounded-full ${isSupa ? "bg-emerald-500 animate-pulse" : "bg-coral"}`} />
              <span className="text-gray-800 font-medium truncate max-w-[180px]">{user?.full_name || user?.email}</span>
              <span className="bg-ink text-white px-1.5 py-0.5 text-[10px] font-bold uppercase">
                {user?.role}
              </span>
            </div>

            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-ink hover:text-white transition px-3 py-1.5 uppercase tracking-wider text-ink border border-gray-200 font-medium"
            >
              <Eye size={13} />
              <span className="hidden sm:inline">Store</span>
            </button>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-[#f8f7f4]">
          {children}
        </main>
      </div>
    </div>
  );
};
