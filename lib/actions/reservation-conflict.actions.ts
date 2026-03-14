"use server";

import { handleReservationConflict, UserReservationProfile } from "../reservation-frequency";
import { parseStringify } from "../utils";

/**
 * Server action to handle user choice for reservation conflicts
 */
export async function handleUserConflictChoice(
  userProfile: UserReservationProfile,
  userChoice: 'create-additional' | 'modify-existing' | 'cancel' | 'proceed-anyway'
) {
  console.log(`🎯 Handling conflict choice: ${userChoice} for user: ${userProfile.email}`);
  
  try {
    const resolution = await handleReservationConflict(userProfile, userChoice);
    
    console.log(`✅ Conflict resolution: ${resolution.action}`);
    console.log(`📝 Message: ${resolution.message}`);
    
    return parseStringify({
      success: true,
      resolution,
      userProfile,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error handling conflict choice:', error);
    
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      userProfile,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Get existing reservations for a user to display in conflict resolution
 */
export async function getUserExistingReservations(userId: string) {
  // This would fetch and return the user's existing reservations
  // Implementation depends on your appointment/reservation data structure
  console.log(`📋 Fetching existing reservations for user: ${userId}`);
  
  try {
    // TODO: Implement based on your appointment collection structure
    return parseStringify({
      success: true,
      reservations: [], // Placeholder - implement actual fetching
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching existing reservations:', error);
    
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}