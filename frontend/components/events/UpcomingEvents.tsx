"use client";

import { useEffect, useState } from "react";
import { EventCard } from "./EventCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import type { UpcomingEvent } from "@/types";
import { toast } from "sonner";

export function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await eventsApi.getUpcoming();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load upcoming events:", error);
      toast.error("Failed to load upcoming events");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No upcoming events yet</p>
        <Link href="/dashboard/people/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Event
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          person={event}
          showActions={false}
        />
      ))}
    </div>
  );
}
