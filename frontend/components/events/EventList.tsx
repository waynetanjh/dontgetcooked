"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
import { Plus } from "lucide-react";
import Link from "next/link";
import { peopleApi } from "@/lib/api";
import type { Event } from "@/types";
import { toast } from "sonner";
import { createPeopleColumns } from "@/components/people/columns";

export function EventList() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await peopleApi.getAll();
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/events/${id}/edit`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      await peopleApi.delete(deleteId);
      toast.success("Event deleted successfully");
      setEvents(events.filter((e) => e.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      createPeopleColumns({
        onEdit: handleEdit,
        onDelete: (id) => setDeleteId(id),
      }),
    []
  );

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No events added yet</p>
        <Link href="/dashboard/events/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Event
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={events}
        searchKey="name"
        searchPlaceholder="Search by name..."
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
