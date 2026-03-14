"use client";

import React, { useState } from 'react';
import { Plus, User, Calendar, Clock, Users, Wine, MessageSquare, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { createAppointment } from '@/lib/actions/appointment.actions';
import { createUser } from '@/lib/actions/guest.actions';
import { Doctors, PartySize } from '@/constants';
import { GuestCounter } from '../ui/GuestCounter';

export const NewReservation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'guest' | 'reservation'>('guest');
  const router = useRouter();

  // Guest form state
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Reservation form state
  const [reservationData, setReservationData] = useState({
    schedule: '',
    partySize: 2 as string | number,
    primaryPhysician: '',
    reason: '',
    note: '',
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  const occasions = [
    'Regular Dining',
    'Birthday Celebration 🎂',
    'Anniversary 💑',
    'Business Meeting 💼',
    'Date Night 💕',
    'Family Gathering 👨‍👩‍👧‍👦',
    'Special Occasion 🎉',
    'Engagement 💍',
    'Other'
  ];

  const handleGuestSubmit = async () => {
    if (!guestData.name || !guestData.email || !guestData.phone) {
      alert('Please fill in all guest details');
      return;
    }

    setIsLoading(true);
    try {
      // Create user first
      const user = await createUser({
        name: guestData.name,
        email: guestData.email,
        phone: guestData.phone,
      });

      if (user) {
        setUserId(user.$id);
        // For quick reservation, we'll skip full registration
        // and create appointment with basic user data
        setStep('reservation');
      }
    } catch (error) {
      console.error('Error creating guest:', error);
      alert('Failed to create guest profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReservationSubmit = async () => {
    if (!reservationData.schedule || !reservationData.primaryPhysician) {
      alert('Please select date/time and welcome drink');
      return;
    }

    if (!userId) {
      alert('Guest information missing');
      return;
    }

    setIsLoading(true);
    try {
      // Create a minimal patient record for the reservation
      const patientData = {
        userId: userId,
        name: guestData.name,
        email: guestData.email,
        phone: guestData.phone,
        birthDate: new Date('1990-01-01'),
        gender: 'Prefer not to say',
        address: 'Walk-in',
        occupation: 'Guest',
        emergencyContactName: guestData.name,
        emergencyContactNumber: guestData.phone,
        primaryPhysician: 'General',
        insuranceProvider: 'None',
        insurancePolicyNumber: `GUEST-${Date.now()}`,
        privacyConsent: true,
      };

      // For simplicity, we'll use the userId as patient reference
      // In production, you'd create a proper patient record first

      const appointment = await createAppointment({
        userId: userId,
        patient: userId, // In production, this should be the patient document ID
        schedule: new Date(reservationData.schedule),
        reason: reservationData.reason || 'Regular Dining',
        note: reservationData.note,
        status: 'pending',
        primaryPhysician: reservationData.primaryPhysician,
        partySize: reservationData.partySize,
      });

      if (appointment) {
        setIsOpen(false);
        router.refresh();
        alert('Reservation created successfully!');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setGuestData({ name: '', email: '', phone: '' });
    setReservationData({
      schedule: '',
      partySize: '2 Guests',
      primaryPhysician: '',
      reason: '',
      note: '',
    });
    setUserId(null);
    setPatientId(null);
    setStep('guest');
  };

  const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all flex items-center gap-2 font-medium"
      >
        <Plus className="w-4 h-4" />
        New Reservation
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-amber-500/20 w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h3 className="text-2xl font-bold text-white">Create New Reservation</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {step === 'guest' ? 'Step 1: Guest Information' : 'Step 2: Reservation Details'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'guest' ? (
                // Guest Information Form
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      value={guestData.name}
                      onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      placeholder="Enter guest name"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={guestData.email}
                      onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      placeholder="guest@email.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={guestData.phone}
                      onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      placeholder="+254 700 000 000"
                    />
                  </div>

                  <button
                    onClick={handleGuestSubmit}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Processing...' : 'Continue to Reservation Details'}
                  </button>
                </div>
              ) : (
                // Reservation Details Form
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-400">
                      Guest: <span className="font-medium text-white">{guestData.name}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={reservationData.schedule}
                        onChange={(e) => setReservationData({ ...reservationData, schedule: e.target.value })}
                        min={minDateTime}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Party Size *
                      </label>
                      <div className="mt-2 text-white">
                        <GuestCounter
                          value={typeof reservationData.partySize === 'number' ? reservationData.partySize : 2}
                          onChange={(value) => setReservationData({ ...reservationData, partySize: value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                      <Wine className="w-4 h-4" />
                      Welcome Drink *
                    </label>
                    <select
                      value={reservationData.primaryPhysician}
                      onChange={(e) => setReservationData({ ...reservationData, primaryPhysician: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                    >
                      <option value="" className="bg-slate-900">Select a welcome drink</option>
                      {Doctors.map(drink => (
                        <option key={drink.name} value={drink.name} className="bg-slate-900">
                          {drink.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Occasion
                    </label>
                    <select
                      value={reservationData.reason}
                      onChange={(e) => setReservationData({ ...reservationData, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
                    >
                      <option value="" className="bg-slate-900">Select occasion (optional)</option>
                      {occasions.map(occasion => (
                        <option key={occasion} value={occasion} className="bg-slate-900">
                          {occasion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Special Requests
                    </label>
                    <textarea
                      value={reservationData.note}
                      onChange={(e) => setReservationData({ ...reservationData, note: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none"
                      placeholder="Any special requests or dietary requirements..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('guest')}
                      className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleReservationSubmit}
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating Reservation...' : 'Create Reservation'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};