import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const api = axios.create({ baseURL: API_URL });

// ── Types ──────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_users: number;
  new_users_today: number;
  new_users_month: number;
  active_users_today: number;
  active_users_month: number;
  total_analyses: number;
  analyses_today: number;
  analyses_month: number;
  mrr: number;
  arr: number;
  revenue_today: number;
  revenue_month: number;
  revenue_all_time: number;
  claude_cost_month: number;
  net_profit_month: number;
  free_users: number;
  paid_users: number;
  conversion_rate: number;
  churn_rate: number;
  avg_revenue_per_user: number;
  cost_per_analysis: number;
  break_even_users: number;
  mrr_growth_rate: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
  new_users: number;
  mrr: number;
}

export interface UserRecord {
  id: string;
  email: string;
  display_name: string;
  subscription_tier: string;
  total_analyses: number;
  revenue_generated: number;
  created_at: string;
  last_active: string;
  churn_risk: "low" | "medium" | "high";
  segment: "power" | "regular" | "new" | "at_risk" | "churned";
}

export interface Alert {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ForecastData {
  month: string;
  conservative_revenue: number;
  realistic_revenue: number;
  optimistic_revenue: number;
  conservative_users: number;
  realistic_users: number;
  optimistic_users: number;
  projected_cost: number;
  projected_profit: number;
}

export interface SubscriptionTier {
  name: string;
  users: number;
  mrr: number;
  arpu: number;
  churn_rate: number;
  growth_rate: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  rate: number;
  drop_off: number;
}

export interface ResponseModeStats {
  mode: string;
  count: number;
  percentage: number;
  avg_confidence: number;
}

// ── Mock data ──────────────────────────────────────────────────────────────

export const MOCK_STATS: DashboardStats = {
  total_users: 1284,
  new_users_today: 24,
  new_users_month: 312,
  active_users_today: 187,
  active_users_month: 743,
  total_analyses: 8921,
  analyses_today: 143,
  analyses_month: 2840,
  mrr: 4320,
  arr: 51840,
  revenue_today: 148,
  revenue_month: 4320,
  revenue_all_time: 18740,
  claude_cost_month: 860,
  net_profit_month: 3460,
  free_users: 987,
  paid_users: 297,
  conversion_rate: 23.1,
  churn_rate: 4.2,
  avg_revenue_per_user: 14.55,
  cost_per_analysis: 0.30,
  break_even_users: 58,
  mrr_growth_rate: 18.2,
};

export const MOCK_REVENUE: RevenueData[] = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (89 - i));
  const base = 3200 + i * 12;
  const revenue = base + Math.random() * 200 - 100;
  const cost = revenue * (0.18 + Math.random() * 0.04);
  return {
    date: date.toISOString().split("T")[0],
    revenue: Math.round(revenue),
    cost: Math.round(cost),
    profit: Math.round(revenue - cost),
    new_users: Math.floor(5 + Math.random() * 25),
    mrr: Math.round(base),
  };
});

export const MOCK_USERS: UserRecord[] = [
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `power-${i}`,
    email: `poweruser${i + 1}@example.com`,
    display_name: `Power User ${i + 1}`,
    subscription_tier: "premium",
    total_analyses: 120 + i * 15,
    revenue_generated: 49.99 * 3,
    created_at: new Date(Date.now() - (60 + i * 10) * 86400000).toISOString(),
    last_active: new Date(Date.now() - i * 3600000).toISOString(),
    churn_risk: "low" as const,
    segment: "power" as const,
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `regular-${i}`,
    email: `user${i + 1}@example.com`,
    display_name: `User ${i + 1}`,
    subscription_tier: i < 4 ? "monthly" : "free",
    total_analyses: 20 + i * 5,
    revenue_generated: i < 4 ? 14.99 * 2 : 0,
    created_at: new Date(Date.now() - (30 + i * 5) * 86400000).toISOString(),
    last_active: new Date(Date.now() - (1 + i) * 86400000).toISOString(),
    churn_risk: "low" as const,
    segment: "regular" as const,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `atrisk-${i}`,
    email: `inactive${i + 1}@example.com`,
    display_name: `Inactive ${i + 1}`,
    subscription_tier: "monthly",
    total_analyses: 3 + i,
    revenue_generated: 14.99,
    created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
    last_active: new Date(Date.now() - (12 + i * 3) * 86400000).toISOString(),
    churn_risk: "high" as const,
    segment: "at_risk" as const,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    id: `new-${i}`,
    email: `newuser${i + 1}@example.com`,
    display_name: `New User ${i + 1}`,
    subscription_tier: "free",
    total_analyses: i + 1,
    revenue_generated: 0,
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    last_active: new Date(Date.now() - i * 86400000).toISOString(),
    churn_risk: "medium" as const,
    segment: "new" as const,
  })),
];

export const MOCK_ALERTS: Alert[] = [
  { id: "1", type: "error", title: "Claude API Key Missing", message: "The AI microservice has no API key configured. Analyses will fail for all users.", timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
  { id: "2", type: "warning", title: "High Churn Rate Detected", message: "Churn rate increased from 2.1% to 4.2% this month. 12 paid users have not logged in for 14+ days.", timestamp: new Date(Date.now() - 7200000).toISOString(), read: false },
  { id: "3", type: "warning", title: "Claude API Cost Spike", message: "API costs today are 34% above the daily average. 3 users made 50+ analyses each.", timestamp: new Date(Date.now() - 10800000).toISOString(), read: false },
  { id: "4", type: "success", title: "Revenue Milestone Reached", message: "Monthly revenue crossed $4,000 for the first time.", timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: "5", type: "info", title: "New User Signup Spike", message: "24 new users signed up today — 3× the daily average. Possible viral moment.", timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
  { id: "6", type: "warning", title: "Free Tier Limit Hit", message: "143 users hit their daily free limit today. Consider reducing limit to save costs.", timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), read: true },
];

export const MOCK_SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { name: "Free", users: 987, mrr: 0, arpu: 0, churn_rate: 0, growth_rate: 8.4 },
  { name: "Monthly", users: 201, mrr: 3014.99, arpu: 14.99, churn_rate: 5.1, growth_rate: 12.3 },
  { name: "Premium", users: 96, mrr: 4799.04, arpu: 49.99, churn_rate: 2.1, growth_rate: 22.8 },
];

export const MOCK_FUNNEL: ConversionFunnel[] = [
  { stage: "Signed Up", count: 1284, rate: 100, drop_off: 0 },
  { stage: "First Analysis", count: 891, rate: 69.4, drop_off: 30.6 },
  { stage: "3+ Analyses", count: 543, rate: 42.3, drop_off: 27.1 },
  { stage: "Hit Free Limit", count: 312, rate: 24.3, drop_off: 18.0 },
  { stage: "Converted to Paid", count: 297, rate: 23.1, drop_off: 1.2 },
];

export const MOCK_RESPONSE_MODES: ResponseModeStats[] = [
  { mode: "Witty", count: 2841, percentage: 31.8, avg_confidence: 0.88 },
  { mode: "Casual", count: 2123, percentage: 23.8, avg_confidence: 0.91 },
  { mode: "Sincere", count: 1876, percentage: 21.0, avg_confidence: 0.86 },
  { mode: "Confident", count: 1204, percentage: 13.5, avg_confidence: 0.83 },
  { mode: "Thoughtful", count: 877, percentage: 9.8, avg_confidence: 0.89 },
];

export interface AnalyticsData {
  daily_active_users: { date: string; count: number }[];
  analyses_per_day: { date: string; count: number }[];
  tier_distribution: { tier: string; count: number; percentage: number }[];
  hourly_usage: { hour: number; count: number }[];
}

export const MOCK_ANALYTICS: AnalyticsData = {
  daily_active_users: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (29 - i));
    return { date: date.toISOString().split("T")[0], count: Math.floor(100 + Math.random() * 150) };
  }),
  analyses_per_day: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(); date.setDate(date.getDate() - (29 - i));
    return { date: date.toISOString().split("T")[0], count: Math.floor(50 + Math.random() * 200) };
  }),
  tier_distribution: [
    { tier: "free", count: 987, percentage: 76.9 },
    { tier: "monthly", count: 201, percentage: 15.7 },
    { tier: "premium", count: 96, percentage: 7.4 },
  ],
  hourly_usage: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: Math.floor(h >= 8 && h <= 22 ? 20 + Math.random() * 80 : Math.random() * 20),
  })),
};

// ── Marketing / Acquisition data ──────────────────────────────────────────

export interface AcquisitionChannel {
  name: string;
  color: string;
  new_users: number;
  paid_conversions: number;
  conversion_rate: number;
  cac: number;          // cost to acquire one paid user ($)
  spend: number;        // monthly spend on this channel ($)
  ltv: number;          // avg lifetime value of user from this channel
  roi: number;          // (revenue - spend) / spend * 100
}

export interface ChannelTrend {
  date: string;
  organic: number;
  paid: number;
  social: number;
  referral: number;
  direct: number;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  cpc: number;    // cost per click
  cpl: number;    // cost per lead
  cpa: number;    // cost per acquisition (paid user)
  roi: number;
  start_date: string;
  end_date?: string;
}

export interface ABTest {
  id: string;
  name: string;
  status: "running" | "completed" | "paused";
  variant_a: string;
  variant_b: string;
  visitors_a: number;
  visitors_b: number;
  conversions_a: number;
  conversions_b: number;
  winner?: "a" | "b" | null;
  confidence: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  conversions: number;
  sent_at: string;
}

export const MOCK_CHANNELS: AcquisitionChannel[] = [
  { name: "Organic Search", color: "#10b981", new_users: 412, paid_conversions: 98,  conversion_rate: 23.8, cac: 0,    spend: 0,    ltv: 89.40, roi: 0 },
  { name: "Paid Social",    color: "#3b82f6", new_users: 289, paid_conversions: 71,  conversion_rate: 24.6, cac: 18.20, spend: 1293, ltv: 76.30, roi: 196 },
  { name: "Referral",       color: "#a855f7", new_users: 198, paid_conversions: 62,  conversion_rate: 31.3, cac: 6.40,  spend: 397,  ltv: 112.50, roi: 1658 },
  { name: "Direct",         color: "#f59e0b", new_users: 241, paid_conversions: 44,  conversion_rate: 18.3, cac: 0,    spend: 0,    ltv: 68.20, roi: 0 },
  { name: "Paid Search",    color: "#f43f5e", new_users: 144, paid_conversions: 22,  conversion_rate: 15.3, cac: 32.50, spend: 715,  ltv: 54.90, roi: 69 },
];

export const MOCK_CHANNEL_TREND: ChannelTrend[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(); date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    organic: Math.floor(10 + Math.random() * 20),
    paid: Math.floor(5 + Math.random() * 15),
    social: Math.floor(3 + Math.random() * 12),
    referral: Math.floor(4 + Math.random() * 10),
    direct: Math.floor(6 + Math.random() * 10),
  };
});

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Valentine's Day Push", channel: "Paid Social", status: "active", budget: 2000, spend: 1293, impressions: 84200, clicks: 3240, leads: 289, conversions: 71, cpc: 0.40, cpl: 4.47, cpa: 18.20, roi: 196, start_date: "2026-05-01" },
  { id: "c2", name: "Google Search — Flirting Tips", channel: "Paid Search", status: "active", budget: 1000, spend: 715, impressions: 22100, clicks: 1430, leads: 144, conversions: 22, cpc: 0.50, cpl: 4.96, cpa: 32.50, roi: 69, start_date: "2026-04-15" },
  { id: "c3", name: "Referral Program Launch", channel: "Referral", status: "active", budget: 500, spend: 397, impressions: 0, clicks: 0, leads: 198, conversions: 62, cpc: 0, cpl: 2.00, cpa: 6.40, roi: 1658, start_date: "2026-05-10" },
  { id: "c4", name: "TikTok Dating Awareness", channel: "Paid Social", status: "paused", budget: 1500, spend: 980, impressions: 210000, clicks: 4100, leads: 187, conversions: 28, cpc: 0.24, cpl: 5.24, cpa: 35.00, roi: 43, start_date: "2026-04-01", end_date: "2026-04-30" },
  { id: "c5", name: "Onboarding Email Sequence", channel: "Email", status: "completed", budget: 0, spend: 0, impressions: 0, clicks: 2840, leads: 891, conversions: 134, cpc: 0, cpl: 0, cpa: 0, roi: 0, start_date: "2026-03-01", end_date: "2026-03-31" },
];

export const MOCK_AB_TESTS: ABTest[] = [
  { id: "ab1", name: "Onboarding — Skip vs Full flow", status: "running", variant_a: "Full 5-step onboarding", variant_b: "Skip to app directly", visitors_a: 312, visitors_b: 308, conversions_a: 94, conversions_b: 71, winner: null, confidence: 67 },
  { id: "ab2", name: "Pricing Page — Monthly first vs Annual first", status: "completed", variant_a: "Show Monthly plan first", variant_b: "Show Annual plan first", visitors_a: 480, visitors_b: 476, conversions_a: 87, conversions_b: 122, winner: "b", confidence: 97 },
  { id: "ab3", name: "CTA — 'Start Free' vs 'Try for Free'", status: "completed", variant_a: "Start Free", variant_b: "Try for Free", visitors_a: 620, visitors_b: 618, conversions_a: 118, conversions_b: 109, winner: "a", confidence: 89 },
];

export const MOCK_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  { id: "e1", name: "Welcome Email", sent: 1284, opened: 897, clicked: 412, unsubscribed: 14, conversions: 38, sent_at: "2026-05-20" },
  { id: "e2", name: "Day 3 Re-engagement", sent: 743, opened: 421, clicked: 198, unsubscribed: 8, conversions: 22, sent_at: "2026-05-17" },
  { id: "e3", name: "Free Limit Hit — Upgrade Nudge", sent: 312, opened: 267, clicked: 189, unsubscribed: 4, conversions: 41, sent_at: "2026-05-15" },
  { id: "e4", name: "Monthly Newsletter", sent: 1284, opened: 512, clicked: 213, unsubscribed: 22, conversions: 11, sent_at: "2026-05-01" },
];

// Derived marketing metrics
export function computeMarketingMetrics(channels: AcquisitionChannel[], stats: DashboardStats) {
  const totalSpend = channels.reduce((s, c) => s + c.spend, 0);
  const totalPaidConversions = channels.reduce((s, c) => s + c.paid_conversions, 0);
  const blendedCAC = totalSpend / totalPaidConversions;
  const ltv = stats.avg_revenue_per_user / (stats.churn_rate / 100);
  const ltvCacRatio = ltv / blendedCAC;
  const paybackMonths = blendedCAC / stats.avg_revenue_per_user;
  return { totalSpend, blendedCAC, ltv, ltvCacRatio, paybackMonths };
}

export function generateForecast(stats: DashboardStats): ForecastData[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const monthIdx = (now.getMonth() + i + 1) % 12;
    const conservative = stats.mrr * Math.pow(1.08, i + 1);
    const realistic = stats.mrr * Math.pow(1.18, i + 1);
    const optimistic = stats.mrr * Math.pow(1.30, i + 1);
    return {
      month: months[monthIdx],
      conservative_revenue: Math.round(conservative),
      realistic_revenue: Math.round(realistic),
      optimistic_revenue: Math.round(optimistic),
      conservative_users: Math.round(stats.total_users * Math.pow(1.05, i + 1)),
      realistic_users: Math.round(stats.total_users * Math.pow(1.12, i + 1)),
      optimistic_users: Math.round(stats.total_users * Math.pow(1.22, i + 1)),
      projected_cost: Math.round(realistic * 0.20),
      projected_profit: Math.round(realistic * 0.80),
    };
  });
}

// ── Month 1 additions: Cohort, Health, Sensitivity, API Cost ──────────────

export interface CohortRow {
  month: string;
  week1: number;
  week2: number | null;
  week4: number | null;
  month2: number | null;
  month3: number | null;
  payback_months: number;
  size: number;
}

export interface HealthScore {
  user_id: string;
  score: number;           // 0-100
  tier: "red" | "yellow" | "green";
  engagement: number;
  usage_intensity: number;
  feature_breadth: number;
  payment_health: number;
  satisfaction: number;
  days_since_active: number;
}

export interface ApiCostDay {
  date: string;
  cost_per_analysis: number;
  total_cost: number;
  analyses_count: number;
  cache_hit_rate: number;
}

// Cohort mock data — 6 months of cohorts
export const MOCK_COHORTS: CohortRow[] = [
  { month: "Nov 2025", week1: 100, week2: 72, week4: 48, month2: 34, month3: 28, payback_months: 2.8, size: 198 },
  { month: "Dec 2025", week1: 100, week2: 69, week4: 45, month2: 31, month3: 24, payback_months: 3.1, size: 224 },
  { month: "Jan 2026", week1: 100, week2: 71, week4: 48, month2: 33, month3: null, payback_months: 3.0, size: 287 },
  { month: "Feb 2026", week1: 100, week2: 68, week4: 42, month2: null, month3: null, payback_months: 3.4, size: 241 },
  { month: "Mar 2026", week1: 100, week2: 65, week4: null, month2: null, month3: null, payback_months: 3.8, size: 198 },
  { month: "Apr 2026", week1: 100, week2: null, week4: null, month2: null, month3: null, payback_months: 0, size: 136 },
];

// Health scores mock — distributed across Red/Yellow/Green
export const MOCK_HEALTH_SCORES: HealthScore[] = [
  ...Array.from({ length: 8 }, (_, i) => ({
    user_id: `power-${i}`, score: 78 + i * 2, tier: "green" as const,
    engagement: 95, usage_intensity: 88, feature_breadth: 72, payment_health: 90, satisfaction: 85,
    days_since_active: i,
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    user_id: `regular-${i}`, score: 45 + i * 3, tier: "yellow" as const,
    engagement: 60, usage_intensity: 55, feature_breadth: 40, payment_health: 80, satisfaction: 65,
    days_since_active: 2 + i,
  })),
  ...Array.from({ length: 4 }, (_, i) => ({
    user_id: `atrisk-${i}`, score: 15 + i * 5, tier: "red" as const,
    engagement: 10, usage_intensity: 8, feature_breadth: 20, payment_health: 60, satisfaction: 30,
    days_since_active: 12 + i * 3,
  })),
];

export function getHealthSummary(scores: HealthScore[]) {
  const red    = scores.filter(s => s.tier === "red").length;
  const yellow = scores.filter(s => s.tier === "yellow").length;
  const green  = scores.filter(s => s.tier === "green").length;
  const total  = scores.length;
  return {
    red, yellow, green,
    redPct:    Math.round((red    / total) * 100),
    yellowPct: Math.round((yellow / total) * 100),
    greenPct:  Math.round((green  / total) * 100),
  };
}

// API cost mock data — 90 days
export const MOCK_API_COSTS: ApiCostDay[] = Array.from({ length: 90 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (89 - i));
  const analyses = Math.floor(80 + Math.random() * 80);
  const costPerAnalysis = 0.0038 + Math.random() * 0.0008 + (i > 70 ? 0.0006 : 0); // slight upward trend
  return {
    date: date.toISOString().split("T")[0],
    cost_per_analysis: Math.round(costPerAnalysis * 10000) / 10000,
    total_cost: Math.round(analyses * costPerAnalysis * 100) / 100,
    analyses_count: analyses,
    cache_hit_rate: Math.round((0.12 + Math.random() * 0.06) * 100) / 100,
  };
});

// Compute month-to-date API cost stats
export function getApiCostStats(costs: ApiCostDay[], monthlyBudget = 1000) {
  const thisMonth = costs.filter(d => d.date >= new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const mtdCost   = thisMonth.reduce((s, d) => s + d.total_cost, 0);
  const avgDaily  = mtdCost / (thisMonth.length || 1);
  const daysLeft  = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const projected = mtdCost + avgDaily * daysLeft;
  const avgCostPerAnalysis = costs.slice(-30).reduce((s, d) => s + d.cost_per_analysis, 0) / 30;
  const avgCacheHit = costs.slice(-30).reduce((s, d) => s + d.cache_hit_rate, 0) / 30;
  return { mtdCost, projected, monthlyBudget, overBudget: projected > monthlyBudget, avgCostPerAnalysis, avgCacheHit };
}

// Sensitivity grid computation
export function computeSensitivityGrid(arpu: number) {
  const churns = [0.08, 0.10, 0.12];
  const cacs   = [8, 10, 12];
  return churns.map(churn => ({
    churn: (churn * 100).toFixed(0) + "%",
    values: cacs.map(cac => {
      const ltv      = arpu / churn;
      const netLtv   = ltv - cac;
      const payback  = cac / arpu;
      return { cac, ltv: Math.round(ltv), netLtv: Math.round(netLtv), payback: payback.toFixed(1) };
    }),
  }));
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/api/v1/admin/stats"),
  getRevenue: (days: number) => api.get<RevenueData[]>(`/api/v1/admin/revenue?days=${days}`),
  getUsers: (page: number, search?: string, tier?: string) =>
    api.get(`/api/v1/admin/users?page=${page}&search=${search || ""}&tier=${tier || ""}`),
  updateUserTier: (userId: string, tier: string) =>
    api.patch(`/api/v1/admin/users/${userId}/tier`, { tier }),
  deleteUser: (userId: string) => api.delete(`/api/v1/admin/users/${userId}`),
  getSettings: () => api.get("/api/v1/admin/settings"),
  updateSettings: (settings: object) => api.patch("/api/v1/admin/settings", settings),
};
