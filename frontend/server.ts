import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Data
  const transactions = [
    { id: '1', amount: 15000, type: 'income', category: 'Sales', date: '2026-04-01' },
    { id: '2', amount: 5000, type: 'expense', category: 'Rent', date: '2026-04-02' },
    { id: '3', amount: 2000, type: 'expense', category: 'Utilities', date: '2026-04-03' },
    { id: '4', amount: 12000, type: 'income', category: 'Service', date: '2026-04-05' },
    { id: '5', amount: 3000, type: 'expense', category: 'Marketing', date: '2026-04-07' },
  ];

  // API Routes
  app.get('/api/summary', (req, res) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    res.json({
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      expenseBreakdown: [
        { name: 'Rent', value: 5000 },
        { name: 'Utilities', value: 2000 },
        { name: 'Marketing', value: 3000 },
      ]
    });
  });

  app.get('/api/transactions', (req, res) => {
    res.json(transactions);
  });

  app.post('/api/transaction', (req, res) => {
    const newTransaction = { id: Date.now().toString(), ...req.body };
    transactions.unshift(newTransaction);
    res.json(newTransaction);
  });

  app.post('/api/ai-decision', (req, res) => {
    const { query } = req.body;
    // Mock AI response logic
    // In a real app, this might call Gemini on the server, 
    // but per guidelines, we prefer calling Gemini from the frontend.
    // However, the user asked for this endpoint. I'll provide a mock response.
    // If I wanted to use Gemini here, I'd need the API key.
    
    let verdict = "Neutral";
    let riskLevel = "Medium";
    let suggestedAction = "Analyze further";
    let logic = "Based on current cashflow trends.";

    if (query.toLowerCase().includes("invest")) {
      verdict = "Recommended with Caution";
      riskLevel = "Low-Medium";
      suggestedAction = "Proceed if cash reserve is > 20%";
      logic = "Your current runway is 6 months. This investment will reduce it to 5.5 months but expected ROI is 15%.";
    } else if (query.toLowerCase().includes("loan")) {
      verdict = "Not Recommended";
      riskLevel = "High";
      suggestedAction = "Avoid high-interest debt";
      logic = "Debt-to-income ratio is already at 40%. Adding more debt may impact liquidity.";
    }

    res.json({
      verdict,
      logic,
      riskLevel,
      suggestedAction
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
