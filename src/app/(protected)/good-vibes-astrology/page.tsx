'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SlotPicker } from '@/components/bookings/SlotPicker';
import { BookingForm, BookingFormData } from '@/components/bookings/BookingForm';
import { BookingList } from '@/components/bookings/BookingList';
import { SelectedTimeSlot, ConsultationBooking } from '@/types/supabase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function GoodVibesAstrologyPage() {
  const { user, isLoading } = useAuth();
  const [userBookings, setUserBookings] = useState<ConsultationBooking[]>([]);
  const [selectedTime, setSelectedTime] = useState<SelectedTimeSlot | null>(null);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch user's bookings
  const fetchBookings = useCallback(async () => {
    if (!user) {
      setLoadingBookings(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.bookings) {
        setUserBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, fetchBookings]);

  // Handle booking submission
  const handleBookingSubmit = async (formData: BookingFormData) => {
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Booking request submitted! You will be notified once approved.');
        setUserBookings(prev => [data.booking, ...prev]);
        setSelectedTime(null);
      } else {
        toast.error(data.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Booking cancelled');
        setUserBookings(prev =>
          prev.map(b => (b.id === bookingId ? data.booking : b))
        );
      } else {
        toast.error(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#67e8f9]/10" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,216,0,0.1) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Count active bookings (pending or approved)
  const activeBookings = userBookings.filter(b =>
    b.status === 'pending' || b.status === 'approved'
  );

  return (
    <div className="pb-16" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          marginTop: '25px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: `
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(103, 232, 249, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Decorative Background */}
        <div
          className="absolute inset-0 opacity-30 rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103, 232, 249, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 100%, rgba(255, 216, 0, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-5 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: '#67e8f9',
                boxShadow: '0 0 25px rgba(103, 232, 249, 0.4)',
              }}
            >
              <Image
                src="/signs-svg/Renata-good-vibes-LOGO-05-Pur.png"
                alt="Good Vibes Astrology"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-cinzel text-2xl md:text-3xl text-white tracking-wide">
                Good Vibes Astrology
              </h1>
              <p className="text-[#6b7a90] text-sm mt-2">
                Book a personal consultation for cosmic guidance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User's Bookings Section */}
      {user && activeBookings.length > 0 && (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            marginTop: '20px',
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(103, 232, 249, 0.1)' }}
              >
                <svg className="w-5 h-5 text-[#67e8f9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">My Bookings</h2>
                <p className="text-[#6b7a90] text-sm">
                  {activeBookings.length} active booking{activeBookings.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <BookingList
              bookings={activeBookings}
              viewMode="user"
              onCancel={handleCancelBooking}
              isLoading={isUpdating || loadingBookings}
            />
          </div>
        </div>
      )}

      {/* Booking Form (when time selected) */}
      {selectedTime && user && (
        <div style={{ marginTop: '20px' }}>
          <BookingForm
            timeSlot={selectedTime}
            user={user}
            onSubmit={handleBookingSubmit}
            onCancel={() => setSelectedTime(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Available Slots Section */}
      {!selectedTime && (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            marginTop: '20px',
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.15)',
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255, 216, 0, 0.1)' }}
              >
                <svg className="w-5 h-5 text-[#ffd800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Book a Consultation</h2>
                <p className="text-[#6b7a90] text-sm">Select an available time slot</p>
              </div>
            </div>

            {!user ? (
              <div
                className="text-center py-10 rounded-xl"
                style={{
                  background: 'rgba(103, 232, 249, 0.03)',
                  border: '1px solid rgba(103, 232, 249, 0.1)',
                }}
              >
                <svg
                  className="w-12 h-12 mx-auto mb-4 text-[#6b7a90]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-[#6b7a90] mb-4">Please sign in to book a consultation</p>
                <a
                  href="/login"
                  className="inline-block px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,216,0,0.3)]"
                  style={{
                    background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
                    color: '#0a0e1a',
                  }}
                >
                  Sign In
                </a>
              </div>
            ) : (
              <SlotPicker
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            )}
          </div>
        </div>
      )}

      {/* Past Bookings Section */}
      {user && userBookings.filter(b => b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled').length > 0 && (
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            marginTop: '20px',
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.1)',
          }}
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(107, 122, 144, 0.1)' }}
              >
                <svg className="w-5 h-5 text-[#6b7a90]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Past Bookings</h2>
                <p className="text-[#6b7a90] text-sm">Your consultation history</p>
              </div>
            </div>

            <BookingList
              bookings={userBookings.filter(b =>
                b.status === 'completed' || b.status === 'rejected' || b.status === 'cancelled'
              )}
              viewMode="user"
              isLoading={loadingBookings}
            />
          </div>
        </div>
      )}
    </div>
  );
}
