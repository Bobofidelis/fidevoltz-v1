import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header / Back Button */}
      <div className="p-4 md:p-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 hover:bg-slate-200">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500">
        <div className="flex items-center justify-center gap-4">
          <Link href="/terms" className="hover:text-slate-900 hover:underline">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-slate-900 hover:underline">
            Privacy Policy
          </Link>
        </div>
        <p className="mt-2">© {new Date().getFullYear()} FideVoltz. All rights reserved.</p>
      </footer>
    </div>
  );
}
