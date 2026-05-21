"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, DollarSign, Users,
  BarChart2, Settings, Heart, TrendingUp, Bell,
  Target, Megaphone,
} from "lucide-react";
import { MOCK_ALERTS } from "@/lib/api";

const unreadCount = MOCK_ALERTS.filter(a => !a.read).length;

const navGroups = [
  {
    label: "Business",
    items: [
      { href: "/overview",  label: "Overview",    icon: LayoutDashboard, badge: null },
      { href: "/revenue",   label: "Revenue",     icon: DollarSign,      badge: null },
      { href: "/users",     label: "Users",       icon: Users,           badge: null },
      { href: "/analytics", label: "Analytics",   icon: BarChart2,       badge: null },
      { href: "/forecast",  label: "Forecast",    icon: TrendingUp,      badge: null },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/acquisition", label: "Acquisition", icon: Target,     badge: null },
      { href: "/campaigns",   label: "Campaigns",   icon: Megaphone,  badge: null },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/alerts",   label: "Alerts",   icon: Bell,     badge: unreadCount },
      { href: "/settings", label: "Settings", icon: Settings, badge: null },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 240,
      minHeight: "100vh",
      background: "#080d18",
      borderRight: "1px solid #1a2235",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "22px 20px",
        borderBottom: "1px solid #1a2235",
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg, #f43f5e, #fb7185)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(244,63,94,0.3)",
        }}>
          <Heart size={17} color="white" fill="white" />
        </div>
        <div>
          <p style={{ color: "#ffffff", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>Cupid AI</p>
          <p style={{ color: "#334155", fontSize: 11, marginTop: 1 }}>CEO Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 8 }}>
            <p style={{ color: "#1e3a5f", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "8px 12px 4px" }}>{group.label}</p>
            {group.items.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link key={href} href={href} style={{ textDecoration: "none", display: "block", marginBottom: 1 }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "8px 12px", borderRadius: 8,
                    background: active ? "rgba(244,63,94,0.12)" : "transparent",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon size={14} color={active ? "#fb7185" : "#475569"} />
                      <span style={{ color: active ? "#fb7185" : "#64748b", fontSize: 13, fontWeight: active ? 600 : 500 }}>{label}</span>
                    </div>
                    {badge !== null && badge > 0 && (
                      <span style={{ background: "#f43f5e", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10 }}>{badge}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1a2235" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#f43f5e", fontSize: 13, fontWeight: 700 }}>A</span>
          </div>
          <div>
            <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>Admin</p>
            <p style={{ color: "#334155", fontSize: 11 }}>cupidai.com</p>
          </div>
        </div>
        <div style={{
          padding: "8px 10px",
          background: "rgba(244,63,94,0.08)",
          borderRadius: 8,
          border: "1px solid rgba(244,63,94,0.15)",
        }}>
          <p style={{ color: "#4b5563", fontSize: 10 }}>API Key Status</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
            <span style={{ color: "#f87171", fontSize: 11, fontWeight: 600 }}>Not Configured</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
