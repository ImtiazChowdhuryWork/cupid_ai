"use client";

import { useState } from "react";
import { MOCK_STATS, generateForecast } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TrendingUp, Users, DollarSign, Target, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from "recharts";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px" };
const tooltip = { backgroundColor: "#0f1623", border: "1px solid #1a2235", borderRadius: 8, color: "#f9fafb", fontSize: 12 };

type Scenario = "conservative" | "realistic" | "optimistic";

const SCENARIO_GROWTH: Record<Scenario, { monthly: number; label: string; color: string; description: string }> = {
  conservative: { monthly: 8, label: "Conservative", color: "#f59e0b", description: "8% monthly growth · assumes market slowdown" },
  realistic:    { monthly: 18, label: "Realistic",    color: "#3b82f6", description: "18% monthly growth · based on current trend" },
  optimistic:   { monthly: 30, label: "Optimistic",   color: "#10b981", description: "30% monthly growth · viral growth scenario" },
};

export default function ForecastPage() {
  const [scenario, setScenario] = useState<Scenario>("realistic");
  const [horizon, setHorizon] = useState(6);
  const s = MOCK_STATS;
  const forecast = generateForecast(s).slice(0, horizon);
  const sc = SCENARIO_GROWTH[scenario];

  const projectedMrr = s.mrr * Math.pow(1 + sc.monthly / 100, horizon);
  const projectedUsers = Math.round(s.total_users * Math.pow(1 + sc.monthly / 100 * 0.7, horizon));
  const projectedRevenue = forecast.reduce((sum, f) => sum + (f[`${scenario}_revenue` as keyof typeof f] as number), 0);
  const projectedCost = forecast.reduce((sum, f) => sum + f.projected_cost, 0);

  const revenueChartData = forecast.map(f => ({
    month: f.month,
    conservative: f.conservative_revenue,
    realistic: f.realistic_revenue,
    optimistic: f.optimistic_revenue,
  }));

  const usersChartData = forecast.map(f => ({
    month: f.month,
    conservative: f.conservative_users,
    realistic: f.realistic_users,
    optimistic: f.optimistic_users,
  }));

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Forecast</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Revenue and growth projections · based on current MRR of {formatCurrency(s.mrr)}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ label: "3 months", v: 3 }, { label: "6 months", v: 6 }, { label: "12 months", v: 12 }].map(h => (
            <button key={h.v} onClick={() => setHorizon(h.v)} style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none",
              background: horizon === h.v ? "#f43f5e" : "#1a2235",
              color: horizon === h.v ? "#ffffff" : "#475569",
            }}>{h.label}</button>
          ))}
        </div>
      </div>

      {/* Scenario selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
        {(Object.keys(SCENARIO_GROWTH) as Scenario[]).map((key) => {
          const sc2 = SCENARIO_GROWTH[key];
          const active = scenario === key;
          return (
            <button key={key} onClick={() => setScenario(key)} style={{
              ...card,
              cursor: "pointer",
              border: active ? `2px solid ${sc2.color}` : "1px solid #1a2235",
              background: active ? sc2.color + "0a" : "#0f1623",
              textAlign: "left",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: active ? sc2.color : "#94a3b8", fontWeight: 700, fontSize: 15 }}>{sc2.label}</span>
                <span style={{ color: sc2.color, fontSize: 20, fontWeight: 800 }}>+{sc2.monthly}%/mo</span>
              </div>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 8 }}>{sc2.description}</p>
            </button>
          );
        })}
      </div>

      {/* Projected KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: `MRR in ${horizon} months`, value: formatCurrency(projectedMrr), sub: `From ${formatCurrency(s.mrr)} today`, icon: DollarSign, color: sc.color },
          { label: `ARR in ${horizon} months`, value: formatCurrency(projectedMrr * 12), sub: "Annualized projection", icon: Target, color: sc.color },
          { label: `Total Users in ${horizon}mo`, value: formatNumber(projectedUsers), sub: `From ${formatNumber(s.total_users)} today`, icon: Users, color: sc.color },
          { label: `Revenue over ${horizon}mo`, value: formatCurrency(projectedRevenue), sub: `Net after ${formatCurrency(projectedCost)} cost`, icon: TrendingUp, color: sc.color },
        ].map((kpi) => (
          <div key={kpi.label} style={{ ...card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "0 0 0 60px", background: kpi.color + "0a" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#475569", fontSize: 12, fontWeight: 500 }}>{kpi.label}</p>
                <p style={{ color: kpi.color, fontSize: 22, fontWeight: 700, marginTop: 6 }}>{kpi.value}</p>
                <p style={{ color: "#334155", fontSize: 12, marginTop: 3 }}>{kpi.sub}</p>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={17} color={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Revenue Projection (3 Scenarios)</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Monthly revenue for each growth scenario</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="month" tick={{ fill: "#334155", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#334155", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltip} formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ color: "#475569", fontSize: 12 }} />
              <Line dataKey="conservative" name="Conservative" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line dataKey="realistic" name="Realistic" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line dataKey="optimistic" name="Optimistic" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={card}>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>User Growth Projection</h3>
          <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Total user count forecast per scenario</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={usersChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2235" />
              <XAxis dataKey="month" tick={{ fill: "#334155", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#334155", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={tooltip} formatter={(v) => formatNumber(Number(v))} />
              <Legend wrapperStyle={{ color: "#475569", fontSize: 12 }} />
              <Line dataKey="conservative" name="Conservative" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Line dataKey="realistic" name="Realistic" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line dataKey="optimistic" name="Optimistic" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-by-month table */}
      <div style={card}>
        <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Month-by-Month Projection ({sc.label} Scenario)</h3>
        <p style={{ color: "#334155", fontSize: 12, marginBottom: 20 }}>Detailed breakdown · {sc.monthly}% monthly growth rate assumed</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1a2235" }}>
              {["Month", "Projected MRR", "Projected Users", "Est. Cost", "Est. Profit", "Cumulative Revenue"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: "#334155", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {forecast.map((f, i) => {
              const mrr = s.mrr * Math.pow(1 + sc.monthly / 100, i + 1);
              const users = Math.round(s.total_users * Math.pow(1 + sc.monthly / 100 * 0.7, i + 1));
              const cost = mrr * 0.2;
              const profit = mrr - cost;
              const cumulative = Array.from({ length: i + 1 }, (_, j) => s.mrr * Math.pow(1 + sc.monthly / 100, j + 1)).reduce((a, b) => a + b, 0);
              return (
                <tr key={f.month} style={{ borderBottom: i < forecast.length - 1 ? "1px solid #1a2235" : "none" }}>
                  <td style={{ padding: "12px 12px", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>{f.month}</td>
                  <td style={{ padding: "12px 12px", color: sc.color, fontSize: 13, fontWeight: 600 }}>{formatCurrency(mrr)}</td>
                  <td style={{ padding: "12px 12px", color: "#e2e8f0", fontSize: 13 }}>{formatNumber(users)}</td>
                  <td style={{ padding: "12px 12px", color: "#f87171", fontSize: 13 }}>{formatCurrency(cost)}</td>
                  <td style={{ padding: "12px 12px", color: "#34d399", fontSize: 13, fontWeight: 600 }}>{formatCurrency(profit)}</td>
                  <td style={{ padding: "12px 12px", color: "#94a3b8", fontSize: 13 }}>{formatCurrency(cumulative)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
