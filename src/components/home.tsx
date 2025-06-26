import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Bell,
  Settings,
  PlusCircle,
  Home,
  PieChart,
  Wallet,
  HelpCircle,
  Upload,
  LogOut,
  ChevronRight,
  DollarSign,
  TrendingUp,
  CreditCard,
  PiggyBank,
  ShoppingBag,
  Utensils,
  Car,
  HomeIcon,
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import ExpenseTracker from "./ExpenseTracker";
import BudgetManager from "./BudgetManager";
import ExpenseFormModal, { ExpenseData } from "./ExpenseFormModal";
import InitialQuestionnaire from "./InitialQuestionnaire";
import api from "../api";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

interface Budget {
  _id: string;
  category: string;
  period: string;
  budget: number;
  spent: number;
  userId: string;
  color?: string;
  remaining?: number;
  statusPercentage?: number;
}

interface ExpenseSummary {
  totalSpent: number;
  categories: { [key: string]: number };
}

interface Profile {
  monthlyIncomeAfterTaxes: number;
  housingExpense: number;
  transportationExpense: number;
  foodGroceriesExpense: number;
  spendingPriorities: string[];
  financialGoals: string[];
  monthlySavingTarget: number;
  nonEssentialsShoppingFrequency: string;
  diningOutFrequency: string;
  currentStep: number;
  profileCompleted: boolean;
}

interface UserInfo {
  username: string;
  img?: string;
  monthlyBudget?: number;
  balance?: number;
}

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "expenses" | "budgets"
  >("dashboard");
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    totalSpent: 0,
    categories: {},
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnreadNotifications] = useState(true);

  const handleCompleteQuestionnaire = () => {
    setShowQuestionnaire(false);
    loadData();
  };

  const handleNotificationClick = () => navigate("/notifications");
  const handleImportData = () => navigate("/import");
  const handleHelpSupport = () => navigate("/help");
  const handleSettings = () => navigate("/settings");
  const handleExpenseSubmit = async (data: ExpenseData) => {
    try {
      const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      await api.post("/expenses", payload);
      toast({ 
        title: "Expense Added", 
        description: "Your expense has been recorded successfully.",
        className: "bg-green-50 border-green-200 text-green-800"
      });
      loadData();
    } catch (err: any) {
      toast({ 
        title: "Add Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const profRes = await api.get("/financial/profile");
      const prof = profRes.data.data;
      setProfile(prof);
      try {
        const userRes = await api.get(`/users/${prof.userId}`);
        const u = userRes.data;
        setUserInfo({
          username: u.username,
          img: u.img,
          monthlyBudget: u.monthlyBudget,
          balance: u.balance,
        });
      } catch {
        // ignore; fallback to generic avatar
      }
      if (!prof.profileCompleted || prof.currentStep < 5) {
        setShowQuestionnaire(true);
        setLoading(false);
        return;
      }
      // Fetch budgets
      const budgRes = await api.get("/budget");
      setBudgets(budgRes.data.data);
      // Fetch expense summary
      const sumRes = await api.get("/expenses/summary");
      setExpenseSummary(sumRes.data);
    } catch (err: any) {
      toast({
        title: "Error fetching data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast({ 
        title: "Logged Out", 
        description: "You have been logged out successfully.",
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
      navigate("/");
    } catch (err: any) {
      toast({ 
        title: "Logout Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  if (showQuestionnaire)
    return <InitialQuestionnaire onComplete={handleCompleteQuestionnaire} />;

  // Derived values
  const monthlyBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const spentThisMonth = expenseSummary.totalSpent;
  const totalBalance = monthlyBudget - spentThisMonth;
  const savingsRate = profile ? (profile.monthlySavingTarget / profile.monthlyIncomeAfterTaxes) * 100 : 0;

  const expenseCategories = Object.entries(expenseSummary.categories).map(
    ([name, amount]) => {
      const budg = budgets.find((b) => b.category === name);
      return { name, amount, color: budg?.color || "#888888" };
    }
  );

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'housing': return <HomeIcon className="h-4 w-4" />;
      case 'transportation': return <Car className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'shopping': return <ShoppingBag className="h-4 w-4" />;
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Wallet className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-lg font-bold">FinanceTracker</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="relative h-8 w-8"
              onClick={handleNotificationClick}
            >
              <Bell className="h-4 w-4" />
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  userInfo?.img ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    userInfo?.username || "User"
                  }`
                }
                alt={userInfo?.username}
              />
              <AvatarFallback>
                {userInfo?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <nav className="flex space-x-1 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="mr-1 h-3 w-3" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "expenses" ? "default" : "ghost"}
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={() => setActiveTab("expenses")}
          >
            <PieChart className="mr-1 h-3 w-3" />
            Expenses
          </Button>
          <Button
            variant={activeTab === "budgets" ? "default" : "ghost"}
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={() => setActiveTab("budgets")}
          >
            <Wallet className="mr-1 h-3 w-3" />
            Budgets
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-xs"
            onClick={handleImportData}
          >
            <Upload className="mr-1 h-3 w-3" />
            Import
          </Button>
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 border-r bg-card p-4 flex-col">
        <div className="flex items-center mb-8">
          <Wallet className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold">FinanceTracker</h1>
        </div>

        <nav className="space-y-1 flex-1">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "expenses" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("expenses")}
          >
            <PieChart className="mr-2 h-4 w-4" />
            Expenses
          </Button>
          <Button
            variant={activeTab === "budgets" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("budgets")}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Budgets
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleImportData}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Data
          </Button>
        </nav>

        <div className="mt-auto pt-4 border-t">
          <div className="flex items-center px-4 py-3 mb-2 rounded-lg bg-muted/50">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={
                  userInfo?.img ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                    userInfo?.username || "User"
                  }`
                }
                alt={userInfo?.username}
              />
              <AvatarFallback>
                {userInfo?.username?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{userInfo?.username}</p>
              <p className="text-xs text-muted-foreground">
                {userInfo?.balance !== undefined ? `$${userInfo.balance.toFixed(2)}` : "Member"}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleHelpSupport}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSettings}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 border-b items-center justify-between px-6 bg-white">
          <h2 className="text-xl font-semibold">
            {activeTab === "dashboard" && "Dashboard"}
            {activeTab === "expenses" && "Expense Tracking"}
            {activeTab === "budgets" && "Budget Management"}
          </h2>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-4 w-4" />
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </Button>
            <Button variant="outline" onClick={handleImportData}>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
            <Button onClick={() => setActiveTab("expenses")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/20">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full"
          >
            <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Total Balance
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      ${totalBalance.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      {totalBalance >= 0 ? (
                        <span className="text-green-600">+${Math.abs(totalBalance).toFixed(2)} remaining</span>
                      ) : (
                        <span className="text-red-600">-${Math.abs(totalBalance).toFixed(2)} over budget</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" /> Monthly Budget
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      ${monthlyBudget.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      {profile && (
                        <span>Based on ${profile.monthlyIncomeAfterTaxes.toFixed(2)} income</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" /> Spent This Month
                    </CardDescription>
                    <CardTitle className="text-2xl">
                      ${spentThisMonth.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      {monthlyBudget > 0 && (
                        <span>{((spentThisMonth / monthlyBudget) * 100).toFixed(1)}% of budget used</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Summary */}
              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Profile</CardTitle>
                    <CardDescription>Your personalized financial overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Income</h4>
                        <p className="font-medium">${profile.monthlyIncomeAfterTaxes.toFixed(2)}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Savings Goal</h4>
                        <div className="flex items-center">
                          <p className="font-medium">${profile.monthlySavingTarget.toFixed(2)}</p>
                          <Badge variant="outline" className="ml-2">
                            {savingsRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Spending Priorities</h4>
                        <p className="font-medium">{profile.spendingPriorities.join(", ")}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-muted-foreground">Financial Goals</h4>
                        <p className="font-medium">{profile.financialGoals.join(", ")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Expense Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>Your spending by category this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {expenseCategories.map((cat) => {
                        const budget = budgets.find(b => b.category === cat.name);
                        const budgetAmount = budget?.budget || 0;
                        const percentage = budgetAmount > 0 ? (cat.amount / budgetAmount) * 100 : 0;
                        
                        return (
                          <div key={cat.name} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  {getCategoryIcon(cat.name)}
                                </div>
                                <div>
                                  <p className="font-medium">{cat.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ${cat.amount.toFixed(2)} of ${budgetAmount.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={percentage > 90 ? "destructive" : percentage > 75 ? "outline" : "default"}>
                                {percentage.toFixed(1)}%
                              </Badge>
                            </div>
                            <Progress 
                              value={percentage} 
                              className="h-2" 
                              indicatorClassName={percentage > 90 ? "bg-destructive" : percentage > 75 ? "bg-warning" : "bg-primary"}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your finances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab("expenses")}>
                        <span>View All Expenses</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <ExpenseFormModal 
                        trigger={
                          <Button variant="outline" className="w-full justify-between">
                            <span>Add New Expense</span>
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        } 
                        onSubmit={handleExpenseSubmit} 
                      />
                      <Button variant="outline" className="w-full justify-between" onClick={() => setActiveTab("budgets")}>
                        <span>Manage Budgets</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" className="w-full justify-between" onClick={handleImportData}>
                        <span>Import Data</span>
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <ExpenseTracker />
            </TabsContent>

            <TabsContent value="budgets">
              <BudgetManager />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default HomePage;