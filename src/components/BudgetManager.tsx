import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { AlertCircle, Plus, Settings } from "lucide-react";

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
}

const BudgetManager = () => {
  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: "1",
      category: "Groceries",
      amount: 500,
      spent: 320,
      period: "Monthly",
    },
    {
      id: "2",
      category: "Streaming Services (Netflix, Spotify)",
      amount: 50,
      spent: 45,
      period: "Monthly",
    },
    {
      id: "3",
      category: "Gas/Fuel",
      amount: 200,
      spent: 150,
      period: "Monthly",
    },
    {
      id: "4",
      category: "Restaurants & Dining Out",
      amount: 250,
      spent: 220,
      period: "Monthly",
    },
    {
      id: "5",
      category: "Rent/Mortgage",
      amount: 1200,
      spent: 1200,
      period: "Monthly",
    },
    {
      id: "6",
      category: "Electricity",
      amount: 150,
      spent: 120,
      period: "Monthly",
    },
  ]);

  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "Monthly",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateBudgetForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newBudget.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }
    if (!newBudget.period) {
      newErrors.period = "Please select a period";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBudget = () => {
    if (!validateBudgetForm()) {
      return;
    }

    const budget: Budget = {
      id: Date.now().toString(),
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      spent: 0,
      period: newBudget.period,
    };

    setBudgets([...budgets, budget]);
    setNewBudget({ category: "", amount: "", period: "Monthly" });
    setErrors({});
    setDialogOpen(false);
  };

  const calculatePercentage = (spent: number, total: number) => {
    return Math.round((spent / total) * 100);
  };

  const getBudgetStatus = (spent: number, total: number) => {
    const percentage = calculatePercentage(spent, total);
    if (percentage >= 90) return "danger";
    if (percentage >= 75) return "warning";
    return "normal";
  };

  const getTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.amount, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((total, budget) => total + budget.spent, 0);
  };

  const getOverallPercentage = () => {
    const total = getTotalBudget();
    const spent = getTotalSpent();
    return total > 0 ? Math.round((spent / total) * 100) : 0;
  };

  return (
    <div className="bg-background p-3 md:p-6 rounded-lg w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Budget Manager</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>
                Set up a new budget category to track your spending.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="category"
                    value={newBudget.category}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, category: e.target.value })
                    }
                    className={errors.category ? "border-red-500" : ""}
                    placeholder="e.g., Groceries, Entertainment"
                    required
                  />
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount *
                </Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    id="amount"
                    type="number"
                    value={newBudget.amount}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, amount: e.target.value })
                    }
                    className={errors.amount ? "border-red-500" : ""}
                    placeholder="0.00"
                    required
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Period *
                </Label>
                <div className="col-span-3 space-y-2">
                  <Select
                    value={newBudget.period}
                    onValueChange={(value) =>
                      setNewBudget({ ...newBudget, period: value })
                    }
                    required
                  >
                    <SelectTrigger
                      className={errors.period ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.period && (
                    <p className="text-sm text-red-500">{errors.period}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setErrors({});
                    setNewBudget({
                      category: "",
                      amount: "",
                      period: "Monthly",
                    });
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleAddBudget}>Create Budget</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-6">
          <TabsTrigger value="overview" className="text-sm md:text-base">
            Overview
          </TabsTrigger>
          <TabsTrigger value="details" className="text-sm md:text-base">
            Budget Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">
                Overall Budget Status
              </CardTitle>
              <CardDescription className="text-sm">
                You've spent ${getTotalSpent().toFixed(2)} of your $
                {getTotalBudget().toFixed(2)} total budget.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm md:text-base">
                  <span>Total Progress</span>
                  <span>{getOverallPercentage()}%</span>
                </div>
                <Progress value={getOverallPercentage()} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {budgets.map((budget) => {
              const percentage = calculatePercentage(
                budget.spent,
                budget.amount,
              );
              const status = getBudgetStatus(budget.spent, budget.amount);

              return (
                <Card
                  key={budget.id}
                  className={status === "danger" ? "border-red-500" : ""}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <CardTitle className="text-base md:text-lg leading-tight">
                        {budget.category}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {budget.period}
                      </span>
                    </div>
                    <CardDescription className="flex flex-col sm:flex-row justify-between gap-1 text-sm">
                      <span>Spent: ${budget.spent}</span>
                      <span>Budget: ${budget.amount}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span
                          className={
                            percentage >= 90 ? "text-red-500 font-medium" : ""
                          }
                        >
                          {percentage}%
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 ${status === "danger" ? "bg-red-200" : status === "warning" ? "bg-yellow-200" : ""}`}
                      />
                    </div>
                  </CardContent>
                  {status === "danger" && (
                    <CardFooter className="pt-0">
                      <Alert variant="destructive" className="w-full py-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Budget Alert</AlertTitle>
                        <AlertDescription>
                          You're approaching your budget limit for{" "}
                          {budget.category}.
                        </AlertDescription>
                      </Alert>
                    </CardFooter>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-lg md:text-xl">
                    Budget Details
                  </CardTitle>
                  <CardDescription className="text-sm">
                    View and adjust your budget allocations across categories.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" /> Manage Categories
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 md:p-3 text-sm">Category</th>
                      <th className="text-left p-2 md:p-3 text-sm">Period</th>
                      <th className="text-left p-2 md:p-3 text-sm">Budget</th>
                      <th className="text-left p-2 md:p-3 text-sm">Spent</th>
                      <th className="text-left p-2 md:p-3 text-sm">
                        Remaining
                      </th>
                      <th className="text-left p-2 md:p-3 text-sm">Status</th>
                      <th className="text-left p-2 md:p-3 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget) => {
                      const remaining = budget.amount - budget.spent;
                      const percentage = calculatePercentage(
                        budget.spent,
                        budget.amount,
                      );
                      const status = getBudgetStatus(
                        budget.spent,
                        budget.amount,
                      );

                      return (
                        <tr key={budget.id} className="border-b">
                          <td className="p-2 md:p-3 text-sm">
                            <div className="max-w-[120px] truncate">
                              {budget.category}
                            </div>
                          </td>
                          <td className="p-2 md:p-3 text-sm">
                            {budget.period}
                          </td>
                          <td className="p-2 md:p-3 text-sm">
                            ${budget.amount}
                          </td>
                          <td className="p-2 md:p-3 text-sm">
                            ${budget.spent}
                          </td>
                          <td className="p-2 md:p-3 text-sm">${remaining}</td>
                          <td className="p-2 md:p-3">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={percentage}
                                className={`h-2 w-12 md:w-16 ${status === "danger" ? "bg-red-200" : status === "warning" ? "bg-yellow-200" : ""}`}
                              />
                              <span className="text-xs md:text-sm">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="p-2 md:p-3">
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetManager;
