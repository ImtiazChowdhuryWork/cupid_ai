"use client";

import { useState } from "react";
import { MOCK_CAMPAIGNS, MOCK_AB_TESTS, MOCK_EMAIL_CAMPAIGNS } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Megaphone, Mail, FlaskConical, TrendingUp, DollarSign, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };

const STATUS_CONFIG = {
  active:    { color: "#10b981", bg: "rgba(16,185,129,0.1)",  label: "Active" },
  paused:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Paused" },
  completed: { color: "#475569", bg: "rgba(71,85,105,0.15)",  label: "Completed" },
  running:   { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  label: "Running" },
};

type ActiveTab = "campaigns" | "abtests" | "email";

export default function CampaignsPage() {
  const [tab, setTab] = useState<ActiveTab>("campaigns");

  const totalSpend = MOCK_CAMPAIGNS.reduce((s, c) => s + c.spend, 0);
  const totalConversions = MOCK_CAMPAIGNS.reduce((s, c) => s + c.conversions, 0);
  const totalLeads = MOCK_CAMPAIGNS.reduce((s, c) => s + c.leads, 0);
  const blendedCPA = totalSpend / totalConversions;

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Campaigns</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Ad campaigns, A/B tests, and email marketing performance</p>
      </div>

      {/* Campaign KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Spend", value: formatCurrency(totalSpend), sub: "All active campaigns", icon: DollarSign, color: "#f43f5e" },
          { label: "Total Leads", value: formatNumber(totalLeads), sub: "Signups from campaigns", icon: Users, color: "#3b82f6" },
          { label: "Paid Conversions", value: String(totalConversions), sub: "Free → Paid from campaigns", icon: TrendingUp, color: "#10b981" },
          { label: "Blended CPA", value: formatCurrency(blendedCPA), sub: "Cost per paid acquisition", icon: Megaphone, color: "#f59e0b" },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
              <p style={{ color: kpi.color, fontSize: 24, fontWeight: 700, marginTop: 6 }}>{kpi.value}</p>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{kpi.sub}</p>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <kpi.icon size={17} color={kpi.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "#1a2235", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {([
          { key: "campaigns", label: "Ad Campaigns", icon: Megaphone },
          { key: "abtests",   label: "A/B Tests",    icon: FlaskConical },
          { key: "email",     label: "Email",         icon: Mail },
        ] as { key: ActiveTab; label: string; icon: React.ElementType }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7,
            fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
            background: tab === t.key ? "#0f1623" : "transparent",
            color: tab === t.key ? "#f1f5f9" : "#475569",
          }}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Ad Campaigns table */}
      {tab === "campaigns" && (
        <div style={card}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Ad Campaign Performance</h3>
            <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Impressions, clicks, leads, conversions, and ROI per campaign</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a2235" }}>
                {["Campaign", "Channel", "Status", "Budget", "Spend", "Leads", "Conv.", "CPC", "CPA", "ROI"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#334155", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_CAMPAIGNS.map((c, i) => {
                const st = STATUS_CONFIG[c.status];
                const budgetPct = (c.spend / c.budget) * 100;
                return (
                  <tr key={c.id} style={{ borderBottom: i < MOCK_CAMPAIGNS.length - 1 ? "1px solid #1a2235" : "none" }}>
                    <td style={{ padding: "13px 12px" }}>
                      <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{c.name}</p>
                      <p style={{ color: "#334155", fontSize: 11 }}>
                        {format(new Date(c.start_date), "MMM d")}
                        {c.end_date ? ` → ${format(new Date(c.end_date), "MMM d")}` : " → ongoing"}
                      </p>
                    </td>
                    <td style={{ padding: "13px 12px", color: "#64748b", fontSize: 12 }}>{c.channel}</td>
                    <td style={{ padding: "13px 12px" }}>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </td>
                    <td style={{ padding: "13px 12px" }}>
                      <p style={{ color: "#94a3b8", fontSize: 12 }}>{formatCurrency(c.budget)}</p>
                      <div style={{ height: 3, background: "#1a2235", borderRadius: 2, marginTop: 4, width: 60 }}>
                        <div style={{ height: 3, background: budgetPct > 90 ? "#ef4444" : "#f59e0b", borderRadius: 2, width: `${Math.min(budgetPct, 100)}%` }} />
                      </div>
                      <p style={{ color: "#334155", fontSize: 10, marginTop: 2 }}>{budgetPct.toFixed(0)}% used</p>
                    </td>
                    <td style={{ padding: "13px 12px", color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{formatCurrency(c.spend)}</td>
                    <td style={{ padding: "13px 12px", color: "#94a3b8", fontSize: 13 }}>{formatNumber(c.leads)}</td>
                    <td style={{ padding: "13px 12px", color: "#10b981", fontSize: 13, fontWeight: 700 }}>{c.conversions}</td>
                    <td style={{ padding: "13px 12px", color: "#64748b", fontSize: 12 }}>{formatCurrency(c.cpc)}</td>
                    <td style={{ padding: "13px 12px" }}>
                      <span style={{ color: c.cpa < 20 ? "#34d399" : c.cpa < 35 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 600 }}>
                        {c.cpa === 0 ? "—" : formatCurrency(c.cpa)}
                      </span>
                    </td>
                    <td style={{ padding: "13px 12px" }}>
                      <span style={{ color: c.roi > 200 ? "#34d399" : c.roi > 50 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 700 }}>
                        {c.roi === 0 ? "—" : `${c.roi}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* A/B Tests */}
      {tab === "abtests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {MOCK_AB_TESTS.map(test => {
            const rateA = ((test.conversions_a / test.visitors_a) * 100).toFixed(1);
            const rateB = ((test.conversions_b / test.visitors_b) * 100).toFixed(1);
            const lift = (((test.conversions_b / test.visitors_b) - (test.conversions_a / test.visitors_a)) / (test.conversions_a / test.visitors_a) * 100).toFixed(1);
            const st = STATUS_CONFIG[test.status];
            return (
              <div key={test.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>{test.name}</h3>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{st.label}</span>
                    </div>
                    <p style={{ color: "#334155", fontSize: 12 }}>Statistical confidence: <span style={{ color: test.confidence >= 95 ? "#34d399" : test.confidence >= 80 ? "#fbbf24" : "#f87171", fontWeight: 600 }}>{test.confidence}%</span> {test.confidence >= 95 ? "— Statistically significant" : test.confidence >= 80 ? "— Getting there" : "— Need more data"}</p>
                  </div>
                  {test.winner && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8 }}>
                      <CheckCircle size={14} color="#34d399" />
                      <span style={{ color: "#34d399", fontSize: 13, fontWeight: 700 }}>Variant {test.winner.toUpperCase()} wins (+{Math.abs(parseFloat(lift))}% lift)</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "A", name: test.variant_a, visitors: test.visitors_a, conversions: test.conversions_a, rate: rateA, isWinner: test.winner === "a" },
                    { label: "B", name: test.variant_b, visitors: test.visitors_b, conversions: test.conversions_b, rate: rateB, isWinner: test.winner === "b" },
                  ].map(v => (
                    <div key={v.label} style={{
                      padding: 16, borderRadius: 10,
                      background: v.isWinner ? "rgba(16,185,129,0.06)" : "#1a2235",
                      border: v.isWinner ? "1px solid rgba(16,185,129,0.2)" : "1px solid #2d3f5a",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 24, height: 24, borderRadius: "50%", background: v.isWinner ? "#10b981" : "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{v.label}</span>
                          <span style={{ color: v.isWinner ? "#34d399" : "#94a3b8", fontSize: 13, fontWeight: 600 }}>{v.name}</span>
                        </div>
                        {v.isWinner && <CheckCircle size={16} color="#34d399" />}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[
                          { label: "Visitors", value: formatNumber(v.visitors) },
                          { label: "Conversions", value: String(v.conversions) },
                          { label: "Conv. Rate", value: `${v.rate}%` },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: "center" }}>
                            <p style={{ color: "#334155", fontSize: 11 }}>{m.label}</p>
                            <p style={{ color: v.isWinner ? "#34d399" : "#e2e8f0", fontSize: 16, fontWeight: 700, marginTop: 2 }}>{m.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Email campaigns */}
      {tab === "email" && (
        <div style={card}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Email Campaign Performance</h3>
            <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Open rates, click rates, and conversions per email</p>
          </div>
          {MOCK_EMAIL_CAMPAIGNS.map((em, i) => {
            const openRate = ((em.opened / em.sent) * 100).toFixed(1);
            const clickRate = ((em.clicked / em.sent) * 100).toFixed(1);
            const convRate = ((em.conversions / em.sent) * 100).toFixed(2);
            return (
              <div key={em.id} style={{ padding: "16px 0", borderBottom: i < MOCK_EMAIL_CAMPAIGNS.length - 1 ? "1px solid #1a2235" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>{em.name}</p>
                    <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Sent {format(new Date(em.sent_at), "MMM d, yyyy")} · {formatNumber(em.sent)} recipients</p>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    {em.unsubscribed > 10 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={12} color="#f59e0b" />
                        <span style={{ color: "#fbbf24", fontSize: 12 }}>{em.unsubscribed} unsubs</span>
                      </div>
                    )}
                    <span style={{ color: "#10b981", fontSize: 13, fontWeight: 700 }}>{em.conversions} conversions</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {[
                    { label: "Open Rate", value: `${openRate}%`, pct: parseFloat(openRate), color: "#3b82f6", benchmark: "Benchmark: 25%" },
                    { label: "Click Rate", value: `${clickRate}%`, pct: parseFloat(clickRate) * 3, color: "#a855f7", benchmark: "Benchmark: 3%" },
                    { label: "Conv. Rate", value: `${convRate}%`, pct: parseFloat(convRate) * 20, color: "#10b981", benchmark: "Benchmark: 1%" },
                    { label: "Unsubscribes", value: String(em.unsubscribed), pct: (em.unsubscribed / em.sent) * 1000, color: "#f87171", benchmark: `${((em.unsubscribed / em.sent) * 100).toFixed(2)}% rate` },
                  ].map(m => (
                    <div key={m.label} style={{ padding: 12, background: "#1a2235", borderRadius: 8 }}>
                      <p style={{ color: "#475569", fontSize: 11, marginBottom: 4 }}>{m.label}</p>
                      <p style={{ color: m.color, fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{m.value}</p>
                      <div style={{ height: 4, background: "#0f1623", borderRadius: 2, marginBottom: 4 }}>
                        <div style={{ height: 4, background: m.color, borderRadius: 2, width: `${Math.min(m.pct, 100)}%` }} />
                      </div>
                      <p style={{ color: "#334155", fontSize: 10 }}>{m.benchmark}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
