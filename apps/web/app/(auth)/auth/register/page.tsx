"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterPageContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  useEffect(() => {
    if (user) {
      router.push(returnUrl);
    }
  }, [user, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await res.json();
      login(data.user, data.access_token);
      toast.success('Registration successful! Check your email for a welcome message.');
      router.push(returnUrl);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href={`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
            />
          </div>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
        </div>

        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
