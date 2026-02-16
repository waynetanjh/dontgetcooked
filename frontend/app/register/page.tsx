import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Don&apos;t Get Cooked</h1>
          <p className="text-muted-foreground">Create your account to get started</p>
        </div>

        <RegisterForm />

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/">
            <Button variant="link" className="p-0 h-auto font-semibold">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
