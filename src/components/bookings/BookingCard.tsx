'use client';

import { ConsultationBooking } from '@/types/supabase';

interface BookingCardProps {
  booking: ConsultationBooking;
  viewMode: 'user' | 'superuser';
  onCancel?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onComplete?: (id: string) => void;
  isLoading?: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pending: {
    bg: 'rgba(255, 216, 0, 0.15)',
    text: '#ffd800',
    border: 'rgba(255, 216, 0, 0.3)',
    label: 'Pending',
  },
  approved: {
    bg: 'rgba(117, 142, 79, 0.15)',
    text: '#758e4f',
    border: 'rgba(117, 142, 79, 0.3)',
    label: 'Approved',
  },
  rejected: {
    bg: 'rgba(248, 113, 113, 0.15)',
    text: '#f87171',
    border: 'rgba(248, 113, 113, 0.3)',
    label: 'Rejected',
  },
  cancelled: {
    bg: 'rgba(107, 122, 144, 0.15)',
    text: '#6b7a90',
    border: 'rgba(107, 122, 144, 0.3)',
    label: 'Cancelled',
  },
  completed: {
    bg: 'rgba(103, 232, 249, 0.15)',
    text: '#67e8f9',
    border: 'rgba(103, 232, 249, 0.3)',
    label: 'Completed',
  },
};

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function BookingCard({
  booking,
  viewMode,
  onCancel,
  onApprove,
  onReject,
  onComplete,
  isLoading,
}: BookingCardProps) {
  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;

  const handleReject = () => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason && onReject) {
      onReject(booking.id, reason);
    }
  };

  return (
    <div
      className="rounded-xl p-5 transition-all duration-200 hover:shadow-lg"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
        border: '1px solid rgba(103, 232, 249, 0.12)',
      }}
    >
      {/* Header with status badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white font-medium text-lg">
            {formatDateTime(booking.scheduled_start)}
          </p>
          <p className="text-[#6b7a90] text-sm mt-1">
            {booking.duration_minutes} minutes
          </p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          style={{
            background: statusStyle.bg,
            color: statusStyle.text,
            border: `1px solid ${statusStyle.border}`,
          }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* User info (for superuser view) */}
      {viewMode === 'superuser' && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(103, 232, 249, 0.05)' }}>
          <p className="text-white font-medium">{booking.user_name}</p>
          <p className="text-[#6b7a90] text-sm">{booking.user_email}</p>
          {booking.user_phone && (
            <p className="text-[#6b7a90] text-sm">{booking.user_phone}</p>
          )}
        </div>
      )}

      {/* Birth info (if provided, for superuser view) */}
      {viewMode === 'superuser' && (booking.birth_date || booking.birth_time || booking.birth_place) && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255, 216, 0, 0.05)' }}>
          <p className="text-[#ffd800] text-xs font-semibold uppercase tracking-wide mb-2">Birth Info</p>
          {booking.birth_date && (
            <p className="text-[#a1a1aa] text-sm">Date: {booking.birth_date}</p>
          )}
          {booking.birth_time && (
            <p className="text-[#a1a1aa] text-sm">Time: {booking.birth_time}</p>
          )}
          {booking.birth_place && (
            <p className="text-[#a1a1aa] text-sm">Place: {booking.birth_place}</p>
          )}
        </div>
      )}

      {/* Consultation topic */}
      {booking.consultation_topic && (
        <div className="mb-4">
          <p className="text-[#67e8f9] text-xs font-semibold uppercase tracking-wide mb-1">Topic</p>
          <p className="text-[#a1a1aa] text-sm">{booking.consultation_topic}</p>
        </div>
      )}

      {/* Additional notes */}
      {booking.additional_notes && (
        <div className="mb-4">
          <p className="text-[#67e8f9] text-xs font-semibold uppercase tracking-wide mb-1">Notes</p>
          <p className="text-[#a1a1aa] text-sm">{booking.additional_notes}</p>
        </div>
      )}

      {/* Rejection reason */}
      {booking.status === 'rejected' && booking.rejection_reason && (
        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(248, 113, 113, 0.05)' }}>
          <p className="text-[#f87171] text-xs font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
          <p className="text-[#a1a1aa] text-sm">{booking.rejection_reason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        {viewMode === 'user' && booking.status === 'pending' && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#f87171]/20 disabled:opacity-50"
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(248, 113, 113, 0.2)',
            }}
          >
            Cancel Booking
          </button>
        )}

        {viewMode === 'superuser' && booking.status === 'pending' && (
          <>
            {onApprove && (
              <button
                onClick={() => onApprove(booking.id)}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(117,142,79,0.3)] disabled:opacity-50"
                style={{
                  background: 'rgba(117, 142, 79, 0.15)',
                  color: '#758e4f',
                  border: '1px solid rgba(117, 142, 79, 0.3)',
                }}
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#f87171]/20 disabled:opacity-50"
                style={{
                  background: 'rgba(248, 113, 113, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(248, 113, 113, 0.2)',
                }}
              >
                Reject
              </button>
            )}
          </>
        )}

        {viewMode === 'superuser' && booking.status === 'approved' && onComplete && (
          <button
            onClick={() => onComplete(booking.id)}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(103,232,249,0.3)] disabled:opacity-50"
            style={{
              background: 'rgba(103, 232, 249, 0.15)',
              color: '#67e8f9',
              border: '1px solid rgba(103, 232, 249, 0.3)',
            }}
          >
            Mark Completed
          </button>
        )}
      </div>
    </div>
  );
}
