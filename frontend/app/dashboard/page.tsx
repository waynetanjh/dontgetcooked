import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UpcomingEvents } from "@/components/events/UpcomingEvents";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
          <p className="text-muted-foreground mt-2">
            Never miss an important date
          </p>
        </div>
        <Link href="/dashboard/people/new">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Link>
      </div>

      {/* Upcoming Events List */}
      <div>
        <UpcomingEvents />
      </div>
    </div>
  );
}
