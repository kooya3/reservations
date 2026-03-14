"use server";

import { Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";
import { extractPartySize } from "../export-utils";

// Calculate guest repeat rate and loyalty metrics
const calculateGuestRepeatRate = (reservations: any[]) => {
  try {
    // Group reservations by guest email
    const guestMap = new Map<string, {
      name: string;
      email: string;
      visits: number;
      lastVisit: Date;
      occasions: string[];
    }>();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Process all confirmed/scheduled reservations
    const validReservations = reservations.filter(r => 
      r.status === ('scheduled' as any) || r.status === ('confirmed' as any)
    );

    validReservations.forEach(reservation => {
      const email = reservation.patient.email.toLowerCase();
      const visitDate = new Date(reservation.schedule);
      
      // No spending calculations until payment integration is complete

      if (guestMap.has(email)) {
        const guest = guestMap.get(email)!;
        guest.visits++;
        guest.lastVisit = visitDate > guest.lastVisit ? visitDate : guest.lastVisit;
        if (reservation.reason && !guest.occasions.includes(reservation.reason)) {
          guest.occasions.push(reservation.reason);
        }
      } else {
        guestMap.set(email, {
          name: reservation.patient.name,
          email,
          visits: 1,
          lastVisit: visitDate,
          occasions: reservation.reason ? [reservation.reason] : []
        });
      }
    });

    // Calculate metrics
    const totalGuests = guestMap.size;
    const repeatGuests = Array.from(guestMap.values()).filter(guest => guest.visits > 1);
    const repeatRate = totalGuests > 0 ? ((repeatGuests.length / totalGuests) * 100).toFixed(1) : "0";

    // Today's guest breakdown
    const todaysReservations = validReservations.filter(r => {
      const schedule = new Date(r.schedule);
      return schedule >= today && schedule < tomorrow;
    });

    const todaysGuestEmails = new Set(todaysReservations.map(r => r.patient.email.toLowerCase()));
    const newGuestsToday = Array.from(todaysGuestEmails).filter(email => {
      const guest = guestMap.get(email);
      return guest && guest.visits === 1;
    }).length;

    const returningGuestsToday = todaysGuestEmails.size - newGuestsToday;

    // Average visits per guest
    const totalVisits = Array.from(guestMap.values()).reduce((sum, guest) => sum + guest.visits, 0);
    const avgVisitsPerGuest = totalGuests > 0 ? (totalVisits / totalGuests).toFixed(1) : "1.0";

    // Top guests by visits (no spending data until payment integration)
    const topGuests = Array.from(guestMap.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)
      .map(guest => ({
        name: guest.name,
        visits: guest.visits,
        lastVisit: guest.lastVisit,
        occasions: guest.occasions
      }));

    return {
      repeatRate,
      newGuestsToday,
      returningGuestsToday,
      totalUniqueGuests: totalGuests,
      avgVisitsPerGuest,
      topGuests
    };
  } catch (error) {
    console.error("Error calculating guest repeat rate:", error);
    return {
      repeatRate: "0",
      newGuestsToday: 0,
      returningGuestsToday: 0,
      totalUniqueGuests: 0,
      avgVisitsPerGuest: "1.0",
      topGuests: []
    };
  }
};

// Get real-time analytics for the admin dashboard
export const getReservationAnalytics = async () => {
  try {
    // Get all appointments for analytics
    const allReservations = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.limit(500), Query.orderDesc("$createdAt")]
    );

    const documents = allReservations.documents as Appointment[];
    
    // Enrich reservations with extracted party size immediately
    const reservations = documents.map(r => ({
      ...r,
      partySize: extractPartySize(r.partySize, r.note),
      // Ensure we extract the number for calculations later
      partySizeNumber: parseInt(extractPartySize(r.partySize, r.note).match(/\d+/)?.[0] || "2")
    })) as any[];
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get last week's date range
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Filter today's reservations
    const todaysReservations = reservations.filter(r => {
      const schedule = new Date(r.schedule);
      return schedule >= today && schedule < tomorrow;
    });
    
    // Filter upcoming reservations (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingReservations = reservations.filter(r => {
      const schedule = new Date(r.schedule);
      return schedule >= today && schedule <= nextWeek;
    });
    
    // Filter this week's reservations (past week)
    const thisWeeksReservations = reservations.filter(r => {
      const schedule = new Date(r.schedule);
      return schedule >= lastWeek && schedule <= today;
    });
    
    // Calculate average party size - using enriched data
    const partySizes = reservations.map((r: any) => r.partySizeNumber);
    
    const avgPartySize = partySizes.length > 0 
      ? (partySizes.reduce((a: number, b: number) => a + b, 0) / partySizes.length).toFixed(1)
      : "2.0";
      
    console.log("📊 Analytics Debug - Party Sizes:", { 
      totalReservations: reservations.length,
      partySizes: partySizes.slice(0, 5),
      avgPartySize 
    });
    
    // Calculate party size change from last week
    const lastWeekSizes = thisWeeksReservations.map((r: any) => {
      return parseInt(extractPartySize(r.partySize, r.note).match(/\d+/)?.[0] || "2");
    });
    
    const lastWeekAvg = lastWeekSizes.length > 0 
      ? lastWeekSizes.reduce((a: number, b: number) => a + b, 0) / lastWeekSizes.length
      : 0;
    
    const currentAvg = parseFloat(avgPartySize);
    const partySizeChange = lastWeekAvg > 0 
      ? ((currentAvg - lastWeekAvg) / lastWeekAvg * 100).toFixed(0)
      : "0";
    
    // Find peak reservation time
    const timeSlots: { [key: string]: number } = {};
    todaysReservations.forEach((r: any) => {
      const schedule = new Date(r.schedule);
      const hour = schedule.getHours();
      const minutes = schedule.getMinutes() >= 30 ? "30" : "00";
      const timeSlot = `${hour}:${minutes}`;
      timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1;
    });
    
    let peakTime = "7:30 PM";
    let maxBookings = 0;
    Object.entries(timeSlots).forEach(([time, count]) => {
      if (count > maxBookings) {
        maxBookings = count;
        const [hour, minutes] = time.split(':');
        const h = parseInt(hour);
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
        peakTime = `${displayHour}:${minutes} ${period}`;
      }
    });
    
    // Enhanced revenue calculation with dynamic pricing
    const getRevenuePerPerson = (hour: number, occasion: string) => {
      let basePrice = 1500; // KSH 1,500 base per person
      
      // Time-based pricing
      if (hour >= 19 && hour <= 22) {
        basePrice *= 1.3; // 30% premium for dinner rush
      } else if (hour >= 12 && hour <= 14) {
        basePrice *= 1.1; // 10% premium for lunch
      }
      
      // Occasion-based pricing
      if (occasion && occasion !== 'Regular Dining') {
        basePrice *= 1.2; // 20% premium for special occasions
      }
      
      return basePrice;
    };

    const todaysRevenue = todaysReservations
      .filter((r: any) => r.status !== 'cancelled')
      .reduce((total: number, r: any) => {
        // Use enriched number
        const guests = r.partySizeNumber || 2;
        
        // Calculate dynamic pricing
        const reservationHour = new Date(r.schedule).getHours();
        const pricePerPerson = getRevenuePerPerson(reservationHour, r.reason);
        
        return total + (guests * pricePerPerson);
      }, 0);
      
    console.log("💰 Revenue Debug:", { 
      todaysActiveReservations: todaysReservations.filter((r: any) => r.status !== 'cancelled').length,
      todaysRevenue: todaysRevenue / 1000 + "K",
      baseRevenuePerPerson: 1500 
    });
    
    // Calculate yesterday's revenue for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaysReservations = reservations.filter((r: any) => {
      const schedule = new Date(r.schedule);
      return schedule >= yesterday && schedule < today;
    });
    
    const yesterdaysRevenue = yesterdaysReservations
      .filter((r: any) => r.status !== 'cancelled')
      .reduce((total: number, r: any) => {
        // Use enriched number
        const guests = r.partySizeNumber || 2;
        
        // Calculate dynamic pricing
        const reservationHour = new Date(r.schedule).getHours();
        const pricePerPerson = getRevenuePerPerson(reservationHour, r.reason);
        
        return total + (guests * pricePerPerson);
      }, 0);
    
    const revenueChange = yesterdaysRevenue > 0 
      ? ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue * 100).toFixed(0)
      : "0";
    
    // Count special requests
    const specialRequests = todaysReservations.filter((r: any) => 
      r.note && r.note.trim().length > 0
    ).length;
    
    // Count dietary restrictions and special occasions
    const dietaryCount = todaysReservations.filter((r: any) => 
      r.note && (
        r.note.toLowerCase().includes('vegan') ||
        r.note.toLowerCase().includes('vegetarian') ||
        r.note.toLowerCase().includes('gluten') ||
        r.note.toLowerCase().includes('allergy') ||
        r.note.toLowerCase().includes('dietary')
      )
    ).length;
    
    const occasionCount = todaysReservations.filter((r: any) => 
      r.reason && r.reason !== "Regular Dining"
    ).length;
    
    // Status breakdown for today
    const statusCounts = {
      confirmed: 0,
      pending: 0,
      cancelled: 0
    };
    
    todaysReservations.forEach((r: any) => {
      if (r.status === 'scheduled' || r.status === 'confirmed') {
        statusCounts.confirmed++;
      } else if (r.status === 'pending') {
        statusCounts.pending++;
      } else if (r.status === 'cancelled') {
        statusCounts.cancelled++;
      }
    });
    
    // Calculate occupancy rate
    const totalTables = 50; // Assuming 50 tables available
    const occupancyRate = ((statusCounts.confirmed / totalTables) * 100).toFixed(0);
    
    // Guest repeat rate analytics
    const guestAnalytics = calculateGuestRepeatRate(reservations);
    
    return parseStringify({
      avgPartySize,
      partySizeChange: partySizeChange !== "0" ? `${parseFloat(partySizeChange) > 0 ? '+' : ''}${partySizeChange}%` : "0%",
      peakTime,
      peakTimeBookings: maxBookings,
      todaysRevenue: todaysRevenue / 1000, // Convert to thousands
      revenueChange: revenueChange !== "0" ? `${parseFloat(revenueChange) > 0 ? '+' : ''}${revenueChange}%` : "0%",
      specialRequests,
      dietaryCount,
      occasionCount,
      todaysReservations: todaysReservations.length,
      confirmedCount: statusCounts.confirmed,
      pendingCount: statusCounts.pending,
      cancelledCount: statusCounts.cancelled,
      occupancyRate,
      recentReservations: upcomingReservations.slice(0, 10), // Show upcoming reservations
      allRecentReservations: reservations.slice(0, 20), // All reservations for admin view
      upcomingCount: upcomingReservations.length,
      // Guest analytics
      repeatGuestRate: guestAnalytics.repeatRate,
      newGuestsToday: guestAnalytics.newGuestsToday,
      returningGuestsToday: guestAnalytics.returningGuestsToday,
      totalUniqueGuests: guestAnalytics.totalUniqueGuests,
      avgVisitsPerGuest: guestAnalytics.avgVisitsPerGuest,
      topGuests: guestAnalytics.topGuests
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    // Return default values if there's an error
    return {
      avgPartySize: "0",
      partySizeChange: "0%",
      peakTime: "N/A",
      peakTimeBookings: 0,
      todaysRevenue: 0,
      revenueChange: "0%",
      specialRequests: 0,
      dietaryCount: 0,
      occasionCount: 0,
      todaysReservations: 0,
      confirmedCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
      occupancyRate: "0",
      recentReservations: [],
      allRecentReservations: [],
      upcomingCount: 0,
      // Guest analytics defaults
      repeatGuestRate: "0",
      newGuestsToday: 0,
      returningGuestsToday: 0,
      totalUniqueGuests: 0,
      avgVisitsPerGuest: "1.0",
      topGuests: []
    };
  }
};