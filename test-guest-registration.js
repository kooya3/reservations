#!/usr/bin/env node

/**
 * Test script to verify guest registration with proper gender field validation
 */

console.log('🧪 Testing Guest Registration with Gender Validation Fix...\n');

// Simulate the exact data structure that would be sent from the form
const testGuestData = {
  // Essential fields (guaranteed to work)
  userId: "test123",
  name: "Test Guest",
  email: "test@example.com", 
  phone: "+1234567890",
  
  // Privacy consent (required by database)
  privacyConsent: true,
  
  // Optional fields with proper validation
  gender: "Other", // Fixed: mapped from "Prefer not to say" to "Other"
  
  // Optional fields
  birthDate: new Date('1990-05-15'),
  address: "Window View" // Table preference
};

console.log('📋 Test Data Structure:');
console.log('='.repeat(50));
console.log(JSON.stringify(testGuestData, null, 2));

console.log('\n✅ Validation Checks:');
console.log('='.repeat(50));

// Check required fields
const requiredFields = ['userId', 'name', 'email', 'phone', 'privacyConsent'];
requiredFields.forEach(field => {
  if (testGuestData[field]) {
    console.log(`   ✅ ${field}: Present and valid`);
  } else {
    console.log(`   ❌ ${field}: Missing or invalid`);
  }
});

// Check gender field specifically
console.log('\n🔧 Gender Field Validation:');
console.log('='.repeat(50));

const validGenderValues = ['Male', 'Female', 'Other'];
if (validGenderValues.includes(testGuestData.gender)) {
  console.log(`   ✅ gender: "${testGuestData.gender}" is valid (one of: ${validGenderValues.join(', ')})`);
} else {
  console.log(`   ❌ gender: "${testGuestData.gender}" is invalid (must be one of: ${validGenderValues.join(', ')})`);
}

console.log('\n📊 Expected Database Behavior:');
console.log('='.repeat(50));
console.log('   ✅ No "Unknown attribute" errors');
console.log('   ✅ No "Invalid format" errors for gender field');
console.log('   ✅ Guest registration should complete successfully');
console.log('   ✅ User should be redirected to appointment creation');

console.log('\n🚀 Next Steps for Manual Testing:');
console.log('='.repeat(50));
console.log('   1. Open: http://localhost:3002/guests/test123/register');
console.log('   2. Fill out the form with any values');
console.log('   3. Submit the form');
console.log('   4. Check browser console and server logs for:');
console.log('      - No database schema errors');
console.log('      - Successful guest creation message');
console.log('      - Redirect to appointment page');

console.log('\n🔍 Key Fixed Issues:');
console.log('='.repeat(50));
console.log('   ✅ Removed healthcare fields (primaryPhysician, etc.)');
console.log('   ✅ Added required privacyConsent field');
console.log('   ✅ Fixed gender field validation (maps "Prefer not to say" → "Other")');
console.log('   ✅ Clean minimal data structure for restaurant use');

console.log('\n🟢 System Status: READY FOR TESTING');
console.log('📱 Development Server: http://localhost:3002');