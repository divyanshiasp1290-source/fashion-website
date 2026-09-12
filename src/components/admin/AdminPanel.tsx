import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AdminAuthGate } from "./AdminAuthGate";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLayout, type AdminSection } from "./AdminLayout";
import { CategoryManager } from "./CategoryManager";
import { CollectionManager } from "./CollectionManager";
import { ContactManager } from "./ContactManager";
import { CustomerManager } from "./CustomerManager";
import { InventoryManager } from "./InventoryManager";
import { NewsletterManager } from "./NewsletterManager";
import { OrderManager } from "./OrderManager";
import { ProductManager } from "./ProductManager";

const VALID_SECTIONS: AdminSection[] = [
  "dashboard",
  "products",
  "categories",
  "collections",
  "inventory",
  "orders",
  "customers",
  "messages",
  "newsletter",
];

function getSectionFromPath(pathname: string): AdminSection {
  const match = pathname.match(/^\/admin\/([a-z0-9_-]+)/i);
  if (match && match[1]) {
    const candidate = match[1].toLowerCase() as AdminSection;
    if (VALID_SECTIONS.includes(candidate)) {
      return candidate;
    }
  }
  return "dashboard";
}

export const AdminPanel: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const [section, setSection] = useState<AdminSection>(() => {
    if (typeof window !== "undefined") {
      return getSectionFromPath(window.location.pathname);
    }
    return "dashboard";
  });

  const handleSelectSection = (nextSection: AdminSection) => {
    setSection(nextSection);
    const targetPath = nextSection === "dashboard" ? "/admin" : `/admin/${nextSection}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const current = getSectionFromPath(window.location.pathname);
      setSection(current);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] flex items-center justify-center font-mono text-xs text-taupe">
        Verifying atelier security credentials...
      </div>
    );
  }

  // If not logged in as admin, render secure gate
  if (!user || !isAdmin) {
    return <AdminAuthGate onBackToStore={onBackToStore} />;
  }

  return (
    <AdminLayout
      activeSection={section}
      onSelectSection={handleSelectSection}
      onBackToStore={onBackToStore}
    >
      {section === "dashboard" && <AdminDashboard onNavigate={handleSelectSection} />}
      {section === "products" && <ProductManager />}
      {section === "categories" && <CategoryManager />}
      {section === "collections" && <CollectionManager />}
      {section === "inventory" && <InventoryManager />}
      {section === "orders" && <OrderManager />}
      {section === "customers" && <CustomerManager />}
      {section === "messages" && <ContactManager />}
      {section === "newsletter" && <NewsletterManager />}
    </AdminLayout>
  );
};
