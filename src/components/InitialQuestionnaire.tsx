import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
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
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

interface QuestionnaireProps {
  onComplete?: (categories: CategorySuggestion[]) => void;
}

interface CategorySuggestion {
  name: string;
  icon: string;
  color: string;
  budgetSuggestion: number;
}

const InitialQuestionnaire = ({ onComplete = () => {} }: QuestionnaireProps) => {
  const navigate = useNavigate();
  const totalSteps = 5;
  const [step, setStep] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    income: "",
    housingExpense: "",
    transportationExpense: "",
    foodExpense: "",
    spendingPriorities: [] as string[],
    savingGoals: "",
    financialGoals: [] as string[],
    shoppingFrequency: "weekly",
    diningOutFrequency: "weekly",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    api
      .get("/financial/profile")
      .then((res) => {
        const data = res.data.data;
        setFormData({
          income: data.monthlyIncomeAfterTaxes?.toString() || "",
          housingExpense: data.housingExpense?.toString() || "",
          transportationExpense: data.transportationExpense?.toString() || "",
          foodExpense: data.foodGroceriesExpense?.toString() || "",
          spendingPriorities: data.spendingPriorities || [],
          savingGoals: data.monthlySavingTarget?.toString() || "",
          financialGoals: data.financialGoals || [],
          shoppingFrequency: data.nonEssentialsShoppingFrequency || "weekly",
          diningOutFrequency: data.diningOutFrequency || "weekly",
        });
        setStep(Math.min(data.currentStep + 1, totalSteps));
      })
      .catch(() => {
        const saved = localStorage.getItem("questionnaireData");
        if (saved) setFormData(JSON.parse(saved));
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  const validateCurrentStep = () => {
    const e: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.income || +formData.income <= 0)
          e.income = "Please enter a valid monthly income";
        break;
      case 2:
        if (+formData.housingExpense < 0)
          e.housingExpense = "Enter housing expense (0 if none)";
        if (+formData.transportationExpense < 0)
          e.transportationExpense = "Enter transportation expense (0 if none)";
        if (+formData.foodExpense < 0)
          e.foodExpense = "Enter food expense (0 if none)";
        break;
      case 3:
        if (formData.spendingPriorities.length === 0)
          e.spendingPriorities = "Select at least one spending priority";
        break;
      case 4:
        if (formData.financialGoals.length === 0)
          e.financialGoals = "Select at least one financial goal";
        if (+formData.savingGoals < 0)
          e.savingGoals = "Enter your monthly saving target (0 if none)";
        break;
      case 5:
        if (!formData.shoppingFrequency)
          e.shoppingFrequency = "Select shopping frequency";
        if (!formData.diningOutFrequency)
          e.diningOutFrequency = "Select dining out frequency";
        break;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = async () => {
    if (!validateCurrentStep()) return;
    setErrors({});
    localStorage.setItem("questionnaireData", JSON.stringify(formData));

    let payload: Record<string, any> = {};
    switch (step) {
      case 1:
        payload = { monthlyIncomeAfterTaxes: +formData.income };
        break;
      case 2:
        payload = {
          housingExpense: +formData.housingExpense,
          transportationExpense: +formData.transportationExpense,
          foodGroceriesExpense: +formData.foodExpense,
        };
        break;
      case 3:
        payload = { spendingPriorities: formData.spendingPriorities };
        break;
      case 4:
        payload = {
          financialGoals: formData.financialGoals,
          monthlySavingTarget: +formData.savingGoals,
        };
        break;
      case 5:
        payload = {
          nonEssentialsShoppingFrequency: formData.shoppingFrequency,
          diningOutFrequency: formData.diningOutFrequency,
        };
        break;
    }

    try {
      await api.post(`/financial/save-step/${step}`, payload);
    } catch {
      // fallback to localStorage
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      const cats = generateCategorySuggestions(formData);
      try {
        await api.post("/financial/complete-profile", { categories: cats });
      } catch {
        localStorage.setItem("userCategories", JSON.stringify(cats));
      }
      onComplete(cats);
      navigate("/home");
    }
  };

  const prevStep = () => step > 1 && setStep(step - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSelectChange = (name: string, val: string) =>
    setFormData((f) => ({ ...f, [name]: val }));

  const handleCheckboxChange = (
    field: "spendingPriorities" | "financialGoals",
    val: string,
    checked: boolean,
  ) => {
    setFormData((f) => {
      const arr = f[field];
      return {
        ...f,
        [field]: checked ? [...arr, val] : arr.filter((x) => x !== val),
      };
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <CardHeader className="px-4 md:px-6">
              <CardTitle>Income Information</CardTitle>
              <CardDescription>Let's start with your monthly income</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <Label htmlFor="income">Monthly Income After Taxes *</Label>
              <Input id="income" name="income" type="number" value={formData.income} onChange={handleInputChange} className={errors.income ? "border-red-500" : ""} required />
              {errors.income && <Alert variant="destructive"><AlertCircle /><AlertDescription>{errors.income}</AlertDescription></Alert>}
            </CardContent>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <CardHeader className="px-4 md:px-6">
              <CardTitle>Regular Expenses</CardTitle>
              <CardDescription>Tell us about your major monthly expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {[["housingExpense","Housing (Rent/Mortgage)"],["transportationExpense","Transportation"],["foodExpense","Food & Groceries"]].map(([name,label])=>(
                <div key={name} className="space-y-2">
                  <Label htmlFor={name}>{label} *</Label>
                  <Input id={name} name={name} type="number" value={(formData as any)[name]} onChange={handleInputChange} className={errors[name] ? "border-red-500" : ""} required />
                  {errors[name] && <Alert variant="destructive"><AlertCircle /><AlertDescription>{errors[name]}</AlertDescription></Alert>}
                </div>
              ))}
            </CardContent>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <CardHeader className="px-4 md:px-6"><CardTitle>Spending Priorities</CardTitle><CardDescription>What matters most? *</CardDescription></CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {errors.spendingPriorities && <Alert variant="destructive"><AlertCircle /><AlertDescription>{errors.spendingPriorities}</AlertDescription></Alert>}
              {['travel','dining','shopping','health','entertainment'].map(val=>(<div key={val} className="flex items-center space-x-2"><Checkbox id={val} checked={formData.spendingPriorities.includes(val)} onCheckedChange={(ch)=>handleCheckboxChange('spendingPriorities',val,ch===true)} /><Label htmlFor={val}>{val.charAt(0).toUpperCase()+val.slice(1)}</Label></div>))}
            </CardContent>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <CardHeader className="px-4 md:px-6"><CardTitle>Financial Goals</CardTitle><CardDescription>Select goals & target *</CardDescription></CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {errors.financialGoals && <Alert variant="destructive"><AlertCircle /><AlertDescription>{errors.financialGoals}</AlertDescription></Alert>}
              {['emergency','debt','retirement','home','vacation'].map(val=>(<div key={val} className="flex items-center space-x-2"><Checkbox id={val} checked={formData.financialGoals.includes(val)} onCheckedChange={(ch)=>handleCheckboxChange('financialGoals',val,ch===true)} /><Label htmlFor={val}>{val.charAt(0).toUpperCase()+val.slice(1)}</Label></div>))}
              <div className="pt-4 space-y-2"><Label htmlFor="savingGoals">Monthly Saving Target *</Label><Input id="savingGoals" name="savingGoals" type="number" value={formData.savingGoals} onChange={handleInputChange} className={errors.savingGoals?"border-red-500":""} required />{errors.savingGoals&&<Alert variant="destructive"><AlertCircle /><AlertDescription>{errors.savingGoals}</AlertDescription></Alert>}</div>
            </CardContent>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <CardHeader className="px-4 md:px-6"><CardTitle>Spending Habits</CardTitle><CardDescription>Your shopping & dining frequency *</CardDescription></CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {[["shoppingFrequency","How often do you shop?"],["diningOutFrequency","How often dine out?"]].map(([name,label])=>(<div key={name} className="space-y-2"><Label htmlFor={name}>{label} *</Label><Select value={(formData as any)[name]} onValueChange={(val)=>handleSelectChange(name,val)}><SelectTrigger className={errors[name]?"border-red-500":""}><SelectValue placeholder="Choose frequency" /></SelectTrigger><SelectContent>{['daily','weekly','monthly','rarely'].map(v=><SelectItem key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>)}</SelectContent></Select>{errors[name]&&<Alert variant="destructive"><AlertCircle /><AlertDescription>{errors[name]}</AlertDescription></Alert>}</div>))}
            </CardContent>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const generateCategorySuggestions = (data: typeof formData): CategorySuggestion[] => {
    const income = parseFloat(data.income) || 0;
    const suggestions: CategorySuggestion[] = [];
    if (+data.housingExpense > 0) suggestions.push({ name: "Rent/Mortgage", icon: "🏠", color: "#4CAF50", budgetSuggestion: +data.housingExpense });
    if (+data.transportationExpense > 0) { suggestions.push({ name: "Transportation", icon: "🚗", color: "#2196F3", budgetSuggestion: +data.transportationExpense }); if (+data.transportationExpense > income*0.1) suggestions.push({ name: "Gas/Fuel", icon: "⛽", color: "#FF9800", budgetSuggestion: +data.transportationExpense*0.4 }); }
    if (+data.foodExpense > 0) suggestions.push({ name: "Groceries", icon: "🛒", color: "#8BC34A", budgetSuggestion: +data.foodExpense });
    if (['daily','weekly'].includes(data.diningOutFrequency)) { const db = data.diningOutFrequency==='daily'?income*0.15:income*0.08; suggestions.push({ name: "Restaurants & Dining Out", icon: "🍽️", color: "#FF5722", budgetSuggestion: db }); }
    if (income>0) { suggestions.push({name:"Utilities",icon:"⚡",color:"#FFC107",budgetSuggestion:income*0.08}); suggestions.push({name:"Mobile Phone",icon:"📱",color:"#00BCD4",budgetSuggestion:income*0.03}); }
    suggestions.push({name:"Savings",icon:"💰",color:"#607D8B",budgetSuggestion: (+data.savingGoals>0?+data.savingGoals:income*0.15)});
    if (data.spendingPriorities.includes("travel")) suggestions.push({name:"Travel & Vacation",icon:"✈️",color:"#00BCD4",budgetSuggestion:income*0.08});
    if (data.spendingPriorities.includes("health")){ suggestions.push({name:"Health & Fitness",icon:"💪",color:"#8BC34A",budgetSuggestion:income*0.05});suggestions.push({name:"Medical Expenses",icon:"🏥",color:"#E91E63",budgetSuggestion:income*0.04}); }
    if (data.spendingPriorities.includes("shopping")) suggestions.push({name:"Shopping & Retail",icon:"🛍️",color:"#E91E63",budgetSuggestion: data.shoppingFrequency==='daily'?income*0.12:data.shoppingFrequency==='weekly'?income*0.08:income*0.05});
    if (data.spendingPriorities.includes("entertainment")){ suggestions.push({name:"Entertainment",icon:"🎬",color:"#9C27B0",budgetSuggestion:income*0.06});suggestions.push({name:"Streaming Services",icon:"📺",color:"#673AB7",budgetSuggestion:income*0.02}); }
    if (data.financialGoals.includes("emergency")) suggestions.push({name:"Emergency Fund",icon:"🚨",color:"#FF6B6B",budgetSuggestion:income*0.1});
    if (data.financialGoals.includes("debt")) suggestions.push({name:"Debt Payments",icon:"💳",color:"#FF4444",budgetSuggestion:income*0.15});
    if (data.financialGoals.includes("retirement")) suggestions.push({name:"Retirement Savings",icon:"🏖️",color:"#4ECDC4",budgetSuggestion:income*0.1});
    suggestions.push({name:"Miscellaneous",icon:"📦",color:"#95A5A6",budgetSuggestion:income*0.05});
    return suggestions;
  };

  if (loadingProfile) return <div className="flex items-center justify-center h-screen">Loading…</div>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="px-4 md:px-6 pt-4 md:pt-6">
          <div className="flex justify-between items-center mb-2"><Progress value={(step/totalSteps)*100} className="h-2 flex-1"/></div>
          <div className="text-right text-sm text-muted-foreground mt-1">Step {step} of {totalSteps}</div>
        </div>
        {renderStep()}
        <CardFooter className="flex justify-between p-4 md:p-6">
          <Button variant="outline" onClick={prevStep} disabled={step===1}>Back</Button>
          <Button onClick={nextStep}>{step===totalSteps?"Complete":"Next"}</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InitialQuestionnaire;
