"use client";

import { MOCK_CHANNELS, MOCK_CHANNEL_TREND, MOCK_STATS, computeMarketingMetrics } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Target, TrendingUp, DollarSign, Users, AlertTriangle, CheckCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };
const tooltip = { backgroundColor: "#0f1623", border: "1px solid #1a2235", borderRadius: 8, color: "#f9fafb", fontSize: 12 };

export default function AcquisitionPage() {
  const metrics = computeMarketingMetrics(MOCK_CHANNELS, MOCK_STATS);
  const channels = MOCK_CHANNELS;
  const trend = MOCK_CHANNEL_TREND;
  const s = MOCK_STATS;

  const ltvCacHealth = metrics.ltvCacRatio >= 3 ? "healthy" : metrics.ltvCacRatio >= 1.5 ? "warning" : "danger";
  const ltvCacColor = { healthy: "#10b981", warning: "#f59e0b", danger: "#ef4444" }[ltvCacHealth];
  const ltvCacLabel = { healthy: "Healthy (3:1+)", warning: "Needs work (< 3:1)", danger: "Unsustainable (< 1.5:1)" }[ltvCacHealth];

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Acquisition</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Where users come from, what they cost, and how much they're worth</p>
      </div>

      {/* Core marketing KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        {[
          { label: "Blended CAC", value: formatCurrency(metrics.blendedCAC), sub: "Cost to acquire 1 paid user", icon: DollarSign, color: "#f59e0b",
            note: metrics.blendedCAC < 20 ? "✓ Low — excellent efficiency" : metrics.blendedCAC < 50 ? "Acceptable range" : "⚠ High — optimize campaigns" },
          { label: "Customer LTV", value: formatCurrency(metrics.ltv), sub: `ARPU / Churn rate (${s.churn_rate}%)`, icon: TrendingUp, color: "#10b981",
            note: `${(metrics.ltv / s.avg_revenue_per_user).toFixed(1)} months avg lifetime` },
          { label: "LTV : CAC Ratio", value: `${metrics.ltvCacRatio.toFixed(1)} : 1`, sub: ltvCacLabel, icon: Target, color: ltvCacColor,
            note: "Target is 3:1 or better" },
          { label: "Payback Period", value: `${metrics.paybackMonths.toFixed(1)} mo`, sub: "Months to recover CAC", icon: Users, color: "#3b82f6",
            note: metrics.paybackMonths < 12 ? "✓ Under 12 months — healthy" : "⚠ Over 12 months — slow" },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "0 0 0 60px", background: kpi.color + "0a" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
                <p style={{ color: kpi.color, fontSize: 24, fontWeight: 700, marginTop: 6, letterSpacing: "-0.02em" }}>{kpi.value}</p>
                <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{kpi.sub}</p>
                <p style={{ color: kpi.color, fontSize: 11, marginTop: 6, fontWeight: 500 }}>{kpi.note}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <kpi.icon size={17} color={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Marketing spend summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Marketing Spend", value: formatCurrency(metrics.totalSpend), sub: "This month across all channels", color: "#f43f5e" },
          { label: "Paid Conversions", value: String(channels.reduce((s, c) => s + c.paid_conversions, 0)), sub: "New paid users from paid channels", color: "#10b981" },
          { label: "New Users (all channels)", value: formatNumber(s.new_users_month), sub: "Organic + paid combined", color: "#3b82f6" },
          { label: "Organic %", value: `${((channels.find(c => c.name === "Organic Search")!.new_users + channels.find(c => c.name === "Direct")!.new_users) / s.new_users_month * 100).toFixed(0)}%`, sub: "No spend required", color: "#a855f7" },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...card }}>
            <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
            <p style={{ color: kpi.color, fontSize: 24, fontWeight: 700, marginTop: 6 }}>{kpi.value}</p>
            <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Channel breakdown table */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Channel Performance</h3>
          <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Compare every acquisition channel by spend, conversions, CAC, LTV, and ROI</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a2235" }}>
              {["Channel", "New Users", "Paid Conv.", "Conv. Rate", "Spend", "CAC", "LTV", "ROI"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#334155", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {channels.sort((a, b) => b.paid_conversions - a.paid_conversions).map((ch, i) => (
              <tr key={ch.name} style={{ borderBottom: i < channels.length - 1 ? "1px solid #1a2235" : "none" }}>
                <td style={{ padding: "13px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: ch.color }} />
                    <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{ch.name}</span>
                  </div>
                </td>
                <td style={{ padding: "13px 12px", color: "#94a3b8", fontSize: 13 }}>{formatNumber(ch.new_users)}</td>
                <td style={{ padding: "13px 12px", color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{ch.paid_conversions}</td>
                <td style={{ padding: "13px 12px" }}>
                  <span style={{ color: ch.conversion_rate > 25 ? "#34d399" : ch.conversion_rate > 15 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 600 }}>
                    {ch.conversion_rate.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: "13px 12px", color: ch.spend === 0 ? "#334155" : "#94a3b8", fontSize: 13 }}>
                  {ch.spend === 0 ? "Free" : formatCurrency(ch.spend)}
                </td>
                <td style={{ padding: "13px 12px" }}>
                  <span style={{ color: ch.cac === 0 ? "#334155" : ch.cac < 15 ? "#34d399" : ch.cac < 30 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 600 }}>
                    {ch.cac === 0 ? "—" : formatCurrency(ch.cac)}
                  </span>
                </td>
                <td style={{ padding: "13px 12px", color: ch.ltv > 80 ? "#34d399" : "#94a3b8", fontSize: 13, fontWeight: 600 }}>
                  {formatCurrency(ch.ltv)}
                </td>
                <td style={{ padding: "13px 12px" }}>
                  {ch.roi === 0 ? (
                    <span style={{ color: "#334155", fontSize: 12 }}>Organic</span>
                  ) : (
                    <span style={{ color: ch.roi > 200 ? "#34d399" : ch.roi > 50 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 700 }}>
                      {ch.roi}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <div style={{ padding: "8px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle size={13} color="#34d399" />
            <span style={{ color: "#34d399", fontSize: 12, fontWeight: 500 }}>Best ROI: Referral (1658%) — scale this channel</span>
          </div>
          <div style={{ padding: "8px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={13} color="#fbbf24" />
            <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 500 }}>Worst: Paid Search (CAC $32.5) — reduce spend or pause</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Channel trend over time */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>New Users by Channel (30 days)</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Daily acquisition split by source</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trend}>
              <defs>
                {["organic","paid","social","referral","direct"].map((k, i) => (
                  <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={channels[i]?.color || "#666"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={channels[i]?.color || "#666"} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => v.slice(5)} interval={6} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltip} />
              <Legend wrapperStyle={{ color: "#475569", fontSize: 11 }} />
              {[["organic","#10b981"],["paid","#f43f5e"],["social","#3b82f6"],["referral","#a855f7"],["direct","#f59e0b"]].map(([k,c]) => (
                <Area key={k} type="monotone" dataKey={k} name={k.charAt(0).toUpperCase()+k.slice(1)} stroke={c} strokeWidth={1.5} fill={`url(#grad_${k})`} stackId="1" />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* CAC by channel */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>CAC by Channel</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Cost to acquire one paid user</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channels.filter(c => c.cac > 0)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltip} formatter={v => formatCurrency(Number(v))} />
              <Bar dataKey="cac" name="CAC" radius={[0, 4, 4, 0]}>
                {channels.filter(c => c.cac > 0).map((ch) => (
                  <Cell key={ch.name} fill={ch.cac < 15 ? "#10b981" : ch.cac < 30 ? "#f59e0b" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
