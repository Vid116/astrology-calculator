'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SelectedTimeSlot } from '@/types/supabase';

interface SlotPickerProps {
  selectedTime: SelectedTimeSlot | null;
  onSelectTime: (time: SelectedTimeSlot | null) => void;
  isLoading?: boolean;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function getDateKey(isoString: string): string {
  const date = new Date(isoString);
  return date.toISOString().split('T')[0];
}

function getUserTimezone(): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(new Date())
      .find(p => p.type === 'timeZoneName')?.value || 'local time';
  } catch {
    return 'local time';
  }
}

const DURATIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

export function SlotPicker({
  selectedTime,
  onSelectTime,
  isLoading: externalLoading,
}: SlotPickerProps) {
  const [duration, setDuration] = useState(60);
  const [times, setTimes] = useState<SelectedTimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const fetchTimes = useCallback(async (dur: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/availability/times?duration=${dur}`);
      const data = await res.json();
      if (data.times) {
        setTimes(data.times);
      }
    } catch (error) {
      console.error('Error fetching available times:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimes(duration);
  }, [duration, fetchTimes]);

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    onSelectTime(null); // Clear selection when duration changes
  };

  // Group times by date
  const timesByDate = useMemo(() => {
    const grouped: Record<string, SelectedTimeSlot[]> = {};
    times.forEach(time => {
      const dateKey = getDateKey(time.start_time);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(time);
    });

    // Sort times within each date
    Object.values(grouped).forEach(dateSlots => {
      dateSlots.sort((a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });

    return grouped;
  }, [times]);

  const sortedDates = useMemo(() => {
    return Object.keys(timesByDate).sort();
  }, [timesByDate]);

  const effectiveExpandedDate = expandedDate || sortedDates[0] || null;

  const loading = externalLoading || isLoading;

  return (
    <div>
      {/* Duration Selector */}
      <div className="mb-5">
        <p className="text-[#a1a1aa] text-sm mb-3">Choose consultation duration</p>
        <div className="flex gap-2">
          {DURATIONS.map(d => (
            <button
              key={d.value}
              onClick={() => handleDurationChange(d.value)}
              className="flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: duration === d.value
                  ? 'rgba(255, 216, 0, 0.12)'
                  : 'rgba(103, 232, 249, 0.03)',
                color: duration === d.value ? '#ffd800' : '#6b7a90',
                border: duration === d.value
                  ? '1px solid rgba(255, 216, 0, 0.35)'
                  : '1px solid rgba(103, 232, 249, 0.1)',
                boxShadow: duration === d.value
                  ? '0 0 12px rgba(255, 216, 0, 0.1)'
                  : 'none',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
        <p className="text-[#4a5568] text-xs mt-2">
          Times shown in your timezone ({getUserTimezone()})
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#67e8f9] animate-spin" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && times.length === 0 && (
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-[#6b7a90] mb-2">No available times for {duration} min</p>
          <p className="text-[#4a5568] text-sm">Try a different duration or check back later</p>
        </div>
      )}

      {/* Time Slots by Date */}
      {!loading && times.length > 0 && (
        <div className="space-y-3">
          {sortedDates.map(dateKey => {
            const dateSlots = timesByDate[dateKey];
            const isExpanded = effectiveExpandedDate === dateKey;
            const firstSlot = dateSlots[0];

            return (
              <div
                key={dateKey}
                className="rounded-xl overflow-hidden transition-all duration-200"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
                  border: isExpanded
                    ? '1px solid rgba(103, 232, 249, 0.25)'
                    : '1px solid rgba(103, 232, 249, 0.1)',
                }}
              >
                {/* Date header */}
                <button
                  onClick={() => setExpandedDate(isExpanded ? null : dateKey)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left transition-all duration-200 hover:bg-white/[0.02]"
                >
                  <div>
                    <p className="text-white font-medium">
                      {formatDate(firstSlot.start_time)}
                    </p>
                    <p className="text-[#6b7a90] text-sm mt-0.5">
                      {dateSlots.length} time{dateSlots.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#67e8f9] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Time buttons */}
                {isExpanded && (
                  <div className="px-5 pb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {dateSlots.map((time, i) => {
                      const isSelected = selectedTime?.start_time === time.start_time && selectedTime?.slot_id === time.slot_id;

                      return (
                        <button
                          key={`${time.slot_id}-${i}`}
                          onClick={() => onSelectTime(isSelected ? null : time)}
                          className="p-3 rounded-lg text-left transition-all duration-200"
                          style={{
                            background: isSelected
                              ? 'rgba(103, 232, 249, 0.15)'
                              : 'rgba(103, 232, 249, 0.05)',
                            border: isSelected
                              ? '1px solid rgba(103, 232, 249, 0.4)'
                              : '1px solid rgba(103, 232, 249, 0.1)',
                            boxShadow: isSelected
                              ? '0 0 15px rgba(103, 232, 249, 0.15)'
                              : 'none',
                          }}
                        >
                          <p
                            className="font-medium"
                            style={{ color: isSelected ? '#67e8f9' : '#fff' }}
                          >
                            {formatTime(time.start_time)}
                          </p>
                          <p className="text-[#6b7a90] text-sm mt-1">
                            {formatTime(time.start_time)} - {formatTime(time.end_time)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
