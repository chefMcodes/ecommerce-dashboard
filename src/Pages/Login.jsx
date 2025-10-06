import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Input, message, Typography } from "antd";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const { Title } = Typography;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Authenticate admin
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const user = data?.user;
      if (!user) throw new Error("No user returned from login.");

      // Step 2: Check if admin record exists
      const { data: admin, error: fetchError } = await supabase
        .from("admins")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Step 3: If not found, create one safely
      if (!admin) {
        const { error: insertError } = await supabase.from("admins").insert([
          {
            id: user.id,
            email: user.email,
            name: "Admin User",
            // ✅ Do not include password
            created_at: new Date(),
          },
        ]);
        if (insertError) throw insertError;
      }

      message.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login Error:", err.message);
      toast.error(err.message || "Login failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <Title level={3} className="text-center mb-6">
          Admin Login
        </Title>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            placeholder="Enter email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input.Password
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="mt-2"
          >
            Login
          </Button>

          <p className="text-center mt-2">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-700">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
