export type TransactionType = "income" | "expense";

export type TransactionCategory =
  | "salary"
  | "freelance"
  | "investment"
  | "other_income"
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "healthcare"
  | "education"
  | "other_expense";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  date: string;
  type: TransactionType;
}

export interface Budget {
  amount: number;
  month: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}
