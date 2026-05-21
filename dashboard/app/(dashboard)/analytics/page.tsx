"use client";

import { MOCK_ANALYTICS, MOCK_STATS, MOCK_FUNNEL, MOCK_RESPONSE_MODES, MOCK_COHORTS } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { Activity, BarChart2, Users, TrendingUp, ArrowRight } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine,
} from "recharts";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };
const tooltip = { backgroundColor: "#0f1623", border: "1px solid #1a2235", borderRadius: 8, color: "#f9fafb", fontSize: 12 };
const TIER_COLORS = ["#4b5563", "#3b82f6", "#f43f5e"];
const MODE_COLORS: Record<string, string> = {
  Witty: "#3b82f6", Casual: "#10b981", Sincere: "#f43f5e",
  Confident: "#f59e0b", Thoughtful: "#a855f7",
};

function KpiCard({ label, value, sub, icon: Icon, color = "#f43f5e" }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color?: string;
}) {
  return (
    <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{label}</p>
        <p style={{ color: "#ffffff", fontSize: 24, fontWeight: 700, marginTop: 6 }}>{value}</p>
        {sub && <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{sub}</p>}
      </div>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color={color} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const analytics = MOCK_ANALYTICS;
  const stats = MOCK_STATS;
  const peakHour = analytics.hourly_usage.reduce((max, h) => h.count > max.count ? h : max, analytics.hourly_usage[0]);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Analytics</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>User behaviour, engagement, and product usage metrics</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        <KpiCard label="DAU / MAU Ratio" value={`${((stats.active_users_today / stats.active_users_month) * 100).toFixed(1)}%`} sub="Engagement health (higher = better)" icon={Activity} color="#3b82f6" />
        <KpiCard label="Avg Analyses / User" value={(stats.total_analyses / stats.total_users).toFixed(1)} sub="All time — higher = more engaged" icon={BarChart2} color="#a855f7" />
        <KpiCard label="Conversion Rate" value={`${stats.conversion_rate}%`} sub="Free → Paid (industry avg: 2-5%)" icon={TrendingUp} color="#10b981" />
        <KpiCard label="Peak Activity" value={`${peakHour.hour}:00`} sub={`${peakHour.count} analyses · best time to send push`} icon={Users} color="#f43f5e" />
      </div>

      {/* Conversion Funnel */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Conversion Funnel</h3>
          <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>How users progress from signup to paid — identify where you lose them</p>
        </div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          {MOCK_FUNNEL.map((stage, i) => {
            const isLast = i === MOCK_FUNNEL.length - 1;
            const barHeight = Math.max(40, (stage.rate / 100) * 180);
            const dropColor = stage.drop_off > 20 ? "#ef4444" : stage.drop_off > 10 ? "#f59e0b" : "#10b981";
            return (
              <div key={stage.stage} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: 200 }}>
                  <p style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{formatNumber(stage.count)}</p>
                  <div style={{
                    width: "70%",
                    height: barHeight,
                    background: i === 0 ? "#f43f5e" : i === MOCK_FUNNEL.length - 1 ? "#10b981" : `rgba(244,63,94,${0.8 - i * 0.12})`,
                    borderRadius: "6px 6px 0 0",
                    position: "relative",
                  }} />
                </div>
                <div style={{ width: "100%", textAlign: "center", padding: "12px 4px 0", borderTop: "1px solid #1a2235" }}>
                  <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>{stage.stage}</p>
                  <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700 }}>{stage.rate.toFixed(1)}%</p>
                  {stage.drop_off > 0 && (
                    <p style={{ color: dropColor, fontSize: 10, marginTop: 2 }}>-{stage.drop_off.toFixed(1)}% drop</p>
                  )}
                </div>
                {!isLast && (
                  <div style={{ position: "absolute", color: "#334155" }}>
                    <ArrowRight size={12} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ padding: "8px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 8 }}>
            <p style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>✓ Strong: Signup → First Analysis (69.4%)</p>
          </div>
          <div style={{ padding: "8px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8 }}>
            <p style={{ color: "#f87171", fontSize: 12, fontWeight: 600 }}>⚠ Weak: First Analysis → 3+ Analyses (27.1% drop)</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* DAU chart */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Daily Active Users</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Last 30 days</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={analytics.daily_active_users}>
              <defs>
                <linearGradient id="dauG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="date" tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} interval={4} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} />
              <Area type="monotone" dataKey="count" name="Active Users" stroke="#3b82f6" strokeWidth={2} fill="url(#dauG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly usage */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Hourly Usage Pattern</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>When users are most active · use this for push notification timing</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={analytics.hourly_usage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="hour" tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(h) => `${h}h`} interval={3} />
              <YAxis tick={{ fill: "#334155", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltip} labelStyle={{ color: "#94a3b8" }} labelFormatter={(h) => `${h}:00`} />
              <Bar dataKey="count" name="Analyses" fill="#f43f5e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Response mode popularity */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Response Mode Popularity</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Which AI response styles users prefer most</p>
          {MOCK_RESPONSE_MODES.map((m) => (
            <div key={m.mode} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: MODE_COLORS[m.mode] }} />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{m.mode}</span>
                  <span style={{ color: "#334155", fontSize: 11 }}>avg {(m.avg_confidence * 100).toFixed(0)}% confidence</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{m.percentage}%</span>
                  <span style={{ color: "#334155", fontSize: 11, marginLeft: 6 }}>{formatNumber(m.count)}</span>
                </div>
              </div>
              <div style={{ height: 6, background: "#1a2235", borderRadius: 3 }}>
                <div style={{ height: 6, background: MODE_COLORS[m.mode], borderRadius: 3, width: `${m.percentage}%` }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.12)", borderRadius: 8 }}>
            <p style={{ color: "#93c5fd", fontSize: 12 }}>💡 Witty & Casual modes are most popular — consider promoting them in onboarding</p>
          </div>
        </div>

        {/* Tier distribution + retention */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>User Tier Distribution</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <PieChart width={120} height={120}>
                <Pie data={analytics.tier_distribution} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="count" strokeWidth={0}>
                  {analytics.tier_distribution.map((_, i) => <Cell key={i} fill={TIER_COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div style={{ flex: 1 }}>
                {analytics.tier_distribution.map((t, i) => (
                  <div key={t.tier} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: TIER_COLORS[i] }} />
                        <span style={{ color: "#94a3b8", fontSize: 12, textTransform: "capitalize" }}>{t.tier}</span>
                      </div>
                      <span style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{t.percentage}%</span>
                    </div>
                    <div style={{ height: 3, background: "#1a2235", borderRadius: 2 }}>
                      <div style={{ height: 3, background: TIER_COLORS[i], borderRadius: 2, width: `${t.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>7-Day Retention</h3>
            {[
              { day: "Day 1", pct: 68, color: "#10b981" },
              { day: "Day 3", pct: 45, color: "#3b82f6" },
              { day: "Day 7", pct: 31, color: "#f59e0b" },
              { day: "Day 30", pct: 18, color: "#f43f5e" },
            ].map((r) => (
              <div key={r.day} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span style={{ color: "#475569", fontSize: 12, width: 44 }}>{r.day}</span>
                <div style={{ flex: 1, height: 8, background: "#1a2235", borderRadius: 4 }}>
                  <div style={{ height: 8, background: r.color, borderRadius: 4, width: `${r.pct}%` }} />
                </div>
                <span style={{ color: r.pct > 50 ? "#34d399" : r.pct > 25 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 700, width: 36 }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COHORT RETENTION TABLE (Month 1 Addition) ── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700 }}>Cohort Retention</h2>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>
            What % of each monthly signup cohort is still active — reveals product stickiness before revenue reports show the problem
          </p>
        </div>

        {/* Retention Table */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>Retention by Cohort</h3>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>Color: green (healthy 40%+) · yellow (watch 20–40%) · red (critical &lt;20%)</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12 }}>
              {[["#10b981","40%+"],["#f59e0b","20–40%"],["#ef4444","<20%"]].map(([c,l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                  <span style={{ color: "#475569" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #1a2235" }}>
                {["Cohort","Size","Week 1","Week 2","Week 4","Month 2","Month 3","Payback"].map(h => (
                  <th key={h} style={{ textAlign: h==="Cohort"?"left":"center", padding: "8px 12px", color: "#334155", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_COHORTS.map((row, i) => {
                const cell = (val: number | null) => {
                  if (val === null) return <td key={Math.random()} style={{ textAlign: "center", padding: "12px 8px" }}><span style={{ color: "#1e3a5f", fontSize: 12 }}>—</span></td>;
                  const bg    = val >= 40 ? "rgba(16,185,129,0.15)" : val >= 20 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";
                  const color = val >= 40 ? "#34d399" : val >= 20 ? "#fbbf24" : "#f87171";
                  return (
                    <td key={val} style={{ textAlign: "center", padding: "12px 8px" }}>
                      <span style={{ background: bg, color, fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                        {val === 100 ? "100%" : `${val}%`}
                      </span>
                    </td>
                  );
                };
                return (
                  <tr key={row.month} style={{ borderBottom: i < MOCK_COHORTS.length-1 ? "1px solid #1a2235" : "none" }}>
                    <td style={{ padding: "12px 12px", color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{row.month}</td>
                    <td style={{ textAlign: "center", padding: "12px 8px", color: "#475569", fontSize: 12 }}>{row.size}</td>
                    {cell(row.week1)}{cell(row.week2)}{cell(row.week4)}{cell(row.month2)}{cell(row.month3)}
                    <td style={{ textAlign: "center", padding: "12px 8px" }}>
                      {row.payback_months > 0
                        ? <span style={{ color: row.payback_months < 3 ? "#34d399" : row.payback_months < 4 ? "#fbbf24" : "#f87171", fontSize: 13, fontWeight: 600 }}>{row.payback_months}mo</span>
                        : <span style={{ color: "#1e3a5f", fontSize: 12 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ padding: "8px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 8 }}>
              <span style={{ color: "#34d399", fontSize: 12, fontWeight: 500 }}>✓ Best: Jan 2026 — 48% at Week 4 (industry benchmark: 40%)</span>
            </div>
            <div style={{ padding: "8px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8 }}>
              <span style={{ color: "#fbbf24", fontSize: 12, fontWeight: 500 }}>⚠ Feb 2026 dropped to 42% — monitor for continued decline</span>
            </div>
          </div>
        </div>

        {/* Retention Curves */}
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Retention Curves by Cohort</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Dashed line = 40% industry benchmark · curves above it = strong stickiness</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={[
              { period: "Wk 1",  "Nov 2025": 72, "Dec 2025": 69, "Jan 2026": 71, "Feb 2026": 68, "Mar 2026": 65, benchmark: 70 },
              { period: "Wk 2",  "Nov 2025": 48, "Dec 2025": 45, "Jan 2026": 48, "Feb 2026": 42, "Mar 2026": null, benchmark: 50 },
              { period: "Wk 4",  "Nov 2025": 34, "Dec 2025": 31, "Jan 2026": 33, "Feb 2026": null, "Mar 2026": null, benchmark: 40 },
              { period: "Mo 2",  "Nov 2025": 28, "Dec 2025": 24, "Jan 2026": null, "Feb 2026": null, "Mar 2026": null, benchmark: 30 },
              { period: "Mo 3",  "Nov 2025": null, "Dec 2025": null, "Jan 2026": null, "Feb 2026": null, "Mar 2026": null, benchmark: 22 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="period" tick={{ fill: "#334155", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#334155", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip contentStyle={tooltip} formatter={(v) => `${v}%`} />
              <ReferenceLine y={40} stroke="#334155" strokeDasharray="6 3" />
              {([["Nov 2025","#f43f5e"],["Dec 2025","#f97316"],["Jan 2026","#10b981"],["Feb 2026","#3b82f6"],["Mar 2026","#a855f7"]] as [string,string][]).map(([month, color]) => (
                <Line key={month} dataKey={month} name={month} stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} connectNulls={false} />
              ))}
              <Line dataKey="benchmark" name="40% Benchmark" stroke="#334155" strokeWidth={1} strokeDasharray="6 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
