"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Request failed');
      }

      setSubmitted(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Check your email</h2>
        <p className="mt-2 text-sm text-slate-600">
          We've sent a password reset link to <strong>{email}</strong>.
        </p>
        <div className="mt-6">
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Reset password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? "Sending link..." : "Send reset link"}
        </Button>

        <div className="text-center">
          <Link href="/auth/login" className="text-sm font-medium text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
