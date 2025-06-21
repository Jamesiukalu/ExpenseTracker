import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/seperator";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  Trash2,
  Check,
} from "lucide-react";
import { useToast } from "../components/ui/use-toast";

interface NotificationsProps {
  onBack?: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  time: string;
  read: boolean;
  category: "budget" | "report" | "system" | "reminder";
}

const Notifications = ({ onBack = () => {} }: NotificationsProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Budget Alert - Restaurants",
      message:
        "You've spent 85% of your Restaurants budget ($170 of $200). Consider reducing dining out expenses.",
      type: "warning",
      time: "2 hours ago",
      read: false,
      category: "budget",
    },
    {
      id: 2,
      title: "Weekly Spending Report",
      message:
        "Your weekly spending report is ready. You spent $245 this week, 12% less than last week.",
      type: "info",
      time: "1 day ago",
      read: false,
      category: "report",
    },
    {
      id: 3,
      title: "Budget Goal Achieved!",
      message:
        "Congratulations! You stayed under your Groceries budget this month.",
      type: "success",
      time: "2 days ago",
      read: true,
      category: "budget",
    },
    {
      id: 4,
      title: "Monthly Report Available",
      message:
        "Your monthly financial summary for March is now available for review.",
      type: "info",
      time: "3 days ago",
      read: true,
      category: "report",
    },
    {
      id: 5,
      title: "Budget Exceeded - Entertainment",
      message:
        "You've exceeded your Entertainment budget by $25. Current spending: $125 of $100 budget.",
      type: "error",
      time: "5 days ago",
      read: true,
      category: "budget",
    },
    {
      id: 6,
      title: "Reminder: Update Categories",
      message:
        "It's been a while since you updated your expense categories. Consider reviewing them.",
      type: "info",
      time: "1 week ago",
      read: true,
      category: "reminder",
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    budgetAlerts: true,
    weeklyReports: true,
    monthlyReports: true,
    systemUpdates: false,
    reminders: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "budget" | "report" | "system" | "reminder"
  >("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadgeVariant = (type: string) => {
    switch (type) {
      case "warning":
        return "secondary";
      case "error":
        return "destructive";
      case "success":
        return "default";
      default:
        return "outline";
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notification.read;
    return notification.category === activeFilter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAsUnread = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: false }
          : notification,
      ),
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed.",
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
    toast({
      title: "All Notifications Read",
      description: "All notifications have been marked as read.",
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been cleared.",
    });
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings((prev) => ({ ...prev, [setting]: value }));
    toast({
      title: "Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  return (
    <div className="bg-background p-3 md:p-6 rounded-lg w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h1 className="text-xl md:text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="notifications" className="text-sm">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <div className="space-y-4">
            {/* Filter and Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={activeFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                    >
                      All ({notifications.length})
                    </Button>
                    <Button
                      variant={
                        activeFilter === "unread" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveFilter("unread")}
                    >
                      Unread ({unreadCount})
                    </Button>
                    <Button
                      variant={
                        activeFilter === "budget" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveFilter("budget")}
                    >
                      Budget
                    </Button>
                    <Button
                      variant={
                        activeFilter === "report" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setActiveFilter("report")}
                    >
                      Reports
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={markAllAsRead}
                      >
                        Mark All Read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {activeFilter === "all" && "All Notifications"}
                  {activeFilter === "unread" && "Unread Notifications"}
                  {activeFilter === "budget" && "Budget Notifications"}
                  {activeFilter === "report" && "Report Notifications"}
                </CardTitle>
                <CardDescription>
                  {filteredNotifications.length === 0
                    ? "No notifications to display"
                    : `${filteredNotifications.length} notification${filteredNotifications.length !== 1 ? "s" : ""}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No notifications found</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {filteredNotifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={`p-4 hover:bg-muted/50 transition-colors ${
                              !notification.read
                                ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm mb-1">
                                      {notification.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={
                                          getNotificationBadgeVariant(
                                            notification.type,
                                          ) as any
                                        }
                                        className="text-xs"
                                      >
                                        {notification.type}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {notification.category}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {notification.time}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {notification.read ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          markAsUnread(notification.id)
                                        }
                                        title="Mark as unread"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                        title="Mark as read"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-red-500 hover:text-red-700"
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
                                      title="Delete notification"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < filteredNotifications.length - 1 && (
                            <Separator />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
              <CardDescription>
                Control which notifications you receive and how you receive them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when approaching or exceeding budget limits
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.budgetAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("budgetAlerts", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly spending summaries and insights
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) =>
                      handleSettingChange("weeklyReports", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Monthly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive monthly financial insights and trends
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.monthlyReports}
                    onCheckedChange={(checked) =>
                      handleSettingChange("monthlyReports", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about app updates and new features
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={(checked) =>
                      handleSettingChange("systemUpdates", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive helpful reminders and tips
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.reminders}
                    onCheckedChange={(checked) =>
                      handleSettingChange("reminders", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailNotifications", checked)
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
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushNotifications", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
