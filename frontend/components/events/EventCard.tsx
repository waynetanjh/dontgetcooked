import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { formatDate, getCountdownText, getYearCount, getOrdinalSuffix } from "@/lib/utils";
import type { Person } from "@/types";

interface EventCardProps {
  person: Person;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function EventCard({ person, onEdit, onDelete, showActions = true }: EventCardProps) {
  const eventDate = new Date(person.eventDate);
  const countdown = getCountdownText(eventDate);
  const yearCount = getYearCount(eventDate);
  const isToday = countdown === "Today!";

  return (
    <Card className={isToday ? "border-primary bg-primary/5" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{person.name}</CardTitle>
            {person.eventLabel && (
              <CardDescription>
                <Badge variant="secondary">{person.eventLabel}</Badge>
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
          {person.notes && (
            <p className="text-sm text-muted-foreground">{person.notes}</p>
          )}

          {/* Actions */}
          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(person.id)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(person.id)}
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
