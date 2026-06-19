/**
 * Utility functions for report calculations, filtering, aggregations, and downloads.
 */

export const parseInvoiceDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date();
};

export const getInvoicesInDateRange = (invoices, dateFrom, dateTo) => {
  return (invoices || []).filter((inv) => {
    const invDate = parseInvoiceDate(inv.date);
    const fromLimit = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const toLimit = dateTo ? new Date(dateTo + "T23:59:59") : null;

    if (fromLimit && invDate < fromLimit) return false;
    if (toLimit && invDate > toLimit) return false;
    return true;
  });
};

export const getSalesDataFiltered = (invoices, dateFrom, dateTo, searchTerm) => {
  const scopeInvoices = getInvoicesInDateRange(invoices, dateFrom, dateTo).filter(
    (inv) => inv.status === "Active"
  );
  
  const formatted = scopeInvoices.map((inv) => ({
    id: inv.id,
    date: inv.date,
    customerName: inv.customerName,
    customerMobile: inv.customerMobile,
    operator: inv.operator || "admin",
    paymentMethod: inv.paymentMethod || "CASH",
    itemsCount: (inv.items || []).reduce((acc, it) => acc + Number(it.quantity || 0), 0),
    discounts: Number(inv.totalLineDiscount || 0) + Number(inv.globalDiscount || 0),
    amount: Number(inv.grandTotal || 0)
  }));

  if (!searchTerm) return formatted;
  const term = searchTerm.toLowerCase();
  return formatted.filter(
    (s) =>
      String(s.id).toLowerCase().includes(term) ||
      (s.customerName || "").toLowerCase().includes(term) ||
      (s.customerMobile || "").includes(term) ||
      (s.operator || "").toLowerCase().includes(term) ||
      (s.paymentMethod || "").toLowerCase().includes(term)
  );
};

export const getInvoiceDataFiltered = (invoices, dateFrom, dateTo, searchTerm) => {
  const scopeInvoices = getInvoicesInDateRange(invoices, dateFrom, dateTo);
  const formatted = scopeInvoices.map((inv) => ({
    id: inv.id,
    date: inv.date,
    customerName: inv.customerName || "Walk-in Customer",
    customerMobile: inv.customerMobile || "-",
    itemsCount: (inv.items || []).length,
    grandTotal: Number(inv.grandTotal || 0),
    paidAmount: Number(inv.paidAmount || 0),
    balance: Number(inv.balance || 0),
    operator: inv.operator || "admin",
    status: inv.status || "Active",
    rawInvoice: inv // keep raw reference for Action handlers (view, print, etc.)
  }));

  if (!searchTerm) return formatted;
  const term = searchTerm.toLowerCase();
  return formatted.filter(
    (s) =>
      String(s.id).toLowerCase().includes(term) ||
      (s.customerName || "").toLowerCase().includes(term) ||
      (s.customerMobile || "").includes(term) ||
      (s.operator || "").toLowerCase().includes(term) ||
      (s.status || "").toLowerCase().includes(term)
  );
};

export const getRevenueDataFiltered = (invoices, dateFrom, dateTo) => {
  const activeInvs = getInvoicesInDateRange(invoices, dateFrom, dateTo).filter(
    (i) => i.status === "Active"
  );

  const groups = {};
  activeInvs.forEach((inv) => {
    const parsedDate = parseInvoiceDate(inv.date);
    const dateStr = parsedDate.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    if (!groups[dateStr]) {
      groups[dateStr] = {
        date: dateStr,
        count: 0,
        cash: 0,
        upi: 0,
        card: 0,
        credit: 0,
        bank: 0,
        total: 0
      };
    }

    const method = String(inv.paymentMethod || "CASH").toUpperCase();
    const amt = Number(inv.grandTotal || 0);

    groups[dateStr].count += 1;
    groups[dateStr].total += amt;

    if (method === "CASH") groups[dateStr].cash += amt;
    else if (
      method.includes("UPI") ||
      method.includes("PAYTM") ||
      method.includes("PHONEPE") ||
      method.includes("GPLAY") ||
      method.includes("GPAY")
    )
      groups[dateStr].upi += amt;
    else if (method.includes("CARD")) groups[dateStr].card += amt;
    else if (method.includes("CREDIT") || method.includes("DEPOSIT")) groups[dateStr].credit += amt;
    else if (method.includes("BANK") || method.includes("TRANSFER")) groups[dateStr].bank += amt;
    else groups[dateStr].cash += amt; // default fallback
  });

  const list = Object.values(groups);
  return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getDepositDataFiltered = (depositAccounts, searchTerm) => {
  const formatted = (depositAccounts || []).map((acc) => {
    const creditLimit = Number(acc.creditLimit || 0);
    const outstanding = Number(acc.outstanding || 0);
    return {
      customerName: acc.customerName,
      customerMobile: acc.customerMobile || "No Mobile",
      creditLimit: creditLimit,
      creditGiven: Number(acc.creditGiven || 0),
      paymentsReceived: Number(acc.paymentsReceived || 0),
      outstanding: outstanding,
      utilization: creditLimit > 0 ? (outstanding / creditLimit) * 100 : 0
    };
  });

  if (!searchTerm) return formatted;
  const term = searchTerm.toLowerCase();
  return formatted.filter(
    (s) =>
      (s.customerName || "").toLowerCase().includes(term) ||
      (s.customerMobile || "").includes(term)
  );
};

export const getBankTransferDataFiltered = (invoices, dateFrom, dateTo, searchTerm) => {
  const bankInvoices = getInvoicesInDateRange(invoices, dateFrom, dateTo).filter((inv) => {
    const pm = String(inv.paymentMethod || "").toUpperCase();
    return pm.includes("BANK") || pm.includes("TRANSFER");
  });

  const formatted = bankInvoices.map((inv) => ({
    id: inv.id,
    date: inv.date,
    customerName: inv.customerName || "Walk-in Client",
    customerMobile: inv.customerMobile || "-",
    grandTotal: Number(inv.grandTotal || 0),
    paidAmount: Number(inv.paidAmount || 0),
    operator: inv.operator || "admin",
    status: inv.status || "Active",
    rawInvoice: inv // keep raw reference for Action handlers (view, print, etc.)
  }));

  if (!searchTerm) return formatted;
  const term = searchTerm.toLowerCase();
  return formatted.filter(
    (s) =>
      String(s.id).toLowerCase().includes(term) ||
      (s.customerName || "").toLowerCase().includes(term) ||
      (s.customerMobile || "").includes(term) ||
      (s.operator || "").toLowerCase().includes(term)
  );
};

export const exportCSV = (activeTab, rows, showToast) => {
  if (!rows || rows.length === 0) {
    showToast("No records available to export for current filter criteria.", "info");
    return;
  }

  let headers = [];
  let fileRows = [];
  let filename = `Report_${activeTab}_${new Date().toISOString().split("T")[0]}.csv`;

  if (activeTab === "sales") {
    headers = [
      "Transaction ID",
      "Date & Time",
      "Cashier/Operator",
      "Customer",
      "Item Count",
      "Payment Method",
      "Amount Amount (INR)"
    ];
    fileRows = rows.map((row) => [
      row.id,
      row.date,
      row.operator || "admin",
      row.customerName || "Walk-in Customer",
      row.itemsCount,
      row.paymentMethod,
      row.amount
    ]);
  } else if (activeTab === "invoice") {
    headers = [
      "Invoice No",
      "Date & Time",
      "Customer Name",
      "Items Count",
      "Total Value (INR)",
      "Paid (INR)",
      "Outstanding Due (INR)",
      "Cashier",
      "Status"
    ];
    fileRows = rows.map((row) => [
      row.id,
      row.date,
      row.customerName,
      row.itemsCount,
      row.grandTotal,
      row.paidAmount,
      row.balance,
      row.operator,
      row.status
    ]);
  } else if (activeTab === "revenue") {
    headers = [
      "Date Period",
      "Sales Count",
      "CASH (INR)",
      "UPI (INR)",
      "CARD (INR)",
      "CREDIT (INR)",
      "BANK TRANSFER (INR)",
      "Gross Total (INR)"
    ];
    fileRows = rows.map((row) => [
      row.date,
      row.count,
      row.cash,
      row.upi,
      row.card,
      row.credit,
      row.bank,
      row.total
    ]);
  } else if (activeTab === "deposit") {
    headers = [
      "Customer Name",
      "Mobile Phone",
      "Credit Limit",
      "Credit Extended (Dr)",
      "Payments Made (Cr)",
      "Outstanding Due (INR)",
      "Utilization %"
    ];
    fileRows = rows.map((row) => [
      row.customerName,
      row.customerMobile,
      row.creditLimit,
      row.creditGiven,
      row.paymentsReceived,
      row.outstanding,
      row.utilization
    ]);
  } else if (activeTab === "bank_transfer") {
    headers = [
      "Invoice No",
      "Transfer Date",
      "Customer Name",
      "Mobile Phone",
      "Invoice Total",
      "Bank Paid",
      "Operator/Auditor",
      "Status"
    ];
    fileRows = rows.map((row) => [
      row.id,
      row.date,
      row.customerName,
      row.customerMobile,
      row.grandTotal,
      row.paidAmount,
      row.operator || "admin",
      row.status
    ]);
  }

  try {
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...fileRows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`${activeTab.toUpperCase()} report exported successfully to CSV.`, "success");
  } catch (err) {
    showToast("Failed to parse and download CSV file: " + err.message, "danger");
  }
};
