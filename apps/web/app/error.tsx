"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-100 p-4 mb-6">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
        Something went wrong!
      </h2>
      <p className="text-slate-600 mb-8 max-w-md">
        We apologize for the inconvenience. An unexpected error has occurred.
        Please try again or contact support if the problem persists.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default" className="bg-blue-600 hover:bg-blue-700">
          Try again
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
