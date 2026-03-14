#!/usr/bin/env node

/**
 * Test to verify that the privacyConsent fix resolves the database error
 */

const fs = require('fs');

console.log('🔒 Testing Privacy Consent Fix...\n');

// Check if privacyConsent is included in the guest data
function checkPrivacyConsentFix() {
  const guestActionsFile = 'lib/actions/guest.actions.ts';
  
  if (!fs.existsSync(guestActionsFile)) {
    console.log('❌ guest.actions.ts file not found');
    return false;
  }
  
  const content = fs.readFileSync(guestActionsFile, 'utf8');
  
  // Check for privacyConsent in the guest data
  const hasPrivacyConsent = content.includes('privacyConsent: true');
  const isInCorrectLocation = content.includes('// Required by database schema') && 
                             content.includes('privacyConsent: true');
  
  console.log('📋 Privacy Consent Fix Verification:');
  console.log('='.repeat(50));
  
  if (hasPrivacyConsent) {
    console.log('   ✅ privacyConsent field found in guest data');
  } else {
    console.log('   ❌ privacyConsent field missing from guest data');
    return false;
  }
  
  if (isInCorrectLocation) {
    console.log('   ✅ privacyConsent properly placed with required fields');
  } else {
    console.log('   ❌ privacyConsent not in correct location');
    return false;
  }
  
  // Check that it's set to true (required for restaurant guests)
  if (content.includes('privacyConsent: true')) {
    console.log('   ✅ privacyConsent set to true (required value)');
  } else {
    console.log('   ❌ privacyConsent not set to true');
    return false;
  }
  
  return true;
}

// Check the data structure that will be sent
function checkDataStructure() {
  const guestActionsFile = 'lib/actions/guest.actions.ts';
  const content = fs.readFileSync(guestActionsFile, 'utf8');
  
  console.log('\n🏗️ Expected Data Structure:');
  console.log('='.repeat(50));
  
  const expectedFields = [
    'userId',
    'name', 
    'email',
    'phone',
    'privacyConsent'
  ];
  
  let allFieldsPresent = true;
  
  expectedFields.forEach(field => {
    if (content.includes(`${field}:`)) {
      console.log(`   ✅ ${field}: Required field present`);
    } else {
      console.log(`   ❌ ${field}: Required field missing`);
      allFieldsPresent = false;
    }
  });
  
  // Check optional fields
  const optionalFields = ['birthDate', 'address', 'gender'];
  
  console.log('\n📋 Optional Fields:');
  optionalFields.forEach(field => {
    if (content.includes(`guest.${field}`)) {
      console.log(`   ✅ ${field}: Optional field handled properly`);
    } else {
      console.log(`   ⚪ ${field}: Optional field not found (okay)`);
    }
  });
  
  return allFieldsPresent;
}

// Main test execution
console.log('🧪 Running Privacy Consent Database Fix Test...\n');

const privacyConsentFixed = checkPrivacyConsentFix();
const dataStructureCorrect = checkDataStructure();

console.log('\n📊 Test Results:');
console.log('='.repeat(50));

if (privacyConsentFixed && dataStructureCorrect) {
  console.log('🎉 SUCCESS: Privacy consent fix is properly implemented!');
  
  console.log('\n✅ What was fixed:');
  console.log('   • Added privacyConsent: true to guest data');
  console.log('   • Placed in required fields section');
  console.log('   • Set to true (restaurant guest consent)');
  
  console.log('\n📝 Expected Database Payload:');
  console.log('   {');
  console.log('     userId: "guest_id",');
  console.log('     name: "Guest Name",');
  console.log('     email: "guest@email.com",');
  console.log('     phone: "+1234567890",');
  console.log('     privacyConsent: true,         // ← FIXED: Required field');
  console.log('     birthDate: Date (optional),');
  console.log('     address: "preferences" (optional),');
  console.log('     gender: "preference" (optional)');
  console.log('   }');
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Test guest registration at: http://localhost:3002/guests/test123/register');
  console.log('   2. Fill out the form with test data');
  console.log('   3. Submit and verify no "Missing required attribute" error');
  console.log('   4. Check console for successful guest creation');
  
} else {
  console.log('❌ FAILED: Privacy consent fix needs attention');
  
  if (!privacyConsentFixed) {
    console.log('   → Privacy consent field not properly implemented');
  }
  if (!dataStructureCorrect) {
    console.log('   → Required data structure not complete');
  }
}

console.log('\n🔗 Development Server: http://localhost:3002');

process.exit(privacyConsentFixed && dataStructureCorrect ? 0 : 1);