"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TelegramTest } from "@/components/settings/TelegramTest";
import { TodayBirthdayNotifications } from "@/components/settings/TodayBirthdayNotifications";
import { Download, Calendar } from "lucide-react";
import { eventsApi } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCalendar = async () => {
    try {
      setIsExporting(true);
      const blob = await eventsApi.exportCalendar();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "events-calendar.ics";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Calendar exported successfully!");
    } catch (error: any) {
      console.error("Failed to export calendar:", error);
      const message = error.response?.data?.message || "Failed to export calendar";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your notifications and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Telegram Test */}
        <TelegramTest />

        {/* Today's Birthday Notifications */}
        <TodayBirthdayNotifications />

        {/* Calendar Export */}
        <Card>
          <CardHeader>
            <CardTitle>Export Calendar</CardTitle>
            <CardDescription>
              Download your events as an .ics file to import into Google Calendar, Apple Calendar, or Outlook
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportCalendar} disabled={isExporting}>
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Calendar"}
            </Button>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Application details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Timezone:</span>
              <span>Asia/Singapore</span>
            </div>
          </CardContent>
        </Card>

        {/* Notification Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Calendar className="inline mr-2 h-5 w-5" />
              Notification Schedule
            </CardTitle>
            <CardDescription>
              Daily reminders are sent at 9:00 AM Singapore time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You will receive a Telegram notification for any events happening today.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
