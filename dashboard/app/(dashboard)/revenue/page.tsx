"use client";

import { useState } from "react";
import { MOCK_REVENUE, MOCK_STATS, MOCK_SUBSCRIPTION_TIERS, MOCK_API_COSTS, getApiCostStats, computeSensitivityGrid } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Activity, ArrowUpRight, Target } from "lucide-react";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, LineChart,
} from "recharts";
import { format } from "date-fns";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };
const tooltip = { backgroundColor: "#0f1623", border: "1px solid #1a2235", borderRadius: 8, color: "#f9fafb", fontSize: 12 };

function KpiCard({ label, value, sub, trend, trendUp, color = "#10b981", icon: Icon }: {
  label: string; value: string; sub?: string; trend?: string; trendUp?: boolean; color?: string; icon: React.ElementType;
}) {
  return (
    <div style={{ ...card, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "0 0 0 60px", background: color + "0a" }} />
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

export default function RevenuePage() {
  const [period, setPeriod] = useState(30);
  const s = MOCK_STATS;
  const data = MOCK_REVENUE.slice(-period);

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalCost = data.reduce((sum, d) => sum + d.cost, 0);
  const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);
  const avgDaily = totalRevenue / period;
  const projectedMonthly = avgDaily * 30;
  const revenueGrowth = ((data[data.length - 1].mrr - data[0].mrr) / data[0].mrr * 100).toFixed(1);

  // MRR growth chart (last 30 days)
  const mrrData = MOCK_REVENUE.slice(-30).map(d => ({ date: d.date, mrr: d.mrr }));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Revenue</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Financial performance · last updated {format(new Date(), "h:mm a")}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ label: "7d", days: 7 }, { label: "30d", days: 30 }, { label: "90d", days: 90 }].map((p) => (
            <button key={p.days} onClick={() => setPeriod(p.days)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
              background: period === p.days ? "#f43f5e" : "#1a2235",
              color: period === p.days ? "#ffffff" : "#475569",
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <KpiCard label="MRR" value={formatCurrency(s.mrr)} sub={`Growing at ${s.mrr_growth_rate}%/mo`} trend={`+${s.mrr_growth_rate}%`} trendUp icon={DollarSign} />
        <KpiCard label="ARR" value={formatCurrency(s.arr)} sub="Annualized run rate" trend="+18.2%" trendUp icon={Target} />
        <KpiCard label="Net Profit" value={formatCurrency(s.net_profit_month)} sub={`${((s.net_profit_month / s.mrr) * 100).toFixed(1)}% margin`} trend="+22.1%" trendUp icon={ArrowUpRight} />
        <KpiCard label="ARPU" value={formatCurrency(s.avg_revenue_per_user)} sub="Avg revenue per paid user" trend="+3.2%" trendUp icon={TrendingUp} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <KpiCard label="Period Revenue" value={formatCurrency(totalRevenue)} sub={`${period}-day total`} icon={DollarSign} />
        <KpiCard label="Avg Daily Revenue" value={formatCurrency(avgDaily)} sub="This period" icon={Activity} />
        <KpiCard label="Claude API Cost" value={formatCurrency(totalCost)} sub={`${((totalCost / totalRevenue) * 100).toFixed(1)}% of revenue`} icon={Activity} color="#f59e0b" trend="+12.4%" trendUp={false} />
        <KpiCard label="Projected Monthly" value={formatCurrency(projectedMonthly)} sub="Based on current avg" icon={TrendingUp} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Revenue · Cost · Profit</h3>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Daily breakdown · {period} days</p>
            </div>
            <div style={{ padding: "4px 10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 6 }}>
              <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>+{revenueGrowth}% growth</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} interval={Math.floor(period / 7)} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ color: "#475569", fontSize: 12 }} />
              <Bar dataKey="revenue" name="Revenue" fill="#10b981" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar dataKey="cost" name="Claude Cost" fill="#f59e0b" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Line dataKey="profit" name="Net Profit" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* MRR Growth */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>MRR Growth</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Monthly recurring revenue trend</p>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={mrrData}>
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip contentStyle={tooltip} formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="mrr" name="MRR" stroke="#10b981" strokeWidth={2} fill="url(#mrrGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1a2235" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#475569", fontSize: 12 }}>Current MRR</span>
              <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{formatCurrency(s.mrr)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: "#475569", fontSize: 12 }}>MRR Growth Rate</span>
              <span style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>+{s.mrr_growth_rate}%/mo</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#475569", fontSize: 12 }}>Projected Next Month</span>
              <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{formatCurrency(s.mrr * (1 + s.mrr_growth_rate / 100))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription tiers table */}
      <div style={card}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Revenue by Subscription Tier</h3>
          <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Breakdown of users, MRR, ARPU, and churn per tier</p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a2235" }}>
              {["Tier", "Users", "MRR", "ARPU", "% of MRR", "Churn Rate", "Growth Rate"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_SUBSCRIPTION_TIERS.map((tier, i) => {
              const totalMrr = MOCK_SUBSCRIPTION_TIERS.reduce((s, t) => s + t.mrr, 0);
              const pct = totalMrr > 0 ? ((tier.mrr / totalMrr) * 100).toFixed(1) : "0";
              const colors = ["#4b5563", "#3b82f6", "#f43f5e"];
              return (
                <tr key={tier.name} style={{ borderBottom: i < MOCK_SUBSCRIPTION_TIERS.length - 1 ? "1px solid #1a2235" : "none" }}>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors[i] }} />
                      <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{tier.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px", color: "#94a3b8", fontSize: 13 }}>{formatNumber(tier.users)}</td>
                  <td style={{ padding: "14px 12px", color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{formatCurrency(tier.mrr)}</td>
                  <td style={{ padding: "14px 12px", color: "#94a3b8", fontSize: 13 }}>{formatCurrency(tier.arpu)}</td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: "#1a2235", borderRadius: 2 }}>
                        <div style={{ height: 4, background: colors[i], borderRadius: 2, width: `${pct}%` }} />
                      </div>
                      <span style={{ color: "#94a3b8", fontSize: 12, width: 36 }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <span style={{ color: tier.churn_rate > 4 ? "#f87171" : tier.churn_rate > 2 ? "#fbbf24" : "#34d399", fontSize: 13, fontWeight: 600 }}>{tier.churn_rate}%</span>
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <TrendingUp size={12} color="#34d399" />
                      <span style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>+{tier.growth_rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── UNIT ECONOMICS SENSITIVITY GRID (Month 1 Addition) ── */}
      {(() => {
        const grid = computeSensitivityGrid(MOCK_STATS.avg_revenue_per_user);
        const cacs = [8, 10, 12];
        return (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>Unit Economics Sensitivity</h2>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>How net LTV changes as churn and CAC vary — shows how fragile your margins really are</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              {/* 3x3 grid */}
              <div style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>LTV − CAC Grid</h3>
                    <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>{"Green = strong (>$100) · Yellow = acceptable ($60–100) · Red = at risk (<$60)"}</p>
                  </div>
                  <div style={{ padding: "6px 12px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8 }}>
                    <p style={{ color: "#475569", fontSize: 11 }}>Current ARPU</p>
                    <p style={{ color: "#f43f5e", fontSize: 14, fontWeight: 700 }}>${MOCK_STATS.avg_revenue_per_user}/mo</p>
                  </div>
                </div>
                {/* Header row */}
                <div style={{ display: "grid", gridTemplateColumns: "100px repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
                  <div />
                  {cacs.map(c => (
                    <div key={c} style={{ textAlign: "center", padding: "8px", background: "#1a2235", borderRadius: 8 }}>
                      <p style={{ color: "#475569", fontSize: 10 }}>CAC</p>
                      <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>${c}</p>
                    </div>
                  ))}
                </div>
                {/* Grid rows */}
                {grid.map(row => (
                  <div key={row.churn} style={{ display: "grid", gridTemplateColumns: "100px repeat(3, 1fr)", gap: 8, marginBottom: 8 }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "8px 12px", background: "#1a2235", borderRadius: 8 }}>
                      <p style={{ color: "#475569", fontSize: 10 }}>Churn</p>
                      <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700 }}>{row.churn}</p>
                    </div>
                    {row.values.map(cell => {
                      const bg    = cell.netLtv >= 100 ? "rgba(16,185,129,0.15)" : cell.netLtv >= 60 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";
                      const color = cell.netLtv >= 100 ? "#34d399" : cell.netLtv >= 60 ? "#fbbf24" : "#f87171";
                      const isCurrent = row.churn === "10%" && cell.cac === 10;
                      return (
                        <div key={cell.cac} style={{ padding: "12px 8px", background: bg, borderRadius: 10, textAlign: "center", border: isCurrent ? `2px solid ${color}` : "1px solid transparent", position: "relative" }}>
                          {isCurrent && <div style={{ position: "absolute", top: 4, right: 6, fontSize: 9, color, fontWeight: 700 }}>NOW</div>}
                          <p style={{ color, fontSize: 20, fontWeight: 800 }}>${cell.netLtv}</p>
                          <p style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>LTV: ${cell.ltv}</p>
                          <p style={{ color: "#334155", fontSize: 10 }}>Payback: {cell.payback}mo</p>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(244,63,94,0.06)", border: "1px solid rgba(244,63,94,0.12)", borderRadius: 10 }}>
                  <p style={{ color: "#94a3b8", fontSize: 12 }}>
                    ⚡ <strong style={{ color: "#f43f5e" }}>Risk scenario:</strong> If churn hits 12% + CAC rises to $12, net LTV drops to ${computeSensitivityGrid(MOCK_STATS.avg_revenue_per_user)[2].values[2].netLtv} — margins collapse. Monitor both metrics closely.
                  </p>
                </div>
              </div>

              {/* Breakeven tracker */}
              <div style={card}>
                <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Breakeven Tracker</h3>
                {[
                  { label: "Current paid users", value: MOCK_STATS.paid_users, color: "#f43f5e" },
                  { label: "Breakeven required", value: MOCK_STATS.break_even_users, color: "#475569" },
                  { label: "Above breakeven", value: MOCK_STATS.paid_users - MOCK_STATS.break_even_users, color: "#10b981" },
                ].map(m => (
                  <div key={m.label} style={{ marginBottom: 20 }}>
                    <p style={{ color: "#475569", fontSize: 12 }}>{m.label}</p>
                    <p style={{ color: m.color, fontSize: 26, fontWeight: 800, marginTop: 4 }}>{m.value}</p>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 10, marginTop: 4 }}>
                  <p style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>✓ {MOCK_STATS.paid_users - MOCK_STATS.break_even_users} users above breakeven</p>
                  <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>Safety buffer: {Math.round(((MOCK_STATS.paid_users - MOCK_STATS.break_even_users) / MOCK_STATS.break_even_users) * 100)}% above minimum</p>
                </div>
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #1a2235" }}>
                  <p style={{ color: "#475569", fontSize: 12, marginBottom: 12 }}>If churn worsens to 12%:</p>
                  <p style={{ color: "#475569", fontSize: 12 }}>New breakeven</p>
                  <p style={{ color: "#f87171", fontSize: 22, fontWeight: 700 }}>{Math.round(MOCK_STATS.break_even_users * 1.4)} users</p>
                  <p style={{ color: "#334155", fontSize: 11, marginTop: 4 }}>+{Math.round(MOCK_STATS.break_even_users * 0.4)} more users needed</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── CLAUDE API COST FORECASTING (Month 1 Addition) ── */}
      {(() => {
        const costStats = getApiCostStats(MOCK_API_COSTS, 1000);
        const last90 = MOCK_API_COSTS.slice(-90);
        const last30Cost = MOCK_API_COSTS.slice(-30);
        return (
          <div style={{ marginTop: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>Claude API Cost Forecasting</h2>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Largest variable cost tracked in real-time — one model price change from Anthropic can drop margin 20% overnight</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
              {[
                { label: "Month-to-Date Cost", value: `$${costStats.mtdCost.toFixed(0)}`, sub: "Actual spend so far", color: "#f59e0b" },
                { label: "Projected Month-End", value: `$${costStats.projected.toFixed(0)}`, sub: costStats.overBudget ? `⚠ $${(costStats.projected - costStats.monthlyBudget).toFixed(0)} over budget` : `✓ Within $${costStats.monthlyBudget} budget`, color: costStats.overBudget ? "#ef4444" : "#10b981" },
                { label: "Avg Cost / Analysis", value: `$${costStats.avgCostPerAnalysis.toFixed(4)}`, sub: "Last 30 days", color: "#f43f5e" },
                { label: "Cache Hit Rate", value: `${(costStats.avgCacheHit * 100).toFixed(1)}%`, sub: "Low → increase to save costs", color: "#3b82f6" },
              ].map(kpi => (
                <div key={kpi.label} style={{ ...card }}>
                  <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
                  <p style={{ color: kpi.color, fontSize: 24, fontWeight: 700, marginTop: 6 }}>{kpi.value}</p>
                  <p style={{ color: kpi.color === "#ef4444" ? "#f87171" : kpi.color === "#10b981" ? "#34d399" : "#334155", fontSize: 12, marginTop: 3 }}>{kpi.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              {/* Cost per analysis trend */}
              <div style={card}>
                <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Cost Per Analysis Trend (90 days)</h3>
                <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Upward trend is a warning — if reaching $0.006+, investigate model pricing or conversation length</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={last90}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
                    <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => v.slice(5)} interval={14} />
                    <YAxis tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(4)}`} />
                    <Tooltip contentStyle={tooltip} formatter={(v) => `$${Number(v).toFixed(4)}`} />
                    <Line dataKey="cost_per_analysis" name="$/analysis" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Efficiency levers */}
              <div style={card}>
                <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 20 }}>Efficiency Levers</h3>
                {[
                  {
                    label: "Increase Cache Hit Rate",
                    current: `${(costStats.avgCacheHit * 100).toFixed(0)}%`,
                    target: "40%",
                    saving: `~$${Math.round((0.40 - costStats.avgCacheHit) * MOCK_STATS.analyses_month * costStats.avgCostPerAnalysis)}/mo`,
                    color: "#3b82f6",
                  },
                  {
                    label: "Reduce Free Tier Limit",
                    current: "3/day",
                    target: "2/day",
                    saving: `~$${Math.round(MOCK_STATS.free_users * 30 * costStats.avgCostPerAnalysis)}/mo`,
                    color: "#a855f7",
                    note: "Est. +1-2% churn",
                  },
                  {
                    label: "Use Haiku for Free Tier",
                    current: "Opus (all)",
                    target: "Haiku (free)",
                    saving: `~$${Math.round(MOCK_STATS.free_users * 3 * 30 * (costStats.avgCostPerAnalysis - 0.0002))}/mo`,
                    color: "#10b981",
                    note: "~5% quality drop",
                  },
                ].map(lever => (
                  <div key={lever.label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1a2235" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{lever.label}</p>
                        <p style={{ color: "#334155", fontSize: 11, marginTop: 2 }}>{lever.current} → {lever.target}</p>
                        {lever.note && <p style={{ color: "#f59e0b", fontSize: 10, marginTop: 2 }}>⚠ {lever.note}</p>}
                      </div>
                      <div style={{ padding: "4px 10px", background: lever.color + "15", border: `1px solid ${lever.color}30`, borderRadius: 8, textAlign: "right" }}>
                        <p style={{ color: "#334155", fontSize: 9 }}>Saves</p>
                        <p style={{ color: lever.color, fontSize: 13, fontWeight: 700 }}>{lever.saving}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 4 }}>
                  <p style={{ color: "#475569", fontSize: 11, marginBottom: 12, fontWeight: 600 }}>MODEL COMPARISON</p>
                  {[
                    ["Claude Opus 4.7",  "$0.030", "Best",  "#f43f5e", "Premium users"],
                    ["Claude Sonnet 4.6","$0.006",  "Great", "#3b82f6", "Monthly users"],
                    ["Claude Haiku 4.5", "$0.0002", "Good",  "#10b981", "Free tier"],
                  ].map(([model, cost, quality, color, rec]) => (
                    <div key={model} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <div>
                        <p style={{ color: "#94a3b8", fontSize: 11 }}>{model}</p>
                        <p style={{ color: "#334155", fontSize: 10 }}>{rec}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color, fontSize: 12, fontWeight: 700 }}>{cost}</p>
                        <p style={{ color: "#334155", fontSize: 10 }}>{quality}</p>
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
