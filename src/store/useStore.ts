import { create } from "zustand";
import { Transaction, Budget, SavingGoal } from "@/types";

interface Store {
  transactions: Transaction[];
  budget: Budget | null;
  goals: SavingGoal[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (budget: Budget) => void;
  addGoal: (goal: SavingGoal) => void;
  updateGoal: (id: string, goal: Partial<SavingGoal>) => void;
  deleteGoal: (id: string) => void;
  resetAllData: () => void;
  loadFromStorage: () => void;
}

export const useStore = create<Store>((set, get) => ({
  transactions: [],
  budget: null,
  goals: [],

  addTransaction: (transaction) => {
    const newTransactions = [...get().transactions, transaction];
    set({ transactions: newTransactions });
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
  },

  updateTransaction: (id, updatedTransaction) => {
    const newTransactions = get().transactions.map((t) =>
      t.id === id ? { ...t, ...updatedTransaction } : t
    );
    set({ transactions: newTransactions });
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
  },

  deleteTransaction: (id) => {
    const newTransactions = get().transactions.filter((t) => t.id !== id);
    set({ transactions: newTransactions });
    localStorage.setItem("transactions", JSON.stringify(newTransactions));
  },

  setBudget: (budget) => {
    set({ budget });
    localStorage.setItem("budget", JSON.stringify(budget));
  },

  addGoal: (goal) => {
    const newGoals = [...get().goals, goal];
    set({ goals: newGoals });
    localStorage.setItem("goals", JSON.stringify(newGoals));
  },

  updateGoal: (id, updatedGoal) => {
    const newGoals = get().goals.map((g) =>
      g.id === id ? { ...g, ...updatedGoal } : g
    );
    set({ goals: newGoals });
    localStorage.setItem("goals", JSON.stringify(newGoals));
  },

  deleteGoal: (id) => {
    const newGoals = get().goals.filter((g) => g.id !== id);
    set({ goals: newGoals });
    localStorage.setItem("goals", JSON.stringify(newGoals));
  },

  resetAllData: () => {
    set({ transactions: [], budget: null, goals: [] });
    localStorage.removeItem("transactions");
    localStorage.removeItem("budget");
    localStorage.removeItem("goals");
  },

  loadFromStorage: () => {
    const transactions = localStorage.getItem("transactions");
    const budget = localStorage.getItem("budget");
    const goals = localStorage.getItem("goals");

    set({
      transactions: transactions ? JSON.parse(transactions) : [],
      budget: budget ? JSON.parse(budget) : null,
      goals: goals ? JSON.parse(goals) : [],
    });
  },
}));
