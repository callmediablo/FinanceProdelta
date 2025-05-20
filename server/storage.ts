import {
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  budgets, type Budget, type InsertBudget,
  savingsGoals, type SavingsGoal, type InsertSavingsGoal,
  contracts, type Contract, type InsertContract,
  cryptoHoldings, type CryptoHolding, type InsertCryptoHolding
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private savingsGoals: Map<number, SavingsGoal>;
  private contracts: Map<number, Contract>;
  private cryptoHoldings: Map<number, CryptoHolding>;
  
  private userIdCounter: number;
  private transactionIdCounter: number;
  private budgetIdCounter: number;
  private savingsGoalIdCounter: number;
  private contractIdCounter: number;
  private cryptoHoldingIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.savingsGoals = new Map();
    this.contracts = new Map();
    this.cryptoHoldings = new Map();
    
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.budgetIdCounter = 1;
    this.savingsGoalIdCounter = 1;
    this.contractIdCounter = 1;
    this.cryptoHoldingIdCounter = 1;
    
    this.initializeDemoData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      balance: parseFloat(user.balance.toString()) + amount
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const budget: Budget = { ...insertBudget, id };
    this.budgets.set(id, budget);
    return budget;
  }
  
  async updateBudget(id: number, spent: number): Promise<Budget | undefined> {
    const budget = await this.getBudget(id);
    if (!budget) return undefined;
    
    const updatedBudget = {
      ...budget,
      spent: parseFloat(budget.spent.toString()) + spent
    };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  // Savings goals operations
  async getSavingsGoals(userId: number): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values())
      .filter(goal => goal.userId === userId);
  }
  
  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }
  
  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = this.savingsGoalIdCounter++;
    const goal: SavingsGoal = { ...insertGoal, id };
    this.savingsGoals.set(id, goal);
    return goal;
  }
  
  async updateSavingsGoalProgress(id: number, amount: number): Promise<SavingsGoal | undefined> {
    const goal = await this.getSavingsGoal(id);
    if (!goal) return undefined;
    
    const updatedGoal = {
      ...goal,
      currentAmount: parseFloat(goal.currentAmount.toString()) + amount
    };
    this.savingsGoals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  // Contracts operations
  async getContracts(userId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values())
      .filter(contract => contract.userId === userId);
  }
  
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }
  
  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = this.contractIdCounter++;
    const contract: Contract = { ...insertContract, id };
    this.contracts.set(id, contract);
    return contract;
  }
  
  async updateContract(id: number, contractData: Partial<InsertContract>): Promise<Contract | undefined> {
    const contract = await this.getContract(id);
    if (!contract) return undefined;
    
    const updatedContract = { ...contract, ...contractData };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }
  
  async deleteContract(id: number): Promise<boolean> {
    return this.contracts.delete(id);
  }
  
  // Crypto holdings operations
  async getCryptoHoldings(userId: number): Promise<CryptoHolding[]> {
    return Array.from(this.cryptoHoldings.values())
      .filter(holding => holding.userId === userId);
  }
  
  async getCryptoHolding(id: number): Promise<CryptoHolding | undefined> {
    return this.cryptoHoldings.get(id);
  }
  
  async createCryptoHolding(insertHolding: InsertCryptoHolding): Promise<CryptoHolding> {
    const id = this.cryptoHoldingIdCounter++;
    const holding: CryptoHolding = { ...insertHolding, id };
    this.cryptoHoldings.set(id, holding);
    return holding;
  }
  
  async updateCryptoHolding(id: number, price: number): Promise<CryptoHolding | undefined> {
    const holding = await this.getCryptoHolding(id);
    if (!holding) return undefined;
    
    const updatedHolding = {
      ...holding,
      currentPrice: price
    };
    this.cryptoHoldings.set(id, updatedHolding);
    return updatedHolding;
  }
  
  async deleteCryptoHolding(id: number): Promise<boolean> {
    return this.cryptoHoldings.delete(id);
  }
  
  // Initialize demo data
  private initializeDemoData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "max",
      password: "password123",
      firstName: "Max",
      lastName: "Mustermann",
      email: "max@example.com",
      balance: 3421.58,
      schufaScore: 92
    };
    this.createUser(demoUser).then(user => {
      const userId = user.id;
      
      // Create transactions
      const transactions: InsertTransaction[] = [
        {
          userId,
          amount: -42.87,
          description: "REWE Einkauf",
          category: "Lebensmittel",
          date: new Date(),
          type: "expense"
        },
        {
          userId,
          amount: 2450.00,
          description: "Gehalt",
          category: "Einkommen",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
          type: "income"
        },
        {
          userId,
          amount: -17.99,
          description: "Netflix Abo",
          category: "Unterhaltung",
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          type: "expense"
        },
        {
          userId,
          amount: -89.95,
          description: "H&M",
          category: "Shopping",
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
          type: "expense"
        }
      ];
      
      transactions.forEach(transaction => this.createTransaction(transaction));
      
      // Create budgets
      const budgets: InsertBudget[] = [
        {
          userId,
          category: "Lebensmittel",
          amount: 400,
          period: "monthly",
          spent: 356
        },
        {
          userId,
          category: "Transport",
          amount: 200,
          period: "monthly",
          spent: 149
        },
        {
          userId,
          category: "Freizeit",
          amount: 200,
          period: "monthly",
          spent: 245
        },
        {
          userId,
          category: "Shopping",
          amount: 150,
          period: "monthly",
          spent: 112
        }
      ];
      
      budgets.forEach(budget => this.createBudget(budget));
      
      // Create savings goal
      const savingsGoal: InsertSavingsGoal = {
        userId,
        name: "Urlaub Italien",
        targetAmount: 8000,
        currentAmount: 5280,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      };
      
      this.createSavingsGoal(savingsGoal);
      
      // Create contracts
      const contracts: InsertContract[] = [
        {
          userId,
          name: "Handy-Vertrag",
          provider: "Telekom",
          cost: 39.99,
          billingCycle: "monthly",
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          autoRenewal: true,
          category: "Telekommunikation",
          notes: "24-monatiger Vertrag mit 5G und 20GB Datenvolumen"
        },
        {
          userId,
          name: "Netflix",
          provider: "Netflix GmbH",
          cost: 17.99,
          billingCycle: "monthly",
          startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
          endDate: undefined,
          autoRenewal: true,
          category: "Unterhaltung",
          notes: "Premium Abo mit 4K Streaming"
        },
        {
          userId,
          name: "Hausratversicherung",
          provider: "Allianz",
          cost: 89.90,
          billingCycle: "yearly",
          startDate: new Date(Date.now() - 275 * 24 * 60 * 60 * 1000), // 275 days ago
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          autoRenewal: false,
          category: "Versicherung",
          notes: "Jährliche Zahlung, Kündigung 3 Monate vor Ablauf möglich"
        }
      ];
      
      contracts.forEach(contract => this.createContract(contract));
      
      // Create crypto holdings
      const cryptoHoldings: InsertCryptoHolding[] = [
        {
          userId,
          currency: "BTC",
          amount: 0.032,
          purchasePrice: 45000,
          currentPrice: 46440
        },
        {
          userId,
          currency: "ETH",
          amount: 0.5,
          purchasePrice: 3200,
          currentPrice: 3142.40
        }
      ];
      
      cryptoHoldings.forEach(holding => this.createCryptoHolding(holding));
    });
  }
}

export const storage = new MemStorage();
