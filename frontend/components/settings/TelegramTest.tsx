"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { telegramApi } from "@/lib/api";
import { toast } from "sonner";

export function TelegramTest() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    try {
      setIsLoading(true);
      await telegramApi.sendTest();
      toast.success("Test notification sent successfully!");
    } catch (error: any) {
      console.error("Failed to send test notification:", error);
      const message = error.response?.data?.message || "Failed to send test notification";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Telegram Notification</CardTitle>
        <CardDescription>
          Send a test notification to verify your Telegram bot is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleTest} disabled={isLoading}>
          <Send className="mr-2 h-4 w-4" />
          {isLoading ? "Sending..." : "Send Test Notification"}
        </Button>
      </CardContent>
    </Card>
  );
}
