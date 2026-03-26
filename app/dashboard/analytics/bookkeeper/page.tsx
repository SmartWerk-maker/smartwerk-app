import type { Metadata } from "next";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = {
  title: "📊 SmartWerk — Analytics",
  description: "Financial analytics and insights",
};

// 🔥 КЛЮЧ — вимикає prerender
export const dynamic = "force-dynamic";

export default function Page() {
  return <AnalyticsClient />;
}