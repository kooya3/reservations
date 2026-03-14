import { Query } from "node-appwrite";

import { databases, users, DATABASE_ID, PATIENT_COLLECTION_ID, APPOINTMENT_COLLECTION_ID } from "./appwrite.config";

/**
 * Smart Reservation Frequency Detection System
 * 
 * This system intelligently handles multiple reservations from the same user
 * by analyzing request frequency, existing reservations, and user behavior patterns.
 */

export interface UserReservationProfile {
  userId: string;
  email: string;
  phone: string;
  name: string;
  existingReservations: number;
  lastReservationDate?: Date;
  requestFrequency: 'first-time' | 'returning' | 'frequent' | 'rapid-duplicate';
  recommendedAction: 'create-new' | 'update-existing' | 'confirm-additional' | 'prevent-duplicate';
  conflictDetails?: {
    duplicateWithin?: string; // "5 minutes", "1 hour", etc.
    existingAppointments?: any[];
    similarRequests?: number;
  };
}

export interface FrequencyAnalysis {
  shouldPurgeAll: boolean;
  shouldCreateNew: boolean;
  userProfile: UserReservationProfile;
  suggestedAction: string;
  userMessage: string;
}

/**
 * Analyze user reservation frequency and determine appropriate action
 */
export async function analyzeReservationFrequency(
  email: string, 
  phone: string, 
  name: string
): Promise<FrequencyAnalysis> {
  console.log('🔍 Frequency Analysis: Analyzing user reservation patterns...');
  console.log('📊 Input:', { email, phone, name });

  try {
    // Step 1: Check for existing user by email or phone
    const existingUser = await findExistingUser(email, phone);
    console.log('✅ existingUser found:', existingUser ? `YES (${existingUser.$id})` : 'NO');
    
    // Step 2: Get user's reservation history if they exist
    const reservationHistory = existingUser ? await getUserReservationHistory(existingUser.$id) : [];
    console.log('📊 reservationHistory length:', reservationHistory.length);
    
    // Step 3: Analyze request timing and patterns
    // IMPORTANT: If user exists in Appwrite but has no reservation history yet,
    // treat them as "returning" (user exists) not "first-time"
    const frequencyPattern = existingUser && reservationHistory.length === 0 
      ? { type: 'returning' as const, conflicts: undefined }  // User exists but no appointments yet
      : analyzeRequestPattern(reservationHistory);
    
    console.log('📊 frequencyPattern:', frequencyPattern.type);
    
    // Step 4: Create user profile
    const userProfile: UserReservationProfile = {
      userId: existingUser?.$id || 'new',
      email,
      phone,
      name,
      existingReservations: reservationHistory.length,
      lastReservationDate: reservationHistory.length > 0 ? 
        new Date(reservationHistory[0].$createdAt) : undefined,
      requestFrequency: frequencyPattern.type,
      recommendedAction: determineRecommendedAction(frequencyPattern, reservationHistory),
      conflictDetails: frequencyPattern.conflicts
    };

    // Step 5: Generate analysis result
    const analysis = generateFrequencyAnalysis(userProfile, frequencyPattern);
    
    console.log('📈 Frequency Analysis Result:', {
      frequency: userProfile.requestFrequency,
      action: userProfile.recommendedAction,
      existing: userProfile.existingReservations,
      userExists: !!existingUser
    });
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Frequency Analysis Error:', error);
    
    // Fallback to safe default behavior
    return {
      shouldPurgeAll: false, // Don't purge on error
      shouldCreateNew: true,
      userProfile: {
        userId: 'unknown',
        email,
        phone,
        name,
        existingReservations: 0,
        requestFrequency: 'first-time',
        recommendedAction: 'create-new'
      },
      suggestedAction: 'create-new',
      userMessage: 'Creating your reservation... (safe mode due to system analysis error)'
    };
  }
}

/**
 * Find existing user by email or phone
 */
async function findExistingUser(email: string, phone: string) {
  try {
    // Search by email first
    const emailResults = await users.list([
      Query.equal("email", [email])
    ]);

    console.log('🔎 findExistingUser: emailResults count:', emailResults?.users?.length || 0);
    if (emailResults && emailResults.users && emailResults.users.length > 0) {
      console.log('🔎 findExistingUser: matched by email ->', emailResults.users[0].$id);
      return emailResults.users[0];
    }
    
    // Search by phone if email not found
    const phoneResults = await users.list([
      Query.equal("phone", [phone])
    ]);

    console.log('🔎 findExistingUser: phoneResults count:', phoneResults?.users?.length || 0);
    if (phoneResults && phoneResults.users && phoneResults.users.length > 0) {
      console.log('🔎 findExistingUser: matched by phone ->', phoneResults.users[0].$id);
      return phoneResults.users[0];
    }

    return null;
    
  } catch (error) {
    console.error('❌ Error finding existing user:', error);
    return null;
  }
}

/**
 * Get user's reservation/appointment history
 */
async function getUserReservationHistory(userId: string) {
  try {
    if (!DATABASE_ID || !PATIENT_COLLECTION_ID || !APPOINTMENT_COLLECTION_ID) {
      console.log('⚠️ getUserReservationHistory: Missing config, returning empty history');
      return [];
    }

    // Get patient record
    const patientResults = await databases.listDocuments(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      [Query.equal("userId", [userId]), Query.limit(1)]
    );
    
    console.log('📋 getUserReservationHistory: Found', patientResults.documents.length, 'patient record(s) for userId', userId);
    
    if (patientResults.documents.length === 0) {
      console.log('⚠️ getUserReservationHistory: No patient document found yet (user may be first-time or profile incomplete). Returning empty history but user exists in Appwrite.');
      return [];
    }
    
    const patientId = patientResults.documents[0].$id;
    console.log('📋 getUserReservationHistory: Patient document ID:', patientId);
    
    // Get appointments for this patient
    const appointmentResults = await databases.listDocuments(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      [
        Query.equal("patient", [patientId]),
        Query.orderDesc("$createdAt"),
        Query.limit(10) // Last 10 appointments
      ]
    );
    
    console.log('📋 getUserReservationHistory: Found', appointmentResults.documents.length, 'appointment(s) for patient', patientId);
    return appointmentResults.documents;
    
  } catch (error) {
    console.error('❌ Error fetching reservation history:', error);
    return [];
  }
}

/**
 * Analyze request patterns to detect frequency type
 */
function analyzeRequestPattern(reservationHistory: any[]) {
  const now = new Date();
  const conflicts: any = {};
  
  if (reservationHistory.length === 0) {
    return { type: 'first-time' as const, conflicts: undefined };
  }
  
  const lastReservation = reservationHistory[0];
  const lastReservationTime = new Date(lastReservation.$createdAt);
  const timeSinceLastReservation = now.getTime() - lastReservationTime.getTime();
  
  const minutes = timeSinceLastReservation / (1000 * 60);
  const hours = minutes / 60;
  const days = hours / 24;
  
  // Rapid duplicate detection (within 5 minutes)
  if (minutes < 5) {
    conflicts.duplicateWithin = '5 minutes';
    conflicts.existingAppointments = reservationHistory.slice(0, 3);
    return { type: 'rapid-duplicate' as const, conflicts };
  }
  
  // Recent duplicate (within 1 hour)
  if (hours < 1) {
    conflicts.duplicateWithin = '1 hour';
    conflicts.similarRequests = reservationHistory.length;
    return { type: 'rapid-duplicate' as const, conflicts };
  }
  
  // Same day reservation (within 24 hours)
  if (days < 1) {
    return { type: 'frequent' as const, conflicts: { duplicateWithin: '24 hours' } };
  }
  
  // Returning customer (has previous reservations but reasonable time gap)
  if (reservationHistory.length > 0) {
    return { type: 'returning' as const, conflicts: undefined };
  }
  
  return { type: 'first-time' as const, conflicts: undefined };
}

/**
 * Determine the recommended action based on analysis
 */
function determineRecommendedAction(
  pattern: { type: string; conflicts?: any }, 
  history: any[]
): UserReservationProfile['recommendedAction'] {
  
  switch (pattern.type) {
    case 'first-time':
      return 'create-new';
      
    case 'returning':
      return 'create-new'; // Returning customers can make new reservations
      
    case 'frequent':
      return 'confirm-additional'; // Same day - ask for confirmation
      
    case 'rapid-duplicate':
      return 'prevent-duplicate'; // Likely accidental duplicate
      
    default:
      return 'create-new';
  }
}

/**
 * Generate comprehensive frequency analysis
 */
function generateFrequencyAnalysis(
  profile: UserReservationProfile, 
  pattern: { type: string; conflicts?: any }
): FrequencyAnalysis {
  
  switch (profile.recommendedAction) {
    case 'create-new':
      return {
        shouldPurgeAll: false, // Keep existing reservations
        shouldCreateNew: true,
        userProfile: profile,
        suggestedAction: 'create-new',
        userMessage: profile.requestFrequency === 'first-time' 
          ? "Welcome! Creating your first reservation..."
          : `Welcome back! Creating your new reservation... (You have ${profile.existingReservations} previous reservations)`
      };
      
    case 'confirm-additional':
      return {
        shouldPurgeAll: false,
        shouldCreateNew: false, // Wait for user confirmation
        userProfile: profile,
        suggestedAction: 'request-confirmation',
        userMessage: `You recently made a reservation. Would you like to make an additional booking for today?`
      };
      
    case 'prevent-duplicate':
      return {
        shouldPurgeAll: false,
        shouldCreateNew: false,
        userProfile: profile,
        suggestedAction: 'show-recent-reservation',
        userMessage: `It looks like you just made a reservation ${profile.conflictDetails?.duplicateWithin} ago. Here are your current bookings:`
      };
      
    case 'update-existing':
      return {
        shouldPurgeAll: false,
        shouldCreateNew: false,
        userProfile: profile,
        suggestedAction: 'offer-modification',
        userMessage: "Would you like to modify your existing reservation or create a new one?"
      };
      
    default:
      return {
        shouldPurgeAll: false,
        shouldCreateNew: true,
        userProfile: profile,
        suggestedAction: 'create-new',
        userMessage: "Processing your reservation request..."
      };
  }
}

/**
 * Handle reservation conflict resolution
 */
export async function handleReservationConflict(
  userProfile: UserReservationProfile,
  userChoice: 'create-additional' | 'modify-existing' | 'cancel' | 'proceed-anyway'
): Promise<{ shouldProceed: boolean; action: string; message: string }> {
  
  switch (userChoice) {
    case 'create-additional':
      return {
        shouldProceed: true,
        action: 'create-new',
        message: 'Creating your additional reservation...'
      };
      
    case 'modify-existing':
      return {
        shouldProceed: true,
        action: 'update-existing',
        message: 'Redirecting to modify your existing reservation...'
      };
      
    case 'proceed-anyway':
      return {
        shouldProceed: true,
        action: 'create-new',
        message: 'Creating your reservation as requested...'
      };
      
    case 'cancel':
    default:
      return {
        shouldProceed: false,
        action: 'cancel',
        message: 'Reservation cancelled. Your existing bookings remain unchanged.'
      };
  }
}