import { format, startOfMonth, endOfMonth } from "date-fns";

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), "dd MMM yyyy");
};

export const getCurrentMonth = (): string => {
  return format(new Date(), "yyyy-MM");
};

export const getMonthRange = (month: string): { start: Date; end: Date } => {
  const date = new Date(month + "-01");
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};
