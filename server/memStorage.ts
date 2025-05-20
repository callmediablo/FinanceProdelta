import {
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  budgets, type Budget, type InsertBudget,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  contracts, type Contract, type InsertContract,
  cryptoHoldings, type CryptoHolding, type InsertCryptoHolding
} from "@shared/schema";

import { IStorage } from "./storage";

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
      username: user.username,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
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
      userId: transaction.userId,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      date: transaction.date || new Date(),
      type: transaction.type
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
      deadline: goal.deadline || null
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