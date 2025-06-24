import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent } from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
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
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import ExpenseTracker from "./ExpenseTracker";
import BudgetManager from "./BudgetManager";
import ExpenseFormModal, { ExpenseData } from "./ExpenseFormModal";
import InitialQuestionnaire from "./InitialQuestionnaire";
import api from "../api";

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
      toast({ title: "Expense Added", description: "Your expense has been recorded." });
      loadData();
    } catch (err: any) {
      toast({ title: "Add Failed", description: err.message, variant: "destructive" });
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
      // const month = new Date().toISOString().slice(0, 7);
      // const sumRes = await api.get("/expenses/summary", { params: { month } });
      // setExpenseSummary(sumRes.data);
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
      toast({ title: "Logged Out", description: "You have been logged out." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Logout Failed", description: err.message, variant: "destructive" });
    }
  }
  useEffect(() => {
    loadData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">Loading…</div>
    );
  if (showQuestionnaire)
    return <InitialQuestionnaire onComplete={handleCompleteQuestionnaire} />;

  // Derived values
  const monthlyBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const spentThisMonth = expenseSummary.totalSpent;
  const totalBalance = monthlyBudget - spentThisMonth;

  const expenseCategories = Object.entries(expenseSummary.categories).map(
    ([name, amount]) => {
      const budg = budgets.find((b) => b.category === name);
      return { name, amount, color: budg?.color || "#888888" };
    }
  );

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

        <nav className="space-y-2 flex-1">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "expenses" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("expenses")}
          >
            <PieChart className="mr-2 h-4 w-4" />
            Expenses
          </Button>
          <Button
            variant={activeTab === "budgets" ? "default" : "ghost"}
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
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleHelpSupport}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSettings}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
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
        <header className="hidden md:flex h-16 border-b items-center justify-between px-6">
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
            <div className="flex items-center">
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
              <span className="ml-2 font-medium">{userInfo?.username}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full"
          >
            <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
              {/* --- Profile Details Section --- */}
              {profile && (
                <Card>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                    <div>
                      <strong>Income:</strong> $
                      {profile.monthlyIncomeAfterTaxes}
                    </div>
                    <div>
                      <strong>Housing:</strong> ${profile.housingExpense}
                    </div>
                    <div>
                      <strong>Transport:</strong> $
                      {profile.transportationExpense}
                    </div>
                    <div>
                      <strong>Food:</strong> ${profile.foodGroceriesExpense}
                    </div>
                    <div>
                      <strong>Saving Goal:</strong> $
                      {profile.monthlySavingTarget}
                    </div>
                    <div>
                      <strong>Shop Freq:</strong>{" "}
                      {profile.nonEssentialsShoppingFrequency}
                    </div>
                    <div>
                      <strong>Dine Freq:</strong> {profile.diningOutFrequency}
                    </div>
                    <div>
                      <strong>Priorities:</strong>{" "}
                      {profile.spendingPriorities.join(", ")}
                    </div>
                    <div>
                      <strong>Goals:</strong>{" "}
                      {profile.financialGoals.join(", ")}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Financial Overview (unchanged) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Total Balance
                      </span>
                      <span className="text-xl md:text-2xl font-bold">
                        ${totalBalance.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Monthly Budget
                      </span>
                      <span className="text-xl md:text-2xl font-bold">
                        ${monthlyBudget.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Spent This Month
                      </span>
                      <span className="text-xl md:text-2xl font-bold">
                        ${spentThisMonth.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expense Categories (unchanged) */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Expense Categories
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {expenseCategories.map((cat) => (
                      <div key={cat.name} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        <span className="flex-1 text-sm md:text-base truncate pr-2">
                          {cat.name}
                        </span>
                        <span className="font-medium text-sm md:text-base flex-shrink-0">
                          ${cat.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                 <ExpenseFormModal trigger={<Button><PlusCircle className="mr-2"/>Add New Expense</Button>} onSubmit={handleExpenseSubmit} />
                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Data
                </Button>
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
