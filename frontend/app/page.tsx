"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { toast } from "sonner";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";

function SessionExpiryHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      toast.error("Your session has expired. Please sign in again.");
    }
  }, [searchParams]);

  return null;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <Suspense fallback={null}>
        <SessionExpiryHandler />
      </Suspense>
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Don&apos;t Get Cooked</h1>
          <p className="text-muted-foreground">Never forget the important dates</p>
        </div>

        <LoginForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/register">
            <Button variant="link" className="p-0 h-auto font-semibold">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
