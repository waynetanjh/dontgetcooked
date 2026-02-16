"use client";

import { useEffect, useState } from "react";
import { EventListItem } from "./EventListItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { eventsApi } from "@/lib/api";
import type { UpcomingEvent } from "@/types";
import { toast } from "sonner";

interface GroupedEvents {
  today: UpcomingEvent[];
  thisWeek: UpcomingEvent[];
  thisMonth: UpcomingEvent[];
  later: UpcomingEvent[];
}

function groupEventsByDate(events: UpcomingEvent[]): GroupedEvents {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);
  const endOfMonth = new Date(today);
  endOfMonth.setDate(today.getDate() + 30);

  const grouped: GroupedEvents = {
    today: [],
    thisWeek: [],
    thisMonth: [],
    later: [],
  };

  events.forEach((event) => {
    const eventDate = new Date(event.eventDate);
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    if (eventDateOnly.getTime() === today.getTime()) {
      grouped.today.push(event);
    } else if (eventDateOnly < endOfWeek) {
      grouped.thisWeek.push(event);
    } else if (eventDateOnly < endOfMonth) {
      grouped.thisMonth.push(event);
    } else {
      grouped.later.push(event);
    }
  });

  return grouped;
}

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
        <Card>
          <div className="h-16 bg-muted animate-pulse" />
          <div className="h-16 bg-muted animate-pulse border-t" />
          <div className="h-16 bg-muted animate-pulse border-t" />
        </Card>
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

  const groupedEvents = groupEventsByDate(events);

  const renderGroup = (title: string, events: UpcomingEvent[]) => {
    if (events.length === 0) return null;

    return (
      <div key={title}>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          {title}
        </h3>
        <Card className="overflow-hidden">
          {events.map((event) => (
            <EventListItem 
              key={event.id} 
              event={event} 
              onDelete={loadEvents}
            />
          ))}
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderGroup("Today", groupedEvents.today)}
      {renderGroup("This Week", groupedEvents.thisWeek)}
      {renderGroup("This Month", groupedEvents.thisMonth)}
      {renderGroup("Later", groupedEvents.later)}
    </div>
  );
}
