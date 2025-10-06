import React, { useEffect, useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { message, Dropdown } from "antd";
import { supabase } from "../supabaseClient";
import toast from "react-hot-toast";

export default function Navbar({ toggleSidebar }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in admin
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("admins")
            .select("name, email")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setAdmin(data);
        }
      } catch (err) {
        console.error("Error fetching admin:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, []);

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const profileMenu = {
    items: [
      {
        key: "1",
        label: (
          <div className="px-2 py-1 text-sm">
            <p className="font-medium">{admin?.name || "Admin"}</p>
            <p className="text-xs text-gray-500">{admin?.email}</p>
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 w-full"
          >
            <LogOut size={16} /> Logout
          </button>
        ),
      },
    ],
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
      {/* Sidebar toggle button (mobile only) */}
      <button
        className="md:hidden text-gray-600 hover:text-gray-900"
        onClick={toggleSidebar}
      >
        <Menu size={28} />
      </button>

      {/* Search input */}
      {/* <input
        type="text"
        placeholder="Search..."
        className="hidden sm:block px-4 py-2 border rounded-lg w-60 focus:ring focus:ring-primary/40"
      /> */}

      {/* Profile section */}
      <div className="flex items-center gap-4">
        {!loading ? (
          <Dropdown
            menu={profileMenu}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="font-medium hidden sm:block">
                {admin?.name || "Admin"}
              </span>
              <img
                src={
                  admin?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${admin?.name || "Admin"}`
                }
                alt="Admin Avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </Dropdown>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        )}
      </div>
    </header>
  );
}
