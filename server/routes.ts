import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTransactionSchema, 
  insertBudgetSchema, 
  insertSavingsGoalSchema, 
  insertContractSchema, 
  insertCryptoHoldingSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // Transaction routes
  app.get("/api/transactions/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const transactions = await storage.getTransactions(userId);
    res.json(transactions);
  });
  
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      
      // Update budget if applicable
      if (transaction.type === "expense") {
        const budgets = await storage.getBudgets(transaction.userId);
        const budget = budgets.find(b => b.category === transaction.category);
        
        if (budget) {
          await storage.updateBudget(budget.id, parseFloat(transaction.amount.toString()) * -1);
        }
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  });
  
  // Budget routes
  app.get("/api/budgets/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const budgets = await storage.getBudgets(userId);
    res.json(budgets);
  });
  
  app.post("/api/budgets", async (req: Request, res: Response) => {
    try {
      const budgetData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  });
  
  // Savings goals routes
  app.get("/api/savings-goals/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const savingsGoals = await storage.getSavingsGoals(userId);
    res.json(savingsGoals);
  });
  
  app.post("/api/savings-goals", async (req: Request, res: Response) => {
    try {
      const goalData = insertSavingsGoalSchema.parse(req.body);
      const goal = await storage.createSavingsGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  });
  
  app.patch("/api/savings-goals/:id", async (req: Request, res: Response) => {
    const goalId = parseInt(req.params.id);
    if (isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }
    
    const { amount } = req.body;
    if (typeof amount !== "number") {
      return res.status(400).json({ message: "Amount must be a number" });
    }
    
    const updatedGoal = await storage.updateSavingsGoalProgress(goalId, amount);
    if (!updatedGoal) {
      return res.status(404).json({ message: "Savings goal not found" });
    }
    
    res.json(updatedGoal);
  });
  
  // Contracts routes
  app.get("/api/contracts/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const contracts = await storage.getContracts(userId);
    res.json(contracts);
  });
  
  app.post("/api/contracts", async (req: Request, res: Response) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      if (error instanceof Error) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  });
  
  app.patch("/api/contracts/:id", async (req: Request, res: Response) => {
    const contractId = parseInt(req.params.id);
    if (isNaN(contractId)) {
      return res.status(400).json({ message: "Invalid contract ID" });
    }
    
    try {
      const contract = await storage.getContract(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      const updatedContract = await storage.updateContract(contractId, req.body);
      res.json(updatedContract);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  });
  
  app.delete("/api/contracts/:id", async (req: Request, res: Response) => {
    const contractId = parseInt(req.params.id);
    if (isNaN(contractId)) {
      return res.status(400).json({ message: "Invalid contract ID" });
    }
    
    const deleted = await storage.deleteContract(contractId);
    if (!deleted) {
      return res.status(404).json({ message: "Contract not found" });
    }
    
    res.status(204).end();
  });
  
  // Crypto holdings routes
  app.get("/api/crypto-holdings/:userId", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const holdings = await storage.getCryptoHoldings(userId);
    res.json(holdings);
  });
  
  app.post("/api/crypto-holdings", async (req: Request, res: Response) => {
    try {
      const holdingData = insertCryptoHoldingSchema.parse(req.body);
      const holding = await storage.createCryptoHolding(holdingData);
      res.status(201).json(holding);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid request data" });
      }
    }
  });
  
  app.patch("/api/crypto-holdings/:id", async (req: Request, res: Response) => {
    const holdingId = parseInt(req.params.id);
    if (isNaN(holdingId)) {
      return res.status(400).json({ message: "Invalid holding ID" });
    }
    
    const { price } = req.body;
    if (typeof price !== "number") {
      return res.status(400).json({ message: "Price must be a number" });
    }
    
    const updatedHolding = await storage.updateCryptoHolding(holdingId, price);
    if (!updatedHolding) {
      return res.status(404).json({ message: "Crypto holding not found" });
    }
    
    res.json(updatedHolding);
  });
  
  app.delete("/api/crypto-holdings/:id", async (req: Request, res: Response) => {
    const holdingId = parseInt(req.params.id);
    if (isNaN(holdingId)) {
      return res.status(400).json({ message: "Invalid holding ID" });
    }
    
    const deleted = await storage.deleteCryptoHolding(holdingId);
    if (!deleted) {
      return res.status(404).json({ message: "Crypto holding not found" });
    }
    
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
