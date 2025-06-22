import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordian";
import { Alert, AlertDescription } from "./ui/alert";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ArrowLeft,
  Search,
  CheckCircle,
} from "lucide-react";
import { useToast } from "./ui/use-toast";
import api from "../api";


const HelpSupport = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("faq");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const onBack = () => {
    navigate(-1); // Go back to previous page
  };

  const faqs = [
    {
      id: "getting-started",
      question: "How do I get started with the finance tracker?",
      answer:
        "Start by completing the initial questionnaire which helps us understand your spending habits and financial goals. This will generate personalized expense categories and budget suggestions tailored to your needs.",
    },
    {
      id: "add-expenses",
      question: "How do I add expenses?",
      answer:
        "You can add expenses by clicking the 'Add New Expense' button on the dashboard. Fill in the amount, description, category, and optionally upload a receipt. The system can also suggest categories based on your description.",
    },
    {
      id: "budget-setup",
      question: "How do I set up budgets?",
      answer:
        "Go to the Budget Manager section and click 'Add Budget'. Select a category, set your budget amount, and choose the time period (weekly, monthly, quarterly, or yearly). You'll receive alerts when approaching your limits.",
    },
    {
      id: "import-data",
      question: "Can I import data from my bank or other apps?",
      answer:
        "Yes! Use the Import Data feature to upload CSV files or Excel spreadsheets. You can also paste CSV data directly. Download our template to see the required format.",
    },
    {
      id: "categories",
      question: "How are expense categories determined?",
      answer:
        "Categories are initially generated based on your questionnaire responses. You can also manually select categories when adding expenses, and the system learns from your choices to make better suggestions.",
    },
    {
      id: "receipts",
      question: "How do receipt uploads work?",
      answer:
        "You can upload receipt images when adding expenses. The system can extract information from receipts and suggest appropriate categories. Supported formats include JPG, PNG, and PDF.",
    },
    {
      id: "data-security",
      question: "Is my financial data secure?",
      answer:
        "Yes, we take data security seriously. All data is encrypted in transit and at rest. We never store your banking credentials, and you have full control over your data with options to export or delete it.",
    },
    {
      id: "mobile-app",
      question: "Is there a mobile app?",
      answer:
        "The web application is fully responsive and works great on mobile devices. A dedicated mobile app is in development and will be available soon.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post("/contact", {
        name: contactForm.name,
        email: contactForm.email,
        subject: contactForm.subject,
        category: contactForm.category,
        message: contactForm.message,
      });
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us! We'll get back to you within 24 hours.",
      });
      // Reset form
      setContactForm({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background p-3 md:p-6 rounded-lg w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">Help & Support</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Button
          variant={activeTab === "faq" ? "default" : "outline"}
          onClick={() => setActiveTab("faq")}
          className="flex-1 sm:flex-none"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          FAQ
        </Button>
        <Button
          variant={activeTab === "contact" ? "default" : "outline"}
          onClick={() => setActiveTab("contact")}
          className="flex-1 sm:flex-none"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Us
        </Button>
        <Button
          variant={activeTab === "guides" ? "default" : "outline"}
          onClick={() => setActiveTab("guides")}
          className="flex-1 sm:flex-none"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          User Guides
        </Button>
      </div>

      {/* FAQ Section */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Find answers to common questions about using the finance tracker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {filteredFaqs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No FAQs found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Section */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send us a Message</CardTitle>
              <CardDescription>
                We're here to help! Send us your questions or feedback.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={contactForm.category}
                    onValueChange={(value) =>
                      setContactForm({ ...contactForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Question</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="account">Account Issue</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
              <CardDescription>
                Choose the method that works best for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">
                    support@financetracker.com
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Response within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">1-800-FINANCE</p>
                  <p className="text-xs text-muted-foreground">
                    Mon-Fri, 9 AM - 6 PM EST
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">
                    Available on our website
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mon-Fri, 9 AM - 6 PM EST
                  </p>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Average Response Time:</strong> We typically respond
                  to support requests within 2-4 hours during business hours.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Guides Section */}
      {activeTab === "guides" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Getting Started Guide</CardTitle>
              <CardDescription className="text-sm">
                Learn the basics of setting up your finance tracker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Complete walkthrough from account setup to your first expense
                entry.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Budget Management</CardTitle>
              <CardDescription className="text-sm">
                Master the art of creating and managing budgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to set realistic budgets and track your progress
                effectively.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Data Import & Export</CardTitle>
              <CardDescription className="text-sm">
                Import existing data and export your financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Step-by-step instructions for importing bank statements and
                exporting reports.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Receipt Management</CardTitle>
              <CardDescription className="text-sm">
                Organize and manage your receipts digitally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to capture, store, and organize receipts for better
                expense tracking.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Reports & Analytics</CardTitle>
              <CardDescription className="text-sm">
                Generate insights from your spending data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Understand your spending patterns with detailed reports and
                visualizations.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Mobile Usage Tips</CardTitle>
              <CardDescription className="text-sm">
                Get the most out of the mobile experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Tips and tricks for using the finance tracker on your mobile
                device.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Read Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HelpSupport;
