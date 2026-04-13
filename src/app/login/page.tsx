import { Suspense } from "react";
import { AuthSuspenseFallback } from "@/components/auth/AuthSuspenseFallback";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSuspenseFallback />}>
      <LoginForm />
    </Suspense>
  );
}
