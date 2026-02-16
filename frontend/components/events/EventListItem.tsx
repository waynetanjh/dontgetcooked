import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDate, getCountdownText, getYearCount, getOrdinalSuffix } from "@/lib/utils";
import type { UpcomingEvent } from "@/types";

interface EventListItemProps {
  person: UpcomingEvent;
}

export function EventListItem({ person }: EventListItemProps) {
  const eventDate = new Date(person.eventDate);
  const countdown = getCountdownText(eventDate);
  const yearCount = getYearCount(eventDate);
  const isToday = countdown === "Today!";

  return (
    <div 
      className={`flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-accent transition-colors min-h-[44px] ${
        isToday ? "bg-primary/5 border-primary/20" : ""
      }`}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          <div className={`font-medium truncate ${isToday ? "text-primary" : ""}`}>
            {person.name}
          </div>
          {person.eventLabel && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {person.eventLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 shrink-0" />
          <span className="truncate">{formatDate(eventDate)}</span>
          {yearCount > 0 && (
            <>
              <span>•</span>
              <span className="shrink-0">{getOrdinalSuffix(yearCount)} year</span>
            </>
          )}
        </div>
      </div>
      <div className={`text-sm font-semibold shrink-0 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
        {countdown}
      </div>
    </div>
  );
}
