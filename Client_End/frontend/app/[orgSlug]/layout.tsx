"use client";

import { MainLayout } from "@/components/layout/MainLayout";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
    return <MainLayout>{children}</MainLayout>;
}
