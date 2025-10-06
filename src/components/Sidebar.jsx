import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Users, Settings, Package, X } from "lucide-react";

const links = [
  { name: "Dashboard", path: "/dashboard", icon: <Home size={20} /> },
  { name: "Products", path: "/products", icon: <Package size={20} /> },
  { name: "Orders", path: "/orders", icon: <ShoppingBag size={20} /> },
  { name: "Customers", path: "/customers", icon: <Users size={20} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // cleanup to restore scroll
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 sm:min-h-full w-64  bg-white shadow-lg transform transition-transform duration-300 z-50
      ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-blue-900 tracking-wide">
          DashboardHub
        </h1>
        {/* Close button (mobile only) */}
        <button
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={toggleSidebar}
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleNavClick}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 
              ${
                isActive
                  ? "bg-blue-50 text-blue-900 font-semibold border-l-4 border-blue-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
