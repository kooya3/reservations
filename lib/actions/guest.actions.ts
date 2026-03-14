"use server";

import { ID, Query, InputFile } from "node-appwrite";

import {
  API_KEY,
  BUCKET_ID,
  DATABASE_ID,
  ENDPOINT,
  PATIENT_COLLECTION_ID,
  PROJECT_ID,
  databases,
  storage,
  users,
} from "../appwrite.config";
import { autoPurgeDatabase } from "../database-utils";
import { analyzeReservationFrequency } from "../reservation-frequency";
import { parseStringify } from "../utils";

// CREATE NEW USER (with intelligent frequency detection)
export const createUser = async (user: CreateUserParams, bypassFrequencyCheck = false) => {
  console.log('🚀 createUser: Starting with data:', user);
  console.log('🚀 createUser: Environment check:', {
    endpoint: ENDPOINT ? 'Present' : 'Missing',
    projectId: PROJECT_ID ? 'Present' : 'Missing',
    apiKey: API_KEY ? 'Present' : 'Missing'
  });
  
  try {
    // Skip frequency analysis if bypassed (user confirmed)
    if (!bypassFrequencyCheck) {
      // Intelligent frequency analysis instead of blanket purging
      console.log('📊 createUser: Analyzing reservation frequency...');
      const frequencyAnalysis = await analyzeReservationFrequency(
        user.email, 
        user.phone, 
        user.name
      );
      
      console.log(`📈 Frequency Analysis: ${frequencyAnalysis.userProfile.requestFrequency} user`);
      console.log(`💡 Recommended Action: ${frequencyAnalysis.userProfile.recommendedAction}`);
      console.log(`📝 User Message: ${frequencyAnalysis.userMessage}`);
      
      // Streamlined approach: Auto-approve returning users without hassle
      if (frequencyAnalysis.userProfile.recommendedAction === 'prevent-duplicate') {
        console.log('🚫 createUser: Recent duplicate detected - but allowing since user wants another reservation');
        console.log(`📝 User Message: ${frequencyAnalysis.userMessage}`);
        // Continue with user creation - let them make additional reservations easily
      }
      
      if (frequencyAnalysis.userProfile.recommendedAction === 'confirm-additional') {
        console.log('✅ createUser: Frequent user detected - auto-approving additional reservation');
        console.log(`📝 User Message: ${frequencyAnalysis.userMessage}`);
        console.log(`🎯 Existing Reservations: ${frequencyAnalysis.userProfile.existingReservations || 0}`);
        // Continue with user creation - streamlined experience for returning customers
      }
      
      // Only purge if explicitly recommended by analysis
      if (frequencyAnalysis.shouldPurgeAll) {
        console.log('🧹 createUser: Analysis recommends data purge...');
        const purgeResult = await autoPurgeDatabase();
        console.log(`✅ createUser: Smart purge completed - ${purgeResult.patientsDeleted + purgeResult.appointmentsDeleted + purgeResult.usersDeleted} items cleared`);
      }
    } else {
      console.log('⚡ createUser: Frequency check bypassed - user confirmed additional reservation');
    }
    
    console.log('🔗 createUser: Checking if user already exists before create...');
    try {
      const precheck = await users.list([
        Query.equal("email", [user.email])
      ]);

      if (precheck.users && precheck.users.length > 0) {
        console.log('👤 createUser: Pre-check found existing user, returning it to avoid 409:', precheck.users[0]);
        return parseStringify(precheck.users[0]);
      }
    } catch (precheckError) {
      console.warn('⚠️ createUser: Pre-check for existing user failed, continuing to create. Error:', precheckError);
    }

    console.log('🔗 createUser: About to call users.create...');
    // Create new user in Appwrite
    const newUser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    console.log('✅ createUser: Success! New user created:', newUser);
    return parseStringify(newUser);
  } catch (error: any) {
    console.log('🚨 createUser: Caught error:', error);
    console.log('🚨 createUser: Error code:', error?.code);
    console.log('🚨 createUser: Error message:', error?.message);
    
    // Check if user already exists
    if (error && error?.code === 409) {
      console.log('👤 createUser: User exists, fetching existing user...');
      try {
        const existingUser = await users.list([
          Query.equal("email", [user.email]),
        ]);
        
        console.log('✅ createUser: Found existing user:', existingUser.users[0]);
        return parseStringify(existingUser.users[0]);
      } catch (listError) {
        console.error('❌ createUser: Failed to fetch existing user:', listError);
        return null;
      }
    }
    
    console.error('❌ createUser: Failed to create user:', error);
    console.error('❌ createUser: Error details:', {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      stack: error?.stack
    });
    
    // Return null instead of undefined for cleaner error handling
    return null;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.error("An error occurred while retrieving the user details:", error);
  }
};

// REGISTER GUEST (complete profile with intelligent frequency detection)
export const registerGuest = async ({
  identificationDocument,
  ...guest
}: RegisterGuestParams) => {
  console.log('🚀 registerGuest: Starting with data:', guest);
  console.log('🚀 registerGuest: Has document:', !!identificationDocument);
  
  try {
    // Intelligent frequency analysis for guest registration
    console.log('📊 registerGuest: Analyzing reservation frequency...');
    const frequencyAnalysis = await analyzeReservationFrequency(
      guest.email, 
      guest.phone, 
      guest.name
    );
    
    console.log(`📈 Frequency Analysis: ${frequencyAnalysis.userProfile.requestFrequency} guest`);
    console.log(`💡 Recommended Action: ${frequencyAnalysis.userProfile.recommendedAction}`);
    console.log(`📝 User Message: ${frequencyAnalysis.userMessage}`);
    
    // Streamlined approach: Auto-approve returning guests without hassle
    if (frequencyAnalysis.userProfile.recommendedAction === 'prevent-duplicate') {
      console.log('✅ registerGuest: Recent duplicate detected - but allowing since guest wants another reservation');
      console.log(`📝 Guest Message: ${frequencyAnalysis.userMessage}`);
      // Continue with guest registration - let them make additional reservations easily
    }
    
    if (frequencyAnalysis.userProfile.recommendedAction === 'confirm-additional') {
      console.log('✅ registerGuest: Frequent guest detected - auto-approving additional reservation');
      console.log(`📝 Guest Message: ${frequencyAnalysis.userMessage}`);
      console.log(`🎯 Existing Reservations: ${frequencyAnalysis.userProfile.existingReservations || 0}`);
      // Continue with guest registration - streamlined experience for returning customers
    }
    
    // Smart purge only when recommended
    if (frequencyAnalysis.shouldPurgeAll) {
      console.log('🧹 registerGuest: Smart purging recommended by frequency analysis...');
      const purgeResult = await autoPurgeDatabase();
      console.log(`✅ registerGuest: Smart purge completed - ${purgeResult.patientsDeleted + purgeResult.appointmentsDeleted + purgeResult.usersDeleted} items cleared`);
    }
    // Upload identification document
    if (identificationDocument) {
      const inputFile = identificationDocument && 
        InputFile.fromBlob(
          identificationDocument?.get("blobFile") as Blob,
          identificationDocument?.get("fileName") as string
        );

      await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // Create minimal guest document with only core fields that definitely exist
    const restaurantGuestData = {
      // Absolute essentials only - start minimal
      userId: guest.userId,
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      // Required by database schema
      privacyConsent: true,
    };
    
    // Add optional fields only if they exist in database schema
    if (guest.birthDate) {
      restaurantGuestData.birthDate = guest.birthDate;
    }
    
    // Try adding common fields that might exist
    try {
      if (guest.address) restaurantGuestData.address = guest.address;
      if (guest.gender) {
        // Map gender to valid database values
        const validGender = guest.gender === "Prefer not to say" ? "Other" : guest.gender;
        restaurantGuestData.gender = validGender;
      }
    } catch (e) {
      // If these fail, continue without them
      console.log('Optional fields not supported:', e);
    }

    console.log('🎯 registerGuest: Creating with clean data:', restaurantGuestData);

    const newGuest = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      restaurantGuestData
    );

    console.log('✅ registerGuest: Success! New guest created:', newGuest);
    return parseStringify(newGuest);
  } catch (error) {
    console.error('❌ registerGuest: Failed to create guest:', error);
    console.error('❌ registerGuest: Error details:', {
      message: error?.message,
      code: error?.code,
      type: error?.type
    });
    return null;
  }
};

// GET GUEST
export const getGuest = async (userId: string) => {
  try {
    const guests = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    // Check if we have documents before accessing
    if (guests.documents && guests.documents.length > 0) {
      return parseStringify(guests.documents[0]);
    }
    return null;
  } catch (error) {
    console.error("An error occurred while retrieving the guest details:", error);
    return null;
  }
};

// Legacy aliases for backward compatibility
export const getPatient = getGuest;
export const registerPatient = registerGuest;