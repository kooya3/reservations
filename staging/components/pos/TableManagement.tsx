"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Utensils,
  Sparkles,
  Settings,
  Plus,
  MapPin,
  Calendar,
  Phone,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableStatus, TableLocation, OrderStatus } from "@/types/pos.types";
import { getPOSTables, getTableStatistics, seatGuestsAtTable, clearTable, markTableCleaned } from "@/lib/actions/pos-table.actions";

interface TableManagementProps {
  staffRole: string;
  onSelectTable: (tableNumber: number) => void;
}

export const TableManagement: React.FC<TableManagementProps> = ({ 
  staffRole, 
  onSelectTable 
}) => {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableStats, setTableStats] = useState<any>({});

  useEffect(() => {
    loadTables();
    loadTableStats();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const fetchedTables = await getPOSTables(selectedLocation !== "all" ? selectedLocation : undefined);
      setTables(fetchedTables);
      console.log("✅ Tables loaded:", fetchedTables.length);
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTableStats = async () => {
    try {
      const stats = await getTableStatistics();
      setTableStats(stats);
    } catch (error) {
      console.error("Error loading table stats:", error);
    }
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case TableStatus.OCCUPIED:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case TableStatus.RESERVED:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case TableStatus.CLEANING:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case TableStatus.OUT_OF_ORDER:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case TableStatus.AVAILABLE:
        return <CheckCircle className="w-4 h-4" />;
      case TableStatus.OCCUPIED:
        return <Users className="w-4 h-4" />;
      case TableStatus.RESERVED:
        return <Calendar className="w-4 h-4" />;
      case TableStatus.CLEANING:
        return <Sparkles className="w-4 h-4" />;
      case TableStatus.OUT_OF_ORDER:
        return <Settings className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getLocationColor = (location: TableLocation) => {
    const colors = {
      [TableLocation.INDOOR]: "bg-slate-600",
      [TableLocation.OUTDOOR]: "bg-green-600",
      [TableLocation.BAR]: "bg-purple-600",
      [TableLocation.PRIVATE_DINING]: "bg-amber-600",
      [TableLocation.TERRACE]: "bg-blue-600"
    };
    return colors[location];
  };

  const filteredTables = selectedLocation === "all" 
    ? tables 
    : tables.filter(table => table.location === selectedLocation);

  const handleTableAction = (table: Table, action: string) => {
    switch (action) {
      case "seat":
        onSelectTable(table.number);
        break;
      case "new_order":
        onSelectTable(table.number);
        break;
      case "view_order":
        // Navigate to order details
        break;
      case "clean":
        updateTableStatus(table.$id, TableStatus.CLEANING);
        break;
      case "available":
        updateTableStatus(table.$id, TableStatus.AVAILABLE);
        break;
      default:
        break;
    }
  };

  const updateTableStatus = async (tableId: string, newStatus: TableStatus) => {
    setTables(prev => 
      prev.map(table => 
        table.$id === tableId 
          ? { ...table, status: newStatus }
          : table
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading table layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Table Management</h2>
            <p className="text-slate-400">Monitor and manage restaurant seating</p>
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as TableLocation | "all")}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All Locations</option>
              {Object.values(TableLocation).map(location => (
                <option key={location} value={location}>
                  {location.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Table
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 text-center">
            <p className="text-xl font-bold text-white">{tableStats.total || 0}</p>
            <p className="text-xs text-slate-400">Total Tables</p>
          </div>
          <div className="bg-green-500/10 rounded-lg border border-green-500/20 p-4 text-center">
            <p className="text-xl font-bold text-green-400">{tableStats.available || 0}</p>
            <p className="text-xs text-slate-400">Available</p>
          </div>
          <div className="bg-red-500/10 rounded-lg border border-red-500/20 p-4 text-center">
            <p className="text-xl font-bold text-red-400">{tableStats.occupied || 0}</p>
            <p className="text-xs text-slate-400">Occupied</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg border border-amber-500/20 p-4 text-center">
            <p className="text-xl font-bold text-amber-400">{tableStats.reserved || 0}</p>
            <p className="text-xs text-slate-400">Reserved</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg border border-blue-500/20 p-4 text-center">
            <p className="text-xl font-bold text-blue-400">{tableStats.cleaning || 0}</p>
            <p className="text-xs text-slate-400">Cleaning</p>
          </div>
          <div className="bg-slate-500/10 rounded-lg border border-slate-500/20 p-4 text-center">
            <p className="text-xl font-bold text-slate-400">{tableStats.outOfOrder || 0}</p>
            <p className="text-xs text-slate-400">Out of Order</p>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <AnimatePresence>
          {filteredTables.map((table) => (
            <motion.div
              key={table.$id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative bg-slate-800/50 rounded-xl border-2 p-4 hover:border-opacity-80 transition-all cursor-pointer ${getStatusColor(table.status)}`}
            >
              {/* Table Number & Location */}
              <div className="text-center mb-3">
                <div className="flex items-center justify-center mb-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${getLocationColor(table.location)}`} />
                  <span className="text-white font-bold text-lg">Table {table.number}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Users className="w-3 h-3" />
                  <span>{table.capacity} seats</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center mb-3">
                <Badge className={`${getStatusColor(table.status)} flex items-center gap-1 text-xs`}>
                  {getStatusIcon(table.status)}
                  {table.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Table Info */}
              <div className="space-y-2 text-xs text-slate-400">
                {table.waiterName && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{table.waiterName}</span>
                  </div>
                )}
                
                {table.lastOccupied && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {Math.round((Date.now() - table.lastOccupied.getTime()) / (1000 * 60))}m ago
                    </span>
                  </div>
                )}

                {table.currentOrderId && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Utensils className="w-3 h-3" />
                    <span>Active Order</span>
                  </div>
                )}

                {table.reservationId && (
                  <div className="flex items-center gap-1 text-blue-400">
                    <Calendar className="w-3 h-3" />
                    <span>Reserved</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 space-y-1">
                {table.status === TableStatus.AVAILABLE && (
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
                    onClick={() => handleTableAction(table, "seat")}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Seat Guests
                  </Button>
                )}

                {table.status === TableStatus.OCCUPIED && (
                  <div className="space-y-1">
                    {table.currentOrderId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-black text-xs"
                        onClick={() => handleTableAction(table, "view_order")}
                      >
                        View Order
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-amber-600 hover:bg-amber-700 text-xs"
                        onClick={() => handleTableAction(table, "new_order")}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        New Order
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500 hover:text-white text-xs"
                      onClick={() => handleTableAction(table, "clean")}
                    >
                      Mark for Cleaning
                    </Button>
                  </div>
                )}

                {table.status === TableStatus.CLEANING && (
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-xs"
                    onClick={() => handleTableAction(table, "available")}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Mark Available
                  </Button>
                )}

                {table.status === TableStatus.RESERVED && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-black text-xs"
                      >
                        View Reservation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-slate-900 border border-amber-500/20">
                      <DialogHeader>
                        <DialogTitle className="text-amber-500">
                          Table {table.number} Reservation
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                          <h4 className="text-amber-400 font-medium mb-2">Reservation Details</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Table:</span>
                              <span className="text-white">Table {table.number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Capacity:</span>
                              <span className="text-white">{table.capacity} guests</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Waiter:</span>
                              <span className="text-white">{table.waiterName || 'Unassigned'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {table.notes && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <h4 className="text-blue-400 font-medium mb-1">Special Notes</h4>
                            <p className="text-slate-300 text-sm">{table.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleTableAction(table, "seat")}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Seat Guests
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Notes indicator */}
              {table.notes && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTables.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tables found</h3>
          <p className="text-slate-400">
            {selectedLocation === "all" 
              ? "No tables configured yet"
              : `No tables in ${selectedLocation.replace('_', ' ')} area`
            }
          </p>
        </div>
      )}
    </div>
  );
};