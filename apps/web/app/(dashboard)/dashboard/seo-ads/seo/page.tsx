import { redirect } from "next/navigation";

export default function SEOAdsTabRedirect() {
  redirect("/dashboard/seo-ads?tab=seo");
}
