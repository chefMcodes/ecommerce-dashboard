import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Input, message, Typography } from "antd";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const { Title } = Typography;

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1️⃣ Create account in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // 2️⃣ After signup, create a matching row in admins table
    const user = data.user;
    if (user) {
      const { error: insertError } = await supabase.from("admins").insert([
        {
          id: user.id, // match the auth user id
          name: name || "Admin User",
          email: user.email,
          created_at: new Date(),
        },
      ]);

      if (insertError) {
        console.error("Error creating admin record:", insertError.message);
      }
    }

    toast.success(
      "Registration successful! Check your email for confirmation."
    );
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <Title level={3} className="text-center mb-6">
          Create an Admin Account
        </Title>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <Input
            placeholder="Enter full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            Register
          </Button>

          <p className="text-center mt-2">
            Already have an account?{" "}
            <Link to="/" className="text-blue-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
