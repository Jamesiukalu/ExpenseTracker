import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Calendar } from "./ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Camera, Upload, X } from "lucide-react";
import { cn } from "../lib/utils";
import { EXPENSE_CATEGORIES } from "../lib/categories";

interface ExpenseFormProps {
  onSubmit?: (data: ExpenseData) => void;
}

interface ExpenseData {
  amount: string;
  date: Date;
  description: string;
  category: string;
  receipt?: File | null;
}

const ExpenseForm = ({ onSubmit = () => {} }: ExpenseFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [suggestedCategories, setSuggestedCategories] =
    useState<string[]>(EXPENSE_CATEGORIES);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceipt(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setReceiptPreview(previewUrl);

      // Simulate category suggestion based on receipt
      if (file.name.toLowerCase().includes("grocery")) {
        setCategory("Groceries");
      } else if (file.name.toLowerCase().includes("restaurant")) {
        setCategory("Restaurants & Dining Out");
      } else if (file.name.toLowerCase().includes("gas")) {
        setCategory("Gas/Fuel");
      } else if (file.name.toLowerCase().includes("coffee")) {
        setCategory("Coffee Shops");
      }
    }
  };

  const handleCameraCapture = () => {
    // In a real implementation, this would access the device camera
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeReceipt = () => {
    setReceipt(null);
    setReceiptPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }
    if (!description.trim()) {
      newErrors.description = "Please enter a description";
    }
    if (!category) {
      newErrors.category = "Please select a category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const expenseData: ExpenseData = {
      amount,
      date,
      description,
      category,
      receipt,
    };
    onSubmit(expenseData);

    // Reset form
    setAmount("");
    setDescription("");
    setCategory("");
    setReceipt(null);
    setReceiptPreview(null);
    setErrors({});
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">Add New Expense</CardTitle>
        <CardDescription className="text-sm">
          Enter expense details and upload a receipt if available
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className={`pl-7 ${errors.amount ? "border-red-500" : ""}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-red-500" : ""}
              required
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {suggestedCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Receipt</Label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {!receiptPreview ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCameraCapture}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleUpload}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-full h-48 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={removeReceipt}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="p-4 md:p-6">
        <Button className="w-full" onClick={handleSubmit}>
          Save Expense
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExpenseForm;
