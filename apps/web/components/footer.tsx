import Link from "next/link";
import { Zap } from "lucide-react";
import { SocialMediaLinks } from "./social-media-links";

const footerLinks = {
  product: [
    { label: "Tutorials", href: "/projects" },
    { label: "Store", href: "/store" },
    { label: "Categories", href: "/projects" },
    { label: "New Arrivals", href: "/store" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/projects" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "Help Center", href: "/support" },
    { label: "Shipping Info", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">FideVoltz</span>
            </Link>
            <p className="text-sm text-slate-600 mb-6 max-w-xs">
              Your one-stop platform for electronics tutorials and premium components. 
              Learn, build, and innovate with FideVoltz.
            </p>
            <SocialMediaLinks iconSize={16} />
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} FideVoltz. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
