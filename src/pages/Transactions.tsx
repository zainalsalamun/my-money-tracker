import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Transaction, TransactionType, TransactionCategory } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { formatDate, getCurrentMonth } from "@/utils/date";
import { toast } from "sonner";

export default function Transactions() {
  const { t } = useLanguage();
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loadFromStorage } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | "all">("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "" as TransactionCategory,
    date: new Date().toISOString().split("T")[0],
    type: "expense" as TransactionType,
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesMonth = t.date.startsWith(filterMonth);
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesCategory = filterCategory === "all" || t.category === filterCategory;
      return matchesMonth && matchesType && matchesCategory;
    });
  }, [transactions, filterMonth, filterType, filterCategory]);

  const incomeCategories: TransactionCategory[] = ["salary", "freelance", "investment", "other_income"];
  const expenseCategories: TransactionCategory[] = [
    "food",
    "transport",
    "shopping",
    "entertainment",
    "bills",
    "healthcare",
    "education",
    "other_expense",
  ];

  const currentCategories = formData.type === "income" ? incomeCategories : expenseCategories;

  const handleSubmit = () => {
    if (!formData.title || !formData.amount || !formData.category) {
      toast.error(t("common.error"));
      return;
    }

    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
      toast.success(t("common.success"));
    } else {
      addTransaction({
        ...transactionData,
        id: Date.now().toString(),
      });
      toast.success(t("common.success"));
    }

    handleCloseDialog();
  };

  const handleOpenDialog = (transaction?: Transaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        title: transaction.title,
        amount: transaction.amount.toString(),
        category: transaction.category,
        date: transaction.date,
        type: transaction.type,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    setFormData({
      title: "",
      amount: "",
      category: "" as TransactionCategory,
      date: new Date().toISOString().split("T")[0],
      type: "expense",
    });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteTransaction(deletingId);
      toast.success(t("common.success"));
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("transactions.title")}</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("transactions.addTransaction")}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>{t("transactions.month")}</Label>
            <Input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("transactions.type")}</Label>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allTypes")}</SelectItem>
                <SelectItem value="income">{t("transactions.income")}</SelectItem>
                <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("transactions.category")}</Label>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allCategories")}</SelectItem>
                {[...incomeCategories, ...expenseCategories].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {t(`transactions.categories.${cat}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <div className="grid gap-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{transaction.title}</h3>
                  <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{t(`transactions.categories.${transaction.category}`)}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(transaction)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeletingId(transaction.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{t("transactions.noTransactions")}</p>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? t("transactions.editTransaction") : t("transactions.addTransaction")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("transactions.title_field")}</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("transactions.type")}</Label>
              <Select
                value={formData.type}
                onValueChange={(v: TransactionType) =>
                  setFormData({ ...formData, type: v, category: "" as TransactionCategory })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{t("transactions.income")}</SelectItem>
                  <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("transactions.category")}</Label>
              <Select
                value={formData.category}
                onValueChange={(v: TransactionCategory) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {t(`transactions.categories.${cat}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("transactions.amount")}</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("transactions.date")}</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t("transactions.cancel")}
            </Button>
            <Button onClick={handleSubmit}>{t("transactions.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("transactions.deleteTransaction")}</AlertDialogTitle>
            <AlertDialogDescription>{t("transactions.confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("transactions.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("transactions.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
