import { Suspense } from "react";
import StatusClient from "./StatusClient";

export default function StatusPage() {
  return (
    <Suspense fallback={<div className="loading">Завантаження…</div>}>
      <StatusClient />
    </Suspense>
  );
}
