import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, ChevronDown, Download, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { Button } from "./ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Badge } from "./ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar as Cal } from "./ui/calender";
import { format } from "date-fns";
import { EXPENSE_CATEGORIES } from "../lib/categories";
import { useToast } from "./ui/use-toast";
import api from "../api";
import ExpenseFormModal, { ExpenseData } from "./ExpenseFormModal";

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

  // Load current month
  const load = async () => {
    try {
      const m = new Date().toISOString().slice(0, 7);
      const res = await api.get("/expenses", { params: { month: m } });
      setExpenses(res.data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => { load() }, []);

  // Add or update
  const handleSubmit = async (data: ExpenseData) => {
    try {
      const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString() : data.date,
      };
      if (editing) {
        await api.put(`/expenses/update/${editing._id}`, payload);
        toast({ title: "Expense Updated" });
      } else {
        await api.post("/expenses", payload);
        toast({ title: "Expense Added" });
      }
      setEditing(null);
      load();
    } catch (err: any) {
      toast({ title: editing ? "Update Failed" : "Add Failed", description: err.message, variant: "destructive" });
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Really delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast({ title: "Deleted" });
      load();
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  // Filtering
  const filtered = expenses.filter(e => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase())
      || e.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || category === "all" || e.category === category;
    const d = new Date(e.date);
    const matchDate = (!range.from || d >= range.from) && (!range.to || d <= range.to);
    return matchSearch && matchCat && matchDate;
  });

  const total = filtered.reduce((sum, e) => sum + e.amount, 0);
  const byCat = EXPENSE_CATEGORIES.map(c => {
    const sum = filtered.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0);
    return { category: c, total: sum };
  }).filter(x => x.total > 0);

  const fmtRange = () => {
    if (range.from && range.to) return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd")}`;
    if (range.from) return `From ${format(range.from, "MMM dd")}`;
    if (range.to) return `Until ${format(range.to, "MMM dd")}`;
    return "Select range";
  };

  // Export CSV
  const handleExport = () => {
    const headers = ["Date", "Description", "Amount", "Category"];
    const rows = filtered.map(e => [
      format(new Date(e.date), "yyyy-MM-dd"),
      e.description,
      e.amount.toFixed(2),
      e.category,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `expenses_${new Date().toISOString().slice(0,7)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-background p-6 rounded-lg w-full">
      {/* Add & Export */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Expense Tracker
          <ExpenseFormModal
            trigger={<Button size="icon" variant="outline"><Plus /></Button>}
            onSubmit={handleSubmit}
          />
        </h1>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2"/>Export Data
        </Button>
      </div>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded">
              <p>Total</p><p className="text-xl">${total.toFixed(2)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded">
              <p>Transactions</p><p className="text-xl">{filtered.length}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded">
              <p>Top Category</p><p className="text-xl">{byCat.sort((a,b)=>b.total-a.total)[0]?.category||"N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-muted-foreground"/>
          <Input className="pl-10" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <Select value={category||"all"} onValueChange={v=>setCategory(v==="all"?null:v)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Category"/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {EXPENSE_CATEGORIES.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-48 justify-start">
              <Calendar className="mr-2"/> {fmtRange()} <ChevronDown className="ml-auto"/>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Cal mode="range" selected={range} onSelect={r => setRange(r ?? { from: undefined, to: undefined })}/>
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Views */}
      <Tabs defaultValue={view} onValueChange={v=>setView(v as any)}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="chart">Chart View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden sm:table-cell">Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Receipt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length ? filtered.map(e=>(
                    <TableRow key={e._id}>
                      <TableCell>{format(new Date(e.date),"MMM dd")}</TableCell>
                      <TableCell>{e.description}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">{e.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${e.amount.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {e.receiptUrl ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="space-x-2">
                        <ExpenseFormModal
                          trigger={<Button size="icon" variant="ghost" onClick={() => setEditing(e)} ><Edit/></Button>}
                          onSubmit={handleSubmit}
                          initialExpense={{ ...e, date: new Date(e.date) }}
                        />
                        <Button size="icon" variant="ghost" onClick={()=>handleDelete(e._id)}>
                          <Trash2/>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No expenses.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chart">
          <Card>
            <CardContent>
              <div className="h-64 flex items-end justify-around">
                {byCat.map(i=>{
                  const pct = (i.total/total)*100;
                  const h   = Math.max(pct,5);
                  return (
                    <div key={i.category} className="flex flex-col items-center">
                      <div className="w-12 bg-primary rounded-t" style={{ height:`${h}%` }}/>
                      <p className="text-xs mt-1">{i.category}</p>
                      <p className="text-xs text-muted-foreground">${i.total.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}