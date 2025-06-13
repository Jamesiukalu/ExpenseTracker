import React, { useState } from "react";
import { Search, Filter, Calendar, ChevronDown, Download } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../lib/categories";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calender";
import { format } from "date-fns";

interface Expense {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  hasReceipt: boolean;
}

const ExpenseTracker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });

  // Mock data for expenses
  const mockExpenses: Expense[] = [
    {
      id: "1",
      date: new Date("2023-05-15"),
      description: "Grocery shopping",
      amount: 85.47,
      category: "Groceries",
      hasReceipt: true,
    },
    {
      id: "2",
      date: new Date("2023-05-14"),
      description: "Gas station",
      amount: 45.0,
      category: "Gas/Fuel",
      hasReceipt: false,
    },
    {
      id: "3",
      date: new Date("2023-05-12"),
      description: "Netflix subscription",
      amount: 14.99,
      category: "Streaming Services (Netflix, Spotify)",
      hasReceipt: false,
    },
    {
      id: "4",
      date: new Date("2023-05-10"),
      description: "Restaurant dinner",
      amount: 78.5,
      category: "Restaurants & Dining Out",
      hasReceipt: true,
    },
    {
      id: "5",
      date: new Date("2023-05-08"),
      description: "Electricity bill",
      amount: 120.75,
      category: "Electricity",
      hasReceipt: true,
    },
    {
      id: "6",
      date: new Date("2023-05-07"),
      description: "Rent payment",
      amount: 1200.0,
      category: "Rent/Mortgage",
      hasReceipt: true,
    },
    {
      id: "7",
      date: new Date("2023-05-06"),
      description: "Haircut",
      amount: 35.0,
      category: "Haircuts & Salon",
      hasReceipt: false,
    },
    {
      id: "8",
      date: new Date("2023-05-05"),
      description: "Coffee shop",
      amount: 12.5,
      category: "Coffee Shops",
      hasReceipt: false,
    },
  ];

  // Categories for filtering
  const categories = EXPENSE_CATEGORIES;

  // Filter expenses based on search, category, and date range
  const filteredExpenses = mockExpenses.filter((expense) => {
    // Filter by search query
    const matchesSearch =
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by category
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === "all" ||
      expense.category === selectedCategory;

    // Filter by date range
    const matchesDateRange =
      (!dateRange.from || expense.date >= dateRange.from) &&
      (!dateRange.to || expense.date <= dateRange.to);

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  // Calculate expenses by category for the chart
  const expensesByCategory = categories
    .map((category) => {
      const total = mockExpenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return { category, total };
    })
    .filter((item) => item.total > 0);

  const handleDateRangeSelect = (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    setDateRange(range);
  };

  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM dd, yyyy")}`;
    }
    if (dateRange.to) {
      return `Until ${format(dateRange.to, "MMM dd, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <div className="bg-background p-3 md:p-6 rounded-lg w-full">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold">Expense Tracker</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Download size={16} />
            <span className="sm:inline">Export Data</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl md:text-2xl font-bold">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Number of Transactions
                </p>
                <p className="text-xl md:text-2xl font-bold">
                  {filteredExpenses.length}
                </p>
              </div>
              <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Most Spent Category
                </p>
                <p className="text-lg md:text-2xl font-bold leading-tight">
                  {expensesByCategory.sort((a, b) => b.total - a.total)[0]
                    ?.category || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="chart">Chart View</TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) =>
                  setSelectedCategory(value === "all" ? null : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[220px] justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="truncate">{formatDateRange()}</span>
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={1}
                    className="p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[150px]">
                          Description
                        </TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">
                          Category
                        </TableHead>
                        <TableHead className="text-right min-w-[80px]">
                          Amount
                        </TableHead>
                        <TableHead className="min-w-[80px] hidden md:table-cell">
                          Receipt
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="text-sm">
                              {format(expense.date, "MMM dd")}
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="max-w-[150px] truncate">
                                {expense.description}
                              </div>
                              <div className="sm:hidden text-xs text-muted-foreground mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {expense.category}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              <Badge variant="outline" className="text-xs">
                                {expense.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                              ${expense.amount.toFixed(2)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {expense.hasReceipt ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-muted-foreground text-xs"
                                >
                                  No
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground text-sm"
                          >
                            No expenses found matching your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[300px] flex items-end justify-around gap-2">
                  {expensesByCategory.map((item) => {
                    const percentage = (item.total / totalExpenses) * 100;
                    const height = Math.max(percentage, 5); // Minimum 5% height for visibility

                    return (
                      <div
                        key={item.category}
                        className="flex flex-col items-center"
                      >
                        <div
                          className="w-16 bg-primary rounded-t-md"
                          style={{ height: `${height}%` }}
                        />
                        <p className="text-xs mt-2 font-medium">
                          {item.category}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${item.total.toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpenseTracker;
