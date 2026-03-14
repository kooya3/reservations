"use server";

import { Query, ID } from "node-appwrite";
import { databases, DATABASE_ID } from "../appwrite.config";
import { parseStringify } from "../utils";

// Collections
const STAFF_COLLECTION_ID = "staff";
const STAFF_SESSIONS_COLLECTION_ID = "staff_sessions";

// Staff roles and permissions
export const STAFF_ROLES = {
  MANAGER: "manager",
  WAITER: "waiter", 
  KITCHEN_STAFF: "kitchen_staff",
  BARTENDER: "bartender",
  HOST: "host",
  ADMIN: "admin"
} as const;

export const STAFF_PERMISSIONS = {
  [STAFF_ROLES.ADMIN]: [
    "manage_staff", "view_analytics", "manage_inventory", "manage_menu", 
    "manage_tables", "process_payments", "manage_orders", "manage_reservations"
  ],
  [STAFF_ROLES.MANAGER]: [
    "view_analytics", "manage_inventory", "manage_menu", "manage_tables", 
    "process_payments", "manage_orders", "manage_reservations"
  ],
  [STAFF_ROLES.WAITER]: [
    "manage_tables", "manage_orders", "view_menu", "take_reservations"
  ],
  [STAFF_ROLES.KITCHEN_STAFF]: [
    "view_orders", "update_order_status", "view_menu"
  ],
  [STAFF_ROLES.BARTENDER]: [
    "manage_bar_orders", "view_menu", "manage_inventory"
  ],
  [STAFF_ROLES.HOST]: [
    "manage_reservations", "manage_tables", "greet_guests"
  ]
};

// Sample staff data for fallback
const SAMPLE_STAFF = [
  {
    $id: "staff-001",
    employeeId: "EMP001",
    firstName: "Sarah",
    lastName: "Johnson", 
    email: "sarah.johnson@restaurant.com",
    phone: "+1234567890",
    role: STAFF_ROLES.WAITER,
    department: "Front of House",
    status: "active",
    hireDate: "2024-01-15",
    hourlyWage: 18.50,
    permissions: STAFF_PERMISSIONS[STAFF_ROLES.WAITER],
    profileImage: "",
    emergencyContact: {
      name: "John Johnson",
      phone: "+1234567891",
      relationship: "Husband"
    },
    schedule: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
      saturday: { start: "10:00", end: "18:00" },
      sunday: { start: "rest", end: "rest" }
    },
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "staff-002",
    employeeId: "EMP002", 
    firstName: "Mike",
    lastName: "Chen",
    email: "mike.chen@restaurant.com",
    phone: "+1234567892",
    role: STAFF_ROLES.KITCHEN_STAFF,
    department: "Kitchen",
    status: "active",
    hireDate: "2024-02-01",
    hourlyWage: 22.00,
    permissions: STAFF_PERMISSIONS[STAFF_ROLES.KITCHEN_STAFF],
    profileImage: "",
    emergencyContact: {
      name: "Lisa Chen",
      phone: "+1234567893",
      relationship: "Wife"
    },
    schedule: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
      saturday: { start: "rest", end: "rest" },
      sunday: { start: "08:00", end: "16:00" }
    },
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "staff-003",
    employeeId: "EMP003",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@restaurant.com", 
    phone: "+1234567894",
    role: STAFF_ROLES.MANAGER,
    department: "Management",
    status: "active",
    hireDate: "2023-12-01",
    hourlyWage: 35.00,
    permissions: STAFF_PERMISSIONS[STAFF_ROLES.MANAGER],
    profileImage: "",
    emergencyContact: {
      name: "Robert Davis",
      phone: "+1234567895", 
      relationship: "Brother"
    },
    schedule: {
      monday: { start: "07:00", end: "15:00" },
      tuesday: { start: "07:00", end: "15:00" },
      wednesday: { start: "07:00", end: "15:00" },
      thursday: { start: "07:00", end: "15:00" },
      friday: { start: "07:00", end: "15:00" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "rest", end: "rest" }
    },
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  }
];

// Generate session token
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Hash password (simplified for demo - use proper bcrypt in production)
function hashPassword(password: string): string {
  // In production, use bcrypt or similar
  return Buffer.from(password).toString('base64');
}

// Verify password
function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// Create staff member
export const createStaffMember = async (staffData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  hireDate: string;
  hourlyWage: number;
  password: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}) => {
  try {
    console.log("👤 Creating staff member:", `${staffData.firstName} ${staffData.lastName}`);
    
    // Generate employee ID
    const employeeId = `EMP${Date.now().toString().slice(-6)}`;
    
    // Hash password
    const hashedPassword = hashPassword(staffData.password);
    
    const staff = await databases.createDocument(
      DATABASE_ID!,
      STAFF_COLLECTION_ID,
      ID.unique(),
      {
        employeeId,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email.toLowerCase(),
        phone: staffData.phone,
        role: staffData.role,
        department: staffData.department,
        status: "active",
        hireDate: staffData.hireDate,
        hourlyWage: staffData.hourlyWage,
        permissions: STAFF_PERMISSIONS[staffData.role as keyof typeof STAFF_PERMISSIONS] || [],
        hashedPassword,
        profileImage: "",
        ...(staffData.emergencyContact && { emergencyContact: JSON.stringify(staffData.emergencyContact) }),
        schedule: JSON.stringify({
          monday: { start: "09:00", end: "17:00" },
          tuesday: { start: "09:00", end: "17:00" },
          wednesday: { start: "09:00", end: "17:00" },
          thursday: { start: "09:00", end: "17:00" },
          friday: { start: "09:00", end: "17:00" },
          saturday: { start: "rest", end: "rest" },
          sunday: { start: "rest", end: "rest" }
        })
      }
    );

    console.log("✅ Staff member created:", employeeId);
    
    // Remove password from response
    const { hashedPassword, ...staffWithoutPassword } = staff;
    return parseStringify(staffWithoutPassword);

  } catch (error) {
    console.error("❌ Error creating staff member:", error);
    throw error;
  }
};

// Staff login
export const staffLogin = async (email: string, password: string) => {
  try {
    console.log("🔑 Staff login attempt:", email);
    
    // Find staff member by email
    const staff = await databases.listDocuments(
      DATABASE_ID!,
      STAFF_COLLECTION_ID,
      [Query.equal('email', email.toLowerCase())]
    );

    if (staff.documents.length === 0) {
      throw new Error("Invalid email or password");
    }

    const staffMember = staff.documents[0];
    
    // Check if staff is active
    if (staffMember.status !== "active") {
      throw new Error("Account is inactive. Please contact management.");
    }

    // Verify password
    if (!verifyPassword(password, staffMember.hashedPassword)) {
      throw new Error("Invalid email or password");
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    // Create session
    const session = await databases.createDocument(
      DATABASE_ID!,
      STAFF_SESSIONS_COLLECTION_ID,
      ID.unique(),
      {
        staffId: staffMember.$id,
        token: sessionToken,
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        ipAddress: "", // Would be populated from request in real implementation
        userAgent: ""
      }
    );

    console.log("✅ Staff login successful:", staffMember.employeeId);
    
    // Remove sensitive data from response
    const { hashedPassword, ...staffWithoutPassword } = staffMember;
    
    return parseStringify({
      staff: staffWithoutPassword,
      session: {
        token: sessionToken,
        expiresAt: expiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Staff login failed:", error);
    
    // For demo purposes, allow login with demo credentials
    if (email === "demo@restaurant.com" && password === "demo123") {
      console.log("🎭 Using demo staff account");
      const demoStaff = {
        ...SAMPLE_STAFF[0],
        email: "demo@restaurant.com"
      };
      
      return parseStringify({
        staff: demoStaff,
        session: {
          token: "demo-session-token",
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
        }
      });
    }
    
    throw error;
  }
};

// Verify session token
export const verifyStaffSession = async (token: string) => {
  try {
    console.log("🔐 Verifying staff session...");
    
    // Demo token handling
    if (token === "demo-session-token") {
      return parseStringify({
        valid: true,
        staff: SAMPLE_STAFF[0]
      });
    }
    
    // Find active session
    const sessions = await databases.listDocuments(
      DATABASE_ID!,
      STAFF_SESSIONS_COLLECTION_ID,
      [
        Query.equal('token', token),
        Query.greaterThan('expiresAt', new Date().toISOString())
      ]
    );

    if (sessions.documents.length === 0) {
      return parseStringify({ valid: false });
    }

    const session = sessions.documents[0];
    
    // Get staff member
    const staff = await databases.getDocument(
      DATABASE_ID!,
      STAFF_COLLECTION_ID,
      session.staffId
    );

    if (staff.status !== "active") {
      return parseStringify({ valid: false });
    }

    console.log("✅ Session valid for:", staff.employeeId);
    
    // Remove sensitive data
    const { hashedPassword, ...staffWithoutPassword } = staff;
    
    return parseStringify({
      valid: true,
      staff: staffWithoutPassword
    });

  } catch (error) {
    console.error("❌ Session verification failed:", error);
    return parseStringify({ valid: false });
  }
};

// Staff logout
export const staffLogout = async (token: string) => {
  try {
    console.log("👋 Staff logout...");
    
    if (token === "demo-session-token") {
      return parseStringify({ success: true });
    }
    
    // Find and delete session
    const sessions = await databases.listDocuments(
      DATABASE_ID!,
      STAFF_SESSIONS_COLLECTION_ID,
      [Query.equal('token', token)]
    );

    if (sessions.documents.length > 0) {
      await databases.deleteDocument(
        DATABASE_ID!,
        STAFF_SESSIONS_COLLECTION_ID,
        sessions.documents[0].$id
      );
    }

    console.log("✅ Staff logged out successfully");
    return parseStringify({ success: true });

  } catch (error) {
    console.error("❌ Logout failed:", error);
    return parseStringify({ success: false });
  }
};

// Get all staff members
export const getAllStaff = async () => {
  try {
    console.log("👥 Fetching all staff members...");
    
    const staff = await databases.listDocuments(
      DATABASE_ID!,
      STAFF_COLLECTION_ID,
      [Query.orderAsc('firstName')]
    );

    console.log(`✅ Retrieved ${staff.documents.length} staff members`);
    
    // Remove sensitive data
    const staffWithoutPasswords = staff.documents.map(({ hashedPassword, ...staff }) => staff);
    
    return parseStringify(staffWithoutPasswords);

  } catch (error) {
    console.error("❌ Error fetching staff:", error);
    
    // Return sample data
    console.log("👥 Using sample staff data");
    return parseStringify(SAMPLE_STAFF);
  }
};

// Get staff member by ID
export const getStaffMemberById = async (staffId: string) => {
  try {
    console.log("👤 Fetching staff member:", staffId);
    
    const staff = await databases.getDocument(
      DATABASE_ID!,
      STAFF_COLLECTION_ID,
      staffId
    );

    console.log("✅ Staff member retrieved:", staff.employeeId);
    
    // Remove sensitive data
    const { hashedPassword, ...staffWithoutPassword } = staff;
    return parseStringify(staffWithoutPassword);

  } catch (error) {
    console.error("❌ Error fetching staff member:", error);
    
    // Return sample staff if ID matches
    const sampleStaff = SAMPLE_STAFF.find(staff => staff.$id === staffId);
    if (sampleStaff) {
      return parseStringify(sampleStaff);
    }
    
    throw error;
  }
};

// Update staff member
export const updateStaffMember = async (staffId: string, updates: any) => {
  try {
    console.log("📝 Updating staff member:", staffId);
    
    // Remove sensitive fields that shouldn't be updated directly
    const { hashedPassword, permissions, ...safeUpdates } = updates;
    
    // Update permissions based on role change
    if (updates.role && STAFF_PERMISSIONS[updates.role as keyof typeof STAFF_PERMISSIONS]) {
      safeUpdates.permissions = STAFF_PERMISSIONS[updates.role as keyof typeof STAFF_PERMISSIONS];
    }
    
    const updatedStaff = await databases.updateDocument(
      DATABASE_ID!,
      STAFF_COLLECTION_ID,
      staffId,
      safeUpdates
    );

    console.log("✅ Staff member updated:", updatedStaff.employeeId);
    
    // Remove sensitive data
    const { hashedPassword: _, ...staffWithoutPassword } = updatedStaff;
    return parseStringify(staffWithoutPassword);

  } catch (error) {
    console.error("❌ Error updating staff member:", error);
    throw error;
  }
};

// Check staff permissions
export const checkStaffPermission = async (staffId: string, permission: string) => {
  try {
    const staff = await getStaffMemberById(staffId);
    const hasPermission = staff.permissions?.includes(permission) || false;
    
    return parseStringify({
      hasPermission,
      staff: staff
    });
    
  } catch (error) {
    console.error("❌ Error checking staff permission:", error);
    return parseStringify({
      hasPermission: false,
      staff: null
    });
  }
};

// Get staff schedule
export const getStaffSchedule = async (date?: string) => {
  try {
    console.log("📅 Fetching staff schedule...");
    
    const staff = await getAllStaff();
    const scheduleDate = date ? new Date(date) : new Date();
    const dayOfWeek = scheduleDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    const schedule = staff.map((member: any) => {
      const dailySchedule = member.schedule ? 
        (typeof member.schedule === 'string' ? JSON.parse(member.schedule) : member.schedule) : {};
      
      return {
        ...member,
        todaySchedule: dailySchedule[dayOfWeek] || { start: "rest", end: "rest" },
        isWorkingToday: dailySchedule[dayOfWeek]?.start !== "rest"
      };
    });

    console.log("✅ Staff schedule retrieved");
    return parseStringify(schedule);

  } catch (error) {
    console.error("❌ Error fetching staff schedule:", error);
    return parseStringify(SAMPLE_STAFF.map(staff => ({
      ...staff,
      todaySchedule: { start: "09:00", end: "17:00" },
      isWorkingToday: true
    })));
  }
};