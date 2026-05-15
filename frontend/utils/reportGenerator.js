import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinDateRange = (value, start, end) => {
  const date = toDate(value);
  if (!date) return false;
 
  if (start) {
    const startDate = toDate(start);
    if (startDate && date < startDate) return false;
  }

  if (end) {
    const endDate = toDate(end);
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      if (date > endDate) return false;
    }
  }

  return true;
};

const sanitize = (value) => {
  const stringValue = String(value ?? "");
  return stringValue
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const buildReportHtml = ({ title, subtitle, filters, summary, headers, rows }) => {
  const createdAt = new Date().toLocaleString();
  const filterMarkup = filters
    .filter((item) => item.value)
    .map(
      (item) =>
        `<div class="chip"><span>${sanitize(item.label)}:</span> ${sanitize(item.value)}</div>`
    )
    .join("");

  const summaryMarkup = summary
    .map(
      (item) =>
        `<div class="summary-item"><div class="summary-label">${sanitize(item.label)}</div><div class="summary-value">${sanitize(item.value)}</div></div>`
    )
    .join("");

  const headMarkup = headers.map((header) => `<th>${sanitize(header)}</th>`).join("");

  const rowMarkup = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${sanitize(cell)}</td>`).join("")}</tr>`
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:#111827; padding:24px; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px; }
          .brand { font-size:22px; font-weight:800; color:#FF4747; margin-bottom:4px; }
          .title { font-size:18px; font-weight:700; margin:0; }
          .subtitle { margin-top:4px; color:#6B7280; font-size:12px; }
          .timestamp { font-size:12px; color:#6B7280; text-align:right; }
          .chips { display:flex; flex-wrap:wrap; gap:8px; margin:8px 0 16px; }
          .chip { background:#F3F4F6; border-radius:999px; padding:6px 12px; font-size:11px; }
          .chip span { color:#6B7280; font-weight:600; }
          .summary { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px; margin-bottom:16px; }
          .summary-item { border:1px solid #E5E7EB; border-radius:10px; padding:10px; }
          .summary-label { font-size:11px; color:#6B7280; text-transform:uppercase; letter-spacing:0.5px; }
          .summary-value { margin-top:5px; font-size:17px; font-weight:700; color:#111827; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #E5E7EB; padding:8px; font-size:11px; text-align:left; }
          th { background:#F9FAFB; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; color:#4B5563; }
          tr:nth-child(even) { background:#FCFCFD; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">SCHOLAR COMMERCE</div>
            <h1 class="title">${sanitize(title)}</h1>
            <div class="subtitle">${sanitize(subtitle)}</div>
          </div>
          <div class="timestamp">Generated: ${sanitize(createdAt)}</div>
        </div>

        <div class="chips">${filterMarkup || '<div class="chip">No filters applied</div>'}</div>

        <div class="summary">${summaryMarkup}</div>

        <table>
          <thead>
            <tr>${headMarkup}</tr>
          </thead>
          <tbody>
            ${rowMarkup || '<tr><td colspan="8">No records found for selected filters.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

export const runPdfAction = async ({ html, mode }) => {
  const { uri } = await Print.printToFileAsync({ html });

  if (mode === "share") {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Share report",
        UTI: "com.adobe.pdf",
      });
    }
  }

  if (mode === "print") {
    await Print.printAsync({ uri });
  }

  return uri;
};

export const filterByDateRange = (items, getDate, startDate, endDate) =>
  items.filter((item) => isWithinDateRange(getDate(item), startDate, endDate));

export const buildProductReportHtml = ({
  products,
  startDate,
  endDate,
  sellerFilter,
  sourceLabel = "Admin Products",
}) => {
  const totalStock = products.reduce((acc, item) => acc + Number(item.countInStock || 0), 0);
  const lowStock = products.filter((item) => Number(item.countInStock || 0) <= 5).length;
  const value = products.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.countInStock || 0),
    0
  );

  const rows = products.map((item) => {
    const sellerName = item.user
      ? `${item.user.FirstName || ""} ${item.user.LastName || ""}`.trim() || item.user.email || "-"
      : "-";

    return [
      item.name || "-",
      item.category?.categoryname || "-",
      sellerName,
      `$${Number(item.price || 0).toFixed(2)}`,
      String(item.countInStock ?? 0),
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
    ];
  });

  return buildReportHtml({
    title: "Product List Report",
    subtitle: sourceLabel,
    filters: [
      { label: "Start Date", value: startDate },
      { label: "End Date", value: endDate },
      { label: "Seller", value: sellerFilter },
    ],
    summary: [
      { label: "Products", value: products.length },
      { label: "Low Stock", value: lowStock },
      { label: "Stock Value", value: `$${value.toFixed(2)}` },
      { label: "Total Units", value: totalStock },
      { label: "Report Scope", value: sourceLabel },
      { label: "Status", value: "Active Export" },
    ],
    headers: ["Product", "Category", "Seller", "Price", "Stock", "Created"],
    rows,
  });
};

export const buildSellerReportHtml = ({ sellers, startDate, endDate, sellerFilter }) => {
  const approved = sellers.filter((item) => item.sellerRequest?.status === "approved").length;
  const pending = sellers.filter((item) => (item.sellerRequest?.status || "pending") === "pending").length;
  const rejected = sellers.filter((item) => item.sellerRequest?.status === "rejected").length;

  const rows = sellers.map((item) => {
    const fullName = `${item.FirstName || ""} ${item.LastName || ""}`.trim();
    return [
      fullName || "-",
      item.email || "-",
      (item.sellerRequest?.status || "pending").toUpperCase(),
      (item.sellerRequest?.subscriptionType || "free").replaceAll("_", " "),
      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
    ];
  });

  return buildReportHtml({
    title: "Seller Report",
    subtitle: "Seller Request & Subscription Snapshot",
    filters: [
      { label: "Start Date", value: startDate },
      { label: "End Date", value: endDate },
      { label: "Seller", value: sellerFilter },
    ],
    summary: [
      { label: "Total Sellers", value: sellers.length },
      { label: "Approved", value: approved },
      { label: "Pending", value: pending },
      { label: "Rejected", value: rejected },
      { label: "Window", value: startDate || endDate ? "Filtered" : "All Time" },
      { label: "Export", value: "Admin Seller Report" },
    ],
    headers: ["Name", "Email", "Status", "Plan", "Requested"],
    rows,
  });
};