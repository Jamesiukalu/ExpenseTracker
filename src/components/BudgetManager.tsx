import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Progress } from "./ui/progress";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Wallet,
  TrendingUp,
  PieChart,
  Calendar,
  CreditCard,
  Film,
  Zap,
  Car,
  Utensils,
  Home,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import api from "../api";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

interface Budget {
  _id: string;
  category: string;
  period: string;
  budget: number;
  spent: number;
  color?: string;
}

export default function BudgetManager() {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    period: "Monthly",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load budgets
  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/budget");
      setBudgets(res.data.data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.amount || +form.amount <= 0)
      e.amount = "Amount must be greater than 0";
    if (!form.period) e.period = "Period is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Create or update budget
  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editingBudget) {
        // Update existing
        const res = await api.put(`/budget/update/${editingBudget._id}`, {
          category: form.category,
          period: form.period,
          budget: +form.amount,
        });
        setBudgets(
          budgets.map((b) => (b._id === res.data.data._id ? res.data.data : b))
        );
        toast({
          title: "Budget Updated",
          description: "Your budget has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } else {
        // Create new
        const res = await api.post("/budget", {
          category: form.category,
          period: form.period,
          budget: +form.amount,
        });
        setBudgets([res.data.data, ...budgets]);
        toast({
          title: "Budget Created",
          description: "New budget category added successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
      }
      setDialogOpen(false);
      setEditingBudget(null);
      setForm({ category: "", amount: "", period: "Monthly" });
      setErrors({});
    } catch (err: any) {
      toast({
        title: editingBudget ? "Update Failed" : "Create Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Delete budget
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget category?"))
      return;

    try {
      await api.delete(`/budget/${id}`);
      setBudgets(budgets.filter((b) => b._id !== id));
      toast({
        title: "Budget Deleted",
        description: "The budget category has been removed.",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Helpers
  const calcPct = (spent: number, total: number) =>
    Math.round((spent / total) * 100);
  const status = (p: number) =>
    p >= 90 ? "danger" : p >= 75 ? "warning" : "normal";
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = totalBudget > 0 ? calcPct(totalSpent, totalBudget) : 0;
  const remainingBudget = totalBudget - totalSpent;

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "housing":
        return <Home className="h-4 w-4" />;
      case "transportation":
        return <Car className="h-4 w-4" />;
      case "food":
        return <Utensils className="h-4 w-4" />;
      case "entertainment":
        return <Film className="h-4 w-4" />;
      case "utilities":
        return <Zap className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget Manager</h1>
          <p className="text-muted-foreground">
            Track and manage your spending categories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingBudget(null);
                setForm({ category: "", amount: "", period: "Monthly" });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? "Edit Budget Category" : "Create New Budget"}
              </DialogTitle>
              <DialogDescription>
                {editingBudget
                  ? "Update your budget category details below"
                  : "Add a new budget category to track your spending"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={errors.category ? "border-red-500" : ""}
                  placeholder="e.g. Groceries, Entertainment"
                />
                {errors.category && (
                  <p className="text-red-500 text-sm">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className={`pl-8 ${errors.amount ? "border-red-500" : ""}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Period *</Label>
                <Select
                  value={form.period}
                  onValueChange={(v) => setForm({ ...form, period: v })}
                >
                  <SelectTrigger
                    className={errors.period ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Weekly", "Monthly", "Quarterly", "Yearly"].map((p) => (
                      <SelectItem key={p} value={p}>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {p}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.period && (
                  <p className="text-red-500 text-sm">{errors.period}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave}>
                {editingBudget ? "Update Budget" : "Create Budget"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Total Budget
            </CardDescription>
            <CardTitle className="text-2xl">
              ${totalBudget.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {budgets.length} categories
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Spent
            </CardDescription>
            <CardTitle className="text-2xl">${totalSpent.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {overallPct}% of budget used
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Remaining
            </CardDescription>
            <CardTitle className="text-2xl">
              ${remainingBudget.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {100 - overallPct}% of budget remaining
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
          <CardDescription>
            You've spent ${totalSpent.toFixed(2)} of ${totalBudget.toFixed(2)}{" "}
            total budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {overallPct}% ({totalSpent.toFixed(2)} / {totalBudget.toFixed(2)})
            </span>
          </div>
          <Progress
            value={overallPct}
            className="h-3"
            indicatorClassName={
              overallPct >= 90
                ? "bg-red-500"
                : overallPct >= 75
                ? "bg-yellow-500"
                : "bg-green-500"
            }
          />
        </CardContent>
      </Card>

      {/* Budget Categories */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : budgets.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const pct = calcPct(b.spent, b.budget);
            const st = status(pct);
            const remaining = b.budget - b.spent;

            return (
              <Card
                key={b._id}
                className={
                  st === "danger"
                    ? "border-red-500 bg-red-50/50"
                    : st === "warning"
                    ? "border-yellow-500 bg-yellow-50/50"
                    : ""
                }
              >
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        {getCategoryIcon(b.category)}
                      </div>
                      <div>
                        <CardTitle>{b.category}</CardTitle>
                        <CardDescription className="text-sm">
                          {b.period} Budget
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingBudget(b);
                          setForm({
                            category: b.category,
                            amount: String(b.budget),
                            period: b.period,
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(b._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Spent</span>
                    <span className="font-medium">
                      ${b.spent.toFixed(2)} of ${b.budget.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className="h-2"
                    indicatorClassName={
                      st === "danger"
                        ? "bg-red-500"
                        : st === "warning"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }
                  />
                  <div className="flex justify-between mt-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Remaining: </span>
                      <span
                        className={
                          remaining < 0
                            ? "text-red-500 font-medium"
                            : "text-green-600 font-medium"
                        }
                      >
                        ${Math.abs(remaining).toFixed(2)}
                      </span>
                    </div>
                    <Badge
                      variant={
                        st === "danger"
                          ? "destructive"
                          : st === "warning"
                          ? "outline"
                          : "default"
                      }
                    >
                      {pct}%
                    </Badge>
                  </div>
                </CardContent>
                {st === "danger" && (
                  <CardFooter>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Budget Exceeded</AlertTitle>
                      <AlertDescription>
                        You've spent {pct}% of your {b.category} budget.
                      </AlertDescription>
                    </Alert>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2">
              <Wallet className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No budget categories found
              </p>
              <p className="text-sm text-muted-foreground">
                Create your first budget category to start tracking
              </p>
              <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
