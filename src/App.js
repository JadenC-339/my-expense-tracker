import { useState, useEffect } from "react";

// Category Icons/Emojis
const CATEGORY_ICONS = {
  "Groceries": "🛒",
  "Utilities": "💡",
  "Rent": "🏠",
  "Entertainment": "🎬",
  "Healthcare": "⚕️",
  "Transportation": "🚗",
  "Dining": "🍽️",
  "Shopping": "🛍️",
  "Education": "📚",
  "Other": "📌",
  "Salary": "💼",
  "Freelance": "💻",
  "Investments": "📈",
  "Gifts": "🎁",
  "Bonus": "🎉",
};

// Expense Categories
const EXPENSE_CATEGORIES = [
  "Groceries", "Utilities", "Rent", "Entertainment", "Healthcare",
  "Transportation", "Dining", "Shopping", "Education", "Other"
];

const INCOME_CATEGORIES = [
  "Salary", "Freelance", "Investments", "Gifts", "Bonus", "Other"
];

const initialTransactions = [
  { id: 1, description: "Monthly Salary", amount: 5000, type: "income", category: "Salary", date: "2026-02-19", notes: "Regular monthly salary", isRecurring: true },
  { id: 2, description: "Rent Payment", amount: 1500, type: "expense", category: "Rent", date: "2026-02-01", notes: "February rent", isRecurring: true },
  { id: 3, description: "Weekly Groceries", amount: 150, type: "expense", category: "Groceries", date: "2026-02-18", notes: "Costco shopping", isRecurring: false },
  { id: 4, description: "Electric Bill", amount: 120, type: "expense", category: "Utilities", date: "2026-02-10", notes: "", isRecurring: true },
];

const BUDGET_DEFAULTS = {
  Groceries: 600,
  Utilities: 200,
  Entertainment: 300,
  Dining: 200,
  Shopping: 250,
  Transportation: 150,
  Healthcare: 200,
  Education: 300,
};

export default function App() {
  // State Management
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("budgets");
    return saved ? JSON.parse(saved) : BUDGET_DEFAULTS;
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Groceries");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState("");
  const [animateId, setAnimateId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingId, setEditingId] = useState(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState("Groceries");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(true);

  // Cursor animation - track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setShowCursor(true);
    };

    const handleMouseLeave = () => {
      setShowCursor(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Save to localStorage when transactions change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Save to localStorage when budgets change
  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);


  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Get current month transactions - Fixed comparison logic
  const today = new Date();
  const currentMonthNum = String(today.getMonth() + 1).padStart(2, '0');
  const currentYearNum = today.getFullYear();
  
  const currentMonthTransactions = transactions.filter((t) => {
    const [year, month] = t.date.split("-").slice(0, 2);
    return year === String(currentYearNum) && month === currentMonthNum;
  });

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown
  const getCategoryBreakdown = () => {
    const breakdown = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      });
    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  };

  // Budget tracking
  const getBudgetStatus = (cat) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    const budget = budgets[cat] || 0;
    return { spent, budget, remaining: budget - spent, percentage: budget > 0 ? (spent / budget) * 100 : 0 };
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchText.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = filterCategory === "All" || t.category === filterCategory;
    const matchesType = filterType === "All" || t.type === filterType;
    const matchesDateStart = !dateRangeStart || t.date >= dateRangeStart;
    const matchesDateEnd = !dateRangeEnd || t.date <= dateRangeEnd;
    return matchesSearch && matchesCategory && matchesType && matchesDateStart && matchesDateEnd;
  }).sort((a, b) => {
    switch(sortBy) {
      case "date-desc":
        return new Date(b.date) - new Date(a.date);
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      case "name-asc":
        return a.description.localeCompare(b.description);
      case "name-desc":
        return b.description.localeCompare(a.description);
      default:
        return 0;
    }
  });

  // Handle Add/Edit Transaction
  const handleAddTransaction = () => {
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!date) {
      setError("Please select a date.");
      return;
    }

    setError("");
    
    if (editingId) {
      // Edit existing transaction
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, description: description.trim(), amount: parsed, type, category, date, notes, isRecurring }
            : t
        )
      );
      setEditingId(null);
    } else {
      // Add new transaction
      const newId = Date.now();
      setTransactions((prev) => [
        { id: newId, description: description.trim(), amount: parsed, type, category, date, notes, isRecurring },
        ...prev,
      ]);
      setAnimateId(newId);
      setTimeout(() => setAnimateId(null), 600);
    }

    // Reset form
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Groceries");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setIsRecurring(false);
  };

  const handleEdit = (transaction) => {
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(transaction.date);
    setNotes(transaction.notes);
    setIsRecurring(transaction.isRecurring);
    setEditingId(transaction.id);
    setActiveTab("form");
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCancelEdit = () => {
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Groceries");
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setIsRecurring(false);
    setEditingId(null);
  };

  const handleSaveBudget = () => {
    const budgetVal = parseFloat(budgetAmount);
    if (!budgetAmount || isNaN(budgetVal) || budgetVal < 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    setBudgets((prev) => ({
      ...prev,
      [selectedBudgetCategory]: budgetVal,
    }));
    setBudgetAmount("");
    setShowBudgetModal(false);
  };

  const handleDownloadCSV = () => {
    const headers = ["Description", "Amount", "Type", "Category", "Date", "Notes", "Recurring"];
    const rows = filteredTransactions.map((t) => [
      t.description,
      t.amount,
      t.type === "income" ? "Income" : "Expense",
      t.category,
      t.date,
      t.notes,
      t.isRecurring ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `expense_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fmt = (n) =>
    n.toLocaleString("en-IN", { style: "currency", currency: "INR" });

  const getMonthYear = () => {
    const today = new Date();
    return today.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const categoryBudgetBreakdown = getCategoryBreakdown();

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* Falling Cash Animation */}
      <div style={styles.cashContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="falling-cash"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
              opacity: 0.1 + Math.random() * 0.15,
            }}
          >
            💵
          </div>
        ))}
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <div style={styles.logoMark}>💰</div>
            <div>
              <h1 style={styles.title}>FinanceFlow</h1>
              <p style={styles.subtitle}>Smart Expense & Income Tracker</p>
            </div>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.headerStat}>
              <span style={styles.headerLabel}>Balance</span>
              <span style={{ ...styles.headerValue, color: balance >= 0 ? "#4dffa4" : "#ff8fa3" }}>
                {fmt(balance)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={styles.nav}>
        {["dashboard", "form", "transactions", "analytics", "budgets"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.navBtn,
              ...(activeTab === tab ? styles.navBtnActive : {}),
            }}
            className="nav-btn"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Custom Cursor */}
      {showCursor && (
        <>
          <div
            style={{
              position: "fixed",
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: "20px",
              height: "20px",
              background: "radial-gradient(circle, rgba(77, 255, 164, 0.8) 0%, rgba(77, 255, 164, 0.2) 100%)",
              borderRadius: "50%",
              border: "2px solid #4dffa4",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              boxShadow: "0 0 12px rgba(77, 255, 164, 0.6), inset 0 0 8px rgba(77, 255, 164, 0.3)",
            }}
            className="cursor-dot"
          />
          <div
            style={{
              position: "fixed",
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: "40px",
              height: "40px",
              border: "2px solid rgba(77, 255, 164, 0.4)",
              borderRadius: "50%",
              pointerEvents: "none",
              transform: "translate(-50%, -50%)",
              zIndex: 9998,
            }}
            className="cursor-ring"
          />
        </>
      )}

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div style={styles.container} className="tab-content fade-in">
          {/* Summary Cards */}
          <div style={styles.summaryGrid}>
            <div style={{ ...styles.card, ...styles.cardBalance }}>
              <span style={styles.cardLabel}>Total Balance</span>
              <span style={{ ...styles.cardAmount, color: balance >= 0 ? "#4dffa4" : "#ff8fa3" }}>
                {fmt(balance)}
              </span>
              <span style={styles.cardSmall}>All time</span>
            </div>
            <div style={{ ...styles.card, ...styles.cardIncome }}>
              <span style={styles.cardLabel}>Total Income</span>
              <span style={{ ...styles.cardAmount, color: "#4dffa4" }}>{fmt(totalIncome)}</span>
              <span style={styles.cardSmall}>All {transactions.filter((t) => t.type === "income").length} transactions</span>
            </div>
            <div style={{ ...styles.card, ...styles.cardExpense }}>
              <span style={styles.cardLabel}>Total Expenses</span>
              <span style={{ ...styles.cardAmount, color: "#ff8fa3" }}>{fmt(totalExpenses)}</span>
              <span style={styles.cardSmall}>All {transactions.filter((t) => t.type === "expense").length} transactions</span>
            </div>
            <div style={{ ...styles.card, ...styles.cardMonth }}>
              <span style={styles.cardLabel}>{getMonthYear()}</span>
              <span style={styles.cardAmount}>{fmt(currentMonthIncome - currentMonthExpenses)}</span>
              <span style={styles.cardSmall}>Income: {fmt(currentMonthIncome)} | Expenses: {fmt(currentMonthExpenses)}</span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Spending by Category</h2>
            <div style={styles.categoryGrid}>
              {categoryBudgetBreakdown.length > 0 ? (
                categoryBudgetBreakdown.map(([cat, amount], index) => {
                  const percentage = (amount / totalExpenses) * 100;
                  return (
                    <div key={cat} style={{ ...styles.categoryCard, animationDelay: `${index * 50}ms` }}>
                      <div style={styles.categoryHeader}>
                        <span style={styles.categoryNameWithIcon}>
                          <span style={{ fontSize: 18, marginRight: 6 }}>{CATEGORY_ICONS[cat]}</span>
                          {cat}
                        </span>
                        <span style={styles.categoryAmount}>{fmt(amount)}</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${percentage}%` }} />
                      </div>
                      <span style={styles.categoryPercent}>{percentage.toFixed(1)}% of total</span>
                    </div>
                  );
                })
              ) : (
                <p style={styles.empty}>No expense data yet</p>
              )}
            </div>
          </div>

          {/* Budget Overview */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Budget Status</h2>
              <button onClick={() => setShowBudgetModal(true)} style={styles.smallBtn}>
                ⚙️ Manage Budgets
              </button>
            </div>
            <div style={styles.budgetGrid}>
              {Object.keys(budgets).map((cat) => {
                const status = getBudgetStatus(cat);
                const isOver = status.spent > status.budget;
                return (
                  <div key={cat} style={styles.budgetCard}>
                    <div style={styles.budgetHeader}>
                      <span style={styles.budgetName}>{cat}</span>
                      <span style={{ color: isOver ? "#ff8fa3" : "#4dffa4" }}>
                        {fmt(status.spent)} / {fmt(status.budget)}
                      </span>
                    </div>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(status.percentage, 100)}%`,
                          background: isOver ? "#ff8fa3" : "#4dffa4",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: "#666" }}>
                      {isOver ? `Over by ${fmt(status.spent - status.budget)}` : `${fmt(status.remaining)} remaining`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Form Tab */}
      {activeTab === "form" && (
        <div style={styles.container} className="tab-content fade-in">
          <div style={styles.formCard}>
            <h2 style={styles.formTitle}>{editingId ? "Edit Transaction" : "Add New Transaction"}</h2>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <input
                  style={styles.input}
                  className="flow-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Grocery shopping..."
                  onKeyDown={(e) => e.key === "Enter" && handleAddTransaction()}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (INR)</label>
                <input
                  style={styles.input}
                  className="flow-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Type</label>
                <select
                  style={styles.select}
                  className="flow-input"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setCategory(e.target.value === "income" ? "Salary" : "Groceries");
                  }}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.select}
                  className="flow-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {(type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date</label>
                <input
                  style={styles.input}
                  className="flow-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (Optional)</label>
                <textarea
                  style={{ ...styles.input, minHeight: 80 }}
                  className="flow-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional details..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                  Mark as recurring transaction
                </label>
              </div>
            </div>

            <div style={styles.formButtons}>
              <button style={styles.submitBtn} className="flow-btn" onClick={handleAddTransaction}>
                {editingId ? "✓ Update Transaction" : "+ Add Transaction"}
              </button>
              {editingId && (
                <button style={styles.cancelBtn} onClick={handleCancelEdit}>
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div style={styles.container} className="tab-content fade-in">
          {/* Filters */}
          <div style={styles.filterCard}>
            <h2 style={styles.sectionTitle}>Filters & Search</h2>
            <div style={styles.filterGrid}>
              <input
                style={styles.input}
                className="flow-input"
                type="text"
                placeholder="Search description or notes..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <select
                style={styles.select}
                className="flow-input"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              <select
                style={styles.select}
                className="flow-input"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                {[...new Set(transactions.map((t) => t.category))].sort().map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </option>
                ))}
              </select>
              <input
                style={styles.input}
                className="flow-input"
                type="date"
                placeholder="From date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
              />
              <input
                style={styles.input}
                className="flow-input"
                type="date"
                placeholder="To date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
              />
              <select
                style={styles.select}
                className="flow-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date-desc">📅 Newest First</option>
                <option value="date-asc">📅 Oldest First</option>
                <option value="amount-desc">💰 Highest Amount</option>
                <option value="amount-asc">💰 Lowest Amount</option>
                <option value="name-asc">A-Z Name</option>
                <option value="name-desc">Z-A Name</option>
              </select>
            </div>
            <div style={styles.filterStats}>
              <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
              <button onClick={handleDownloadCSV} style={styles.downloadBtn} className="flow-btn">
                ↓ Download CSV
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div style={styles.listCard}>
            <h2 style={styles.sectionTitle}>
              Transactions
              <span style={styles.badge}>{filteredTransactions.length}</span>
            </h2>

            {filteredTransactions.length === 0 ? (
              <div style={styles.empty}>No transactions found.</div>
            ) : (
              <ul style={styles.list}>
                {filteredTransactions.map((t) => (
                  <li
                    key={t.id}
                    style={{
                      ...styles.item,
                      ...(hoveredCardId === t.id ? styles.itemHovered : {}),
                    }}
                    className={`flow-item ${animateId === t.id ? "flow-enter" : ""}`}
                    onMouseEnter={() => setHoveredCardId(t.id)}
                    onMouseLeave={() => setHoveredCardId(null)}
                  >
                    <div style={styles.itemContent}>
                      <div style={styles.itemLeft}>
                        <div
                          style={{
                            ...styles.dot,
                            background: t.type === "income" ? "#4dffa4" : "#ff8fa3",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={styles.itemDesc}>{t.description}</div>
                          <div style={styles.itemMeta}>
                            <span style={styles.itemCategory}>
                              {CATEGORY_ICONS[t.category]} {t.category}
                            </span>
                            <span style={styles.itemDate}>{new Date(t.date).toLocaleDateString()}</span>
                            {t.isRecurring && <span style={styles.itemRecurring}>🔄 Recurring</span>}
                          </div>
                          {t.notes && <div style={styles.itemNotes}>📝 {t.notes}</div>}
                        </div>
                      </div>
                      <div style={styles.itemRight}>
                        <span
                          style={{
                            ...styles.itemAmount,
                            color: t.type === "income" ? "#4dffa4" : "#ff8fa3",
                          }}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {fmt(t.amount)}
                        </span>
                        <button
                          style={styles.editBtn}
                          onClick={() => handleEdit(t)}
                          title="Edit"
                          className="smooth-btn"
                        >
                          ✎
                        </button>
                        <button
                          style={styles.deleteBtn}
                          className="flow-del smooth-btn"
                          onClick={() => handleDelete(t.id)}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div style={styles.container} className="tab-content fade-in">
          <div style={styles.analyticsGrid}>
            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>Monthly Overview</h3>
              <div style={styles.analyticsContent}>
                <div style={styles.analyticsRow}>
                  <span>Month:</span>
                  <strong>{getMonthYear()}</strong>
                </div>
                <div style={styles.analyticsRow}>
                  <span>Income:</span>
                  <span style={{ color: "#4dffa4" }}>{fmt(currentMonthIncome)}</span>
                </div>
                <div style={styles.analyticsRow}>
                  <span>Expenses:</span>
                  <span style={{ color: "#ff8fa3" }}>{fmt(currentMonthExpenses)}</span>
                </div>
                <div style={styles.analyticsRow}>
                  <span>Net:</span>
                  <strong style={{ color: currentMonthIncome - currentMonthExpenses >= 0 ? "#4dffa4" : "#ff8fa3" }}>
                    {fmt(currentMonthIncome - currentMonthExpenses)}
                  </strong>
                </div>
              </div>
            </div>

            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>Spending Habits</h3>
              <div style={styles.analyticsContent}>
                {categoryBudgetBreakdown.length > 0 ? (
                  <>
                    <div style={styles.analyticsRow}>
                      <span>Top Category:</span>
                      <strong>{categoryBudgetBreakdown[0][0]} ({fmt(categoryBudgetBreakdown[0][1])})</strong>
                    </div>
                    <div style={styles.analyticsRow}>
                      <span>Avg Transaction:</span>
                      <strong>{fmt(totalExpenses / Math.max(transactions.filter((t) => t.type === "expense").length, 1))}</strong>
                    </div>
                    <div style={styles.analyticsRow}>
                      <span>Total Categories:</span>
                      <strong>{categoryBudgetBreakdown.length}</strong>
                    </div>
                    <div style={styles.analyticsRow}>
                      <span>Recurring Count:</span>
                      <strong>{transactions.filter((t) => t.isRecurring).length}</strong>
                    </div>
                  </>
                ) : (
                  <p style={styles.empty}>No data available</p>
                )}
              </div>
            </div>

            <div style={styles.analyticsCard}>
              <h3 style={styles.analyticsTitle}>Savings Rate</h3>
              <div style={styles.analyticsContent}>
                {totalIncome > 0 ? (
                  <>
                    <div style={styles.analyticsRow}>
                      <span>Total Income:</span>
                      <strong style={{ color: "#4dffa4" }}>{fmt(totalIncome)}</strong>
                    </div>
                    <div style={styles.analyticsRow}>
                      <span>Total Expenses:</span>
                      <strong style={{ color: "#ff8fa3" }}>{fmt(totalExpenses)}</strong>
                    </div>
                    <div style={styles.analyticsRow}>
                      <span>Savings:</span>
                      <strong>{fmt(balance)}</strong>
                    </div>
                    <div style={styles.analyticsRow}>
                      <span>Save Rate:</span>
                      <strong style={{ color: "#4dffa4" }}>
                        {((balance / totalIncome) * 100).toFixed(1)}%
                      </strong>
                    </div>
                  </>
                ) : (
                  <p style={styles.empty}>Add income to see savings rate</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === "budgets" && (
        <div style={styles.container} className="tab-content fade-in">
          <div style={styles.budgetPageCard}>
            <div style={styles.budgetPageHeader}>
              <h2 style={styles.sectionTitle}>Budget Management</h2>
              <button onClick={() => setShowBudgetModal(true)} style={styles.addBudgetBtn}>
                + Add/Edit Budget
              </button>
            </div>

            {Object.keys(budgets).length > 0 ? (
              <div style={styles.budgetList}>
                {Object.keys(budgets)
                  .sort()
                  .map((cat) => {
                    const status = getBudgetStatus(cat);
                    return (
                      <div key={cat} style={styles.budgetListItem}>
                        <div style={styles.budgetItemHeader}>
                          <span style={styles.budgetItemName}>{cat}</span>
                          <span
                            style={{
                              ...styles.budgetItemAmount,
                              color: status.spent > status.budget ? "#ff8fa3" : "#4dffa4",
                            }}
                          >
                            {fmt(status.spent)} / {fmt(status.budget)}
                          </span>
                        </div>
                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${Math.min(status.percentage, 100)}%`,
                              background:
                                status.percentage > 100 ? "#ff8fa3" : status.percentage > 80 ? "#ffd700" : "#4dffa4",
                            }}
                          />
                        </div>
                        <div style={styles.budgetStatus}>
                          <span>{status.percentage.toFixed(0)}% used</span>
                          <span style={{ color: status.spent > status.budget ? "#ff8fa3" : "#4dffa4" }}>
                            {status.spent > status.budget
                              ? `Over by ${fmt(status.spent - status.budget)}`
                              : `${fmt(status.remaining)} left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div style={styles.empty}>No budgets set yet. Create one to get started!</div>
            )}
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Set Budget</h2>
            <select
              style={styles.select}
              className="flow-input"
              value={selectedBudgetCategory}
              onChange={(e) => {
                setSelectedBudgetCategory(e.target.value);
                setBudgetAmount(budgets[e.target.value]?.toString() || "");
              }}
            >
              {[...EXPENSE_CATEGORIES, ...Object.keys(budgets)].filter((v, i, a) => a.indexOf(v) === i).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              style={styles.input}
              className="flow-input"
              type="number"
              min="0"
              step="0.01"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="Budget amount"
            />
            <div style={styles.modalButtons}>
              <button onClick={handleSaveBudget} style={styles.submitBtn} className="flow-btn">
                Save Budget
              </button>
              <button onClick={() => setShowBudgetModal(false)} style={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
    paddingBottom: 64,
    position: "relative",
    overflow: "hidden",
  },
  cashContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 0,
    overflow: "hidden",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "32px 24px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    background: "linear-gradient(135deg, #1a1d26 0%, #141720 100%)",
    borderBottom: "1px solid #2a2d3a",
    padding: "32px 24px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logoMark: {
    fontSize: 32,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    background: "linear-gradient(90deg, #4dffa4, #fff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#666",
  },
  headerStats: {
    display: "flex",
    gap: 24,
  },
  headerStat: {
    textAlign: "right",
  },
  headerLabel: {
    fontSize: 11,
    color: "#666",
    display: "block",
  },
  headerValue: {
    fontSize: 20,
    fontWeight: 700,
  },
  nav: {
    background: "#13151d",
    borderBottom: "1px solid #22253a",
    display: "flex",
    gap: 0,
    overflowX: "auto",
    padding: "0 24px",
    position: "relative",
    zIndex: 50,
  },
  navBtn: {
    flex: "1 0 auto",
    padding: "14px 20px",
    border: "none",
    background: "none",
    color: "#666",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    borderBottom: "2px solid transparent",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    fontFamily: "inherit",
    position: "relative",
    overflow: "hidden",
  },
  navBtnActive: {
    color: "#4dffa4",
    borderBottomColor: "#4dffa4",
    textShadow: "0 0 8px rgba(77, 255, 164, 0.3)",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
    marginBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: "24px",
    border: "1px solid #2a2d3a",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  cardBalance: {
    background: "linear-gradient(135deg, #1a1d26 0%, #141720 100%)",
  },
  cardIncome: {
    background: "linear-gradient(135deg, #0d1f12 0%, #111a14 100%)",
  },
  cardExpense: {
    background: "linear-gradient(135deg, #1f0d12 0%, #1a1115 100%)",
  },
  cardMonth: {
    background: "linear-gradient(135deg, #1a1020 0%, #16101d 100%)",
  },
  cardLabel: {
    fontSize: 11,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#666",
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 700,
  },
  cardSmall: {
    fontSize: 10,
    color: "#555",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: "#e8e6e1",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  categoryCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 12,
    padding: "16px",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    cursor: "pointer",
  },
  categoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: 600,
  },
  categoryNameWithIcon: {
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: 600,
    color: "#4dffa4",
  },
  categoryPercent: {
    fontSize: 11,
    color: "#555",
  },
  progressBar: {
    background: "#0d0f14",
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    background: "#4dffa4",
    transition: "width 0.3s",
  },
  budgetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  budgetCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 12,
    padding: "16px",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    cursor: "pointer",
  },
  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 13,
  },
  budgetName: {
    fontWeight: 600,
  },
  formCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 20,
    padding: "32px",
    maxWidth: 800,
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  formTitle: {
    margin: "0 0 24px",
    fontSize: 20,
    fontWeight: 600,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#555",
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
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
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
    paddingRight: 34,
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontSize: 13,
  },
  formButtons: {
    display: "flex",
    gap: 12,
  },
  submitBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #4dffa4, #a3ffb0)",
    color: "#0d0f14",
    border: "none",
    borderRadius: 10,
    padding: "14px",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  cancelBtn: {
    padding: "14px 20px",
    background: "#22253a",
    color: "#e8e6e1",
    border: "1px solid #2a2d3a",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  error: {
    background: "#ff8fa315",
    border: "1px solid #ff8fa340",
    borderRadius: 8,
    padding: "12px 14px",
    fontSize: 12,
    color: "#ff8fa3",
    marginBottom: 16,
  },
  filterCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 20,
    padding: "24px",
    marginBottom: 24,
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  filterStats: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    color: "#666",
  },
  listCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 20,
    padding: "24px",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    background: "#0d0f14",
    border: "1px solid #1e2130",
    borderRadius: 12,
    padding: "14px 16px",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  itemHovered: {
    background: "#13151d",
    borderColor: "#2e3248",
    transform: "translateX(4px)",
  },
  itemContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    gap: 16,
  },
  itemLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: 4,
  },
  itemDesc: {
    fontSize: 14,
    fontWeight: 600,
    color: "#e8e6e1",
    marginBottom: 4,
  },
  itemMeta: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 11,
    color: "#555",
  },
  itemCategory: {
    background: "#22253a",
    padding: "2px 8px",
    borderRadius: 4,
  },
  itemDate: {},
  itemRecurring: {
    color: "#4dffa4",
  },
  itemNotes: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
  },
  itemRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: 700,
  },
  editBtn: {
    background: "#22253a",
    border: "1px solid #2a2d3a",
    color: "#4dffa4",
    borderRadius: 8,
    width: 30,
    height: 30,
    fontSize: 16,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    padding: 0,
  },
  deleteBtn: {
    background: "#ff8fa315",
    border: "1px solid #ff8fa330",
    color: "#ff8fa3",
    borderRadius: 8,
    width: 30,
    height: 30,
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    padding: 0,
  },
  downloadBtn: {
    background: "linear-gradient(135deg, #4da6ff, #a3d8ff)",
    color: "#0d0f14",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  smallBtn: {
    background: "#22253a",
    color: "#4dffa4",
    border: "1px solid #2a2d3a",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  addBudgetBtn: {
    background: "linear-gradient(135deg, #4dffa4, #a3ffb0)",
    color: "#0d0f14",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
  },
  badge: {
    background: "#a3ffb020",
    color: "#4dffa4",
    border: "1px solid #a3ffb040",
    borderRadius: 20,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 700,
    marginLeft: 8,
  },
  empty: {
    textAlign: "center",
    color: "#444",
    fontSize: 13,
    padding: "40px 20px",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 24,
  },
  analyticsCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 16,
    padding: "24px",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    cursor: "pointer",
  },
  analyticsTitle: {
    margin: "0 0 16px",
    fontSize: 16,
    fontWeight: 600,
  },
  analyticsContent: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  analyticsRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    padding: "8px 0",
    borderBottom: "1px solid #1e2130",
  },
  budgetPageCard: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 20,
    padding: "24px",
  },
  budgetPageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  budgetList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  budgetListItem: {
    background: "#0d0f14",
    border: "1px solid #22253a",
    borderRadius: 12,
    padding: "16px",
    transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
    cursor: "pointer",
  },
  budgetItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  budgetItemName: {
    fontSize: 14,
    fontWeight: 600,
  },
  budgetItemAmount: {
    fontSize: 14,
    fontWeight: 600,
  },
  budgetStatus: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    marginTop: 8,
    color: "#666",
  },
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#13151d",
    border: "1px solid #22253a",
    borderRadius: 16,
    padding: "32px",
    maxWidth: 400,
    width: "90%",
    animation: "modalSlideIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards",
  },
  modalTitle: {
    margin: "0 0 24px",
    fontSize: 18,
    fontWeight: 600,
  },
  modalButtons: {
    display: "flex",
    gap: 12,
    marginTop: 24,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');
  
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; scroll-behavior: smooth; cursor: none; }
  
  /* ═══ FALLING CASH ANIMATION ═══ */
  @keyframes fallCash {
    0% {
      transform: translateY(-100px) rotateZ(0deg);
      opacity: 0;
    }
    2% {
      opacity: 1;
    }
    95% {
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotateZ(720deg);
      opacity: 0;
    }
  }
  
  .falling-cash {
    position: absolute;
    font-size: 40px;
    top: -100px;
    pointer-events: none;
    animation: fallCash linear infinite;
    text-shadow: 0 0 15px rgba(76, 175, 80, 0.6);
    filter: drop-shadow(0 0 8px rgba(77, 255, 164, 0.3));
    will-change: transform;
  }
  
  /* Smooth input animations */
  .flow-input {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1) !important;
  }
  .flow-input:focus { 
    border-color: #4dffa4 !important; 
    box-shadow: 0 0 0 3px rgba(77, 255, 164, 0.1) !important;
  }
  
  /* Smooth button animations */
  .flow-btn {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1) !important;
  }
  .flow-btn:hover { 
    opacity: 0.88; 
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 20px rgba(77, 255, 164, 0.3) !important;
  }
  .flow-btn:active { transform: translateY(0) !important; }
  .flow-btn:disabled { 
    opacity: 0.5; 
    cursor: not-allowed !important;
    transform: none !important;
  }
  
  /* Submit button gradient hover */
  button[style*="linear-gradient(135deg, #4dffa4"] {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1) !important;
  }
  button[style*="linear-gradient(135deg, #4dffa4"]:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(77, 255, 164, 0.4) !important;
    filter: brightness(1.08);
  }
  button[style*="linear-gradient(135deg, #4dffa4"]:active {
    transform: translateY(0) !important;
  }
  
  /* Smooth button states */
  .smooth-btn {
    transition: all 0.25s ease-out;
  }
  .smooth-btn:hover {
    transform: scale(1.08);
  }
  .smooth-btn:active {
    transform: scale(0.96);
  }
  
  /* Delete button smooth effects */
  .flow-del:hover { 
    background: #ff8fa330 !important; 
    transform: scale(1.1) rotate(5deg); 
  }
  .flow-del:active {
    transform: scale(1) rotate(0deg);
  }
  
  /* Card hover animations */
  .flow-item:hover { 
    border-color: #2e3248 !important; 
  }
  
  /* Category card effects */
  .category-card-hover:hover {
    border-color: #4dffa4 !important;
    background: #191c28 !important;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(77, 255, 164, 0.15);
  }
  
  /* Card hover effects for all card types */
  div[style*="background: #13151d"][style*="border: 1px solid #22253a"]:hover {
    border-color: #2a3250 !important;
  }
  
  /* Form and filter card hover */
  .form-card-hover:hover,
  .filter-card-hover:hover {
    border-color: #2e3248 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  /* Tab animations */
  .nav-btn { 
    position: relative;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .nav-btn:hover {
    color: #4dffa4;
    opacity: 0.9;
  }
  
  /* Download button hover */
  button[style*="linear-gradient(135deg, #4da6ff"] {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  button[style*="linear-gradient(135deg, #4da6ff"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(77, 166, 255, 0.3);
  }
  
  /* Add/Edit Budget button hover */
  button[style*="linear-gradient(135deg, #4dffa4"] {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  button[style*="linear-gradient(135deg, #4dffa4"]:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(77, 255, 164, 0.4);
  }
  
  /* Small button hover */
  .small-btn-hover {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .small-btn-hover:hover {
    background: #2e3248 !important;
    border-color: #4dffa4 !important;
    color: #4dffa4 !important;
  }
  
  /* Smooth animations */
  @keyframes flowEnter {
    from { 
      opacity: 0; 
      transform: translateY(-10px) scale(0.97); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  
  .flow-enter { 
    animation: flowEnter 0.5s cubic-bezier(0.22,1,0.36,1) forwards; 
  }
  
  /* Smooth scrollbar */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: #0d0f14; }
  ::-webkit-scrollbar-thumb { 
    background: #2a2d3a; 
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  ::-webkit-scrollbar-thumb:hover { 
    background: #4dffa4; 
  }
  
  /* Smooth select dropdown */
  select {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  select:hover {
    border-color: #2e3248;
  }
  
  /* Modal smooth animations */
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Card animations */
  @keyframes cardEnter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Smooth transitions for all elements */
  input, select, button, textarea {
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  
  /* Enhanced input styling */
  input:hover, select:hover {
    border-color: #2e3248 !important;
  }
  
  /* Button effects */
  button:active {
    transform: scale(0.98);
  }
  
  /* Smooth text selection */
  ::selection {
    background-color: rgba(77, 255, 164, 0.3);
    color: #e8e6e1;
  }
  
  /* Smooth element appearance */
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes progressFill {
    from {
      width: 0;
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .pulse {
    animation: pulse 2s cubic-bezier(0.22,1,0.36,1) infinite;
  }
  
  /* Progress bar animation */
  div[style*="background: #4dffa4"][style*="height: 100%"] {
    animation: progressFill 0.8s ease-out;
  }
  
  /* ═══ CURSOR ANIMATION ═══ */
  .cursor-dot {
    animation: cursorPulse 2s ease-in-out infinite;
  }
  
  .cursor-ring {
    animation: cursorRing 3s linear infinite;
  }
  
  @keyframes cursorPulse {
    0%, 100% {
      box-shadow: 0 0 12px rgba(77, 255, 164, 0.6), inset 0 0 8px rgba(77, 255, 164, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(77, 255, 164, 0.8), inset 0 0 12px rgba(77, 255, 164, 0.5);
    }
  }
  
  @keyframes cursorRing {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.8);
      opacity: 0;
    }
  }
  
  /* ═══ TAB FADE ANIMATION ═══ */
  @keyframes fadeInTab {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .tab-content {
    animation: fadeInTab 0.4s cubic-bezier(0.22,1,0.36,1) forwards;
  }
  
  /* Enhanced tab button hover effects */
  .nav-btn:hover {
    text-shadow: 0 0 12px rgba(77, 255, 164, 0.4);
  }
  
  .nav-btn::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #4dffa4, transparent);
    transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  
  .nav-btn:hover::after {
    width: 100%;
  }
`;


