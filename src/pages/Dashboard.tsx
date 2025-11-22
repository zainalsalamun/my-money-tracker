import { useEffect, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpCircle, ArrowDownCircle, Wallet, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import { getCurrentMonth, formatDate } from "@/utils/date";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { transactions, budget, goals, loadFromStorage } = useStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const currentMonth = getCurrentMonth();

  const monthlyData = useMemo(() => {
    const currentTransactions = transactions.filter(
      (t) => t.date.startsWith(currentMonth)
    );

    const income = currentTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense };
  }, [transactions, currentMonth]);

  const remaining = budget ? budget.amount - monthlyData.expense : 0;

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const chartData = [
    { name: t("dashboard.income"), value: monthlyData.income, color: "hsl(var(--success))" },
    { name: t("dashboard.expense"), value: monthlyData.expense, color: "hsl(var(--destructive))" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.monthlyIncome")}
          value={formatCurrency(monthlyData.income)}
          icon={ArrowUpCircle}
          trend="up"
        />
        <StatCard
          title={t("dashboard.monthlyExpense")}
          value={formatCurrency(monthlyData.expense)}
          icon={ArrowDownCircle}
          trend="down"
        />
        <StatCard
          title={t("dashboard.remainingBudget")}
          value={formatCurrency(remaining)}
          icon={Wallet}
          trend={remaining > 0 ? "up" : "down"}
        />
        <StatCard
          title={t("dashboard.savingGoals")}
          value={`${goals.length} ${t("dashboard.savingGoals")}`}
          icon={TrendingUp}
          trend="neutral"
        />
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.incomeVsExpense")}</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.income > 0 || monthlyData.expense > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.noTransactions")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/transactions")}
            >
              {t("common.viewAll")}
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{transaction.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className={`font-semibold ${
                      transaction.type === "income" ? "text-success" : "text-destructive"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                {t("dashboard.noTransactions")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Saving Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("dashboard.savingGoals")}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/goals")}
          >
            {t("common.viewAll")}
          </Button>
        </CardHeader>
        <CardContent>
          {goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-muted-foreground">
              {t("dashboard.noGoals")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
