"use client";

import { useState } from "react";
import { MOCK_USERS, MOCK_STATS } from "@/lib/api";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { Users, UserCheck, UserX, Search, Zap, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };

type Segment = "all" | "power" | "regular" | "new" | "at_risk";

const SEGMENT_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  power:   { color: "#10b981", bg: "rgba(16,185,129,0.12)", label: "Power User" },
  regular: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Regular" },
  new:     { color: "#a855f7", bg: "rgba(168,85,247,0.12)", label: "New" },
  at_risk: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "At Risk" },
};

const TIER_BADGE: Record<string, { bg: string; color: string }> = {
  free:    { bg: "#1a2235", color: "#64748b" },
  monthly: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa" },
  premium: { bg: "rgba(244,63,94,0.12)", color: "#fb7185" },
};

const CHURN_COLOR = { low: "#34d399", medium: "#fbbf24", high: "#f87171" };

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<Segment>("all");
  const [tierFilter, setTierFilter] = useState("all");
  const s = MOCK_STATS;

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.email.includes(search.toLowerCase()) || u.display_name.toLowerCase().includes(search.toLowerCase());
    const matchSegment = segment === "all" || u.segment === segment;
    const matchTier = tierFilter === "all" || u.subscription_tier === tierFilter;
    return matchSearch && matchSegment && matchTier;
  });

  const powerCount = MOCK_USERS.filter(u => u.segment === "power").length;
  const atRiskCount = MOCK_USERS.filter(u => u.segment === "at_risk").length;
  const newCount = MOCK_USERS.filter(u => u.segment === "new").length;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Users</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Manage users, segments, and subscription tiers</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Users", value: formatNumber(s.total_users), sub: `+${s.new_users_today} today`, icon: Users, color: "#f43f5e" },
          { label: "Paid Users", value: formatNumber(s.paid_users), sub: `${s.conversion_rate}% conversion`, icon: UserCheck, color: "#10b981" },
          { label: "At-Risk Users", value: String(atRiskCount), sub: "Likely to churn", icon: AlertTriangle, color: "#ef4444" },
          { label: "Free Users", value: formatNumber(s.free_users), sub: "Potential to convert", icon: UserX, color: "#64748b" },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
              <p style={{ color: "#ffffff", fontSize: 26, fontWeight: 700, marginTop: 6 }}>{kpi.value}</p>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{kpi.sub}</p>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: kpi.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <kpi.icon size={18} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Segments */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { key: "power", label: "Power Users", count: powerCount, icon: Zap, desc: "50+ analyses · premium tier" },
          { key: "regular", label: "Regular Users", count: MOCK_USERS.filter(u => u.segment === "regular").length, icon: Users, desc: "Active · occasional usage" },
          { key: "new", label: "New Users", count: newCount, icon: Users, desc: "Signed up < 7 days ago" },
          { key: "at_risk", label: "At-Risk Users", count: atRiskCount, icon: AlertTriangle, desc: "Inactive 10+ days · paid" },
        ].map(seg => {
          const cfg = SEGMENT_CONFIG[seg.key];
          const active = segment === seg.key;
          return (
            <button key={seg.key} onClick={() => setSegment(active ? "all" : seg.key as Segment)} style={{
              padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              background: active ? cfg.bg : "#0f1623",
              border: active ? `2px solid ${cfg.color}` : "1px solid #1a2235",
              textAlign: "left",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <seg.icon size={14} color={cfg.color} />
                <span style={{ color: cfg.color, fontSize: 12, fontWeight: 700 }}>{seg.label}</span>
              </div>
              <p style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{seg.count}</p>
              <p style={{ color: "#334155", fontSize: 11 }}>{seg.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ position: "relative", maxWidth: 300, flex: 1 }}>
          <Search size={14} color="#475569" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", background: "#0f1623", border: "1px solid #1a2235",
              borderRadius: 8, padding: "8px 12px 8px 34px", fontSize: 13, color: "#e2e8f0", outline: "none",
            }}
          />
        </div>
        {["all", "free", "monthly", "premium"].map(t => (
          <button key={t} onClick={() => setTierFilter(t)} style={{
            padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: "pointer",
            border: "none", textTransform: "capitalize",
            background: tierFilter === t ? "#f43f5e" : "#1a2235",
            color: tierFilter === t ? "#ffffff" : "#475569",
          }}>{t}</button>
        ))}
        <span style={{ color: "#334155", fontSize: 12, marginLeft: "auto" }}>{filtered.length} users</span>
      </div>

      {/* Table */}
      <div style={{ background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a2235" }}>
              {["User", "Segment", "Tier", "Analyses", "Revenue", "Last Active", "Churn Risk", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 14px", color: "#334155", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => {
              const seg = SEGMENT_CONFIG[user.segment];
              const tier = TIER_BADGE[user.subscription_tier];
              const daysSince = Math.round((Date.now() - new Date(user.last_active).getTime()) / 86400000);
              return (
                <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1a2235" : "none" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: seg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: seg.color, fontSize: 13, fontWeight: 700 }}>{user.display_name[0]}</span>
                      </div>
                      <div>
                        <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{user.display_name}</p>
                        <p style={{ color: "#334155", fontSize: 11 }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: seg.bg, color: seg.color, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{seg.label}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: tier.bg, color: tier.color, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "capitalize" }}>{user.subscription_tier}</span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#94a3b8", fontSize: 13 }}>{user.total_analyses}</td>
                  <td style={{ padding: "12px 14px", color: user.revenue_generated > 0 ? "#34d399" : "#334155", fontSize: 13, fontWeight: user.revenue_generated > 0 ? 600 : 400 }}>
                    {formatCurrency(user.revenue_generated)}
                  </td>
                  <td style={{ padding: "12px 14px", color: daysSince > 7 ? "#f87171" : "#64748b", fontSize: 12 }}>
                    {daysSince === 0 ? "Today" : `${daysSince}d ago`}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: CHURN_COLOR[user.churn_risk] }} />
                      <span style={{ color: CHURN_COLOR[user.churn_risk], fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{user.churn_risk}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <select defaultValue={user.subscription_tier} style={{ background: "#1a2235", border: "1px solid #2d3f5a", color: "#94a3b8", fontSize: 11, borderRadius: 6, padding: "3px 6px", outline: "none", cursor: "pointer" }}>
                        <option value="free">Free</option>
                        <option value="monthly">Monthly</option>
                        <option value="premium">Premium</option>
                      </select>
                      <button style={{ color: "#f87171", fontSize: 11, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, cursor: "pointer", padding: "3px 8px" }}>Ban</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
