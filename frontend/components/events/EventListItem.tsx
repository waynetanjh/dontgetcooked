"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Edit2, Trash2 } from "lucide-react";
import { formatDate, getCountdownText, getYearCount, getOrdinalSuffix } from "@/lib/utils";
import type { UpcomingEvent } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { peopleApi } from "@/lib/api";
import { toast } from "sonner";

interface EventListItemProps {
  event: UpcomingEvent;
  onDelete?: () => void;
}

export function EventListItem({ event, onDelete }: EventListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const eventDate = new Date(event.eventDate);
  const countdown = getCountdownText(eventDate);
  const yearCount = getYearCount(eventDate);
  const isToday = countdown === "Today!";

  const handleEdit = () => {
    router.push(`/dashboard/people/${event.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await peopleApi.delete(event.id);
      toast.success("Event deleted successfully");
      setShowDeleteDialog(false);
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div 
        className={`group flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-accent transition-colors min-h-[44px] ${
          isToday ? "bg-primary/5 border-primary/20" : ""
        }`}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <div className={`font-medium truncate ${isToday ? "text-primary" : ""}`}>
              {event.name}
            </div>
            {event.eventLabel && (
              <Badge variant="secondary" className="text-xs shrink-0">
                {event.eventLabel}
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
        
        <div className="flex items-center gap-2">
          <div className={`text-sm font-semibold shrink-0 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
            {countdown}
          </div>
          
          {/* Action buttons - always visible */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleEdit}
              title="Edit event"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
              title="Delete event"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event for <strong>{event.name}</strong>
              {event.eventLabel && ` (${event.eventLabel})`}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
