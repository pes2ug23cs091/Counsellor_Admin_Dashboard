export default function Badge({ text, children, type = "info" }) {
  const bgColor = {
    success: "#ecfdf5",
    warning: "#fffbeb",
    error: "#fef1f2",
    info: "#eff6ff",
    "Low": "#d1fae5",
    "Medium": "#fed7aa",
    "High": "#fecaca",
    "Active": "#d1fae5",
    "Expired": "#fee2e2",
  }[type] || "#f0f9ff";

  const textColor = {
    success: "#065f46",
    warning: "#92400e",
    error: "#991b1b",
    info: "#0c4a6e",
    "Low": "#047857",
    "Medium": "#92400e",
    "High": "#dc2626",
    "Active": "#065f46",
    "Expired": "#991b1b",
  }[type] || "#0c4a6e";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {children || text}
    </span>
  );
}
