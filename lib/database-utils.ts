import { Query } from "node-appwrite";

import { databases, users, DATABASE_ID, PATIENT_COLLECTION_ID, APPOINTMENT_COLLECTION_ID } from "./appwrite.config";

/**
 * Auto-purge utility for clearing existing data before fresh registrations
 */

export interface PurgeResult {
  success: boolean;
  patientsDeleted: number;
  appointmentsDeleted: number;
  usersDeleted: number;
  errors?: string[];
}

/**
 * Clear all documents from a collection
 */
async function clearCollection(collectionId: string, collectionName: string): Promise<{ success: boolean; deleted: number; errors?: string[] }> {
  if (!collectionId || !DATABASE_ID) {
    return { success: false, deleted: 0, errors: [`Missing configuration for ${collectionName}`] };
  }

  try {
    console.log(`🔍 Auto-purge: Checking ${collectionName}...`);
    
    // Fetch all documents
    const response = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [Query.limit(100)] // Start with smaller batch for safety
    );

    if (response.documents.length === 0) {
      console.log(`✅ ${collectionName}: Already clean`);
      return { success: true, deleted: 0 };
    }

    console.log(`🗑️  Auto-purge: Clearing ${response.documents.length} ${collectionName}...`);
    
    const deletePromises = response.documents.map(doc => 
      databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
        .catch(error => ({ error: `Failed to delete ${doc.$id}: ${error.message}` }))
    );

    const results = await Promise.all(deletePromises);
    const errors = results.filter(r => r && 'error' in r).map(r => r.error);
    const deleted = response.documents.length - errors.length;

    console.log(`${errors.length === 0 ? '✅' : '⚠️'} ${collectionName}: ${deleted} deleted`);
    
    return {
      success: errors.length === 0,
      deleted,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error(`❌ Auto-purge error for ${collectionName}:`, error);
    return { 
      success: false, 
      deleted: 0, 
      errors: [`Failed to clear ${collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Clear user accounts
 */
async function clearUsers(): Promise<{ success: boolean; deleted: number; errors?: string[] }> {
  try {
    console.log(`🔍 Auto-purge: Checking user accounts...`);
    
    const response = await users.list([Query.limit(50)]); // Smaller batch for users
    
    if (response.users.length === 0) {
      console.log(`✅ Users: Already clean`);
      return { success: true, deleted: 0 };
    }

    console.log(`🗑️  Auto-purge: Clearing ${response.users.length} user accounts...`);
    
    const deletePromises = response.users.map(user => 
      users.delete(user.$id)
        .catch(error => ({ error: `Failed to delete user ${user.$id}: ${error.message}` }))
    );

    const results = await Promise.all(deletePromises);
    const errors = results.filter(r => r && 'error' in r).map(r => r.error);
    const deleted = response.users.length - errors.length;

    console.log(`${errors.length === 0 ? '✅' : '⚠️'} Users: ${deleted} deleted`);
    
    return {
      success: errors.length === 0,
      deleted,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error(`❌ Auto-purge error for users:`, error);
    return { 
      success: false, 
      deleted: 0, 
      errors: [`Failed to clear users: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

/**
 * Auto-purge all data to prepare for fresh registrations
 */
export async function autoPurgeDatabase(): Promise<PurgeResult> {
  console.log('🚀 Auto-purge: Preparing database for fresh registration...');
  
  const errors: string[] = [];
  
  try {
    // Clear collections
    const patientResult = await clearCollection(PATIENT_COLLECTION_ID!, 'Patients');
    const appointmentResult = await clearCollection(APPOINTMENT_COLLECTION_ID!, 'Appointments');
    
    // Clear users
    const userResult = await clearUsers();
    
    // Collect any errors
    if (patientResult.errors) errors.push(...patientResult.errors);
    if (appointmentResult.errors) errors.push(...appointmentResult.errors);
    if (userResult.errors) errors.push(...userResult.errors);
    
    const totalDeleted = patientResult.deleted + appointmentResult.deleted + userResult.deleted;
    const overallSuccess = patientResult.success && appointmentResult.success && userResult.success;
    
    const result: PurgeResult = {
      success: overallSuccess,
      patientsDeleted: patientResult.deleted,
      appointmentsDeleted: appointmentResult.deleted,
      usersDeleted: userResult.deleted,
      errors: errors.length > 0 ? errors : undefined
    };
    
    if (overallSuccess) {
      console.log(`✅ Auto-purge completed: ${totalDeleted} items cleared`);
    } else {
      console.log(`⚠️ Auto-purge partial success: ${totalDeleted} items cleared with ${errors.length} errors`);
    }
    
    return result;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during auto-purge';
    console.error('❌ Auto-purge failed:', errorMessage);
    
    return {
      success: false,
      patientsDeleted: 0,
      appointmentsDeleted: 0,
      usersDeleted: 0,
      errors: [errorMessage]
    };
  }
}

/**
 * Quick check if database needs purging (has existing data)
 */
export async function needsPurge(): Promise<boolean> {
  try {
    // Check if there are any existing patients or users
    const [patientCheck, userCheck] = await Promise.allSettled([
      databases.listDocuments(DATABASE_ID!, PATIENT_COLLECTION_ID!, [Query.limit(1)]),
      users.list([Query.limit(1)])
    ]);
    
    const hasPatients = patientCheck.status === 'fulfilled' && patientCheck.value.documents.length > 0;
    const hasUsers = userCheck.status === 'fulfilled' && userCheck.value.users.length > 0;
    
    return hasPatients || hasUsers;
  } catch (error) {
    console.error('❌ Error checking if purge needed:', error);
    return false; // Assume no purge needed if we can't check
  }
}