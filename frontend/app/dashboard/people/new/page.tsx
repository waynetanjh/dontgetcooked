"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventForm } from "@/components/events/EventForm";
import { peopleApi } from "@/lib/api";
import { toast } from "sonner";
import type { EventFormData } from "@/lib/validations";

export default function NewPersonPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true);

      await peopleApi.create({
        name: data.name,
        eventDate: data.eventDate.toISOString(),
        eventLabel: data.eventLabel,
        notes: data.notes,
      });

      toast.success("Event created successfully!");
      router.push("/dashboard/people");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to create event:", error);
      const message = error.response?.data?.message || "Failed to create event";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/people">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to People
        </Button>
      </Link>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Person</CardTitle>
          <CardDescription>
            Add a person and their special event date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Create Event"
          />
        </CardContent>
      </Card>
    </div>
  );
}
