"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentModal } from "../AppointmentModal";
import { StatusBadge } from "../StatusBadge";
import { ReservationActions } from "../admin/ReservationActions";
import { SpecialRequestsCell } from "../ui/special-requests-cell";

export const createColumns = (onUpdate?: () => void): ColumnDef<Appointment>[] => [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Guest Name",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium ">{appointment.patient.name}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Date & Time",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular min-w-[100px]">
          {formatDateTime(appointment.schedule).dateTime}
        </p>
      );
    },
  },
  {
    accessorKey: "partySize",
    header: "Party Size",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-medium whitespace-nowrap">
          {appointment.partySize || "2 Guests"}
        </p>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Occasion",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <p className="text-14-regular max-w-[200px] truncate">
          {appointment.reason || "Regular Dining"}
        </p>
      );
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: "Welcome Drink",
    cell: ({ row }) => {
      const appointment = row.original;

      const drink = Doctors.find(
        (drink) => drink.name === appointment.primaryPhysician
      );

      return (
        <div className="flex items-center gap-2">
          <p className="text-sm whitespace-nowrap">{drink?.name || "Not selected"}</p>
        </div>
      );
    },
  },
  {
    accessorKey: "note",
    header: "Requests",
    size: 80, // Ultra-compact width for icon-only display
    cell: ({ row }) => {
      const appointment = row.original;
      
      return (
        <div className="w-[80px]">
          <SpecialRequestsCell 
            note={appointment.note}
            guestName={appointment.patient.name}
            maxLength={30}
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <ReservationActions 
          appointment={appointment} 
          onUpdate={() => onUpdate?.()} 
        />
      );
    },
  },
];

// Backward compatibility export
export const columns = createColumns();