"use client";

import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  X,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

interface FixedExportDataProps {
  data: any[];
  onExport?: () => void;
}

export const FixedExportData: React.FC<FixedExportDataProps> = ({ data, onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'patient.name',
    'patient.email', 
    'patient.phone',
    'schedule',
    'reason',
    'primaryPhysician',
    'status',
    'note'
  ]);

  const availableFields = [
    { key: 'patient.name', label: 'Guest Name' },
    { key: 'patient.email', label: 'Email' },
    { key: 'patient.phone', label: 'Phone' },
    { key: 'schedule', label: 'Date & Time' },
    { key: 'reason', label: 'Occasion' },
    { key: 'primaryPhysician', label: 'Welcome Drink' },
    { key: 'status', label: 'Status' },
    { key: 'note', label: 'Special Requests' },
    { key: '$createdAt', label: 'Created Date' },
  ];

  const getNestedValue = (obj: any, path: string) => {
    const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    
    if (path === 'schedule' && value) {
      return format(new Date(value), 'yyyy-MM-dd HH:mm');
    }
    
    if (path === 'note' && value) {
      // Clean special requests by removing party size info
      return value.replace(/Party Size: [^|]*\|?\s*/, '').trim() || 'None';
    }
    
    return String(value || '');
  };

  const exportToCSV = () => {
    const headers = selectedFields.map(field => 
      availableFields.find(f => f.key === field)?.label || field
    ).join(',');

    const rows = data.map(item => {
      return selectedFields.map(field => {
        const value = getNestedValue(item, field);
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

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
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

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 rounded-2xl border border-amber-500/20 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
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
              </div>
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
                <span className="text-white font-medium">{data.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-500">Selected Fields:</span>
                <span className="text-white font-medium">{selectedFields.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export {data.length} Records
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