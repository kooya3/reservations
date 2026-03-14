"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Reservation } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";

// CREATE RESERVATION
export const createReservation = async (
  reservation: CreateReservationParams
) => {
  try {
    const newReservation = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      reservation
    );

    // Send confirmation notification
    const scheduledDate = formatDateTime(reservation.schedule);
    await sendNotification(
      reservation.userId,
      `Your reservation for ${scheduledDate.dateTime} has been confirmed! 🍽️`
    );

    revalidatePath("/admin");
    return parseStringify(newReservation);
  } catch (error) {
    console.error("An error occurred while creating a new reservation:", error);
  }
};

// GET RESERVATION
export const getReservation = async (reservationId: string) => {
  try {
    const reservation = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      reservationId
    );

    return parseStringify(reservation);
  } catch (error) {
    console.error("An error occurred while retrieving the reservation:", error);
  }
};

// GET RECENT RESERVATIONS LIST
export const getRecentReservationList = async () => {
  try {
    const reservations = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt"), Query.limit(10)]
    );

    const initialCounts = {
      confirmedCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    };

    const counts = (reservations.documents as Reservation[]).reduce(
      (acc, reservation) => {
        switch (reservation.status) {
          case "confirmed":
            acc.confirmedCount++;
            break;
          case "pending":
            acc.pendingCount++;
            break;
          case "cancelled":
            acc.cancelledCount++;
            break;
        }
        return acc;
      },
      initialCounts
    );

    const data = {
      totalCount: reservations.total,
      ...counts,
      documents: reservations.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error("An error occurred while retrieving the reservations:", error);
  }
};

// UPDATE RESERVATION
export const updateReservation = async ({
  reservationId,
  userId,
  reservation,
  type,
}: UpdateReservationParams) => {
  try {
    const updatedReservation = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      reservationId,
      reservation
    );

    if (!updatedReservation) throw Error;

    // Send status update notification
    const message = 
      type === "confirmed"
        ? "Your reservation has been confirmed! We look forward to serving you. 🎉"
        : type === "pending"
        ? "Your reservation is pending review. We'll confirm shortly. ⏰"
        : "Your reservation has been cancelled. We hope to see you another time. 😔";

    await sendNotification(userId, message);

    revalidatePath("/admin");
    return parseStringify(updatedReservation);
  } catch (error) {
    console.error("An error occurred while updating the reservation:", error);
  }
};

// SEND NOTIFICATION
export const sendNotification = async (userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while sending notification:", error);
  }
};

// Legacy aliases for backward compatibility
export const createAppointment = createReservation;
export const getAppointment = getReservation;
export const getRecentAppointmentList = getRecentReservationList;
export const updateAppointment = updateReservation;
export const sendSMSNotification = sendNotification;