import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Input, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const { Title } = Typography;

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully!");
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <Title level={3} className="text-center mb-6">
          Reset Password
        </Title>

        <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-4">
          <Input.Password
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Input.Password
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="mt-2"
          >
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
