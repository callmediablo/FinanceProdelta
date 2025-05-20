import {
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  budgets, type Budget, type InsertBudget,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  contracts, type Contract, type InsertContract,
  cryptoHoldings, type CryptoHolding, type InsertCryptoHolding
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Budget operations
  getBudgets(userId: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, spent: number): Promise<Budget | undefined>;
  
  // Savings goals operations
  getSavingsGoals(userId: number): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoalProgress(id: number, amount: number): Promise<SavingsGoal | undefined>;
  
  // Contracts operations
  getContracts(userId: number): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: number, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: number): Promise<boolean>;
  
  // Crypto holdings operations
  getCryptoHoldings(userId: number): Promise<CryptoHolding[]>;
  getCryptoHolding(id: number): Promise<CryptoHolding | undefined>;
  createCryptoHolding(holding: InsertCryptoHolding): Promise<CryptoHolding>;
  updateCryptoHolding(id: number, price: number): Promise<CryptoHolding | undefined>;
  deleteCryptoHolding(id: number): Promise<boolean>;
}

// Datenbank-basierte Implementierung
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const newBalance = parseFloat(user.balance) + amount;
    
    const [updatedUser] = await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    
    return transaction || undefined;
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    // Ensure date is set if not provided
    if (!insertTransaction.date) {
      insertTransaction.date = new Date();
    }
    
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
      
    // Update user balance
    if (transaction) {
      const amount = parseFloat(transaction.amount);
      await this.updateUserBalance(transaction.userId, amount);
      
      // Update budget spent if it's an expense
      if (transaction.type === 'expense' && amount < 0) {
        const userBudgets = await this.getBudgets(transaction.userId);
        const matchingBudget = userBudgets.find(b => b.category === transaction.category);
        
        if (matchingBudget) {
          await this.updateBudget(matchingBudget.id, Math.abs(amount));
        }
      }
    }
    
    return transaction;
  }
  
  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return await db
      .select()
      .from(budgets)
      .where(eq(budgets.userId, userId));
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, id));
    
    return budget || undefined;
  }
  
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values(insertBudget)
      .returning();
      
    return budget;
  }
  
  async updateBudget(id: number, spent: number): Promise<Budget | undefined> {
    const budget = await this.getBudget(id);
    if (!budget) return undefined;
    
    const currentSpent = parseFloat(budget.spent);
    const newSpent = currentSpent + spent;
    
    const [updatedBudget] = await db
      .update(budgets)
      .set({ spent: newSpent.toString() })
      .where(eq(budgets.id, id))
      .returning();
      
    return updatedBudget;
  }
  
  // Savings goals operations
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId));
  }
  
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    const [goal] = await db
      .select()
      .from(savingsGoals)
      .where(eq(savingsGoals.id, id));
    
    return goal || undefined;
  }
  
  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const [goal] = await db
      .insert(savingsGoals)
      .values(insertGoal)
      .returning();
      
    return goal;
  }
  
  async updateSavingsGoalProgress(id: number, amount: number): Promise<SavingsGoal | undefined> {
    const goal = await this.getSavingsGoal(id);
    if (!goal) return undefined;
    
    const currentAmount = parseFloat(goal.currentAmount);
    const newAmount = currentAmount + amount;
    
    const [updatedGoal] = await db
      .update(savingsGoals)
      .set({ currentAmount: newAmount.toString() })
      .where(eq(savingsGoals.id, id))
      .returning();
      
    // Update user balance (deduct from balance when contributing to savings)
    if (updatedGoal) {
      await this.updateUserBalance(updatedGoal.userId, -amount);
    }
    
    return updatedGoal;
  }
  
  // Contracts operations
  async getContracts(userId: number): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.userId, userId));
  }
  
  async getContract(id: number): Promise<Contract | undefined> {
    const [contract] = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));
    
    return contract || undefined;
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const [contract] = await db
      .insert(contracts)
      .values(insertContract)
      .returning();
      
    return contract;
  }
  
  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updatedContract] = await db
      .update(contracts)
      .set(contractData)
      .where(eq(contracts.id, id))
      .returning();
      
    return updatedContract;
  }
  
  async deleteContract(id: number): Promise<boolean> {
    const result = await db
      .delete(contracts)
      .where(eq(contracts.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Crypto holdings operations
  async getCryptoHoldings(userId: number): Promise<CryptoHolding[]> {
    return await db
      .select()
      .from(cryptoHoldings)
      .where(eq(cryptoHoldings.userId, userId));
  }
  
  async getCryptoHolding(id: number): Promise<CryptoHolding | undefined> {
    const [holding] = await db
      .select()
      .from(cryptoHoldings)
      .where(eq(cryptoHoldings.id, id));
    
    return holding || undefined;
  }
  
  async createCryptoHolding(insertHolding: InsertCryptoHolding): Promise<CryptoHolding> {
    const [holding] = await db
      .insert(cryptoHoldings)
      .values(insertHolding)
      .returning();
      
    return holding;
  }
  
  async updateCryptoHolding(id: number, price: number): Promise<CryptoHolding | undefined> {
    const [updatedHolding] = await db
      .update(cryptoHoldings)
      .set({ currentPrice: price.toString() })
      .where(eq(cryptoHoldings.id, id))
      .returning();
      
    return updatedHolding;
  }
  
  async deleteCryptoHolding(id: number): Promise<boolean> {
    const result = await db
      .delete(cryptoHoldings)
      .where(eq(cryptoHoldings.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Initialisierung von Demo-Daten
  async initializeDemoData() {
    try {
      // Überprüfen, ob bereits Benutzer in der Datenbank vorhanden sind
      const existingUsers = await db.select().from(users);
      if (existingUsers.length > 0) {
        console.log("Demo-Daten sind bereits vorhanden, Initialisierung übersprungen.");
        return;
      }
      
      console.log("Initialisiere Demo-Daten...");
      
      // Demo-Benutzer erstellen
      const demoUser: InsertUser = {
        username: "max",
        password: "password123",
        firstName: "Max",
        lastName: "Mustermann",
        email: "max@example.com",
        balance: "3421.58",
        schufaScore: 92
      };
      
      const user = await this.createUser(demoUser);
      const userId = user.id;
      
      // Transaktionen erstellen
      const transactions: InsertTransaction[] = [
        {
          userId,
          amount: "-42.87",
          description: "REWE Einkauf",
          category: "Lebensmittel",
          date: new Date(),
          type: "expense"
        },
        {
          userId,
          amount: "2450.00",
          description: "Gehalt",
          category: "Einkommen",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // gestern
          type: "income"
        },
        {
          userId,
          amount: "-17.99",
          description: "Netflix Abo",
          category: "Unterhaltung",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 Tage alt
          type: "expense"
        },
        {
          userId,
          amount: "-89.95",
          description: "H&M",
          category: "Shopping",
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 Tage alt
          type: "expense"
        }
      ];
      
      // Transaktionen einzeln einfügen
      for (const transaction of transactions) {
        await db.insert(transactions).values({
          userId: transaction.userId,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          type: transaction.type
        });
      }
      
      // Budgets erstellen
      const budgetItems: InsertBudget[] = [
        {
          userId,
          category: "Lebensmittel",
          amount: "400",
          period: "monthly",
          spent: "356"
        },
        {
          userId,
          category: "Transport",
          amount: "200",
          period: "monthly",
          spent: "149"
        },
        {
          userId,
          category: "Freizeit",
          amount: "200",
          period: "monthly",
          spent: "245"
        },
        {
          userId,
          category: "Shopping",
          amount: "150",
          period: "monthly",
          spent: "112"
        }
      ];
      
      for (const budget of budgetItems) {
        await db.insert(budgets).values(budget);
      }
      
      // Sparziel erstellen
      const savingsGoal: InsertSavingsGoal = {
        userId,
        name: "Urlaub Italien",
        targetAmount: "8000",
        currentAmount: "5280",
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 Tage ab jetzt
      };
      
      await db.insert(savingsGoals).values(savingsGoal);
      
      // Verträge erstellen
      const contractItems: InsertContract[] = [
        {
          userId,
          name: "Handy-Vertrag",
          provider: "Telekom",
          cost: "39.99",
          billingCycle: "monthly",
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 Tage alt
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage ab jetzt
          autoRenewal: true,
          category: "Telekommunikation",
          notes: "24-monatiger Vertrag mit 5G und 20GB Datenvolumen"
        },
        {
          userId,
          name: "Netflix",
          provider: "Netflix GmbH",
          cost: "17.99",
          billingCycle: "monthly",
          startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 Jahr alt
          endDate: null,
          autoRenewal: true,
          category: "Unterhaltung",
          notes: "Premium Abo mit 4K Streaming"
        },
        {
          userId,
          name: "Hausratversicherung",
          provider: "Allianz",
          cost: "89.90",
          billingCycle: "yearly",
          startDate: new Date(Date.now() - 275 * 24 * 60 * 60 * 1000), // 275 Tage alt
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 Tage ab jetzt
          autoRenewal: false,
          category: "Versicherung",
          notes: "Jährliche Zahlung, Kündigung 3 Monate vor Ablauf möglich"
        }
      ];
      
      for (const contract of contractItems) {
        await db.insert(contracts).values(contract);
      }
      
      // Kryptowährungen erstellen
      const cryptoItems: InsertCryptoHolding[] = [
        {
          userId,
          currency: "BTC",
          amount: "0.032",
          purchasePrice: "45000",
          currentPrice: "46440"
        },
        {
          userId,
          currency: "ETH",
          amount: "0.5",
          purchasePrice: "3200",
          currentPrice: "3142.40"
        }
      ];
      
      for (const crypto of cryptoItems) {
        await db.insert(cryptoHoldings).values(crypto);
      }
      
      console.log("Demo-Daten erfolgreich initialisiert!");
    } catch (error) {
      console.error("Fehler bei der Initialisierung der Demo-Daten:", error);
    }
  }
}

/**
 * In-Memory Speicherimplementierung
 * Diese Klasse bietet eine temporäre Speicherlösung
 */
export class MemStorage implements IStorage {
  private users: User[] = [];
  private transactions: Transaction[] = [];
  private budgets: Budget[] = [];
  private savingsGoals: SavingsGoal[] = [];
  private contracts: Contract[] = [];
  private cryptoHoldings: CryptoHolding[] = [];
  private nextId: { [key: string]: number } = {
    users: 1,
    transactions: 1,
    budgets: 1,
    savingsGoals: 1,
    contracts: 1,
    cryptoHoldings: 1
  };

  constructor() {
    this.initializeDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.nextId.users++,
      ...user,
      balance: user.balance || "0",
      schufaScore: user.schufaScore || null
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const currentBalance = parseFloat(user.balance) || 0;
    user.balance = (currentBalance + amount).toString();
    return user;
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return this.transactions.filter(tx => tx.userId === userId);
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.find(tx => tx.id === id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.nextId.transactions++,
      ...transaction,
      date: transaction.date || new Date()
    };
    this.transactions.push(newTransaction);
    
    // Aktualisieren des Nutzerkontostands
    if (transaction.type === 'income') {
      await this.updateUserBalance(transaction.userId, parseFloat(transaction.amount));
    } else {
      await this.updateUserBalance(transaction.userId, -parseFloat(transaction.amount));
    }

    // Aktualisieren des Budget-Fortschritts, falls es sich um eine Ausgabe handelt
    if (transaction.type === 'expense' && transaction.category) {
      const budgets = await this.getBudgets(transaction.userId);
      const budget = budgets.find(b => b.category === transaction.category);
      if (budget) {
        await this.updateBudget(budget.id, parseFloat(transaction.amount));
      }
    }

    return newTransaction;
  }

  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return this.budgets.filter(budget => budget.userId === userId);
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.find(budget => budget.id === id);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const newBudget: Budget = {
      id: this.nextId.budgets++,
      userId: budget.userId,
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      spent: budget.spent || "0"
    };
    this.budgets.push(newBudget);
    return newBudget;
  }

  async updateBudget(id: number, spent: number): Promise<Budget | undefined> {
    const budget = await this.getBudget(id);
    if (!budget) return undefined;
    
    const currentSpent = parseFloat(budget.spent) || 0;
    budget.spent = (currentSpent + spent).toString();
    return budget;
  }

  // Savings goals operations
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return this.savingsGoals.filter(goal => goal.userId === userId);
  }

  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.find(goal => goal.id === id);
  }

  async createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal> {
    const newGoal: SavingsGoal = {
      id: this.nextId.savingsGoals++,
      userId: goal.userId,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || "0",
      deadline: goal.deadline
    };
    this.savingsGoals.push(newGoal);
    return newGoal;
  }

  async updateSavingsGoalProgress(id: number, amount: number): Promise<SavingsGoal | undefined> {
    const goal = await this.getSavingsGoal(id);
    if (!goal) return undefined;
    
    const currentAmount = parseFloat(goal.currentAmount) || 0;
    goal.currentAmount = (currentAmount + amount).toString();
    
    // Aktualisieren des Nutzerkontostands
    await this.updateUserBalance(goal.userId, -amount);
    
    return goal;
  }

  // Contracts operations
  async getContracts(userId: number): Promise<Contract[]> {
    return this.contracts.filter(contract => contract.userId === userId);
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.find(contract => contract.id === id);
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const newContract: Contract = {
      id: this.nextId.contracts++,
      userId: contract.userId,
      name: contract.name,
      provider: contract.provider,
      category: contract.category,
      cost: contract.cost,
      billingCycle: contract.billingCycle,
      startDate: contract.startDate,
      endDate: contract.endDate || null,
      autoRenewal: contract.autoRenewal || false,
      notes: contract.notes || null
    };
    this.contracts.push(newContract);
    return newContract;
  }

  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const contract = await this.getContract(id);
    if (!contract) return undefined;
    
    Object.assign(contract, contractData);
    return contract;
  }

  async deleteContract(id: number): Promise<boolean> {
    const index = this.contracts.findIndex(contract => contract.id === id);
    if (index === -1) return false;
    
    this.contracts.splice(index, 1);
    return true;
  }

  // Crypto holdings operations
  async getCryptoHoldings(userId: number): Promise<CryptoHolding[]> {
    return this.cryptoHoldings.filter(holding => holding.userId === userId);
  }

  async getCryptoHolding(id: number): Promise<CryptoHolding | undefined> {
    return this.cryptoHoldings.find(holding => holding.id === id);
  }

  async createCryptoHolding(holding: InsertCryptoHolding): Promise<CryptoHolding> {
    const newHolding: CryptoHolding = {
      id: this.nextId.cryptoHoldings++,
      userId: holding.userId,
      amount: holding.amount,
      currency: holding.currency,
      purchasePrice: holding.purchasePrice,
      currentPrice: holding.currentPrice
    };
    this.cryptoHoldings.push(newHolding);
    return newHolding;
  }

  async updateCryptoHolding(id: number, price: number): Promise<CryptoHolding | undefined> {
    const holding = await this.getCryptoHolding(id);
    if (!holding) return undefined;
    
    holding.currentPrice = price.toString();
    return holding;
  }

  async deleteCryptoHolding(id: number): Promise<boolean> {
    const index = this.cryptoHoldings.findIndex(holding => holding.id === id);
    if (index === -1) return false;
    
    this.cryptoHoldings.splice(index, 1);
    return true;
  }

  // Demo data
  private initializeDemoData() {
    // Demo-Benutzer erstellen
    const demoUser: User = {
      id: 1,
      username: "max",
      firstName: "Max",
      lastName: "Mustermann",
      password: "password123",
      email: "max@example.com",
      balance: "2500",
      schufaScore: 850
    };
    this.users.push(demoUser);

    // Demo-Transaktionen
    const demoTransactions: Transaction[] = [
      {
        id: 1,
        userId: 1,
        amount: "750",
        description: "Gehalt",
        category: "Einkommen",
        date: new Date("2025-04-25"),
        type: "income"
      },
      {
        id: 2,
        userId: 1,
        amount: "45.99",
        description: "Lebensmittel",
        category: "Lebensmittel",
        date: new Date("2025-05-10"),
        type: "expense"
      },
      {
        id: 3,
        userId: 1,
        amount: "29.99",
        description: "Netflix Abonnement",
        category: "Unterhaltung",
        date: new Date("2025-05-15"),
        type: "expense"
      }
    ];
    
    this.transactions.push(...demoTransactions);
    this.nextId.transactions = 4;

    // Demo-Budgets
    const demoBudgets: Budget[] = [
      {
        id: 1,
        userId: 1,
        category: "Lebensmittel",
        amount: "300",
        spent: "45.99",
        period: "Monatlich"
      },
      {
        id: 2,
        userId: 1,
        category: "Unterhaltung",
        amount: "100",
        spent: "29.99",
        period: "Monatlich"
      }
    ];
    
    this.budgets.push(...demoBudgets);
    this.nextId.budgets = 3;
    
    // Demo-Sparziele
    const demoSavingsGoals: SavingsGoal[] = [
      {
        id: 1,
        userId: 1,
        name: "Urlaub in Italien",
        targetAmount: "1500",
        currentAmount: "500",
        deadline: new Date("2025-12-01")
      }
    ];
    
    this.savingsGoals.push(...demoSavingsGoals);
    this.nextId.savingsGoals = 2;
    
    // Demo-Verträge
    const demoContracts: Contract[] = [
      {
        id: 1,
        userId: 1,
        name: "Internet Vertrag",
        provider: "Telekom",
        cost: "49.99",
        billingCycle: "Monatlich",
        startDate: new Date("2024-09-15"),
        endDate: new Date("2025-09-15"),
        autoRenewal: true,
        category: "Internet",
        notes: "100 Mbit/s DSL"
      },
      {
        id: 2,
        userId: 1,
        name: "Strom",
        provider: "Vattenfall",
        cost: "85.00",
        billingCycle: "Monatlich",
        startDate: new Date("2024-01-10"),
        endDate: new Date("2026-01-10"),
        autoRenewal: true,
        category: "Strom",
        notes: "Ökostrom-Tarif"
      }
    ];
    
    this.contracts.push(...demoContracts);
    this.nextId.contracts = 3;
    
    // Demo-Krypto
    const demoCryptoHoldings: CryptoHolding[] = [
      {
        id: 1,
        userId: 1,
        amount: "0.25",
        currency: "Bitcoin",
        purchasePrice: "35000",
        currentPrice: "45000"
      },
      {
        id: 2,
        userId: 1,
        amount: "2.5",
        currency: "Ethereum",
        purchasePrice: "2500",
        currentPrice: "3000"
      }
    ];
    
    this.cryptoHoldings.push(...demoCryptoHoldings);
    this.nextId.cryptoHoldings = 3;
  }
}

export const storage = new MemStorage();
