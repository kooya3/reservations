import { format } from 'date-fns';

export interface ExportField {
  key: string;
  label: string;
  category: string;
}

export interface ReservationExportData {
  $id: string;
  $createdAt: string;
  schedule: string;
  status: string;
  reason: string;
  primaryPhysician: string;
  note: string;
  partySize: string | number;
  patient: {
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

export const extractPartySize = (partySize: string | number | undefined, note: string | undefined): string => {
  if (typeof partySize === 'number') return `${partySize} Guests`;
  if (partySize && partySize.trim()) return partySize;
  if (!note) return '2 Guests';
  
  const match = note.match(/Party Size: (\d+)/);
  return match ? `${match[1]} Guests` : '2 Guests';
};

export const extractSpecialRequests = (note: string | undefined): string => {
  if (!note) return 'None';
  const cleaned = note.replace(/Party Size: [^|]*\|?\s*/, '').trim();
  return cleaned || 'None';
};

export const formatReservationDateTime = (dateTime: string): string => {
  try {
    return format(new Date(dateTime), 'yyyy-MM-dd HH:mm');
  } catch {
    return dateTime;
  }
};

export const getExportFilename = (exportFormat: string, prefix = 'reservations'): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  const extension = exportFormat === 'excel' ? 'xls' : exportFormat;
  return `${prefix}_${timestamp}.${extension}`;
};

export const calculateExportStats = (data: ReservationExportData[]) => {
  const stats = {
    totalReservations: data.length,
    totalGuests: 0,
    averagePartySize: 0,
    statusBreakdown: {
      pending: 0,
      scheduled: 0,
      cancelled: 0
    },
    popularOccasions: new Map<string, number>(),
    popularDrinks: new Map<string, number>()
  };

  data.forEach(reservation => {
    // Calculate total guests
    const partySize = extractPartySize(reservation.partySize, reservation.note);
    const guestCount = parseInt(partySize.match(/\d+/)?.[0] || '2');
    stats.totalGuests += guestCount;

    // Status breakdown
    if (reservation.status in stats.statusBreakdown) {
      stats.statusBreakdown[reservation.status as keyof typeof stats.statusBreakdown]++;
    }

    // Popular occasions
    if (reservation.reason) {
      const count = stats.popularOccasions.get(reservation.reason) || 0;
      stats.popularOccasions.set(reservation.reason, count + 1);
    }

    // Popular drinks
    if (reservation.primaryPhysician) {
      const count = stats.popularDrinks.get(reservation.primaryPhysician) || 0;
      stats.popularDrinks.set(reservation.primaryPhysician, count + 1);
    }
  });

  // Calculate average party size
  stats.averagePartySize = stats.totalReservations > 0 ? stats.totalGuests / stats.totalReservations : 0;

  return {
    ...stats,
    popularOccasions: Array.from(stats.popularOccasions.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count })),
    popularDrinks: Array.from(stats.popularDrinks.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  };
};

export const validateExportData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('No data available for export');
    return { isValid: false, errors };
  }

  // Check if data has required fields
  const requiredFields = ['$id', 'schedule', 'status', 'patient'];
  const sampleItem = data[0];
  
  requiredFields.forEach(field => {
    if (!(field in sampleItem)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (sampleItem.patient && typeof sampleItem.patient !== 'object') {
    errors.push('Patient field must be an object');
  }

  return { isValid: errors.length === 0, errors };
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
};