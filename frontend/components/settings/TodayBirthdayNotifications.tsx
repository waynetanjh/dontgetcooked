"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cake } from "lucide-react";
import { telegramApi } from "@/lib/api";
import { toast } from "sonner";

export function TodayBirthdayNotifications() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNotifications = async () => {
    try {
      setIsLoading(true);
      const result = await telegramApi.sendTodayBirthdays();
      
      if (result.success) {
        if (result.data && result.data.count > 0) {
          toast.success(result.message, {
            description: `Sent notifications for: ${result.data.events.join(", ")}`,
          });
        } else {
          toast.info(result.message);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error("Failed to send birthday notifications:", error);
      const message = error.response?.data?.message || "Failed to send birthday notifications";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Today&apos;s Birthday Notifications</CardTitle>
        <CardDescription>
          Manually send Telegram notifications for all birthdays happening today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSendNotifications} disabled={isLoading}>
          <Cake className="mr-2 h-4 w-4" />
          {isLoading ? "Sending..." : "Send Birthday Notifications"}
        </Button>
      </CardContent>
    </Card>
  );
}
