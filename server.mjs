import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ─── MongoDB Atlas Connection ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅  Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌  MongoDB connection error:', err);
    process.exit(1);
  });

// ─── Schema & Model ─────────────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  type:        { type: String, required: true, enum: ['income', 'expense'] },
  category:    { type: String, required: true },
  date:        { type: String, required: true },
  notes:       { type: String, default: '' },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

// ─── Routes ─────────────────────────────────────────────────────────────────

// Root route - API status
app.get('/', (req, res) => {
  res.send('🚀 Expense Tracker API is running. Access endpoints at /api/expenses');
});

// GET /api/expenses — Retrieve all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses — Add new transaction
app.post('/api/expenses', async (req, res) => {
  try {
    const { description, amount, type, category, date, notes, isRecurring } = req.body;
    if (!description || !amount || !type || !category || !date) {
      return res.status(400).json({ error: 'Required fields are missing.' });
    }
    const expense = await Expense.create({ description, amount, type, category, date, notes, isRecurring });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id — Delete transaction
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id — Update transaction
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { description, amount, type, category, date, notes, isRecurring } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { description, amount, type, category, date, notes, isRecurring },
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: 'Transaction not found.' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));
