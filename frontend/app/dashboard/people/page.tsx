import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/events/EventList";
import { Plus } from "lucide-react";

export default function PeoplePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">People & Events</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your important dates
          </p>
        </div>
        <Link href="/dashboard/people/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </Link>
      </div>

      {/* Events List */}
      <EventList />
    </div>
  );
}
