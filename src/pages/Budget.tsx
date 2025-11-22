import { useEffect, useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { getCurrentMonth } from "@/utils/date";
import { toast } from "sonner";

export default function Budget() {
  const { t } = useLanguage();
  const { transactions, budget, setBudget, loadFromStorage } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const currentMonth = getCurrentMonth();

  const monthlyExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, currentMonth]);

  const remaining = budget ? budget.amount - monthlyExpense : 0;
  const usagePercentage = budget ? (monthlyExpense / budget.amount) * 100 : 0;
  const isOverBudget = usagePercentage > 100;

  const handleSetBudget = () => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("common.error"));
      return;
    }

    setBudget({ amount, month: currentMonth });
    toast.success(t("common.success"));
    setIsDialogOpen(false);
    setBudgetAmount("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("budget.title")}</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Wallet className="h-4 w-4" />
          {t("budget.setBudget")}
        </Button>
      </div>

      {isOverBudget && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("budget.warningTitle")}</AlertTitle>
          <AlertDescription>{t("budget.warningMessage")}</AlertDescription>
        </Alert>
      )}

      {budget ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.currentBudget")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("budget.monthlyBudget")}</span>
                <span className="text-2xl font-bold">{formatCurrency(budget.amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("budget.spent")}</span>
                <span className="text-2xl font-bold text-destructive">
                  {formatCurrency(monthlyExpense)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">{t("budget.remaining")}</span>
                <span className={`text-2xl font-bold ${remaining >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(remaining)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("budget.budgetUsage")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{usagePercentage.toFixed(1)}%</span>
                  <span>
                    {formatCurrency(monthlyExpense)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress
                  value={Math.min(usagePercentage, 100)}
                  className={`h-4 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
                />
              </div>
              <div className="pt-4 text-center">
                {isOverBudget ? (
                  <p className="text-destructive font-semibold">
                    {t("budget.warningMessage")}
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    {remaining >= 0 && `${((remaining / budget.amount) * 100).toFixed(1)}% ${t("budget.remaining")}`}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t("budget.noBudget")}</h2>
          <p className="text-muted-foreground mb-4">{t("budget.setBudgetPrompt")}</p>
          <Button onClick={() => setIsDialogOpen(true)}>{t("budget.setBudget")}</Button>
        </Card>
      )}

      {/* Set Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budget.setBudget")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("budget.monthlyBudget")}</Label>
              <Input
                type="number"
                placeholder="0"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("budget.cancel")}
            </Button>
            <Button onClick={handleSetBudget}>{t("budget.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
