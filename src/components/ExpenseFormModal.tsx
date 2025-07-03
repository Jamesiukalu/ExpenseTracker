import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { Calendar } from "./ui/calender";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Camera, Upload, X } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../lib/categories";
import { useToast } from "./ui/use-toast";
import api from "../api";
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

export interface ExpenseData {
  _id?: string;
  amount: number;
  date: Date;
  description: string;
  category: string;
  receiptUrl?: string;
}

interface Props {
  trigger?: React.ReactNode;
  onSubmit?: (data: ExpenseData) => void;
  initialExpense?: ExpenseData;
}

export default function ExpenseFormModal({
  trigger,
  onSubmit = () => {},
  initialExpense,
}: Props) {
  const isEdit = Boolean(initialExpense?._id);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // populate on edit
  useEffect(() => {
    if (initialExpense) {
      setDate(new Date(initialExpense.date));
      setAmount(initialExpense.amount.toString());
      setDescription(initialExpense.description);
      setCategory(initialExpense.category);
      if (initialExpense.receiptUrl) {
        setPreview(initialExpense.receiptUrl);
      }
    }
  }, [initialExpense]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!amount || +amount <= 0) e.amount = "Enter an amount > 0";
    if (!description.trim()) e.description = "Required";
    if (!category) e.category = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setReceipt(f);
    setPreview(URL.createObjectURL(f));
  };

  const pickPhoto = () => fileRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let receiptUrl = preview || undefined;

    try {
      if (receipt) {
        const fd = new FormData();
        fd.append("receipt", receipt);
        const up = await api.post("/expenses/upload/receipt", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        receiptUrl = up.data.url;
      }

      const payload: ExpenseData = {
        amount: +amount,
        date,
        description,
        category,
       receiptUrl,
        ...(initialExpense?._id ? { _id: initialExpense._id } : {}),
      };

      //I am sending to backend here
      if (isEdit) {
        await api.put(`/expenses/update/${initialExpense?._id}`, payload);
      } else {
        await api.post("/expenses", payload);
      }

      toast({ title: isEdit ? "Updated" : "Created" });
      setOpen(false);

      // reset fields
      if (!isEdit) {
        setAmount("");
        setDescription("");
        setCategory("");
        setReceipt(null);
        setPreview(null);
        setErrors({});
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>{isEdit ? "Edit" : "Add Expense"}</Button>}
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            Enter details and optional receipt
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
        >
          {/* Amount */}
          <div>
            <Label>Amount *</Label>
            <Input
              prefix="$"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full">
                  <CalendarIcon className="mr-2" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div className="sm:col-span-2">
            <Label>Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v)}>
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Receipt Upload */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileRef}
            onChange={handleFile}
          />

          <div className="sm:col-span-2">
            {!preview ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="button" variant="outline" onClick={pickPhoto}>
                  <Camera className="mr-2" />
                  Photo
                </Button>
                <Button type="button" variant="outline" onClick={pickPhoto}>
                  <Upload className="mr-2" />
                  Upload
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="preview"
                  className="rounded w-full max-h-60 sm:max-h-80 object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreview(null);
                    setReceipt(null);
                  }}
                >
                  <X />
                </Button>
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {isEdit ? "Save Changes" : "Save Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
