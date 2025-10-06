import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const { Title } = Typography;

export default function SettingsPage() {
  const [admin, setAdmin] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch admin details on mount
  useEffect(() => {
    const fetchAdmin = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("User not found. Please log in again.");
        navigate("/");
        return;
      }

      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id, name, email")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error("Error fetching admin:", adminError.message);
        toast.error("Error fetching admin data.");
      } else if (!adminData) {
        toast.error("No admin record found for this user ID.");
      } else {
        setAdmin(adminData);
        setName(adminData.name);
        setEmail(adminData.email);
      }
    };

    fetchAdmin();
  }, [navigate]);

  // ✅ Handle profile update
  const handleUpdate = async () => {
    if (!password.trim()) {
      toast.error("Please enter your password to confirm changes.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !user) {
        throw new Error("Password confirmation failed. Please try again.");
      }

      const { error: updateError } = await supabase
        .from("admins")
        .update({ name, email })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error.message);
      toast.error(error.message || "Update failed. Please try again.");
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  // ✅ Handle logout
  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success("Logged out successfully!");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Logout error:", error.message);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <div className="flex justify-between mb-4">
          <Title level={3}>Admin Settings</Title>
          <Button
            danger
            loading={logoutLoading}
            onClick={handleLogout}
            type="primary"
          >
            Log out
          </Button>
        </div>

        {admin ? (
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input.Password
              placeholder="Enter password to confirm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="primary"
              loading={loading}
              onClick={handleUpdate}
              block
              className="mt-2"
            >
              Update Settings
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500">Loading admin data...</p>
        )}
      </div>
    </div>
  );
}
