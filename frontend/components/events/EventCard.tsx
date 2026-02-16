import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { formatDate, getCountdownText, getYearCount, getOrdinalSuffix } from "@/lib/utils";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function EventCard({ event, onEdit, onDelete, showActions = true }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const countdown = getCountdownText(eventDate);
  const yearCount = getYearCount(eventDate);
  const isToday = countdown === "Today!";

  return (
    <Card className={isToday ? "border-primary bg-primary/5" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{event.name}</CardTitle>
            {event.eventLabel && (
              <CardDescription>
                <Badge variant="secondary">{event.eventLabel}</Badge>
              </CardDescription>
            )}
          </div>
          <div className={`text-sm font-semibold ${isToday ? "text-primary" : "text-muted-foreground"}`}>
            {countdown}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Event Date */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{formatDate(eventDate)}</span>
          </div>

          {/* Year Count */}
          {yearCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {getOrdinalSuffix(yearCount)} year
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <p className="text-sm text-muted-foreground">{event.notes}</p>
          )}

          {/* Actions */}
          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(event.id)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
