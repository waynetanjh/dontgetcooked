"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { eventSchema, type EventFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { Person } from "@/types";

interface EventFormProps {
  defaultValues?: Partial<Person>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export function EventForm({
  defaultValues,
  onSubmit,
  isLoading,
  submitLabel = "Save Event",
}: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: defaultValues && defaultValues.eventDate
      ? {
          name: defaultValues.name,
          eventDate: new Date(defaultValues.eventDate),
          eventLabel: defaultValues.eventLabel || "",
          notes: defaultValues.notes || "",
        }
      : undefined,
  });

  const selectedDate = watch("eventDate");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., John, Mom, Sarah & David"
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Event Date */}
      <div className="space-y-2">
        <Label>
          Event Date <span className="text-destructive">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setValue("eventDate", date as Date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.eventDate && (
          <p className="text-sm text-destructive">{errors.eventDate.message}</p>
        )}
      </div>

      {/* Event Label */}
      <div className="space-y-2">
        <Label htmlFor="eventLabel">Event Label (Optional)</Label>
        <Input
          id="eventLabel"
          placeholder="e.g., Birthday, Anniversary, Wedding"
          {...register("eventLabel")}
          disabled={isLoading}
        />
        {errors.eventLabel && (
          <p className="text-sm text-destructive">{errors.eventLabel.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes..."
          rows={4}
          {...register("notes")}
          disabled={isLoading}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
