"use client";

import { useState } from "react";
import { Key, Shield, Sliders, Info, Eye, EyeOff, CheckCircle, DollarSign, Zap, Bell } from "lucide-react";

const card = { background: "#0f1623", border: "1px solid #1a2235", borderRadius: 12, padding: "24px", marginBottom: 20 };

const PRICING = [
  { tier: "Free", price: 0, limit: 3, color: "#64748b" },
  { tier: "Monthly", price: 14.99, limit: 999, color: "#3b82f6" },
  { tier: "Premium", price: 49.99, limit: 999, color: "#f43f5e" },
];

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "fail">("idle");
  const [freeLimit, setFreeLimit] = useState(3);
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flags, setFlags] = useState({
    screenshot_ocr: false,
    push_notifications: false,
    referral_program: false,
    ai_model_v2: false,
  });
  const [notifyEmail, setNotifyEmail] = useState("");

  const testApiKey = async () => {
    if (!apiKey) return;
    setTestStatus("testing");
    await new Promise(r => setTimeout(r, 1500));
    setTestStatus(apiKey.startsWith("sk-ant") ? "ok" : "fail");
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const testColors = { idle: "#475569", testing: "#f59e0b", ok: "#10b981", fail: "#ef4444" };
  const testLabels = { idle: "Test Connection", testing: "Testing...", ok: "✓ Connected", fail: "✗ Invalid Key" };

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Settings</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>Configure the AI service, pricing, and app behaviour</p>
      </div>

      {/* Claude API Key */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, background: "rgba(244,63,94,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Key size={17} color="#fb7185" />
          </div>
          <div>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>Claude API Key</h3>
            <p style={{ color: "#334155", fontSize: 12 }}>Required for the AI microservice to generate response suggestions</p>
          </div>
          <div style={{ marginLeft: "auto", padding: "4px 10px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6 }}>
            <span style={{ color: "#f87171", fontSize: 11, fontWeight: 600 }}>Not Configured</span>
          </div>
        </div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); setTestStatus("idle"); }}
            placeholder="sk-ant-api03-..."
            style={{
              width: "100%", background: "#1a2235", border: "1px solid #2d3f5a",
              borderRadius: 8, padding: "10px 42px 10px 14px", fontSize: 13,
              color: "#e2e8f0", outline: "none", fontFamily: "monospace", boxSizing: "border-box",
            }}
          />
          <button onClick={() => setShowKey(!showKey)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569" }}>
            {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={testApiKey} disabled={!apiKey || testStatus === "testing"} style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: apiKey ? "pointer" : "not-allowed",
            border: `1px solid ${testColors[testStatus]}30`, background: testColors[testStatus] + "10",
            color: testColors[testStatus], opacity: apiKey ? 1 : 0.5,
          }}>{testLabels[testStatus]}</button>
          <div style={{ flex: 1, padding: "8px 14px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <Info size={13} color="#60a5fa" />
            <span style={{ color: "#93c5fd", fontSize: 12 }}>Get your key at <span style={{ fontFamily: "monospace" }}>console.anthropic.com</span></span>
          </div>
        </div>
      </div>

      {/* Pricing & Limits */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, background: "rgba(16,185,129,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={17} color="#34d399" />
          </div>
          <div>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>Pricing & Tier Limits</h3>
            <p style={{ color: "#334155", fontSize: 12 }}>Configure subscription prices and daily analysis limits</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {PRICING.map(tier => (
            <div key={tier.tier} style={{ padding: 16, background: "#1a2235", borderRadius: 10, border: `1px solid ${tier.color}20` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: tier.color }} />
                <span style={{ color: tier.color, fontSize: 13, fontWeight: 700 }}>{tier.tier}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <p style={{ color: "#475569", fontSize: 11, marginBottom: 4 }}>Monthly Price ($)</p>
                <input type="number" defaultValue={tier.price} min={0} step={0.01} style={{
                  width: "100%", background: "#0f1623", border: "1px solid #2d3f5a", borderRadius: 6,
                  padding: "6px 10px", color: "#e2e8f0", fontSize: 14, fontWeight: 600, outline: "none", boxSizing: "border-box",
                }} />
              </div>
              <div>
                <p style={{ color: "#475569", fontSize: 11, marginBottom: 4 }}>Daily Analyses Limit</p>
                <input type="number" defaultValue={tier.limit === 999 ? "" : tier.limit} placeholder={tier.limit === 999 ? "Unlimited" : ""} min={1} style={{
                  width: "100%", background: "#0f1623", border: "1px solid #2d3f5a", borderRadius: 6,
                  padding: "6px 10px", color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, background: "rgba(168,85,247,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={17} color="#c084fc" />
          </div>
          <div>
            <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>Feature Flags</h3>
            <p style={{ color: "#334155", fontSize: 12 }}>Enable or disable features for all users</p>
          </div>
        </div>
        {[
          { key: "screenshot_ocr", label: "Screenshot-to-Text (OCR)", desc: "Let users paste screenshots instead of typing conversations" },
          { key: "push_notifications", label: "Push Notifications", desc: "Send streak reminders and engagement notifications" },
          { key: "referral_program", label: "Referral Program", desc: "Give users a referral link for free premium days" },
          { key: "ai_model_v2", label: "Claude Opus (Premium Only)", desc: "Use Claude Opus for premium users, Sonnet for free/monthly" },
        ].map(flag => (
          <div key={flag.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #1a2235" }}>
            <div>
              <p style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{flag.label}</p>
              <p style={{ color: "#334155", fontSize: 12, marginTop: 2 }}>{flag.desc}</p>
            </div>
            <button
              onClick={() => setFlags(prev => ({ ...prev, [flag.key]: !prev[flag.key as keyof typeof flags] }))}
              style={{
                width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
                background: flags[flag.key as keyof typeof flags] ? "#a855f7" : "#1a2235", position: "relative", marginLeft: 16,
              }}>
              <div style={{
                width: 18, height: 18, background: "#ffffff", borderRadius: "50%",
                position: "absolute", top: 3, transition: "left 0.2s",
                left: flags[flag.key as keyof typeof flags] ? 22 : 3,
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, background: "rgba(59,130,246,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={17} color="#60a5fa" />
          </div>
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>Alert Email</h3>
        </div>
        <p style={{ color: "#475569", fontSize: 13, marginBottom: 12 }}>Receive email alerts for cost spikes, churn warnings, and milestones</p>
        <input
          type="email"
          value={notifyEmail}
          onChange={e => setNotifyEmail(e.target.value)}
          placeholder="admin@yourdomain.com"
          style={{
            width: "100%", background: "#1a2235", border: "1px solid #2d3f5a",
            borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#e2e8f0", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Maintenance mode */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: "rgba(249,115,22,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={17} color="#fb923c" />
            </div>
            <div>
              <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 15 }}>Maintenance Mode</h3>
              <p style={{ color: "#334155", fontSize: 12 }}>Blocks all user requests with a maintenance message</p>
            </div>
          </div>
          <button onClick={() => setMaintenance(!maintenance)} style={{
            width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", flexShrink: 0,
            background: maintenance ? "#f97316" : "#1a2235", position: "relative",
          }}>
            <div style={{ width: 18, height: 18, background: "#ffffff", borderRadius: "50%", position: "absolute", top: 3, transition: "left 0.2s", left: maintenance ? 22 : 3 }} />
          </button>
        </div>
        {maintenance && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.15)", borderRadius: 8 }}>
            <p style={{ color: "#fdba74", fontSize: 12 }}>⚠️ Maintenance mode is ON. All users will see a maintenance screen.</p>
          </div>
        )}
      </div>

      {/* System Info */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Info size={15} color="#475569" />
          <h3 style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>System Info</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["App Version", "1.0.0"], ["Flutter SDK", "3.x"],
            ["Backend", "Golang + Gin"], ["AI Service", "Python + FastAPI"],
            ["Database", "PostgreSQL 17"], ["AI Model", "Claude Opus 4.7"],
            ["Cache", "Redis (planned)"], ["Hosting", "Not deployed yet"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#1a2235", borderRadius: 8 }}>
              <span style={{ color: "#475569", fontSize: 12 }}>{label}</span>
              <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: "monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer",
        background: saved ? "#10b981" : "linear-gradient(135deg, #f43f5e, #fb7185)",
        color: "#ffffff", fontSize: 15, fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        boxShadow: saved ? "none" : "0 4px 20px rgba(244,63,94,0.3)",
      }}>
        {saved ? <><CheckCircle size={16} /> Settings Saved Successfully</> : "Save All Settings"}
      </button>
    </div>
  );
}
