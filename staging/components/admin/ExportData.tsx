"use client";

import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  Filter,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';

interface ExportDataProps {
  data: any[];
  onExport?: () => void;
}

export const ExportData: React.FC<ExportDataProps> = ({ data, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'guest.name',
    'guest.email',
    'guest.phone',
    'schedule',
    'reason',
    'status',
    'primaryPhysician',
    'note'
  ]);

  const availableFields = [
    { key: 'guest.name', label: 'Guest Name' },
    { key: 'guest.email', label: 'Email' },
    { key: 'guest.phone', label: 'Phone' },
    { key: 'schedule', label: 'Date & Time' },
    { key: 'reason', label: 'Occasion' },
    { key: 'status', label: 'Status' },
    { key: 'primaryPhysician', label: 'Welcome Drink' },
    { key: 'note', label: 'Special Requests' },
    { key: '$createdAt', label: 'Created Date' },
    { key: 'guest.address', label: 'Seating Preference' },
  ];

  const filterDataByDateRange = (data: any[]) => {
    const now = new Date();
    let filtered = [...data];

    switch (dateRange) {
      case 'today':
        filtered = data.filter(item => {
          const itemDate = new Date(item.schedule);
          return itemDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = data.filter(item => new Date(item.schedule) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = data.filter(item => new Date(item.schedule) >= monthAgo);
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
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const exportToCSV = () => {
    const filteredData = filterDataByDateRange(data);
    
    // Create CSV header
    const headers = selectedFields.map(field => 
      availableFields.find(f => f.key === field)?.label || field
    ).join(',');

    // Create CSV rows
    const rows = filteredData.map(item => {
      return selectedFields.map(field => {
        const value = getNestedValue(item, field);
        if (field === 'schedule' && value) {
          return format(new Date(value), 'yyyy-MM-dd HH:mm');
        }
        // Escape commas and quotes in CSV
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      }).join(',');
    }).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsOpen(false);
    onExport?.();
  };

  const exportToExcel = () => {
    const filteredData = filterDataByDateRange(data);
    
    // Create HTML table for Excel
    let html = '<html><head><meta charset="utf-8"></head><body><table border="1">';
    
    // Add headers
    html += '<tr>';
    selectedFields.forEach(field => {
      const label = availableFields.find(f => f.key === field)?.label || field;
      html += `<th style="background-color: #f59e0b; color: white; padding: 10px;">${label}</th>`;
    });
    html += '</tr>';
    
    // Add data rows
    filteredData.forEach(item => {
      html += '<tr>';
      selectedFields.forEach(field => {
        const value = getNestedValue(item, field);
        let displayValue = value || '';
        if (field === 'schedule' && value) {
          displayValue = format(new Date(value), 'yyyy-MM-dd HH:mm');
        }
        html += `<td style="padding: 5px;">${displayValue}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd')}.xls`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsOpen(false);
    onExport?.();
  };

  const exportToJSON = () => {
    const filteredData = filterDataByDateRange(data);
    
    const exportData = filteredData.map(item => {
      const obj: any = {};
      selectedFields.forEach(field => {
        const value = getNestedValue(item, field);
        const key = availableFields.find(f => f.key === field)?.label || field;
        obj[key] = value;
      });
      return obj;
    });
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsOpen(false);
    onExport?.();
  };

  const handleExport = () => {
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Data
      </button>

      {/* Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 rounded-2xl border border-amber-500/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Export Reservation Data</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Export Format */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-3 block">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-lg border transition-all ${
                    exportFormat === 'csv' 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">CSV</span>
                </button>
                <button
                  onClick={() => setExportFormat('excel')}
                  className={`p-3 rounded-lg border transition-all ${
                    exportFormat === 'excel' 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Excel</span>
                </button>
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-lg border transition-all ${
                    exportFormat === 'json' 
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <FileText className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">JSON</span>
                </button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-3 block">Date Range</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                      dateRange === range 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
              
              {dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              )}
            </div>

            {/* Field Selection */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-3 block">Select Fields to Export</label>
              <div className="grid grid-cols-2 gap-2">
                {availableFields.map(field => (
                  <button
                    key={field.key}
                    onClick={() => toggleField(field.key)}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm text-left flex items-center gap-2 ${
                      selectedFields.includes(field.key)
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border ${
                      selectedFields.includes(field.key)
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

            {/* Export Summary */}
            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400 mb-2">Export Summary</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Total Records:</span>
                <span className="text-white font-medium">{filterDataByDateRange(data).length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Selected Fields:</span>
                <span className="text-white font-medium">{selectedFields.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Format:</span>
                <span className="text-white font-medium">{exportFormat.toUpperCase()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export {filterDataByDateRange(data).length} Records
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};