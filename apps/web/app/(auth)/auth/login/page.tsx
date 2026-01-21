"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials. Please check your email and password.");
      } else if (result?.ok) {
        toast.success("Successfully logged in!");
        // Use returnUrl or default to dashboard
        const redirectUrl = returnUrl && returnUrl !== "/" ? returnUrl : "/dashboard/overview";
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Sign in</h2>
        <p className="mt-2 text-sm text-slate-600">
          Don't have an account?{" "}
          <Link href={`/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`} className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
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
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
