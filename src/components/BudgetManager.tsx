// BudgetManager.tsx
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
import { AlertCircle, Plus, Edit2, Trash } from "lucide-react";
import { useToast } from "./ui/use-toast";
import api from "../api";

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

  // New budget form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [form, setForm] = useState({ category: "", amount: "", period: "Monthly" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load budgets
  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budget");
      setBudgets(res.data.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };
  useEffect(() => { fetchBudgets(); }, []);

  // Validation
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.category.trim()) e.category = "Category is required";
    if (!form.amount || +form.amount <= 0) e.amount = "Amount must be greater than 0";
    if (!form.period) e.period = "Period is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Create or update
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
        setBudgets(budgets.map(b => b._id === res.data.data._id ? res.data.data : b));
        toast({ title: "Budget Updated", description: "Your budget has been updated." });
      } else {
        // Create new
        const res = await api.post("/budget", {
          category: form.category,
          period: form.period,
          budget: +form.amount,
        });
        setBudgets([res.data.data, ...budgets]);
        toast({ title: "Budget Created", description: "New budget added." });
      }
      setDialogOpen(false);
      setEditingBudget(null);
      setForm({ category: "", amount: "", period: "Monthly" });
      setErrors({});
    } catch (err: any) {
      toast({ title: editingBudget ? "Update Failed" : "Create Failed", description: err.message, variant: "destructive" });
    }
  };

  // Delete handler (optional)
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/budget/${id}`);
      setBudgets(budgets.filter(b => b._id !== id));
      toast({ title: "Budget Deleted", description: "Budget removed." });
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  // Helpers
  const calcPct = (spent: number, total: number) => Math.round((spent / total) * 100);
  const status = (p: number) => p >= 90 ? "danger" : p >= 75 ? "warning" : "normal";
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPct = totalBudget > 0 ? calcPct(totalSpent, totalBudget) : 0;

  return (
    <div className="bg-background p-6 rounded-lg w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Budget Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2"/> {editingBudget ? "Edit Budget" : "Add Budget"}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Edit Budget" : "Create New Budget"}</DialogTitle>
              <DialogDescription>
                {editingBudget ? "Update your budget category" : "Add a new category to track"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label>Category *</Label>
              <Input
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className={errors.category ? "border-red-500" : ""}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

              <Label>Amount *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}

              <Label>Period *</Label>
              <Select value={form.period} onValueChange={v => setForm({ ...form, period: v })}>
                <SelectTrigger className={errors.period ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Weekly','Monthly','Quarterly','Yearly'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.period && <p className="text-red-500 text-sm">{errors.period}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave}>{editingBudget ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Budget Status</CardTitle>
          <CardDescription>
            You've spent ${totalSpent.toFixed(2)} of your ${totalBudget.toFixed(2)} total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm mb-2">
            <span>Total Progress</span><span>{overallPct}%</span>
          </div>
          <Progress value={overallPct} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {budgets.map(b => {
          const pct = calcPct(b.spent, b.budget);
          const st = status(pct);
          return (
            <Card key={b._id} className={st === 'danger' ? 'border-red-500' : ''}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{b.category}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingBudget(b);
                      setForm({ category: b.category, amount: String(b.budget), period: b.period });
                      setDialogOpen(true);
                    }}><Edit2 /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b._id)}><Trash /></Button>
                  </div>
                </div>
                <CardDescription className="flex justify-between text-sm">
                  <span>Spent: ${b.spent}</span>
                  <span>Budget: ${b.budget}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span><span className={pct >= 90 ? 'text-red-500' : ''}>{pct}%</span>
                </div>
                <Progress value={pct} className={`h-2 ${st==='danger'? 'bg-red-200' : st==='warning'?'bg-yellow-200':''}`} />
              </CardContent>
              {st === 'danger' && (
                <CardFooter>
                  <Alert variant="destructive">
                    <AlertCircle /><AlertTitle>Budget Alert</AlertTitle>
                    <AlertDescription>Approaching limit for {b.category}.</AlertDescription>
                  </Alert>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
