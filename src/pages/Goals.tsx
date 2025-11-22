import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { SavingGoal } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { toast } from "sonner";

export default function Goals() {
  const { t } = useLanguage();
  const { goals, addGoal, updateGoal, deleteGoal, loadFromStorage } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddAmountDialogOpen, setIsAddAmountDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [addAmount, setAddAmount] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSubmit = () => {
    if (!formData.name || !formData.targetAmount) {
      toast.error(t("common.error"));
      return;
    }

    const goalData = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount || "0"),
      deadline: formData.deadline || undefined,
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
      toast.success(t("common.success"));
    } else {
      addGoal({
        ...goalData,
        id: Date.now().toString(),
      });
      toast.success(t("common.success"));
    }

    handleCloseDialog();
  };

  const handleAddAmount = () => {
    if (!selectedGoal || !addAmount) return;

    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error(t("common.error"));
      return;
    }

    updateGoal(selectedGoal.id, {
      currentAmount: selectedGoal.currentAmount + amount,
    });
    toast.success(t("common.success"));
    setIsAddAmountDialogOpen(false);
    setAddAmount("");
    setSelectedGoal(null);
  };

  const handleOpenDialog = (goal?: SavingGoal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline || "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGoal(null);
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
    });
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteGoal(deletingId);
      toast.success(t("common.success"));
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("goals.title")}</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("goals.addGoal")}
        </Button>
      </div>

      {goals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;

            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{goal.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(goal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingId(goal.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{progress.toFixed(1)}%</span>
                      <span>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>
                  {goal.deadline && (
                    <p className="text-sm text-muted-foreground">
                      {t("goals.deadline")}: {formatDate(goal.deadline)}
                    </p>
                  )}
                  {!isCompleted && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsAddAmountDialogOpen(true);
                      }}
                    >
                      {t("goals.addAmount")}
                    </Button>
                  )}
                  {isCompleted && (
                    <div className="text-center text-success font-semibold">
                      ✓ {t("goals.progress")} 100%
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">{t("goals.noGoals")}</h2>
          <p className="text-muted-foreground mb-4">{t("goals.createPrompt")}</p>
          <Button onClick={() => handleOpenDialog()}>{t("goals.addGoal")}</Button>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGoal ? t("goals.editGoal") : t("goals.addGoal")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("goals.goalName")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("goals.targetAmount")}</Label>
              <Input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("goals.currentAmount")}</Label>
              <Input
                type="number"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              />
            </div>
            <div>
              <Label>{t("goals.deadline")}</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t("goals.cancel")}
            </Button>
            <Button onClick={handleSubmit}>{t("goals.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Amount Dialog */}
      <Dialog open={isAddAmountDialogOpen} onOpenChange={setIsAddAmountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("goals.addToGoal")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t("goals.amountToAdd")}</Label>
              <Input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAmountDialogOpen(false)}>
              {t("goals.cancel")}
            </Button>
            <Button onClick={handleAddAmount}>{t("goals.add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("goals.deleteGoal")}</AlertDialogTitle>
            <AlertDialogDescription>{t("goals.confirmDelete")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("goals.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("goals.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
