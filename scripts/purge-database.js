#!/usr/bin/env node

/**
 * Database Purge Script for AmPm Lounge Reservation System
 * 
 * This script safely clears all user and patient data from Appwrite collections
 * to allow for fresh testing without existing data conflicts.
 * 
 * Usage: node scripts/purge-database.js
 */

const { Client, Databases, Users, Query } = require('node-appwrite');
require('dotenv').config({ path: './.env.local' });

// Configuration from environment variables
const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
} = process.env;

// Validate required configuration
if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
  console.error('❌ CRITICAL: Missing required Appwrite configuration!');
  console.error('Required environment variables:');
  console.error('- NEXT_PUBLIC_ENDPOINT:', ENDPOINT ? '✅' : '❌ Missing');
  console.error('- PROJECT_ID:', PROJECT_ID ? '✅' : '❌ Missing');
  console.error('- API_KEY:', API_KEY ? '✅ Present' : '❌ Missing');
  console.error('- DATABASE_ID:', DATABASE_ID ? '✅' : '❌ Missing');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const users = new Users(client);

/**
 * Clear all documents from a specific collection
 */
async function clearCollection(collectionId, collectionName) {
  if (!collectionId) {
    console.log(`⚠️  Skipping ${collectionName} - Collection ID not configured`);
    return { success: true, deleted: 0 };
  }

  try {
    console.log(`\n🔍 Fetching ${collectionName} documents...`);
    
    let allDocuments = [];
    let hasMore = true;
    let offset = 0;
    const limit = 100;

    // Fetch all documents (handling pagination)
    while (hasMore) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          collectionId,
          [
            Query.limit(limit),
            Query.offset(offset)
          ]
        );

        allDocuments = allDocuments.concat(response.documents);
        hasMore = response.documents.length === limit;
        offset += limit;

        console.log(`📄 Fetched ${response.documents.length} documents (Total: ${allDocuments.length})`);
      } catch (error) {
        if (error.code === 404) {
          console.log(`⚠️  Collection ${collectionName} not found or empty`);
          return { success: true, deleted: 0 };
        }
        throw error;
      }
    }

    if (allDocuments.length === 0) {
      console.log(`✅ ${collectionName} collection is already empty`);
      return { success: true, deleted: 0 };
    }

    console.log(`🗑️  Deleting ${allDocuments.length} documents from ${collectionName}...`);
    
    // Delete documents in batches to avoid rate limits
    const batchSize = 10;
    let deleted = 0;
    let failed = 0;

    for (let i = 0; i < allDocuments.length; i += batchSize) {
      const batch = allDocuments.slice(i, i + batchSize);
      
      const deletePromises = batch.map(async (doc) => {
        try {
          await databases.deleteDocument(DATABASE_ID, collectionId, doc.$id);
          return { success: true, id: doc.$id };
        } catch (error) {
          console.error(`❌ Failed to delete document ${doc.$id}:`, error.message);
          return { success: false, id: doc.$id, error: error.message };
        }
      });

      const results = await Promise.all(deletePromises);
      
      const batchDeleted = results.filter(r => r.success).length;
      const batchFailed = results.filter(r => !r.success).length;
      
      deleted += batchDeleted;
      failed += batchFailed;

      console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}: ${batchDeleted} deleted, ${batchFailed} failed`);
      
      // Small delay to avoid rate limiting
      if (i + batchSize < allDocuments.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const success = failed === 0;
    console.log(`${success ? '✅' : '⚠️'} ${collectionName}: ${deleted} deleted, ${failed} failed`);
    
    return { success, deleted, failed };
  } catch (error) {
    console.error(`❌ Error clearing ${collectionName}:`, error.message);
    return { success: false, deleted: 0, failed: 0, error: error.message };
  }
}

/**
 * Clear all users from Appwrite Auth
 */
async function clearUsers() {
  try {
    console.log(`\n🔍 Fetching user accounts...`);
    
    let allUsers = [];
    let hasMore = true;
    let offset = 0;
    const limit = 100;

    // Fetch all users (handling pagination)
    while (hasMore) {
      try {
        const response = await users.list(
          [
            Query.limit(limit),
            Query.offset(offset)
          ]
        );

        allUsers = allUsers.concat(response.users);
        hasMore = response.users.length === limit;
        offset += limit;

        console.log(`👥 Fetched ${response.users.length} users (Total: ${allUsers.length})`);
      } catch (error) {
        console.error(`❌ Error fetching users:`, error.message);
        break;
      }
    }

    if (allUsers.length === 0) {
      console.log(`✅ No user accounts found`);
      return { success: true, deleted: 0 };
    }

    console.log(`🗑️  Deleting ${allUsers.length} user accounts...`);
    
    // Delete users in batches
    const batchSize = 5; // Smaller batch size for user deletion
    let deleted = 0;
    let failed = 0;

    for (let i = 0; i < allUsers.length; i += batchSize) {
      const batch = allUsers.slice(i, i + batchSize);
      
      const deletePromises = batch.map(async (user) => {
        try {
          await users.delete(user.$id);
          return { success: true, id: user.$id };
        } catch (error) {
          console.error(`❌ Failed to delete user ${user.$id}:`, error.message);
          return { success: false, id: user.$id, error: error.message };
        }
      });

      const results = await Promise.all(deletePromises);
      
      const batchDeleted = results.filter(r => r.success).length;
      const batchFailed = results.filter(r => !r.success).length;
      
      deleted += batchDeleted;
      failed += batchFailed;

      console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}: ${batchDeleted} deleted, ${batchFailed} failed`);
      
      // Longer delay for user deletion to avoid rate limiting
      if (i + batchSize < allUsers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const success = failed === 0;
    console.log(`${success ? '✅' : '⚠️'} Users: ${deleted} deleted, ${failed} failed`);
    
    return { success, deleted, failed };
  } catch (error) {
    console.error(`❌ Error clearing users:`, error.message);
    return { success: false, deleted: 0, failed: 0, error: error.message };
  }
}

/**
 * Main purge function
 */
async function purgeDatabase() {
  console.log('🚀 Starting AmPm Lounge Database Purge...');
  console.log('⚠️  WARNING: This will permanently delete all data!');
  console.log('📋 Configuration:');
  console.log(`   • Endpoint: ${ENDPOINT}`);
  console.log(`   • Project: ${PROJECT_ID}`);
  console.log(`   • Database: ${DATABASE_ID}`);
  console.log('');

  const results = {
    patients: { success: false, deleted: 0 },
    doctors: { success: false, deleted: 0 },
    appointments: { success: false, deleted: 0 },
    users: { success: false, deleted: 0 }
  };

  try {
    // Clear collections
    console.log('🗂️  Clearing Collections...');
    results.patients = await clearCollection(PATIENT_COLLECTION_ID, 'Patients');
    results.doctors = await clearCollection(DOCTOR_COLLECTION_ID, 'Doctors');
    results.appointments = await clearCollection(APPOINTMENT_COLLECTION_ID, 'Appointments');
    
    // Clear users
    console.log('\n👥 Clearing User Accounts...');
    results.users = await clearUsers();

    // Summary
    console.log('\n📊 PURGE SUMMARY:');
    console.log('='.repeat(50));
    console.log(`Patients:     ${results.patients.deleted} deleted ${results.patients.success ? '✅' : '❌'}`);
    console.log(`Doctors:      ${results.doctors.deleted} deleted ${results.doctors.success ? '✅' : '❌'}`);
    console.log(`Appointments: ${results.appointments.deleted} deleted ${results.appointments.success ? '✅' : '❌'}`);
    console.log(`Users:        ${results.users.deleted} deleted ${results.users.success ? '✅' : '❌'}`);
    
    const totalDeleted = results.patients.deleted + results.doctors.deleted + 
                        results.appointments.deleted + results.users.deleted;
    
    const allSuccess = results.patients.success && results.doctors.success && 
                      results.appointments.success && results.users.success;

    console.log('-'.repeat(50));
    console.log(`Total Items Deleted: ${totalDeleted}`);
    console.log(`Status: ${allSuccess ? '✅ SUCCESS' : '⚠️ PARTIAL SUCCESS'}`);
    
    if (allSuccess && totalDeleted > 0) {
      console.log('\n🎉 Database successfully purged! Ready for fresh testing.');
    } else if (totalDeleted === 0) {
      console.log('\n✨ Database was already clean. Ready for testing.');
    } else {
      console.log('\n⚠️  Database partially purged. Some items may have failed to delete.');
    }

  } catch (error) {
    console.error('\n❌ FATAL ERROR during database purge:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Purge interrupted by user. Exiting safely...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the purge
if (require.main === module) {
  purgeDatabase().catch(error => {
    console.error('❌ Failed to purge database:', error);
    process.exit(1);
  });
}

module.exports = { purgeDatabase, clearCollection, clearUsers };