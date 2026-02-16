import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingEvents } from "@/components/events/UpcomingEvents";
import { Plus, Users, Settings as SettingsIcon } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upcoming Events</h1>
        <p className="text-muted-foreground mt-2">
          Never miss an important date
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/people/new">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add a new person and their special date
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/people">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                View All People
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                See and manage all your events
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/settings">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Configure notifications and preferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Events List */}
      <div>
        <UpcomingEvents />
      </div>
    </div>
  );
}
