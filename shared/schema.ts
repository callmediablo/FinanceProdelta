import { pgTable, text, serial, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  schufaScore: integer("schufa_score"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  balance: true,
  schufaScore: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull(), // income, expense
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  category: true,
  date: true,
  type: true,
});

// Budget table
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(), // monthly, yearly
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0"),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  userId: true,
  category: true,
  amount: true,
  period: true,
  spent: true,
});

// Savings goals table
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  deadline: timestamp("deadline"),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).pick({
  userId: true,
  name: true,
  targetAmount: true,
  currentAmount: true,
  deadline: true,
});

// Contracts table
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull(), // monthly, yearly
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  autoRenewal: boolean("auto_renewal").notNull().default(false),
  category: text("category").notNull(), // insurance, subscription, utility, etc.
  notes: text("notes"),
});

export const insertContractSchema = createInsertSchema(contracts).pick({
  userId: true,
  name: true,
  provider: true,
  cost: true,
  billingCycle: true,
  startDate: true,
  endDate: true,
  autoRenewal: true,
  category: true,
  notes: true,
});

// Crypto holdings table
export const cryptoHoldings = pgTable("crypto_holdings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currency: text("currency").notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
});

export const insertCryptoHoldingSchema = createInsertSchema(cryptoHoldings).pick({
  userId: true,
  currency: true,
  amount: true,
  purchasePrice: true,
  currentPrice: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type CryptoHolding = typeof cryptoHoldings.$inferSelect;
export type InsertCryptoHolding = z.infer<typeof insertCryptoHoldingSchema>;
