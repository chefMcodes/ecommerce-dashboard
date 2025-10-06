import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Input, message, Typography } from "antd";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const { Title } = Typography;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/reset-password",
    });

    setLoading(false);

    if (error) toast.error(error.message);
    else toast.success("Password reset link sent! Check your email.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <Title level={3} className="text-center mb-6">
          Forgot Password
        </Title>

        <form onSubmit={handlePasswordReset} className="flex flex-col gap-4">
          <Input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="mt-2"
          >
            Send Reset Link
          </Button>

          <p className="text-center mt-2">
            <Link to="/login">Back to Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
