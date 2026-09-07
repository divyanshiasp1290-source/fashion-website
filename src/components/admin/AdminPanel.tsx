import React, { useState } from "react";
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

export const AdminPanel: React.FC<{ onBackToStore: () => void }> = ({ onBackToStore }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const [section, setSection] = useState<AdminSection>("dashboard");

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
      onSelectSection={setSection}
      onBackToStore={onBackToStore}
    >
      {section === "dashboard" && <AdminDashboard onNavigate={setSection} />}
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
