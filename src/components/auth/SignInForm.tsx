"use client";
import React, { useState } from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Authenticating...");
    try {
      const res = await api.post("/auth/login", formData);
      if (res.token) {
        localStorage.setItem("token", res.token);
        toast.success("Welcome back!", { id: toastId });
        window.location.href = "/"; // Redirect to dashboard
      } else {
        throw new Error("Invalid server response");
      }
    } catch (err: any) {
      toast.error(err.message || "Login failed", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full p-4 sm:p-8">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-10 text-center sm:text-start">
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900 dark:text-white">
            Royal Garage Admin
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Sign in to manage your garage operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            placeholder="admin@royal-garage.com"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 cursor-pointer right-4 top-[44px] text-gray-400"
            >
              {showPassword ? <EyeIcon size="20" /> : <EyeCloseIcon size="20" />}
            </span>
          </div>

          <div className="pt-2">
            <Button className="w-full h-12 text-base font-bold" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </Button>
          </div>
        </form>

        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                Royal Garage System v1.0
            </p>
        </div>
      </div>
    </div>
  );
}
