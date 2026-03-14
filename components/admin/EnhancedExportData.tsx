"use client";

import React, { useState, useMemo } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  X,
  Check,
  ChevronDown,
  Users,
  BarChart3,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';

interface ReservationData {
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

interface ExportDataProps {
  data: ReservationData[];
  analytics?: {
    totalReservations: number;
    totalGuests: number;
    averagePartySize: number;
    popularOccasions: Array<{ name: string; count: number }>;
    popularDrinks: Array<{ name: string; count: number }>;
  };
  onExport?: () => void;
}

interface ExportProgress {
  step: 'preparing' | 'processing' | 'generating' | 'complete';
  progress: number;
  message: string;
}

export const EnhancedExportData: React.FC<ExportDataProps> = ({
  data,
  analytics,
  onExport
}) => {
  // Simple data extraction helper
  const extractPartySize = (partySize: string | number | undefined, note: string | undefined): string => {
    if (typeof partySize === 'number') return `${partySize} Guests`;
    if (partySize && partySize.trim()) return partySize;
    if (!note) return '2 Guests';

    const match = note.match(/Party Size: (\d+)/);
    return match ? `${match[1]} Guests` : '2 Guests';
  };
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json' | 'pdf'>('csv');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'patient.name',
    'patient.email',
    'patient.phone',
    'schedule',
    'partySize',
    'reason',
    'primaryPhysician',
    'status',
    'note',
    '$createdAt'
  ]);

  const availableFields = [
    { key: 'patient.name', label: 'Guest Name', category: 'Guest Info' },
    { key: 'patient.email', label: 'Email Address', category: 'Guest Info' },
    { key: 'patient.phone', label: 'Phone Number', category: 'Guest Info' },
    { key: 'patient.address', label: 'Seating Preference', category: 'Guest Info' },
    { key: 'schedule', label: 'Reservation Date & Time', category: 'Reservation' },
    { key: 'partySize', label: 'Party Size', category: 'Reservation' },
    { key: 'reason', label: 'Occasion', category: 'Reservation' },
    { key: 'primaryPhysician', label: 'Welcome Drink', category: 'Reservation' },
    { key: 'status', label: 'Status', category: 'Reservation' },
    { key: 'note', label: 'Special Requests', category: 'Reservation' },
    { key: '$createdAt', label: 'Created Date', category: 'System' },
    { key: '$id', label: 'Reservation ID', category: 'System' },
  ];

  const fieldsByCategory = useMemo(() => {
    return availableFields.reduce((acc, field) => {
      if (!acc[field.category]) acc[field.category] = [];
      acc[field.category].push(field);
      return acc;
    }, {} as Record<string, typeof availableFields>);
  }, []);

  const filteredData = useMemo(() => {
    const now = new Date();
    let filtered = [...data];

    // Date filtering
    switch (dateRange) {
      case 'today':
        filtered = data.filter(item => {
          const itemDate = new Date(item.schedule);
          return itemDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        filtered = data.filter(item => {
          const itemDate = new Date(item.schedule);
          return itemDate >= weekStart && itemDate <= weekEnd;
        });
        break;
      case 'month':
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filtered = data.filter(item => {
          const itemDate = new Date(item.schedule);
          return itemDate >= monthStart && itemDate <= monthEnd;
        });
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          filtered = data.filter(item => {
            const itemDate = new Date(item.schedule);
            return itemDate >= new Date(customStartDate) && itemDate <= new Date(customEndDate);
          });
        }
        break;
    }

    return filtered;
  }, [data, dateRange, customStartDate, customEndDate]);

  const getNestedValue = (obj: any, path: string): string => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);

    // Enhanced data extraction
    if (path === 'partySize') {
      return extractPartySize(value, obj.note);
    }

    if (path === 'note' && value) {
      // Clean special requests by removing party size
      return value.replace(/Party Size: [^|]*\|?\s*/, '').trim() || 'None';
    }

    if (path === 'schedule' && value) {
      return format(new Date(value), 'yyyy-MM-dd HH:mm');
    }

    if (path === '$createdAt' && value) {
      return format(new Date(value), 'yyyy-MM-dd HH:mm');
    }

    return String(value || '');
  };

  const generateAnalyticsData = () => {
    if (!analytics || !includeAnalytics) return [];

    return [
      ['=== RESERVATION ANALYTICS ==='],
      ['Total Reservations', analytics.totalReservations],
      ['Total Guests', analytics.totalGuests],
      ['Average Party Size', analytics.averagePartySize.toFixed(1)],
      [''],
      ['=== POPULAR OCCASIONS ==='],
      ...analytics.popularOccasions.map(item => [item.name, item.count]),
      [''],
      ['=== POPULAR DRINKS ==='],
      ...analytics.popularDrinks.map(item => [item.name, item.count]),
      [''],
      ['=== RESERVATION DATA ===']
    ];
  };

  const showProgress = (step: ExportProgress['step'], progress: number, message: string) => {
    setExportProgress({ step, progress, message });
  };

  const exportToCSV = async () => {
    showProgress('preparing', 10, 'Preparing CSV export...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

      showProgress('processing', 30, 'Processing reservation data...');

      // Create CSV content
      const headers = selectedFields.map(field =>
        availableFields.find(f => f.key === field)?.label || field
      );

      let csvContent = '';

      // Add analytics if enabled
      if (includeAnalytics && analytics) {
        const analyticsRows = generateAnalyticsData();
        csvContent += analyticsRows.map(row =>
          Array.isArray(row) ? row.join(',') : row
        ).join('\n') + '\n\n';
      }

      showProgress('generating', 60, 'Generating CSV file...');

      // Add data headers and rows
      csvContent += headers.join(',') + '\n';

      const rows = filteredData.map(item => {
        return selectedFields.map(field => {
          const value = getNestedValue(item, field);
          const stringValue = String(value);
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',');
      }).join('\n');

      csvContent += rows;

      showProgress('complete', 90, 'Downloading file...');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showProgress('complete', 100, 'Export complete!');
      setTimeout(() => {
        setExportProgress(null);
        setIsOpen(false);
        onExport?.();
      }, 1500);

    } catch (error) {
      console.error('CSV Export failed:', error);
      setExportProgress(null);
    }
  };

  const exportToExcel = async () => {
    showProgress('preparing', 10, 'Preparing Excel export...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      showProgress('processing', 30, 'Processing data for Excel...');

      // Enhanced Excel export with proper styling
      let html = `
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .header { background-color: #f59e0b; color: white; font-weight: bold; padding: 8px; }
            .analytics-header { background-color: #6366f1; color: white; font-weight: bold; padding: 6px; }
            .data-row { padding: 5px; border: 1px solid #ddd; }
            .analytics-row { background-color: #f8f9fa; padding: 4px; }
          </style>
        </head>
        <body>
      `;

      // Add analytics table if enabled
      if (includeAnalytics && analytics) {
        html += '<h2>Reservation Analytics</h2><table border="1">';
        const analyticsData = generateAnalyticsData();
        analyticsData.forEach(row => {
          if (Array.isArray(row)) {
            html += '<tr>';
            row.forEach(cell => {
              html += `<td class="analytics-row">${cell}</td>`;
            });
            html += '</tr>';
          } else {
            html += `<tr><td colspan="2" class="analytics-header">${row}</td></tr>`;
          }
        });
        html += '</table><br><br>';
      }

      showProgress('generating', 60, 'Creating Excel workbook...');

      // Add main data table
      html += '<h2>Reservation Data</h2><table border="1">';

      // Headers
      html += '<tr>';
      selectedFields.forEach(field => {
        const label = availableFields.find(f => f.key === field)?.label || field;
        html += `<th class="header">${label}</th>`;
      });
      html += '</tr>';

      // Data rows
      filteredData.forEach(item => {
        html += '<tr>';
        selectedFields.forEach(field => {
          const value = getNestedValue(item, field);
          html += `<td class="data-row">${value}</td>`;
        });
        html += '</tr>';
      });

      html += '</table></body></html>';

      showProgress('complete', 90, 'Downloading Excel file...');

      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xls`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showProgress('complete', 100, 'Export complete!');
      setTimeout(() => {
        setExportProgress(null);
        setIsOpen(false);
        onExport?.();
      }, 1500);

    } catch (error) {
      console.error('Excel Export failed:', error);
      setExportProgress(null);
    }
  };

  const exportToJSON = async () => {
    showProgress('preparing', 10, 'Preparing JSON export...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      showProgress('processing', 40, 'Structuring JSON data...');

      const exportData: any = {
        exportInfo: {
          generatedAt: new Date().toISOString(),
          totalRecords: filteredData.length,
          dateRange,
          selectedFields: selectedFields.length
        }
      };

      // Add analytics if enabled
      if (includeAnalytics && analytics) {
        exportData.analytics = analytics;
      }

      showProgress('generating', 70, 'Creating JSON structure...');

      // Add reservation data
      exportData.reservations = filteredData.map(item => {
        const obj: any = {};
        selectedFields.forEach(field => {
          const value = getNestedValue(item, field);
          const key = availableFields.find(f => f.key === field)?.label || field;
          obj[key] = value;
        });
        return obj;
      });

      showProgress('complete', 90, 'Downloading JSON file...');

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showProgress('complete', 100, 'Export complete!');
      setTimeout(() => {
        setExportProgress(null);
        setIsOpen(false);
        onExport?.();
      }, 1500);

    } catch (error) {
      console.error('JSON Export failed:', error);
      setExportProgress(null);
    }
  };

  const handleExport = () => {
    console.log('🚀 Export button clicked!', {
      selectedFieldsCount: selectedFields.length,
      filteredDataCount: filteredData.length,
      exportFormat,
      exportProgress
    });

    switch (exportFormat) {
      case 'csv':
        exportToCSV();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'json':
        exportToJSON();
        break;
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const selectAllInCategory = (category: string) => {
    const categoryFields = fieldsByCategory[category].map(f => f.key);
    const allSelected = categoryFields.every(field => selectedFields.includes(field));

    if (allSelected) {
      setSelectedFields(prev => prev.filter(field => !categoryFields.includes(field)));
    } else {
      setSelectedFields(prev => {
        const combined = [...prev, ...categoryFields];
        return combined.filter((item, index) => combined.indexOf(item) === index);
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-2 backdrop-blur-sm"
      >
        <Download className="w-4 h-4" />
        Export Data
      </button>

      {/* Enhanced Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-amber-500/20 p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            {/* Progress Overlay */}
            {exportProgress && (
              <div className="absolute inset-0 bg-slate-900/95 rounded-2xl flex items-center justify-center z-10">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4">
                    {exportProgress.step === 'complete' ? (
                      <CheckCircle className="w-16 h-16 text-green-500" />
                    ) : (
                      <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                    )}
                  </div>

                  <div className="w-64 bg-slate-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.progress}%` }}
                    />
                  </div>

                  <p className="text-white font-medium mb-2">{exportProgress.message}</p>
                  <p className="text-slate-400 text-sm">{exportProgress.progress}% complete</p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Export Reservation Data</h3>
                <p className="text-slate-400 text-sm">Download your reservation data in multiple formats</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Export Options */}
              <div className="lg:col-span-2 space-y-6">
                {/* Export Format */}
                <div>
                  <label className="text-sm text-gray-400 mb-3 block font-medium">Export Format</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['csv', 'excel', 'json'] as const).map(format => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={`p-3 rounded-lg border transition-all ${exportFormat === format
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                      >
                        {format === 'csv' && <FileText className="w-5 h-5 mx-auto mb-1" />}
                        {format === 'excel' && <FileSpreadsheet className="w-5 h-5 mx-auto mb-1" />}
                        {format === 'json' && <FileText className="w-5 h-5 mx-auto mb-1" />}
                        <span className="text-xs font-medium">{format.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-3 block font-medium">Date Range Filter</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {(['all', 'today', 'week', 'month', 'custom'] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-3 py-2 rounded-lg border transition-all text-sm ${dateRange === range
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>

                  {dateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">End Date</label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Analytics Option */}
                {analytics && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${includeAnalytics ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                        }`}>
                        {includeAnalytics && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <span className="text-white font-medium">Include Analytics Summary</span>
                        <p className="text-blue-300 text-sm">Add reservation statistics and insights to export</p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Field Selection */}
                <div>
                  <label className="text-sm text-gray-400 mb-3 block font-medium">Select Fields to Export</label>
                  <div className="space-y-4">
                    {Object.entries(fieldsByCategory).map(([category, fields]) => (
                      <div key={category} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium text-sm">{category}</h4>
                          <button
                            onClick={() => selectAllInCategory(category)}
                            className="text-xs text-amber-400 hover:text-amber-300"
                          >
                            {fields.every(field => selectedFields.includes(field.key)) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {fields.map(field => (
                            <button
                              key={field.key}
                              onClick={() => toggleField(field.key)}
                              className={`px-3 py-2 rounded-lg border transition-all text-sm text-left flex items-center gap-2 ${selectedFields.includes(field.key)
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                            >
                              <div className={`w-4 h-4 rounded border ${selectedFields.includes(field.key)
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-gray-500'
                                }`}>
                                {selectedFields.includes(field.key) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              {field.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Summary & Actions */}
              <div className="space-y-6">
                {/* Export Summary */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    Export Summary
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Records:</span>
                      <span className="text-white font-medium">{filteredData.length.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Selected Fields:</span>
                      <span className="text-white font-medium">{selectedFields.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Format:</span>
                      <span className="text-white font-medium">{exportFormat.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Date Range:</span>
                      <span className="text-white font-medium capitalize">{dateRange}</span>
                    </div>
                    {includeAnalytics && analytics && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Analytics:</span>
                        <span className="text-blue-400 font-medium">Included</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h4 className="text-amber-400 font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Quick Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-200">Pending:</span>
                      <span className="text-white">{filteredData.filter(r => r.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-200">Confirmed:</span>
                      <span className="text-white">{filteredData.filter(r => r.status === 'scheduled').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-200">Cancelled:</span>
                      <span className="text-white">{filteredData.filter(r => r.status === 'cancelled').length}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleExport}
                    disabled={false}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export {filteredData.length.toLocaleString()} Records
                  </button>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};