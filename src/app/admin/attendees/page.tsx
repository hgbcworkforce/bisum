"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminRegistrationsPage from "../registrations/page";

export default function AdminAttendeesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/registrations");
  }, [router]);

  return <AdminRegistrationsPage />;
}
