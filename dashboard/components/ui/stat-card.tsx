import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  accentColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changePositive = true,
  icon: Icon,
  accentColor = "#f43f5e",
}: StatCardProps) {
  return (
    <div style={{
      background: "#111827",
      border: "1px solid #1f2937",
      borderRadius: 12,
      padding: "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#6b7280", fontSize: 13, fontWeight: 500 }}>{title}</p>
          <p style={{ color: "#ffffff", fontSize: 26, fontWeight: 700, marginTop: 4 }}>{value}</p>
          {subtitle && (
            <p style={{ color: "#4b5563", fontSize: 12, marginTop: 4 }}>{subtitle}</p>
          )}
          {change && (
            <p style={{
              fontSize: 12,
              fontWeight: 600,
              marginTop: 8,
              color: changePositive ? "#34d399" : "#f87171",
            }}>
              {changePositive ? "↑" : "↓"} {change} vs last month
            </p>
          )}
        </div>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: accentColor + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={20} color={accentColor} />
        </div>
      </div>
    </div>
  );
}
