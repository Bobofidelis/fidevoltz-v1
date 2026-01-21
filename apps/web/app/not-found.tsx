import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-blue-100 p-4 mb-6">
        <FileQuestion className="h-10 w-10 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
        Page Not Found
      </h2>
      <p className="text-slate-600 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Link href="/">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
