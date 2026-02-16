"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { formatDate, getCountdownText, getYearCount, getOrdinalSuffix } from "@/lib/utils";

export type PeopleColumnsProps = {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export const createPeopleColumns = ({
  onEdit,
  onDelete,
}: PeopleColumnsProps): ColumnDef<Event>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "eventLabel",
    header: "Event Label",
    cell: ({ row }) => {
      const eventLabel = row.getValue("eventLabel") as string | undefined;
      return eventLabel ? (
        <Badge variant="secondary">{eventLabel}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("eventDate"));
      return formatDate(date);
    },
  },
  {
    id: "countdown",
    header: "Countdown",
    cell: ({ row }) => {
      const eventDate = new Date(row.original.eventDate);
      const countdown = getCountdownText(eventDate);
      const isToday = countdown === "Today!";
      
      return (
        <span className={isToday ? "text-primary font-semibold" : ""}>
          {countdown}
        </span>
      );
    },
  },
  {
    id: "year",
    header: "Year",
    cell: ({ row }) => {
      const eventDate = new Date(row.original.eventDate);
      const yearCount = getYearCount(eventDate);
      
      return yearCount > 0 ? (
        <span>{getOrdinalSuffix(yearCount)} year</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | undefined;
      return notes ? (
        <div className="max-w-xs truncate">{notes}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const person = row.original;

      return (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(person.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(person.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
