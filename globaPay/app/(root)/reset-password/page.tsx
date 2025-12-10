// app/(root)/reset-password/page.tsx
import { Suspense } from "react";
import ResetPasswordInner from "./ResetPasswordInner";

export const dynamic = "force-dynamic";   // safe but optional
export const fetchCache = "force-no-store";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
