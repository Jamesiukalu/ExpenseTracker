import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
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

const InitialQuestionnaire = ({
  onComplete = () => {},
}: QuestionnaireProps) => {
  const [step, setStep] = useState(1);
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
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("questionnaireData");
    const savedCategories = localStorage.getItem("userCategories");

    if (savedData) {
      setFormData(JSON.parse(savedData));
      setIsReturningUser(true);
    }

    // If user has completed questionnaire before, skip to results
    if (savedCategories && savedData) {
      const categories = JSON.parse(savedCategories);
      onComplete(categories);
    }
  }, [onComplete]);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        spendingPriorities: [...formData.spendingPriorities, value],
      });
    } else {
      setFormData({
        ...formData,
        spendingPriorities: formData.spendingPriorities.filter(
          (item) => item !== value,
        ),
      });
    }
  };

  const handleFinancialGoalChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        financialGoals: [...formData.financialGoals, value],
      });
    } else {
      setFormData({
        ...formData,
        financialGoals: formData.financialGoals.filter(
          (item) => item !== value,
        ),
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!formData.income || parseFloat(formData.income) <= 0) {
          newErrors.income = "Please enter a valid monthly income";
        }
        break;
      case 2:
        if (
          !formData.housingExpense ||
          parseFloat(formData.housingExpense) < 0
        ) {
          newErrors.housingExpense =
            "Please enter your housing expense (0 if none)";
        }
        if (
          !formData.transportationExpense ||
          parseFloat(formData.transportationExpense) < 0
        ) {
          newErrors.transportationExpense =
            "Please enter your transportation expense (0 if none)";
        }
        if (!formData.foodExpense || parseFloat(formData.foodExpense) < 0) {
          newErrors.foodExpense = "Please enter your food expense (0 if none)";
        }
        break;
      case 3:
        if (formData.spendingPriorities.length === 0) {
          newErrors.spendingPriorities =
            "Please select at least one spending priority";
        }
        break;
      case 4:
        if (formData.financialGoals.length === 0) {
          newErrors.financialGoals =
            "Please select at least one financial goal";
        }
        if (!formData.savingGoals || parseFloat(formData.savingGoals) < 0) {
          newErrors.savingGoals =
            "Please enter your monthly saving target (0 if none)";
        }
        break;
      case 5:
        if (!formData.shoppingFrequency) {
          newErrors.shoppingFrequency = "Please select your shopping frequency";
        }
        if (!formData.diningOutFrequency) {
          newErrors.diningOutFrequency =
            "Please select your dining out frequency";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) {
      return;
    }

    // Clear errors when validation passes
    setErrors({});

    // Save current form data to localStorage
    localStorage.setItem("questionnaireData", JSON.stringify(formData));

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Generate category suggestions based on questionnaire answers
      const suggestedCategories = generateCategorySuggestions(formData);

      // Save generated categories to localStorage
      localStorage.setItem(
        "userCategories",
        JSON.stringify(suggestedCategories),
      );
      localStorage.setItem("questionnaireCompleted", "true");

      onComplete(suggestedCategories);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generateCategorySuggestions = (
    data: typeof formData,
  ): CategorySuggestion[] => {
    const income = parseFloat(data.income) || 0;
    const suggestions: CategorySuggestion[] = [];

    // Essential categories based on user input
    if (parseFloat(data.housingExpense) > 0) {
      suggestions.push({
        name: "Rent/Mortgage",
        icon: "🏠",
        color: "#4CAF50",
        budgetSuggestion: parseFloat(data.housingExpense),
      });
    }

    if (parseFloat(data.transportationExpense) > 0) {
      suggestions.push({
        name: "Transportation",
        icon: "🚗",
        color: "#2196F3",
        budgetSuggestion: parseFloat(data.transportationExpense),
      });
      // Add fuel category if transportation is significant
      if (parseFloat(data.transportationExpense) > income * 0.1) {
        suggestions.push({
          name: "Gas/Fuel",
          icon: "⛽",
          color: "#FF9800",
          budgetSuggestion: parseFloat(data.transportationExpense) * 0.4,
        });
      }
    }

    if (parseFloat(data.foodExpense) > 0) {
      suggestions.push({
        name: "Groceries",
        icon: "🛒",
        color: "#8BC34A",
        budgetSuggestion: parseFloat(data.foodExpense),
      });
    }

    // Dining out category based on frequency and food budget
    if (
      data.diningOutFrequency === "daily" ||
      data.diningOutFrequency === "weekly"
    ) {
      const diningBudget =
        data.diningOutFrequency === "daily" ? income * 0.15 : income * 0.08;
      suggestions.push({
        name: "Restaurants & Dining Out",
        icon: "🍽️",
        color: "#FF5722",
        budgetSuggestion: diningBudget,
      });
    }

    // Utilities - always include for adults with income
    if (income > 0) {
      suggestions.push({
        name: "Utilities",
        icon: "⚡",
        color: "#FFC107",
        budgetSuggestion: income * 0.08,
      });

      suggestions.push({
        name: "Mobile Phone",
        icon: "📱",
        color: "#00BCD4",
        budgetSuggestion: income * 0.03,
      });
    }

    // Savings based on user's saving goals
    if (parseFloat(data.savingGoals) > 0) {
      suggestions.push({
        name: "Savings",
        icon: "💰",
        color: "#607D8B",
        budgetSuggestion: parseFloat(data.savingGoals),
      });
    } else if (income > 0) {
      // Default savings if no specific goal
      suggestions.push({
        name: "Savings",
        icon: "💰",
        color: "#607D8B",
        budgetSuggestion: income * 0.15,
      });
    }

    // Dynamic categories based on spending priorities
    if (data.spendingPriorities.includes("travel")) {
      suggestions.push({
        name: "Travel & Vacation",
        icon: "✈️",
        color: "#00BCD4",
        budgetSuggestion: income * 0.08,
      });
    }

    if (data.spendingPriorities.includes("health")) {
      suggestions.push({
        name: "Health & Fitness",
        icon: "💪",
        color: "#8BC34A",
        budgetSuggestion: income * 0.05,
      });
      suggestions.push({
        name: "Medical Expenses",
        icon: "🏥",
        color: "#E91E63",
        budgetSuggestion: income * 0.04,
      });
    }

    if (data.spendingPriorities.includes("shopping")) {
      const shoppingBudget =
        data.shoppingFrequency === "daily"
          ? income * 0.12
          : data.shoppingFrequency === "weekly"
            ? income * 0.08
            : income * 0.05;
      suggestions.push({
        name: "Shopping & Retail",
        icon: "🛍️",
        color: "#E91E63",
        budgetSuggestion: shoppingBudget,
      });
    }

    if (data.spendingPriorities.includes("entertainment")) {
      suggestions.push({
        name: "Entertainment",
        icon: "🎬",
        color: "#9C27B0",
        budgetSuggestion: income * 0.06,
      });
      suggestions.push({
        name: "Streaming Services",
        icon: "📺",
        color: "#673AB7",
        budgetSuggestion: income * 0.02,
      });
    }

    // Financial goal-based categories
    if (data.financialGoals.includes("emergency")) {
      suggestions.push({
        name: "Emergency Fund",
        icon: "🚨",
        color: "#FF6B6B",
        budgetSuggestion: income * 0.1,
      });
    }

    if (data.financialGoals.includes("debt")) {
      suggestions.push({
        name: "Debt Payments",
        icon: "💳",
        color: "#FF4444",
        budgetSuggestion: income * 0.15,
      });
    }

    if (data.financialGoals.includes("retirement")) {
      suggestions.push({
        name: "Retirement Savings",
        icon: "🏖️",
        color: "#4ECDC4",
        budgetSuggestion: income * 0.1,
      });
    }

    // Miscellaneous category for unexpected expenses
    suggestions.push({
      name: "Miscellaneous",
      icon: "📦",
      color: "#95A5A6",
      budgetSuggestion: income * 0.05,
    });

    return suggestions;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl">
                Income Information
              </CardTitle>
              <CardDescription className="text-sm">
                Let's start with your monthly income
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income After Taxes *</Label>
                <Input
                  id="income"
                  name="income"
                  type="number"
                  placeholder="0.00"
                  value={formData.income}
                  onChange={handleInputChange}
                  className={errors.income ? "border-red-500" : ""}
                  required
                />
                {errors.income && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.income}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl">
                Regular Expenses
              </CardTitle>
              <CardDescription className="text-sm">
                Tell us about your major monthly expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="space-y-2">
                <Label htmlFor="housingExpense">
                  Housing (Rent/Mortgage) *
                </Label>
                <Input
                  id="housingExpense"
                  name="housingExpense"
                  type="number"
                  placeholder="0.00"
                  value={formData.housingExpense}
                  onChange={handleInputChange}
                  className={errors.housingExpense ? "border-red-500" : ""}
                  required
                />
                {errors.housingExpense && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.housingExpense}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportationExpense">Transportation *</Label>
                <Input
                  id="transportationExpense"
                  name="transportationExpense"
                  type="number"
                  placeholder="0.00"
                  value={formData.transportationExpense}
                  onChange={handleInputChange}
                  className={
                    errors.transportationExpense ? "border-red-500" : ""
                  }
                  required
                />
                {errors.transportationExpense && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.transportationExpense}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="foodExpense">Food & Groceries *</Label>
                <Input
                  id="foodExpense"
                  name="foodExpense"
                  type="number"
                  placeholder="0.00"
                  value={formData.foodExpense}
                  onChange={handleInputChange}
                  className={errors.foodExpense ? "border-red-500" : ""}
                  required
                />
                {errors.foodExpense && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.foodExpense}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl">
                Spending Priorities
              </CardTitle>
              <CardDescription className="text-sm">
                What matters most to you when spending money? *
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {errors.spendingPriorities && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {errors.spendingPriorities}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="travel"
                    checked={formData.spendingPriorities.includes("travel")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("travel", checked === true)
                    }
                  />
                  <Label htmlFor="travel">Travel & Experiences</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dining"
                    checked={formData.spendingPriorities.includes("dining")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("dining", checked === true)
                    }
                  />
                  <Label htmlFor="dining">Dining Out</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shopping"
                    checked={formData.spendingPriorities.includes("shopping")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("shopping", checked === true)
                    }
                  />
                  <Label htmlFor="shopping">Shopping & Retail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="health"
                    checked={formData.spendingPriorities.includes("health")}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("health", checked === true)
                    }
                  />
                  <Label htmlFor="health">Health & Wellness</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="entertainment"
                    checked={formData.spendingPriorities.includes(
                      "entertainment",
                    )}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("entertainment", checked === true)
                    }
                  />
                  <Label htmlFor="entertainment">Entertainment</Label>
                </div>
              </div>
            </CardContent>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl">
                Financial Goals
              </CardTitle>
              <CardDescription className="text-sm">
                What are your financial goals? *
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              {errors.financialGoals && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.financialGoals}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={formData.financialGoals.includes("emergency")}
                    onCheckedChange={(checked) =>
                      handleFinancialGoalChange("emergency", checked === true)
                    }
                  />
                  <Label htmlFor="emergency">Build Emergency Fund</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="debt"
                    checked={formData.financialGoals.includes("debt")}
                    onCheckedChange={(checked) =>
                      handleFinancialGoalChange("debt", checked === true)
                    }
                  />
                  <Label htmlFor="debt">Pay Off Debt</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="retirement"
                    checked={formData.financialGoals.includes("retirement")}
                    onCheckedChange={(checked) =>
                      handleFinancialGoalChange("retirement", checked === true)
                    }
                  />
                  <Label htmlFor="retirement">Save for Retirement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="home"
                    checked={formData.financialGoals.includes("home")}
                    onCheckedChange={(checked) =>
                      handleFinancialGoalChange("home", checked === true)
                    }
                  />
                  <Label htmlFor="home">Save for Home Purchase</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vacation"
                    checked={formData.financialGoals.includes("vacation")}
                    onCheckedChange={(checked) =>
                      handleFinancialGoalChange("vacation", checked === true)
                    }
                  />
                  <Label htmlFor="vacation">Save for Vacation</Label>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Label htmlFor="savingGoals">Monthly Saving Target *</Label>
                <Input
                  id="savingGoals"
                  name="savingGoals"
                  type="number"
                  placeholder="0.00"
                  value={formData.savingGoals}
                  onChange={handleInputChange}
                  className={errors.savingGoals ? "border-red-500" : ""}
                  required
                />
                {errors.savingGoals && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.savingGoals}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-lg md:text-xl">
                Spending Habits
              </CardTitle>
              <CardDescription className="text-sm">
                Tell us about your regular spending habits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 md:px-6">
              <div className="space-y-2">
                <Label htmlFor="shoppingFrequency">
                  How often do you shop for non-essentials? *
                </Label>
                <Select
                  value={formData.shoppingFrequency}
                  onValueChange={(value) =>
                    handleSelectChange("shoppingFrequency", value)
                  }
                  required
                >
                  <SelectTrigger
                    className={errors.shoppingFrequency ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                  </SelectContent>
                </Select>
                {errors.shoppingFrequency && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.shoppingFrequency}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="diningOutFrequency">
                  How often do you dine out? *
                </Label>
                <Select
                  value={formData.diningOutFrequency}
                  onValueChange={(value) =>
                    handleSelectChange("diningOutFrequency", value)
                  }
                  required
                >
                  <SelectTrigger
                    className={
                      errors.diningOutFrequency ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="rarely">Rarely</SelectItem>
                  </SelectContent>
                </Select>
                {errors.diningOutFrequency && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.diningOutFrequency}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const resetQuestionnaire = () => {
    localStorage.removeItem("questionnaireData");
    localStorage.removeItem("userCategories");
    localStorage.removeItem("questionnaireCompleted");
    setIsReturningUser(false);
    setStep(1);
    setFormData({
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
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="px-4 md:px-6 pt-4 md:pt-6">
          <div className="flex justify-between items-center mb-2">
            <Progress value={progress} className="h-2 flex-1" />
            {isReturningUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetQuestionnaire}
                className="ml-2 text-xs"
              >
                Reset
              </Button>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground mt-1">
            Step {step} of {totalSteps}
            {isReturningUser && (
              <span className="text-blue-600 ml-2">(Returning User)</span>
            )}
          </div>
        </div>

        {renderStep()}

        <CardFooter className="flex justify-between p-4 md:p-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="px-4 md:px-6"
          >
            Back
          </Button>
          <Button onClick={nextStep} className="px-4 md:px-6">
            {step === totalSteps ? "Complete" : "Next"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InitialQuestionnaire;
