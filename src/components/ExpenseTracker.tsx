import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Car,
  CreditCard,
  DollarSign,
  Film,
  Utensils,
  ShoppingBag,
  Zap,
  Download,
  HomeIcon,
  Plus,
  Edit,
  Trash2,
  FileText,
  BarChart2,
  List,
  ArrowUpDown,
  PieChart,
} from "lucide-react";
import ChartBreakdown from "./ChartBreakdown";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "../lib/categories";
import api from "../api";
import { useToast } from "./ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Button } from "./ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar as Cal } from "./ui/calender";
import ExpenseFormModal, { ExpenseData } from "./ExpenseFormModal";
import { Progress } from "./ui/progress";
import { Skeleton } from "./ui/skeleton";

interface Expense {
  _id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  receiptUrl?: string;
}

export default function ExpenseTracker() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: Date | undefined; to?: Date | undefined }>({ from: undefined, to: undefined });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<"list" | "chart">("list");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Expense; direction: 'ascending' | 'descending' } | null>(null);

  // Load expenses
  const load = async (month?: string) => {
    setLoading(true);
    try {
      const res = month
        ? await api.get("/expenses", { params: { month } })
        : await api.get("/expenses");
      setExpenses(res.data);
    } catch (err: any) {
      toast({ 
        title: "Error", 
        description: err.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load();
  }, []);

  // Handle expense submission
  const handleSubmit = async (data: ExpenseData) => {
    try {
      const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      if (editing) {
        await api.put(`/expenses/update/${editing._id}`, payload);
        toast({ 
          title: "Expense Updated", 
          description: "Your expense has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800"
        });
      } else {
        await api.post("/expenses", payload);
        toast({ 
          title: "Expense Added", 
          description: "Your expense has been recorded successfully.",
          className: "bg-green-50 border-green-200 text-green-800"
        });
      }
      setEditing(null);
      load();
    } catch (err: any) {
      toast({ 
        title: editing ? "Update Failed" : "Add Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  // Delete expense
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast({ 
        title: "Expense Deleted", 
        description: "The expense has been removed from your records.",
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
      load();
    } catch (err: any) {
      toast({ 
        title: "Delete Failed", 
        description: err.message, 
        variant: "destructive" 
      });
    }
  };

  // Sort expenses
  const requestSort = (key: keyof Expense) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort expenses
  const filtered = expenses.filter(e => {
    const matchSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || category === "all" || e.category === category;
    const d = new Date(e.date);
    const matchDate =
      (!range.from || d >= range.from) && (!range.to || d <= range.to);
    return matchSearch && matchCat && matchDate;
  });

  // Apply sorting
  let sortedExpenses = [...filtered];
  if (sortConfig !== null) {
    sortedExpenses.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }

  const total = sortedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const byCat = EXPENSE_CATEGORIES.map(c => ({
    category: c,
    total: sortedExpenses.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0),
  })).filter(x => x.total > 0);

  const fmtRange = () => {
    if (range.from && range.to) return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`;
    if (range.from) return `From ${format(range.from, "MMM dd")}`;
    if (range.to) return `Until ${format(range.to, "MMM dd")}`;
    return "All dates";
  };

  // Export CSV
  const handleExport = () => {
    const headers = ["Date", "Description", "Amount", "Category"];
    const rows = sortedExpenses.map(e => [
      format(new Date(e.date), "yyyy-MM-dd"),
      e.description,
      e.amount.toFixed(2),
      e.category,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${format(new Date(), "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Your expense data has been downloaded.",
      className: "bg-blue-50 border-blue-200 text-blue-800"
    });
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'housing': return <HomeIcon className="h-4 w-4" />;
      case 'transportation': return <Car className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'shopping': return <ShoppingBag className="h-4 w-4" />;
      case 'entertainment': return <Film className="h-4 w-4" />;
      case 'utilities': return <Zap className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expense Tracker</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your spending patterns
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <ExpenseFormModal
            trigger={
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            }
            onSubmit={handleSubmit}
          />
          <Button variant="outline" onClick={handleExport} className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Expenses
            </CardDescription>
            <CardTitle className="text-2xl">
              ${total.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {sortedExpenses.length} transactions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Top Category
            </CardDescription>
            <CardTitle className="text-2xl">
              {byCat.sort((a,b) => b.total - a.total)[0]?.category || "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              ${byCat.sort((a,b) => b.total - a.total)[0]?.total.toFixed(2) || "0.00"}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </CardDescription>
            <CardTitle className="text-2xl">
              {fmtRange()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {range.from || range.to ? "Custom range" : "All dates"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your expense data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-10" 
                placeholder="Search descriptions or categories..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            
            <Select value={category || "all"} onValueChange={v => setCategory(v === "all" ? null : v)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>
                    <div className="flex items-center">
                      {getCategoryIcon(c)}
                      <span className="ml-2">{c}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  {fmtRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Cal
                  mode="range"
                  selected={range}
                  onSelect={r => setRange(r ?? { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Data Views */}
      <Tabs defaultValue={view} onValueChange={v => setView(v as any)} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="list">
              <List className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="chart">
              <BarChart2 className="mr-2 h-4 w-4" />
              Chart View
            </TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            {sortedExpenses.length} expenses found
          </div>
        </div>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">
                        <Button 
                          variant="ghost" 
                          onClick={() => requestSort('date')}
                          className="px-0 hover:bg-transparent"
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button 
                          variant="ghost" 
                          onClick={() => requestSort('description')}
                          className="px-0 hover:bg-transparent"
                        >
                          Description
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        <Button 
                          variant="ghost" 
                          onClick={() => requestSort('category')}
                          className="px-0 hover:bg-transparent"
                        >
                          Category
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button 
                          variant="ghost" 
                          onClick={() => requestSort('amount')}
                          className="px-0 hover:bg-transparent"
                        >
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">Receipt</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedExpenses.length ? sortedExpenses.map(e => (
                      <TableRow key={e._id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {format(new Date(e.date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="flex items-center gap-2 w-fit">
                            {getCategoryIcon(e.category)}
                            {e.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${e.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {e.receiptUrl ? (
                            <a 
                              href={e.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </a>
                          ) : (
                            <span className="text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <ExpenseFormModal
                              trigger={
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8"
                                  onClick={() => setEditing(e)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                              onSubmit={handleSubmit}
                              initialExpense={{ ...e, date: new Date(e.date) }}
                            />
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(e._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No expenses found</p>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your filters or add a new expense
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              Shows a visual breakdown of your expenses by category.
            </CardHeader>
            <CardContent>
             <ChartBreakdown byCat={byCat} total={total} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}