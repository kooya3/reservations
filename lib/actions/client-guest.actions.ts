"use server";

/**
 * Client-safe server actions for guest operations
 * These functions are designed to be called from client components
 */

import { analyzeReservationFrequency } from "../reservation-frequency";
import { parseStringify } from "../utils";

import { getUser, getPatient } from "./guest.actions";

/**
 * Client-safe user data fetching
 */
export async function fetchUserData(userId: string) {
  try {
    console.log('🚀 ClientActions: Fetching user data for:', userId);
    
    const [userResult, patientResult] = await Promise.allSettled([
      getUser(userId),
      getPatient(userId)
    ]);
    
    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const patient = patientResult.status === 'fulfilled' ? patientResult.value : null;
    
    console.log('✅ ClientActions: User data fetch result:', { 
      hasUser: !!user, 
      hasPatient: !!patient 
    });
    
    return parseStringify({
      success: true,
      user,
      patient,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ ClientActions: Error fetching user data:', error);
    
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user data',
      user: null,
      patient: null,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Client-safe frequency analysis
 */
export async function performFrequencyAnalysis(email: string, phone: string, name: string) {
  try {
    console.log('📊 ClientActions: Performing frequency analysis for:', email);
    
    const analysis = await analyzeReservationFrequency(email, phone, name);
    
    console.log('📈 ClientActions: Frequency analysis complete:', analysis.userProfile.requestFrequency);
    
    return parseStringify({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.warn('⚠️ ClientActions: Frequency analysis failed:', error);
    
    return parseStringify({
      success: false,
      error: error instanceof Error ? error.message : 'Frequency analysis failed',
      analysis: null,
      timestamp: new Date().toISOString()
    });
  }
}