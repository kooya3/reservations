"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Badge as BadgeIcon,
  Shield,
  Clock,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllStaff, getStaffSchedule, updateStaffMember, STAFF_ROLES } from "@/lib/actions/staff.actions";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface StaffManagementProps {
  canManageStaff: boolean;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ canManageStaff }) => {
  const { staff: currentUser, hasPermission } = useStaffAuth();
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [showAddStaff, setShowAddStaff] = useState(false);

  useEffect(() => {
    loadStaff();
    loadSchedule();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staffMembers, searchQuery, selectedDepartment]);

  const loadStaff = async () => {
    try {
      const staff = await getAllStaff();
      setStaffMembers(staff);
      console.log("✅ Staff members loaded:", staff.length);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const schedule = await getStaffSchedule();
      // Merge schedule data with staff data
      setStaffMembers(prev => 
        prev.map(member => {
          const scheduleEntry = schedule.find((s: any) => s.$id === member.$id);
          return scheduleEntry || member;
        })
      );
    } catch (error) {
      console.error("Error loading schedule:", error);
    }
  };

  const filterStaff = () => {
    let filtered = [...staffMembers];

    // Department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(member => 
        member.department.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        member.firstName.toLowerCase().includes(query) ||
        member.lastName.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.employeeId.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    }

    setFilteredStaff(filtered);
  };

  const updateStaffStatus = async (staffId: string, newStatus: string) => {
    try {
      await updateStaffMember(staffId, { status: newStatus });
      
      setStaffMembers(prev =>
        prev.map(member =>
          member.$id === staffId ? { ...member, status: newStatus } : member
        )
      );

      console.log(`✅ Staff status updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating staff status:", error);
      alert("Failed to update staff status. Please try again.");
    }
  };

  const getDepartments = () => {
    const departments = [...new Set(staffMembers.map(member => member.department))];
    return departments;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      manager: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      waiter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      kitchen_staff: "bg-green-500/20 text-green-400 border-green-500/30",
      bartender: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      host: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      admin: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[role] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "on_leave":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  const StaffStats = () => {
    const activeStaff = staffMembers.filter(member => member.status === "active").length;
    const totalStaff = staffMembers.length;
    const avgWage = staffMembers.reduce((sum, member) => sum + (member.hourlyWage || 0), 0) / totalStaff;
    const workingToday = staffMembers.filter(member => member.isWorkingToday).length;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Staff</p>
                <p className="text-2xl font-bold text-white">{totalStaff}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Today</p>
                <p className="text-2xl font-bold text-white">{activeStaff}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Working Today</p>
                <p className="text-2xl font-bold text-white">{workingToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Wage</p>
                <p className="text-2xl font-bold text-white">${avgWage.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const StaffDetailModal = ({ staff }: { staff: any }) => (
    <DialogContent className="max-w-2xl bg-slate-900 border border-amber-500/20">
      <DialogHeader>
        <DialogTitle className="text-amber-500">
          Staff Details - {staff.firstName} {staff.lastName}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <span className="text-slate-400 text-sm">Employee ID</span>
              <p className="text-white font-medium">{staff.employeeId}</p>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Full Name</span>
              <p className="text-white font-medium">{staff.firstName} {staff.lastName}</p>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Role</span>
              <Badge className={getRoleColor(staff.role)}>
                {staff.role.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Department</span>
              <p className="text-white font-medium">{staff.department}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-slate-400 text-sm">Status</span>
              <Badge className={getStatusColor(staff.status)}>
                {staff.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Email</span>
              <p className="text-white font-medium">{staff.email}</p>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Phone</span>
              <p className="text-white font-medium">{staff.phone}</p>
            </div>
            <div>
              <span className="text-slate-400 text-sm">Hourly Wage</span>
              <p className="text-white font-medium">${staff.hourlyWage}</p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div>
          <h4 className="text-white font-medium mb-2">Permissions</h4>
          <div className="flex flex-wrap gap-2">
            {staff.permissions?.map((permission: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {permission.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Schedule */}
        {staff.schedule && (
          <div>
            <h4 className="text-white font-medium mb-2">Weekly Schedule</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(
                typeof staff.schedule === 'string' ? JSON.parse(staff.schedule) : staff.schedule
              ).map(([day, hours]: [string, any]) => (
                <div key={day} className="flex justify-between p-2 bg-slate-800/50 rounded">
                  <span className="text-slate-400 capitalize">{day}</span>
                  <span className="text-white">
                    {hours.start === "rest" ? "Rest Day" : `${hours.start} - ${hours.end}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        {staff.emergencyContact && (
          <div>
            <h4 className="text-white font-medium mb-2">Emergency Contact</h4>
            <div className="bg-slate-800/50 rounded-lg p-3 space-y-1">
              <p className="text-white">
                {typeof staff.emergencyContact === 'string' 
                  ? JSON.parse(staff.emergencyContact).name 
                  : staff.emergencyContact.name}
              </p>
              <p className="text-slate-400 text-sm">
                {typeof staff.emergencyContact === 'string'
                  ? JSON.parse(staff.emergencyContact).phone
                  : staff.emergencyContact.phone}
              </p>
              <p className="text-slate-400 text-sm">
                Relationship: {typeof staff.emergencyContact === 'string'
                  ? JSON.parse(staff.emergencyContact).relationship
                  : staff.emergencyContact.relationship}
              </p>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Staff Management</h2>
          <p className="text-slate-400">Manage restaurant staff and schedules</p>
        </div>
        
        {canManageStaff && (
          <Button
            onClick={() => setShowAddStaff(true)}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        )}
      </div>

      {/* Staff Statistics */}
      <StaffStats />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search staff members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
          />
        </div>
        
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="all">All Departments</option>
          {getDepartments().map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredStaff.map((member) => (
            <motion.div
              key={member.$id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 hover:border-amber-500/30 transition-all"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-medium">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{member.firstName} {member.lastName}</h3>
                    <p className="text-slate-400 text-sm">{member.employeeId}</p>
                  </div>
                </div>

                {canManageStaff && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem onClick={() => setSelectedStaff(member)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      {member.status === "active" ? (
                        <DropdownMenuItem onClick={() => updateStaffStatus(member.$id, "inactive")}>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => updateStaffStatus(member.$id, "active")}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Role and Status */}
              <div className="space-y-2 mb-4">
                <Badge className={getRoleColor(member.role)}>
                  {member.role.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(member.status)}>
                  {member.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-3 h-3" />
                  <span>{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="w-3 h-3" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <DollarSign className="w-3 h-3" />
                  <span>${member.hourlyWage}/hour</span>
                </div>
              </div>

              {/* Today's Schedule */}
              {member.todaySchedule && (
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span className="text-slate-400">Today:</span>
                    <span className="text-white">
                      {member.todaySchedule.start === "rest" 
                        ? "Rest Day" 
                        : `${member.todaySchedule.start} - ${member.todaySchedule.end}`
                      }
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  onClick={() => setSelectedStaff(member)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Details
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No staff members found</h3>
          <p className="text-slate-400">
            {searchQuery || selectedDepartment !== "all" 
              ? "Try adjusting your search criteria"
              : "No staff members have been added yet"
            }
          </p>
        </div>
      )}

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <Dialog open={true} onOpenChange={() => setSelectedStaff(null)}>
          <StaffDetailModal staff={selectedStaff} />
        </Dialog>
      )}
    </div>
  );
};