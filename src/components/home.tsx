import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Bell,
  Settings,
  PlusCircle,
  Home,
  PieChart,
  Wallet,
  HelpCircle,
  Upload,
  Download,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import ExpenseTracker from "./ExpenseTracker";
import BudgetManager from "./BudgetManager";
import ExpenseForm from "./ExpenseForm";
import InitialQuestionnaire from "./InitialQuestionnaire";

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showQuestionnaire, setShowQuestionnaire] = useState(true); // Set to true to show questionnaire by default
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: "Budget Alert",
      message: "You've spent 85% of your Restaurants budget",
      type: "warning",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Weekly Report",
      message: "Your weekly spending report is ready",
      type: "info",
      time: "1 day ago",
    },
  ]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  // Mock user data
  const user = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    totalBalance: 2450.75,
    monthlyBudget: 3000,
    spentThisMonth: 1850.25,
  };

  // Mock expense categories
  const categories = [
    { name: "Rent/Mortgage", amount: 1200, color: "#FF6384" },
    { name: "Groceries", amount: 320, color: "#36A2EB" },
    { name: "Restaurants & Dining Out", amount: 220, color: "#FFCE56" },
    { name: "Gas/Fuel", amount: 150, color: "#4BC0C0" },
    { name: "Electricity", amount: 120, color: "#9966FF" },
    {
      name: "Streaming Services (Netflix, Spotify)",
      amount: 45,
      color: "#FF9F40",
    },
  ];

  const handleCompleteQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  const handleAddExpense = () => {
    setShowExpenseForm(true);
  };

  const handleExpenseSubmit = () => {
    setShowExpenseForm(false);
    toast({
      title: "Expense Added",
      description: "Your expense has been successfully recorded.",
    });
  };

  const handleNotificationClick = () => {
    setHasUnreadNotifications(false);
    toast({
      title: "Notifications",
      description: `You have ${notifications.length} notifications.`,
    });
  };

  const handleImportData = () => {
    navigate("/import");
  };

  const handleHelpSupport = () => {
    navigate("/help");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  if (showQuestionnaire) {
    return <InitialQuestionnaire onComplete={handleCompleteQuestionnaire} />;
  }

  if (showExpenseForm) {
    return <ExpenseForm onSubmit={handleExpenseSubmit} />;
  }

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
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="ml-2 font-medium">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsContent value="dashboard" className="space-y-4 md:space-y-6">
              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">
                        Total Balance
                      </span>
                      <span className="text-xl md:text-2xl font-bold">
                        ${user.totalBalance.toFixed(2)}
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
                        ${user.monthlyBudget.toFixed(2)}
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
                        ${user.spentThisMonth.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expense Summary */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Expense Categories
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    {categories.map((category) => (
                      <div key={category.name} className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="flex-1 text-sm md:text-base truncate pr-2">
                          {category.name}
                        </span>
                        <span className="font-medium text-sm md:text-base flex-shrink-0">
                          ${category.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={handleAddExpense}
                  className="flex items-center"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Expense
                </Button>
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
