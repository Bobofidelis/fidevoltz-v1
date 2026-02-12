import { Zap } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MaintenancePage() {
  // Fetch site settings for branding
  let branding: any = {};
  try {
    const settings = await prisma.siteSettings.findMany({
      where: { category: 'branding' },
    });
    branding = settings.reduce((acc: any, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  } catch (e) {}

  const siteName = branding['branding.siteName'] || "FideVoltz";
  const logo = branding['branding.logo'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Branding */}
        <div className="flex flex-col items-center">
          {logo ? (
            <img src={logo} alt={siteName} className="h-16 w-auto mb-6" />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {siteName} is under maintenance
          </h1>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <p className="text-slate-600 text-lg">
            We're currently performing some scheduled updates to improve your experience. 
            We'll be back online shortly!
          </p>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Coming back soon
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-6">
            If you're an administrator, you can log in below to access the dashboard.
          </p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Admin Login
          </Link>
        </div>
        
        <p className="text-xs text-slate-400 pt-8">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
