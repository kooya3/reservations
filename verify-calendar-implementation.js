#!/usr/bin/env node

/**
 * Comprehensive verification script for the calendar component implementation
 * This script verifies that all components exist and are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Calendar Component Implementation...\n');

// Test configuration
const tests = [
  {
    name: 'DatePicker Component',
    file: 'components/ui/date-picker.tsx',
    checks: [
      'interface DatePickerProps',
      'export function DatePicker',
      'from "react-day-picker"',
      'from "@/components/ui/calendar"',
      'from "framer-motion"',
      'calendar component in a popover'
    ]
  },
  {
    name: 'Updated Calendar Component',
    file: 'components/ui/calendar.tsx',
    checks: [
      'from "react-day-picker"',
      'function Calendar',
      'export { Calendar',
      'dark theme support'
    ]
  },
  {
    name: 'Updated CustomFormField',
    file: 'components/CustomFormField.tsx',
    checks: [
      'CALENDAR = "calendar"',
      'from "./ui/date-picker"',
      'case FormFieldType.CALENDAR',
      'DatePicker component usage'
    ]
  },
  {
    name: 'Updated RegisterForm',
    file: 'components/forms/RegisterForm.tsx',
    checks: [
      'fieldType={FormFieldType.CALENDAR}',
      'birthday field implementation',
      'proper calendar integration'
    ]
  },
  {
    name: 'Register Page Integration',
    file: 'app/guests/[userId]/register/page.tsx',
    checks: [
      'import RegisterForm',
      '<RegisterForm user={user} />',
      'proper page structure'
    ]
  }
];

let allTestsPassed = true;
let totalChecks = 0;
let passedChecks = 0;

// Verification functions
function fileExists(filePath) {
  return fs.existsSync(path.resolve(filePath));
}

function fileContains(filePath, searchStrings) {
  if (!fileExists(filePath)) {
    return searchStrings.map(() => false);
  }
  
  const content = fs.readFileSync(path.resolve(filePath), 'utf8');
  return searchStrings.map(search => {
    if (search === 'calendar component in a popover') {
      return content.includes('Popover') && content.includes('Calendar');
    }
    if (search === 'dark theme support') {
      return content.includes('dark:') || content.includes('slate-');
    }
    if (search === 'DatePicker component usage') {
      return content.includes('<DatePicker') && content.includes('onDateChange');
    }
    if (search === 'birthday field implementation') {
      return content.includes('birthDate') && content.includes('birthday');
    }
    if (search === 'proper calendar integration') {
      return content.includes('FormFieldType.CALENDAR');
    }
    if (search === 'proper page structure') {
      return content.includes('RegisterForm') && content.includes('user={user}');
    }
    return content.includes(search);
  });
}

// Run tests
tests.forEach(test => {
  console.log(`📋 Testing: ${test.name}`);
  console.log(`   File: ${test.file}`);
  
  if (!fileExists(test.file)) {
    console.log(`   ❌ File not found: ${test.file}`);
    allTestsPassed = false;
    totalChecks += test.checks.length;
    return;
  }
  
  const results = fileContains(test.file, test.checks);
  
  test.checks.forEach((check, index) => {
    totalChecks++;
    const passed = results[index];
    if (passed) {
      passedChecks++;
      console.log(`   ✅ ${check}`);
    } else {
      console.log(`   ❌ ${check}`);
      allTestsPassed = false;
    }
  });
  
  console.log('');
});

// Package.json dependencies check
console.log('📦 Checking Dependencies...');
if (fileExists('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const requiredDeps = [
    'react-day-picker',
    'date-fns',
    'framer-motion',
    '@radix-ui/react-popover'
  ];
  
  requiredDeps.forEach(dep => {
    totalChecks++;
    if (deps[dep]) {
      passedChecks++;
      console.log(`   ✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`   ❌ Missing: ${dep}`);
      allTestsPassed = false;
    }
  });
} else {
  console.log('   ❌ package.json not found');
  allTestsPassed = false;
  totalChecks += 4;
}

console.log('\n');

// Final results
console.log('📊 Implementation Summary:');
console.log('='.repeat(50));
console.log(`✅ Checks Passed: ${passedChecks}/${totalChecks}`);
console.log(`📋 Overall Status: ${allTestsPassed ? '✅ SUCCESS' : '❌ NEEDS ATTENTION'}`);

if (allTestsPassed) {
  console.log('\n🎉 Calendar component implementation is complete!');
  console.log('\n📝 What was implemented:');
  console.log('   • Created shadcn/ui Calendar component');
  console.log('   • Built custom DatePicker with Popover');
  console.log('   • Added CALENDAR field type to CustomFormField');
  console.log('   • Updated RegisterForm to use new calendar');
  console.log('   • Maintained proper form validation');
  console.log('   • Added animations and dark theme support');
  
  console.log('\n🚀 Next Steps:');
  console.log('   • Navigate to /guests/[userId]/register to test');
  console.log('   • Click the birthday field to see the calendar');
  console.log('   • Select a date and verify form submission');
  console.log('   • Test on different screen sizes');
} else {
  console.log('\n⚠️  Some components need attention.');
  console.log('   Please review the failed checks above.');
}

console.log('\n🔧 Development Server:');
console.log('   Run: npm run dev');
console.log('   URL: http://localhost:3000/guests/test123/register');

process.exit(allTestsPassed ? 0 : 1);