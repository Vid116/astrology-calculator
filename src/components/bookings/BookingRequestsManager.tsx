'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConsultationBooking } from '@/types/supabase';
import { BookingList } from './BookingList';
import { toast } from 'sonner';

export function BookingRequestsManager() {
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings?role=superuser');
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (
    bookingId: string,
    status: string,
    rejection_reason?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejection_reason }),
      });

      const data = await res.json();

      if (res.ok) {
        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? data.booking : b))
        );
        toast.success(`Booking ${status}`);
      } else {
        toast.error(data.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApprove = (id: string) => {
    const booking = bookings.find(b => b.id === id);
    if (booking?.amount_cents) {
      const amount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: booking.currency || 'usd',
      }).format(booking.amount_cents / 100);
      if (!confirm(`This will charge ${amount} to the client's card. Continue?`)) {
        return;
      }
    }
    updateBookingStatus(id, 'approved');
  };

  const handleReject = (id: string, reason: string) => {
    updateBookingStatus(id, 'rejected', reason);
  };

  const handleComplete = (id: string) => {
    updateBookingStatus(id, 'completed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#67e8f9] animate-spin" />
        </div>
      </div>
    );
  }

  // Count pending for header
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div>
      {/* Header with pending count */}
      {pendingCount > 0 && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(255, 216, 0, 0.1)',
            border: '1px solid rgba(255, 216, 0, 0.2)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255, 216, 0, 0.15)' }}
          >
            <svg className="w-5 h-5 text-[#ffd800]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-[#ffd800] font-medium">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
            </p>
            <p className="text-[#a1a1aa] text-sm">
              Review and approve or reject booking requests
            </p>
          </div>
        </div>
      )}

      <BookingList
        bookings={bookings}
        viewMode="superuser"
        onApprove={handleApprove}
        onReject={handleReject}
        onComplete={handleComplete}
        isLoading={isUpdating}
      />
    </div>
  );
}
