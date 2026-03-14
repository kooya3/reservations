/**
 * Appwrite Schema Synchronization Module
 * Ensures perfect mapping between restaurant app and Appwrite database
 */

// CRITICAL: These are the EXACT fields that Appwrite database expects
// DO NOT remove or rename these fields - they are REQUIRED by the database

export interface AppwritePatientSchema {
  // Required fields that MUST be present
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: string;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;       // REQUIRED - we use for default service
  insuranceProvider: string;      // REQUIRED - we use for dietary preferences
  insurancePolicyNumber: string;  // REQUIRED - we use for guest ID
  privacyConsent: boolean;        // REQUIRED - must always be true
  
  // Optional fields
  allergies?: string;
  currentMedication?: string;
  identificationType?: string;
  identificationNumber?: string;
  identificationDocument?: any;
}

export interface AppwriteAppointmentSchema {
  userId: string;
  patient: string;                 // Guest document ID
  primaryPhysician: string;        // REQUIRED - stores welcome drink selection
  schedule: Date;
  reason: string;
  status: 'pending' | 'scheduled' | 'cancelled';
  note?: string;                   // We store party size here
  cancellationReason?: string;
}

/**
 * Maps restaurant guest data to Appwrite patient schema
 */
export function mapGuestToPatient(guestData: any): AppwritePatientSchema {
  return {
    // Required fields
    userId: guestData.userId,
    name: guestData.name,
    email: guestData.email,
    phone: guestData.phone,
    birthDate: guestData.birthDate || new Date("1990-01-01"),
    gender: guestData.gender || "Prefer not to say",
    address: guestData.address || guestData.favoriteTable || "No preference",
    occupation: guestData.occupation || "Restaurant Guest",
    emergencyContactName: guestData.emergencyContactName || guestData.name,
    emergencyContactNumber: guestData.emergencyContactNumber || guestData.phone,
    
    // CRITICAL: These three fields are REQUIRED by Appwrite
    primaryPhysician: guestData.primaryPhysician || "General",
    insuranceProvider: guestData.insuranceProvider || guestData.dietaryPreferences || "None",
    insurancePolicyNumber: guestData.insurancePolicyNumber || `GUEST-${Date.now()}`,
    
    // CRITICAL: This MUST be true
    privacyConsent: true,
    
    // Optional fields
    allergies: guestData.allergies || guestData.dietaryPreferences,
    currentMedication: guestData.currentMedication || "",
    identificationType: guestData.identificationType || "Guest Registration",
    identificationNumber: guestData.identificationNumber || `GUEST-${guestData.userId?.substring(0, 8)}`,
    identificationDocument: undefined,
  };
}

/**
 * Maps reservation data to Appwrite appointment schema
 */
export function mapReservationToAppointment(reservationData: any): AppwriteAppointmentSchema {
  // Extract party size to store in note field
  const partySize = reservationData.partySize || "2 Guests";
  const existingNote = reservationData.note || "";
  
  return {
    userId: reservationData.userId,
    patient: reservationData.patient,
    
    // CRITICAL: primaryPhysician is REQUIRED and stores the welcome drink
    primaryPhysician: reservationData.primaryPhysician || "House Special",
    
    schedule: new Date(reservationData.schedule),
    reason: reservationData.reason || "Regular Dining",
    status: reservationData.status || 'pending',
    
    // Store party size in note field since DB doesn't have partySize column
    note: `Party Size: ${partySize}${existingNote ? ` | ${existingNote}` : ''}`,
    
    cancellationReason: reservationData.cancellationReason,
  };
}

/**
 * Validates that all required fields are present before sending to Appwrite
 */
export function validatePatientData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = [
    'userId', 'name', 'email', 'phone', 'birthDate', 'gender',
    'address', 'occupation', 'emergencyContactName', 'emergencyContactNumber',
    'primaryPhysician', 'insuranceProvider', 'insurancePolicyNumber', 'privacyConsent'
  ];
  
  for (const field of required) {
    if (!data[field] && data[field] !== false && data[field] !== 0) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Special check for privacyConsent
  if (data.privacyConsent !== true) {
    errors.push('privacyConsent must be true');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates appointment data before sending to Appwrite
 */
export function validateAppointmentData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required = ['userId', 'patient', 'primaryPhysician', 'schedule', 'reason', 'status'];
  
  for (const field of required) {
    if (!data[field] && data[field] !== false && data[field] !== 0) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Field mapping reference for developers
export const FIELD_MAPPINGS = {
  PATIENT_COLLECTION: {
    'primaryPhysician': 'Used for: Default service type (set to "General")',
    'insuranceProvider': 'Used for: Dietary preferences storage',
    'insurancePolicyNumber': 'Used for: Unique guest identifier',
    'address': 'Used for: Seating preferences',
    'occupation': 'Used for: Guest type (always "Restaurant Guest")',
    'emergencyContactName': 'Used for: Duplicate of guest name',
    'emergencyContactNumber': 'Used for: Duplicate of guest phone',
  },
  APPOINTMENT_COLLECTION: {
    'primaryPhysician': 'Used for: Welcome drink selection (REQUIRED)',
    'reason': 'Used for: Dining occasion',
    'note': 'Used for: Party size and special requests',
    'patient': 'Used for: Reference to guest document',
  }
};