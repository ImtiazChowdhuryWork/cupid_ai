"use client";

import { useState } from "react";
import { MOCK_ALERTS } from "@/lib/api";
import { AlertTriangle, CheckCircle, Info, Zap, Bell, Filter } from "lucide-react";
import { format } from "date-fns";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };

type AlertType = "all" | "error" | "warning" | "info" | "success";

const TYPE_CONFIG = {
  error:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)",   icon: AlertTriangle, label: "Error" },
  warning: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.2)",  icon: AlertTriangle, label: "Warning" },
  info:    { color: "#3b82f6", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",  icon: Info,          label: "Info" },
  success: { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)",  icon: CheckCircle,   label: "Success" },
};

const ACTION_MAP: Record<string, string> = {
  "Claude API Key Missing":      "→ Go to Settings to configure your API key",
  "High Churn Rate Detected":    "→ Check Users page · consider sending re-engagement emails",
  "Claude API Cost Spike":       "→ Review user activity in Analytics · consider rate limiting",
  "Revenue Milestone Reached":   "→ No action needed · celebrate!",
  "New User Signup Spike":       "→ Check source in Analytics · consider targeted onboarding",
  "Free Tier Limit Hit":         "→ Review free tier limit in Settings",
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<AlertType>("all");
  const [alerts, setAlerts] = useState(MOCK_ALERTS);

  const filtered = alerts.filter(a => filter === "all" || a.type === filter);
  const unread = alerts.filter(a => !a.read).length;
  const counts = Object.keys(TYPE_CONFIG).reduce((acc, k) => {
    acc[k as AlertType] = alerts.filter(a => a.type === k).length;
    return acc;
  }, {} as Record<AlertType, number>);

  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  const markRead = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Alerts</h1>
            {unread > 0 && (
              <span style={{ background: "#f43f5e", color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{unread} unread</span>
            )}
          </div>
          <p style={{ color: "#475569", fontSize: 13 }}>System alerts, cost spikes, and business notifications</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: "#1a2235", border: "1px solid #2d3f5a", color: "#94a3b8",
          }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {(Object.entries(TYPE_CONFIG) as [string, typeof TYPE_CONFIG["error"]][]).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={type} style={{ ...card, cursor: "pointer", border: filter === type ? `2px solid ${cfg.color}` : "1px solid #1a2235" }}
              onClick={() => setFilter(filter === type ? "all" : type as AlertType)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} color={cfg.color} />
                </div>
                <div>
                  <p style={{ color: "#475569", fontSize: 12 }}>{cfg.label}s</p>
                  <p style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700 }}>{counts[type as AlertType] || 0}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Filter size={14} color="#475569" style={{ alignSelf: "center" }} />
        {(["all", "error", "warning", "info", "success"] as AlertType[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
            border: "none", textTransform: "capitalize",
            background: filter === f ? "#f43f5e" : "#1a2235",
            color: filter === f ? "#ffffff" : "#475569",
          }}>{f} {f !== "all" ? `(${counts[f] || 0})` : `(${alerts.length})`}</button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ ...card, textAlign: "center", padding: 48 }}>
            <Bell size={32} color="#1a2235" style={{ margin: "0 auto 12px" }} />
            <p style={{ color: "#475569", fontSize: 14 }}>No alerts in this category</p>
          </div>
        )}
        {filtered.map(alert => {
          const cfg = TYPE_CONFIG[alert.type];
          const Icon = cfg.icon;
          const action = ACTION_MAP[alert.title];
          return (
            <div key={alert.id} style={{
              padding: "16px 20px",
              background: alert.read ? "#0f1623" : cfg.bg,
              border: `1px solid ${alert.read ? "#1a2235" : cfg.border}`,
              borderRadius: 12,
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              opacity: alert.read ? 0.7 : 1,
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color={cfg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600 }}>{alert.title}</p>
                  {!alert.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />}
                  <span style={{ padding: "1px 8px", background: cfg.color + "18", color: cfg.color, fontSize: 10, fontWeight: 700, borderRadius: 4, textTransform: "uppercase" }}>{alert.type}</span>
                </div>
                <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>{alert.message}</p>
                {action && (
                  <p style={{ color: cfg.color, fontSize: 12, marginTop: 8, fontWeight: 500 }}>{action}</p>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                <span style={{ color: "#334155", fontSize: 11 }}>{format(new Date(alert.timestamp), "MMM d · h:mm a")}</span>
                {!alert.read && (
                  <button onClick={() => markRead(alert.id)} style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: "#1a2235", border: "1px solid #2d3f5a", color: "#64748b",
                  }}>Mark read</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
