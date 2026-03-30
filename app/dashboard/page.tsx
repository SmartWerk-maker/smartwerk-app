"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import Sidebar from "./components/sidebar";
import Topbar from "./components/Topbar";
import RevenueChart from "./components/charts/RevenueChart";
import InvoiceStatusChart from "./components/charts/InvoiceStatusChart";
import Suggestions from "./components/suggestions";
import RecentActivity from "./components/recent-activity";
import KPIGroup from "./components/KPIGroup";

import { useActivity } from "@/app/dashboard/hooks/useActivity";
import { useFinancialDashboard } from "@/app/dashboard/hooks/useFinancialDashboard";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useTheme } from "@/app/providers/ThemeProvider";



import "./dashboard.css";

/* ================= PAGE ================= */

export default function DashboardPage() {
  const router = useRouter();

  /* ---------- AUTH ---------- */
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
    });

    return () => unsub();
  }, [router]);

  /* ---------- UI STATE ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detect = () => setIsMobile(window.innerWidth < 1200);
    detect();
    window.addEventListener("resize", detect);
    return () => window.removeEventListener("resize", detect);
  }, []);

  


/* ---------- SWIPE ---------- */
const [touchStartX, setTouchStartX] = useState<number | null>(null);
const [touchEndX, setTouchEndX] = useState<number | null>(null);

const handleTouchStart = (e: TouchEvent) => {
  setTouchEndX(null);
  setTouchStartX(e.touches[0].clientX);
};

const handleTouchMove = (e: TouchEvent) => {
  setTouchEndX(e.touches[0].clientX);
};

const handleTouchEnd = () => {
  if (touchStartX === null || touchEndX === null) return;

  const distance = touchEndX - touchStartX;

  // 👉 EDGE SWIPE OPEN (тільки з лівого краю)
  if (touchStartX < 60 && distance > 80 && isMobile) {
    setSidebarOpen(true);
  }

  // 👉 CLOSE
  if (distance < -80 && isMobile) {
    setSidebarOpen(false);
  }
};

useEffect(() => {
  if (!isMobile) return;

  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchmove", handleTouchMove);
  window.addEventListener("touchend", handleTouchEnd);

  return () => {
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  };
}, [isMobile, touchStartX, touchEndX]);

  /* ---------- CONTEXTS ---------- */
  const { language } = useLanguage();
  const { isDark } = useTheme();

  /* ---------- DATA ---------- */
  const dashboard = useFinancialDashboard(user?.uid);
  const activity = useActivity(user?.uid);

  /* ---------- ACTIONS ---------- */
  const handleLogout = useCallback(async () => {
    await signOut(auth);
    router.push("/login");
  }, [router]);

  /* ---------- LOADING ---------- */
  if (!user) {
    return (
      <div className="dash-loading">
        <div className="dash-loading-card">Loading dashboard…</div>
      </div>
    );
  }

  /* ---------- DERIVED ---------- */
  const revenueTrendData = dashboard.trends.revenueByMonth;

  /* ================= RENDER ================= */

  return (
    <div className={`dash-root ${isDark ? "dash-theme-dark" : "dash-theme-light"}`}>
      {/* MOBILE BACKDROP */}
      {isMobile && sidebarOpen && (
        <div
          className="dash-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        isMobile={isMobile}
        isOpen={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* MAIN */}
      <main className="dash-main">
        <Topbar
          user={user}
          isMobile={isMobile}
          onMenu={() => setSidebarOpen(true)}
        />

        {/* KPI */}
        <section className="dash-kpi-row">
          <KPIGroup
            revenue={dashboard.totals.revenue}
            unpaid={dashboard.totals.unpaid}
            overdueCount={dashboard.totals.overdueCount}
            remindersSent={dashboard.totals.remindersSent}
            expenses={dashboard.totals.expenses}
            quoteWinRate={dashboard.ratios.quoteWinRate}
            topClient={dashboard.totals.topClient}
          />
        </section>

        {/* CHARTS */}
        <section className="dash-charts-row">
          <RevenueChart data={revenueTrendData} />
          <InvoiceStatusChart
            paid={dashboard.totals.revenue}
            unpaid={dashboard.totals.unpaid}
            overdue={dashboard.totals.overdueCount}
          />
        </section>

        {/* INSIGHTS */}
        <section className="dash-bottom-row">
          <Suggestions
            overdueCount={dashboard.totals.overdueCount}
            quoteWinRate={dashboard.ratios.quoteWinRate}
            isDark={isDark}
            language={language}
          />

          <RecentActivity
            activity={activity}
            isDark={isDark}
            language={language}
          />
        </section>
      </main>
    </div>
  );
}