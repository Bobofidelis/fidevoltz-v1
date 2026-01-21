"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Reset failed');
      }

      toast.success("Password successfully reset! Please log in.");
      router.push("/auth/login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to reset password. Token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Invalid Link</h2>
        <p className="text-slate-600">This password reset link is invalid or missing a token.</p>
        <Link href="/auth/forgot-password">
          <Button variant="outline">Request new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? "Resetting password..." : "Reset password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Set new password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Please enter your new password below.
        </p>
      </div>
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
