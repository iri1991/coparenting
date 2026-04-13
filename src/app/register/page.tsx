import { Suspense } from "react";
import { AuthSuspenseFallback } from "@/components/auth/AuthSuspenseFallback";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthSuspenseFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
