import { Models } from "node-appwrite";

// Guest type (formerly Patient)
export interface Guest extends Models.Document {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  preferredTable: string; // formerly primaryPhysician
  dietaryRestrictions: string; // formerly insuranceProvider
  specialRequests: string; // formerly insurancePolicyNumber
  allergies: string | undefined;
  favoriteItems: string | undefined; // formerly currentMedication
  diningHistory: string | undefined; // formerly familyMedicalHistory
  pastVisits: string | undefined; // formerly pastMedicalHistory
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
  marketingConsent: boolean;
  newsletterConsent: boolean;
}

// Reservation type (formerly Appointment)
export interface Reservation extends Models.Document {
  guest: Guest;
  schedule: Date;
  status: Status;
  tablePreference: string; // formerly primaryPhysician
  occasion: string; // formerly reason
  note: string;
  partySize: number;
  userId: string;
  cancellationReason: string | null;
  specialRequests?: string;
  welcomeDrink?: string;
}

// Legacy aliases for backward compatibility
export type Patient = Guest;
export type Appointment = Reservation;