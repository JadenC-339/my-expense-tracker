import { useState } from "react";

const initialTransactions = [
  { id: 1, description: "Monthly Salary", amount: 5000, type: "income" },
  { id: 2, description: "Rent", amount: 1500, type: "expense" },
  { id: 3, description: "Groceries", amount: 320, type: "expense" },
];

export default function App() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [error, setError] = useState("");
  const [animateId, setAnimateId] = useState(null);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const handleAdd = () => {
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    setError("");
    const newId = Date.now();
    setTransactions((prev) => [
      { id: newId, description: description.trim(), amount: parsed, type },
      ...prev,
    ]);
    setAnimateId(newId);
    setDescription("");
    setAmount("");
    setTimeout(() => setAnimateId(null), 600);
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDownloadCSV = () => {
    const headers = ["Description", "Amount", "Type", "Date"];
    const rows = transactions.map((t) => [
      t.description,
      t.amount,
      t.type === "income" ? "Income" : "Expense",
      new Date(t.id).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmt = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoMark}>₿</div>
        <div>
          <h1 style={styles.title}>Flow</h1>
          <p style={styles.subtitle}>Personal Finance Tracker</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.card, ...styles.cardBalance }}>
          <span style={styles.cardLabel}>Total Balance</span>
          <span style={{ ...styles.cardAmount, color: balance >= 0 ? "#a3ffb0" : "#ff8fa3" }}>
            {fmt(balance)}
          </span>
        </div>
        <div style={{ ...styles.card, ...styles.cardIncome }}>
          <span style={styles.cardLabel}>Income</span>
          <span style={{ ...styles.cardAmount, color: "#a3ffb0" }}>{fmt(totalIncome)}</span>
          <div style={styles.cardIcon}>↑</div>
        </div>
        <div style={{ ...styles.card, ...styles.cardExpense }}>
          <span style={styles.cardLabel}>Expenses</span>
          <span style={{ ...styles.cardAmount, color: "#ff8fa3" }}>{fmt(totalExpenses)}</span>
          <div style={styles.cardIcon}>↓</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainGrid}>
        {/* Form */}
        <div style={styles.formPanel}>
          <h2 style={styles.panelTitle}>Add Transaction</h2>
          {error && <div style={styles.error}>{error}</div>}

          <label style={styles.label}>Description</label>
          <input
            style={styles.input}
            className="flow-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Salary, Groceries…"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <label style={styles.label}>Amount (USD)</label>
          <input
            style={styles.input}
            className="flow-input"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <label style={styles.label}>Type</label>
          <select
            style={styles.select}
            className="flow-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <button style={styles.addBtn} className="flow-btn" onClick={handleAdd}>
            + Add Transaction
          </button>

          <button 
            style={styles.downloadBtn} 
            className="flow-btn" 
            onClick={handleDownloadCSV}
            disabled={transactions.length === 0}
          >
            ↓ Download CSV
          </button>
        </div>

        {/* Transaction List */}
        <div style={styles.listPanel}>
          <h2 style={styles.panelTitle}>
            Transactions
            <span style={styles.badge}>{transactions.length}</span>
          </h2>

          {transactions.length === 0 ? (
            <div style={styles.empty}>No transactions yet. Add one!</div>
          ) : (
            <ul style={styles.list}>
              {transactions.map((t) => (
                <li
                  key={t.id}
                  style={styles.item}
                  className={`flow-item ${animateId === t.id ? "flow-enter" : ""}`}
                >
                  <div style={styles.itemLeft}>
                    <div
                      style={{
                        ...styles.dot,
                        background: t.type === "income" ? "#a3ffb0" : "#ff8fa3",
                        boxShadow: `0 0 8px ${t.type === "income" ? "#a3ffb040" : "#ff8fa340"}`,
                      }}
                    />
                    <div>
                      <div style={styles.itemDesc}>{t.description}</div>
                      <div style={styles.itemType}>
                        {t.type === "income" ? "Income" : "Expense"}
                      </div>
                    </div>
                  </div>
                  <div style={styles.itemRight}>
                    <span
                      style={{
                        ...styles.itemAmount,
                        color: t.type === "income" ? "#a3ffb0" : "#ff8fa3",
                      }}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {fmt(t.amount)}
                    </span>
                    <button
                      style={styles.deleteBtn}
                      className="flow-del"
                      onClick={() => handleDelete(t.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────── */
const styles = {
  root: {
    minHeight: "100vh",
    background: "#0d0f14",
    color: "#e8e6e1",
    fontFamily: "'DM Mono', 'Fira Mono', monospace",
    padding: "32px 24px 64px",
    maxWidth: 960,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 40,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "linear-gradient(135deg, #a3ffb0 0%, #4dffa4 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    color: "#0d0f14",
    fontWeight: 700,
    boxShadow: "0 0 24px #4dffa430",
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: "0.12em",
    background: "linear-gradient(90deg, #a3ffb0, #fff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    margin: 0,
    fontSize: 12,
    color: "#666",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: "24px 28px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  cardBalance: {
    background: "linear-gradient(135deg, #1a1d26 0%, #141720 100%)",
    border: "1px solid #2a2d3a",
  },
  cardIncome: {
    background: "linear-gradient(135deg, #0d1f12 0%, #111a14 100%)",
    border: "1px solid #1e3024",
  },
  cardExpense: {
    background: "linear-gradient(135deg, #1f0d12 0%, #1a1115 100%)",
    border: "1px solid #30202a",
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#666",
  },
  cardAmount: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  cardIcon: {
    position: "absolute",
    right: 20,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 36,
    opacity: 0.07,
    fontWeight: 900,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 24,
    alignItems: "start",
  },
  formPanel: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 20,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  panelTitle: {
    margin: "0 0 8px",
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#aaa",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    background: "#a3ffb020",
    color: "#a3ffb0",
    border: "1px solid #a3ffb040",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#555",
    marginTop: 4,
  },
  input: {
    background: "#0d0f14",
    border: "1px solid #22253a",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#e8e6e1",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    background: "#0d0f14",
    border: "1px solid #22253a",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#e8e6e1",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='%23666'%3E%3Cpath d='M6 8 0 0h12z'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "calc(100% - 14px) center",
  },
  addBtn: {
    marginTop: 8,
    background: "linear-gradient(135deg, #4dffa4, #a3ffb0)",
    color: "#0d0f14",
    border: "none",
    borderRadius: 10,
    padding: "14px",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 20px #4dffa430",
  },
  downloadBtn: {
    marginTop: 8,
    background: "linear-gradient(135deg, #4da6ff, #a3d8ff)",
    color: "#0d0f14",
    border: "none",
    borderRadius: 10,
    padding: "14px",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 20px #4da6ff30",
    width: "100%",
  },
  "downloadBtn:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  error: {
    background: "#ff8fa315",
    border: "1px solid #ff8fa340",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#ff8fa3",
    letterSpacing: "0.04em",
  },
  listPanel: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 20,
    padding: "28px 24px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 480,
    overflowY: "auto",
    paddingRight: 4,
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0d0f14",
    border: "1px solid #1e2130",
    borderRadius: 12,
    padding: "14px 16px",
    transition: "border-color 0.2s",
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  itemDesc: {
    fontSize: 14,
    fontWeight: 600,
    color: "#e8e6e1",
    marginBottom: 2,
  },
  itemType: {
    fontSize: 11,
    color: "#555",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  itemRight: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexShrink: 0,
  },
  itemAmount: {
    fontSize: 15,
    fontWeight: 700,
  },
  deleteBtn: {
    background: "#ff8fa315",
    border: "1px solid #ff8fa330",
    color: "#ff8fa3",
    borderRadius: 8,
    width: 30,
    height: 30,
    fontSize: 18,
    lineHeight: "1",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s, transform 0.15s",
    padding: 0,
    flexShrink: 0,
  },
  empty: {
    textAlign: "center",
    color: "#444",
    fontSize: 13,
    padding: "40px 0",
    letterSpacing: "0.06em",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }
  .flow-input:focus { border-color: #4dffa4 !important; }
  .flow-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  .flow-btn:active { transform: translateY(0); }
  .flow-btn:disabled { opacity: 0.5; cursor: not-allowed !important; transform: none !important; }
  .flow-del:hover { background: #ff8fa330 !important; transform: scale(1.1); }
  .flow-item:hover { border-color: #2e3248 !important; }
  @keyframes flowEnter {
    from { opacity: 0; transform: translateY(-10px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .flow-enter { animation: flowEnter 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
  ul::-webkit-scrollbar { width: 4px; }
  ul::-webkit-scrollbar-track { background: transparent; }
  ul::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 4px; }
`;
