"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EventForm } from "@/components/events/EventForm";
import { peopleApi } from "@/lib/api";
import { toast } from "sonner";
import type { EventFormData } from "@/lib/validations";
import type { Person } from "@/types";

export default function EditPersonPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [personId, setPersonId] = useState<string>("");

  useEffect(() => {
    async function resolveParams() {
      const resolvedParams = await Promise.resolve(params);
      setPersonId(resolvedParams.id);
    }
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (personId) {
      loadPerson();
    }
  }, [personId]);

  const loadPerson = async () => {
    try {
      setIsFetching(true);
      const data = await peopleApi.getById(personId);
      setPerson(data);
    } catch (error) {
      console.error("Failed to load person:", error);
      toast.error("Failed to load person");
      router.push("/dashboard/people");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    try {
      setIsLoading(true);

      await peopleApi.update(personId, {
        name: data.name,
        eventDate: data.eventDate.toISOString(),
        eventLabel: data.eventLabel,
        notes: data.notes,
      });

      toast.success("Event updated successfully!");
      router.push("/dashboard/people");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update event:", error);
      const message = error.response?.data?.message || "Failed to update event";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!person) {
    return null;
  }

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
          <CardTitle>Edit Event</CardTitle>
          <CardDescription>
            Update {person.name}&apos;s event information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventForm
            defaultValues={person}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Update Event"
          />
        </CardContent>
      </Card>
    </div>
  );
}
