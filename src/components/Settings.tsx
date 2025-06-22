import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Camera,
  Edit,
  Settings as SettingsIcon,
  CreditCard,
  Globe,
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import api from "../api";

interface SettingsProps {
  userId: string; // <-- pass your logged-in user ID into this screen
}

interface Profile {
  name: string;
  email: string;
  avatar: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  theme: string;
}

const Settings: React.FC<SettingsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    avatar: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    currency: "",
    timezone: "",
    dateFormat: "",
    language: "",
    theme: "",
  });
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profRes = await api.get("/financial/profile");
        const prof = profRes.data.data;
        setProfile(prof);
        const userRes = await api.get(`/users/${prof.userId}`);
        const u = userRes.data;
        setProfile((p) => ({
          ...p,
          name: u.username,
          email: u.email,
          avatar:
            u.img || "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          phone: u.phone || "+1 (555) 123-4567",
          bio:
            u.desc ||
            "Financial enthusiast focused on smart budgeting and investment strategies.",
          location: u.location || "location",
          website: u.website || "null",
          currency: u.currency || "USD",
          timezone: u.timezone || "America/New_York",
          dateFormat: u.dateFormat || "MM/DD/YYYY",
          language: u.language || "en",
          theme: u.theme || "system",
          // you could pull more fields if your model grows…
        }));
      } catch (err) {
        toast({ title: "Couldn’t load profile", variant: "destructive" });
      }
    };
    loadProfile();
  }, []);

  const handleDeleteAccount = async () => {
    setIsSaving(true);
    try {
      await api.delete(`/users/${userId}`);
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently removed.",
        variant: "destructive",
      });
      // e.g. log out / redirect to login
      onBack();
    } catch (err: any) {
      toast({
        title: "Delete Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    emailNotifications: true,
    pushNotifications: false,
    budgetThreshold: 80,
  });

  const [privacy, setPrivacy] = useState({
    dataSharing: false,
    analytics: true,
    marketingEmails: false,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved successfully.",
    });
  };
  const onBack = () => {
    navigate(-1); // Go back to previous page
  };
  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleExportData = () => {
    // Simulate data export
    const data = {
      profile,
      expenses: [],
      budgets: [],
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "finance-data-export.json";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your data has been exported successfully.",
    });
  };

  const resetQuestionnaire = () => {
    localStorage.removeItem("questionnaireData");
    localStorage.removeItem("userCategories");
    localStorage.removeItem("questionnaireCompleted");
    toast({
      title: "Questionnaire Reset",
      description:
        "Your questionnaire data has been cleared. You'll be prompted to complete it again on your next visit.",
    });
  };

  return (
    <div className="bg-background p-3 md:p-6 rounded-lg w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl md:text-2xl font-bold">Profile & Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="profile" className="text-xs md:text-sm">
            <User className="mr-1 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="account" className="text-xs md:text-sm">
            <SettingsIcon className="mr-1 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs md:text-sm">
            <Globe className="mr-1 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm">
            <Bell className="mr-1 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs md:text-sm">
            <Shield className="mr-1 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs md:text-sm">
            <Download className="mr-1 h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Profile Information */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>
                  Manage your personal profile and public information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-lg">
                    {profile.name ? profile.name.split(" ").map((n) => n[0]).join("") : ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({ ...profile, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) =>
                        setProfile({ ...profile, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) =>
                      setProfile({ ...profile, website: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    {/* {profile.bio.length}/500 characters */}
                  </p>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status</CardTitle>
                <CardDescription>
                  Your account information and membership details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Account Type</p>
                    <p className="text-sm text-muted-foreground">Free Plan</p>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      January 2024
                    </p>
                  </div>
                  <Badge variant="outline">3 months</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-muted-foreground">
                      Your email is verified
                    </p>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Security</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last changed 2 months ago
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Change
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Login Sessions</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your active sessions
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connected Accounts</CardTitle>
                <CardDescription>
                  Link your accounts for easier data import
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Bank Account</p>
                        <p className="text-sm text-muted-foreground">
                          Connect your bank for automatic imports
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                        <Download className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">CSV Import</p>
                        <p className="text-sm text-muted-foreground">
                          Import data from spreadsheets
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">App Preferences</CardTitle>
              <CardDescription>
                Customize your app experience and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profile.language}
                    onValueChange={(value) =>
                      setProfile({ ...profile, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={profile.theme}
                    onValueChange={(value) =>
                      setProfile({ ...profile, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={profile.currency}
                    onValueChange={(value) =>
                      setProfile({ ...profile, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) =>
                      setProfile({ ...profile, timezone: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="America/Chicago">
                        Central Time
                      </SelectItem>
                      <SelectItem value="America/Denver">
                        Mountain Time
                      </SelectItem>
                      <SelectItem value="America/Los_Angeles">
                        Pacific Time
                      </SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={profile.dateFormat}
                    onValueChange={(value) =>
                      setProfile({ ...profile, dateFormat: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when approaching budget limits
                    </p>
                  </div>
                  <Switch
                    checked={notifications.budgetAlerts}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        budgetAlerts: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly spending summaries
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        weeklyReports: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Monthly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive monthly financial insights
                    </p>
                  </div>
                  <Switch
                    checked={notifications.monthlyReports}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        monthlyReports: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Budget Alert Threshold</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="50"
                    max="95"
                    value={notifications.budgetThreshold}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        budgetThreshold: parseInt(e.target.value),
                      })
                    }
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get alerted when you've spent this percentage of your budget
                </p>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Notifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
              <CardDescription>
                Control your data privacy and sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data to improve our services
                    </p>
                  </div>
                  <Switch
                    checked={privacy.dataSharing}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, dataSharing: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve by sharing usage analytics
                    </p>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, analytics: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and tips
                    </p>
                  </div>
                  <Switch
                    checked={privacy.marketingEmails}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, marketingEmails: checked })
                    }
                  />
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your financial data is always encrypted and never shared with
                  third parties without your explicit consent.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Export</CardTitle>
                <CardDescription>
                  Download your data for backup or migration purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Export all your financial data including expenses, budgets,
                    and settings in JSON format.
                  </p>
                  <Button onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reset Options</CardTitle>
                <CardDescription>
                  Reset specific parts of your data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Reset Questionnaire</p>
                      <p className="text-sm text-muted-foreground">
                        Clear questionnaire data and retake it
                      </p>
                    </div>
                    <Button variant="outline" onClick={resetQuestionnaire}>
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-lg text-red-600">
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that will permanently affect your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Deleting your account will permanently remove all your
                      data. This action cannot be undone.
                    </AlertDescription>
                  </Alert>
                  <Dialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your account? This
                          will permanently remove all your data including
                          expenses, budgets, and settings. This action cannot be
                          undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                        >
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
