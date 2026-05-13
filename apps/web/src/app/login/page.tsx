import { Suspense } from "react";
import { LoginPage } from "@/features/auth/pages/login-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
