'use client';

import { useState } from 'react';
import { ConsultationBooking, BookingStatus } from '@/types/supabase';
import { BookingCard } from './BookingCard';

interface BookingListProps {
  bookings: ConsultationBooking[];
  viewMode: 'user' | 'superuser';
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onComplete?: (id: string) => void;
  isLoading?: boolean;
}

type FilterTab = 'all' | BookingStatus;

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function BookingList({
  bookings,
  viewMode,
  onCancel,
  onApprove,
  onReject,
  onComplete,
  isLoading,
}: BookingListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredBookings = activeTab === 'all'
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  // Count bookings per status
  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(tab => {
          const isActive = activeTab === tab.value;
          const count = counts[tab.value];

          // Hide tabs with 0 items except 'all' and 'pending'
          if (count === 0 && tab.value !== 'all' && tab.value !== 'pending') {
            return null;
          }

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                paddingLeft: '24px',
                paddingRight: '24px',
                paddingTop: '8px',
                paddingBottom: '8px',
                background: isActive
                  ? 'rgba(103, 232, 249, 0.15)'
                  : 'rgba(103, 232, 249, 0.05)',
                color: isActive ? '#67e8f9' : '#6b7a90',
                border: isActive
                  ? '1px solid rgba(103, 232, 249, 0.3)'
                  : '1px solid rgba(103, 232, 249, 0.1)',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="text-xs"
                  style={{ marginLeft: '8px', color: '#a78bfa' }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bookings grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              viewMode={viewMode}
              onCancel={onCancel}
              onApprove={onApprove}
              onReject={onReject}
              onComplete={onComplete}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-xl"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-[#6b7a90]">
            {activeTab === 'all'
              ? 'No bookings yet'
              : `No ${activeTab} bookings`}
          </p>
        </div>
      )}
    </div>
  );
}
