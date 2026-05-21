"use client";

import { MOCK_STATS, MOCK_REVENUE, MOCK_ALERTS, MOCK_USERS, MOCK_HEALTH_SCORES, getHealthSummary } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Users, DollarSign, BarChart2, Activity,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  ArrowUpRight, Zap, Heart, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "20px" };
const tooltip = { backgroundColor: "#0f1623", border: "1px solid #1a2235", borderRadius: 8, color: "#f9fafb", fontSize: 12 };

function KpiCard({ label, value, sub, trend, trendUp, color = "#f43f5e", icon: Icon }: {
  label: string; value: string; sub?: string; trend?: string; trendUp?: boolean; color?: string; icon: React.ElementType;
}) {
  return (
    <div style={{ ...card, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, borderRadius: "0 0 0 80px", background: color + "08" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{label}</p>
          <p style={{ color: "#ffffff", fontSize: 26, fontWeight: 700, marginTop: 6, letterSpacing: "-0.02em" }}>{value}</p>
          {sub && <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{sub}</p>}
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              {trendUp ? <TrendingUp size={12} color="#34d399" /> : <TrendingDown size={12} color="#f87171" />}
              <span style={{ fontSize: 12, fontWeight: 600, color: trendUp ? "#34d399" : "#f87171" }}>{trend}</span>
              <span style={{ fontSize: 11, color: "#334155" }}>vs last month</span>
            </div>
          )}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={18} color={color} />
        </div>
      </div>
    </div>
  );
}

function AlertBanner({ alert }: { alert: typeof MOCK_ALERTS[0] }) {
  const colors = { error: "#ef4444", warning: "#f59e0b", info: "#3b82f6", success: "#10b981" };
  const icons = { error: AlertTriangle, warning: AlertTriangle, info: Zap, success: CheckCircle };
  const color = colors[alert.type];
  const Icon = icons[alert.type];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
      background: color + "10", border: `1px solid ${color}25`, borderRadius: 10, marginBottom: 8,
    }}>
      <Icon size={15} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{alert.title}</p>
        <p style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{alert.message}</p>
      </div>
      <span style={{ color: "#334155", fontSize: 11, flexShrink: 0 }}>
        {format(new Date(alert.timestamp), "h:mm a")}
      </span>
    </div>
  );
}

export default function OverviewPage() {
  const s = MOCK_STATS;
  const revenue14 = MOCK_REVENUE.slice(-14);
  const unreadAlerts = MOCK_ALERTS.filter(a => !a.read);
  const powerUsers = MOCK_USERS.filter(u => u.segment === "power").slice(0, 5);
  const atRiskUsers = MOCK_USERS.filter(u => u.segment === "at_risk");
  const costPerUser = s.claude_cost_month / s.paid_users;

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>Live</span>
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Overview</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>{format(new Date(), "EEEE, MMMM d yyyy")} · All metrics are real-time</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {unreadAlerts.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
              <AlertTriangle size={14} color="#f87171" />
              <span style={{ color: "#f87171", fontSize: 13, fontWeight: 600 }}>{unreadAlerts.length} active alerts</span>
            </div>
          )}
        </div>
      </div>

      {/* Active alerts */}
      {unreadAlerts.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          {unreadAlerts.slice(0, 3).map(a => <AlertBanner key={a.id} alert={a} />)}
        </div>
      )}

      {/* Revenue KPIs */}
      <p style={{ color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Revenue</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard label="MRR" value={formatCurrency(s.mrr)} sub={`ARR: ${formatCurrency(s.arr)}`} trend="+18.2%" trendUp icon={DollarSign} color="#10b981" />
        <KpiCard label="Today's Revenue" value={formatCurrency(s.revenue_today)} sub={`${((s.revenue_today / (s.mrr / 30)) * 100).toFixed(0)}% of daily avg`} icon={TrendingUp} color="#10b981" />
        <KpiCard label="Claude API Cost" value={formatCurrency(s.claude_cost_month)} sub={`$${costPerUser.toFixed(2)} per paid user`} trend="+12.4%" trendUp={false} icon={Activity} color="#f59e0b" />
        <KpiCard label="Net Profit" value={formatCurrency(s.net_profit_month)} sub={`${((s.net_profit_month / s.revenue_month) * 100).toFixed(1)}% margin`} trend="+22.1%" trendUp icon={ArrowUpRight} color="#10b981" />
      </div>

      {/* User KPIs */}
      <p style={{ color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Users</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Total Users" value={formatNumber(s.total_users)} sub={`+${s.new_users_today} today`} trend="+8.4%" trendUp icon={Users} color="#f43f5e" />
        <KpiCard label="Active Today" value={formatNumber(s.active_users_today)} sub={`${((s.active_users_today / s.total_users) * 100).toFixed(1)}% of total`} icon={Zap} color="#3b82f6" />
        <KpiCard label="Paid Users" value={formatNumber(s.paid_users)} sub={`${s.conversion_rate}% conversion rate`} trend="+5.2%" trendUp icon={Heart} color="#f43f5e" />
        <KpiCard label="At-Risk Users" value={String(atRiskUsers.length)} sub="Likely to churn soon" trend={`${s.churn_rate}% churn rate`} trendUp={false} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Usage KPIs */}
      <p style={{ color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Usage</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        <KpiCard label="Total Analyses" value={formatNumber(s.total_analyses)} sub="All time" icon={BarChart2} color="#a855f7" />
        <KpiCard label="Analyses Today" value={formatNumber(s.analyses_today)} sub={`vs ~${Math.round(s.analyses_month / 30)} avg/day`} icon={BarChart2} color="#a855f7" />
        <KpiCard label="Cost Per Analysis" value={`$${s.cost_per_analysis.toFixed(3)}`} sub="Claude API cost" icon={Activity} color="#f59e0b" />
        <KpiCard label="Break-even Users" value={String(s.break_even_users)} sub={`You have ${s.paid_users} paid — ${s.paid_users - s.break_even_users} above break-even`} icon={CheckCircle} color="#10b981" />
      </div>

      {/* Charts + Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Revenue chart */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Revenue vs Cost (14 days)</h3>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Daily trend · hover for details</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 3, background: "#10b981", borderRadius: 2 }} /><span style={{ color: "#475569" }}>Revenue</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 3, background: "#f59e0b", borderRadius: 2 }} /><span style={{ color: "#475569" }}>Cost</span></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue14}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="cost" name="Cost" stroke="#f59e0b" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency metrics */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Business Health</h3>
          {[
            { label: "Profit Margin", value: `${((s.net_profit_month / s.mrr) * 100).toFixed(1)}%`, pct: (s.net_profit_month / s.mrr) * 100, color: "#10b981", target: "Target: 70%" },
            { label: "Cost Ratio", value: `${((s.claude_cost_month / s.mrr) * 100).toFixed(1)}%`, pct: (s.claude_cost_month / s.mrr) * 100, color: "#f59e0b", target: "Target: <25%" },
            { label: "Conversion Rate", value: `${s.conversion_rate}%`, pct: s.conversion_rate, color: "#3b82f6", target: "Target: 30%" },
            { label: "Churn Rate", value: `${s.churn_rate}%`, pct: Math.min(s.churn_rate * 10, 100), color: "#ef4444", target: "Target: <3%" },
          ].map((m) => (
            <div key={m.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>{m.label}</span>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{m.value}</span>
                  <p style={{ color: "#334155", fontSize: 10 }}>{m.target}</p>
                </div>
              </div>
              <div style={{ height: 6, background: "#1a2235", borderRadius: 3 }}>
                <div style={{ height: 6, background: m.color, borderRadius: 3, width: `${Math.min(m.pct, 100)}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top users + Recent signups */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top power users */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Top Users by Usage</h3>
            <span style={{ color: "#f43f5e", fontSize: 12, fontWeight: 600 }}>This month</span>
          </div>
          {powerUsers.map((u, i) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ color: "#334155", fontSize: 13, width: 16, textAlign: "center" }}>{i + 1}</span>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a2235", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#f43f5e", fontSize: 13, fontWeight: 700 }}>{u.display_name[0]}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{u.display_name}</p>
                <p style={{ color: "#334155", fontSize: 11 }}>{u.subscription_tier} · {u.total_analyses} analyses</p>
              </div>
              <span style={{ color: "#10b981", fontSize: 12, fontWeight: 600 }}>{formatCurrency(u.revenue_generated)}</span>
            </div>
          ))}
        </div>

        {/* At-risk users */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>At-Risk Users</h3>
            <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>Likely to churn</span>
          </div>
          {atRiskUsers.map((u) => {
            const daysSince = Math.round((Date.now() - new Date(u.last_active).getTime()) / 86400000);
            return (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#f87171", fontSize: 13, fontWeight: 700 }}>{u.display_name[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{u.display_name}</p>
                  <p style={{ color: "#334155", fontSize: 11 }}>Inactive {daysSince} days · {u.subscription_tier}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={11} color="#f87171" />
                  <span style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>{daysSince}d</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 8 }}>
            <p style={{ color: "#64748b", fontSize: 12 }}>💡 Consider sending a re-engagement email to these users</p>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER HEALTH SCORE (Month 1 Addition) ── */}
      {(() => {
        const health = getHealthSummary(MOCK_HEALTH_SCORES);
        const redUsers = MOCK_HEALTH_SCORES.filter(s => s.tier === "red");
        const interventions = [
          { color: "#ef4444", msg: `${redUsers.length} Red users inactive 12+ days — send win-back email now` },
          { color: "#f59e0b", msg: `${MOCK_HEALTH_SCORES.filter(s=>s.tier==="yellow").length} Yellow users stable — check again next week` },
          { color: "#10b981", msg: `${MOCK_HEALTH_SCORES.filter(s=>s.tier==="green").length} Green users healthy — consider upsell to Premium` },
        ];
        return (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>Customer Health Scores</h2>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Composite 0–100 score per user · enables proactive churn intervention before users leave</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20 }}>
              <div style={card}>
                <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Health Distribution</h3>
                {[
                  { label: "Healthy (67–100)", count: health.green,  pct: health.greenPct,  color: "#10b981", action: "Upsell opportunity" },
                  { label: "Stable (34–66)",   count: health.yellow, pct: health.yellowPct, color: "#f59e0b", action: "Monitor weekly" },
                  { label: "At-Risk (0–33)",   count: health.red,    pct: health.redPct,    color: "#ef4444", action: "Intervene now" },
                ].map(seg => (
                  <div key={seg.label} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div>
                        <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{seg.label}</p>
                        <p style={{ color: "#334155", fontSize: 11 }}>{seg.action}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: seg.color, fontSize: 20, fontWeight: 700, lineHeight: 1 }}>{seg.count}</p>
                        <p style={{ color: "#334155", fontSize: 11 }}>{seg.pct}%</p>
                      </div>
                    </div>
                    <div style={{ height: 8, background: "#1a2235", borderRadius: 4 }}>
                      <div style={{ height: 8, background: seg.color, borderRadius: 4, width: `${seg.pct}%` }} />
                    </div>
                    {seg.color === "#ef4444" && health.redPct > 15 && (
                      <p style={{ color: "#f87171", fontSize: 11, marginTop: 4, fontWeight: 600 }}>⚠ Exceeds 15% alert threshold</p>
                    )}
                  </div>
                ))}
                <div style={{ paddingTop: 16, borderTop: "1px solid #1a2235" }}>
                  <p style={{ color: "#475569", fontSize: 11, marginBottom: 8, fontWeight: 600 }}>SCORE WEIGHTS</p>
                  {[["Engagement","40%"],["Usage Intensity","25%"],["Feature Breadth","15%"],["Payment Health","10%"],["Satisfaction","10%"]].map(([l,w]) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: "#475569", fontSize: 11 }}>{l}</span>
                      <span style={{ color: "#f43f5e", fontSize: 11, fontWeight: 700 }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={card}>
                  <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Suggested Interventions</h3>
                  {interventions.map((iv, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: iv.color + "08", border: `1px solid ${iv.color}20`, borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: iv.color, flexShrink: 0, marginTop: 4 }} />
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>{iv.msg}</p>
                    </div>
                  ))}
                </div>

                <div style={card}>
                  <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>At-Risk Score Breakdown</h3>
                  {redUsers.slice(0, 3).map((s, i) => (
                    <div key={s.user_id} style={{ marginBottom: i < 2 ? 16 : 0, paddingBottom: i < 2 ? 16 : 0, borderBottom: i < 2 ? "1px solid #1a2235" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#f87171", fontSize: 12, fontWeight: 700 }}>U{i+1}</span>
                          </div>
                          <div>
                            <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>At-Risk User {i+1}</p>
                            <p style={{ color: "#334155", fontSize: 11 }}>Inactive {s.days_since_active} days</p>
                          </div>
                        </div>
                        <div style={{ padding: "4px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>
                          <span style={{ color: "#f87171", fontSize: 16, fontWeight: 800 }}>{s.score}</span>
                          <span style={{ color: "#475569", fontSize: 10 }}>/100</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                        {([["Engage", s.engagement],["Usage", s.usage_intensity],["Features", s.feature_breadth],["Payment", s.payment_health],["Satisfy", s.satisfaction]] as [string,number][]).map(([label, val]) => (
                          <div key={label} style={{ textAlign: "center" }}>
                            <div style={{ height: 4, background: "#1a2235", borderRadius: 2, marginBottom: 3 }}>
                              <div style={{ height: 4, background: val < 30 ? "#ef4444" : val < 60 ? "#f59e0b" : "#10b981", borderRadius: 2, width: `${val}%` }} />
                            </div>
                            <p style={{ color: "#334155", fontSize: 9 }}>{label}</p>
                            <p style={{ color: val < 30 ? "#f87171" : "#64748b", fontSize: 11, fontWeight: 600 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
