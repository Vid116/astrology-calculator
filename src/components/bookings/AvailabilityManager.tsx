'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AvailabilitySlot } from '@/types/supabase';
import { toast } from 'sonner';

interface AvailabilityManagerProps {
  userId: string;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
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

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri
const WEEKEND = [0, 6]; // Sun, Sat

type AddMode = 'single' | 'recurring';

export function AvailabilityManager({ userId }: AvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('single');

  // Single slot form state
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });

  // Recurring form state
  const [recurring, setRecurring] = useState({
    days: [] as number[],
    startTime: '09:00',
    endTime: '17:00',
    fromDate: '',
    toDate: '',
  });

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch(`/api/availability?superuser_id=${userId}`);
      const data = await res.json();
      if (data.slots) {
        setSlots(data.slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load availability');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Preview calculation for recurring windows
  const recurringPreview = useMemo(() => {
    if (recurring.days.length === 0 || !recurring.fromDate || !recurring.toDate || !recurring.startTime || !recurring.endTime) {
      return null;
    }

    const [startH, startM] = recurring.startTime.split(':').map(Number);
    const [endH, endM] = recurring.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (endMin <= startMin) return null;

    const from = new Date(recurring.fromDate + 'T00:00:00');
    const to = new Date(recurring.toDate + 'T00:00:00');
    if (to < from) return null;

    let matchingDays = 0;
    const current = new Date(from);
    while (current <= to) {
      if (recurring.days.includes(current.getDay())) {
        matchingDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const hours = Math.floor((endMin - startMin) / 60);
    const mins = (endMin - startMin) % 60;
    const timeLabel = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

    return { matchingDays, timeLabel };
  }, [recurring]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const startDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`);
    const endDateTime = new Date(`${newSlot.date}T${newSlot.endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (startDateTime <= new Date()) {
      toast.error('Cannot create slots in the past');
      return;
    }

    setIsAdding(true);

    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Availability slot added');
        setSlots(prev => [...prev, data.slot].sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ));
        setShowAddForm(false);
        setNewSlot({ date: '', startTime: '', endTime: '' });
      } else {
        toast.error(data.error || 'Failed to add slot');
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddRecurring = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recurring.days.length === 0) {
      toast.error('Select at least one day of the week');
      return;
    }
    if (!recurring.fromDate || !recurring.toDate) {
      toast.error('Select a date range');
      return;
    }
    if (!recurring.startTime || !recurring.endTime) {
      toast.error('Set start and end time');
      return;
    }

    setIsAdding(true);

    try {
      const res = await fetch('/api/availability/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: recurring.days,
          startTime: recurring.startTime,
          endTime: recurring.endTime,
          fromDate: recurring.fromDate,
          toDate: recurring.toDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const count = data.slots?.length || 0;
        const skipped = data.skipped || 0;
        let message = `Created ${count} availability window${count !== 1 ? 's' : ''}`;
        if (skipped > 0) {
          message += ` (${skipped} skipped due to overlap)`;
        }
        toast.success(message);
        setSlots(prev => [...prev, ...(data.slots || [])].sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        ));
        setShowAddForm(false);
        setRecurring({ days: [], startTime: '09:00', endTime: '17:00', fromDate: '', toDate: '' });
      } else {
        toast.error(data.error || 'Failed to create slots');
      }
    } catch (error) {
      console.error('Error adding recurring slots:', error);
      toast.error('Failed to create slots');
    } finally {
      setIsAdding(false);
    }
  };

  const toggleDay = (day: number) => {
    setRecurring(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort(),
    }));
  };

  const setDayPreset = (preset: 'weekdays' | 'weekend') => {
    const target = preset === 'weekdays' ? WEEKDAYS : WEEKEND;
    const allSelected = target.every(d => recurring.days.includes(d));
    setRecurring(prev => ({
      ...prev,
      days: allSelected
        ? prev.days.filter(d => !target.includes(d))
        : [...new Set([...prev.days, ...target])].sort(),
    }));
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const res = await fetch(`/api/availability?id=${slotId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Slot deleted');
        setSlots(prev => prev.filter(s => s.id !== slotId));
      } else {
        toast.error(data.error || 'Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete slot');
    }
  };

  const inputStyle = {
    background: 'rgba(103, 232, 249, 0.05)',
    border: '1px solid rgba(103, 232, 249, 0.2)',
  };

  const formContainerStyle = {
    background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
    border: '1px solid rgba(103, 232, 249, 0.15)',
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

  return (
    <div>
      {/* Add New Slot Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-[0_0_15px_rgba(103,232,249,0.2)]"
          style={{
            background: 'rgba(103, 232, 249, 0.1)',
            color: '#67e8f9',
            border: '1px solid rgba(103, 232, 249, 0.3)',
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAddForm ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
          </svg>
          {showAddForm ? 'Cancel' : 'Add Availability'}
        </button>
      </div>

      {/* Add Slot Form */}
      {showAddForm && (
        <div className="mb-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setAddMode('single')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: addMode === 'single' ? 'rgba(103, 232, 249, 0.15)' : 'rgba(103, 232, 249, 0.03)',
                color: addMode === 'single' ? '#67e8f9' : '#6b7a90',
                border: addMode === 'single' ? '1px solid rgba(103, 232, 249, 0.4)' : '1px solid rgba(103, 232, 249, 0.1)',
              }}
            >
              Single Slot
            </button>
            <button
              type="button"
              onClick={() => setAddMode('recurring')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: addMode === 'recurring' ? 'rgba(103, 232, 249, 0.15)' : 'rgba(103, 232, 249, 0.03)',
                color: addMode === 'recurring' ? '#67e8f9' : '#6b7a90',
                border: addMode === 'recurring' ? '1px solid rgba(103, 232, 249, 0.4)' : '1px solid rgba(103, 232, 249, 0.1)',
              }}
            >
              Recurring Schedule
            </button>
          </div>

          {/* Single Slot Form */}
          {addMode === 'single' && (
            <form
              onSubmit={handleAddSlot}
              className="p-5 rounded-xl"
              style={formContainerStyle}
            >
              <p className="text-white font-medium mb-4">New Availability Window</p>
              <p className="text-[#6b7a90] text-sm mb-4">Set when you&apos;re available. Users will choose their consultation duration when booking.</p>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={newSlot.date}
                    onChange={e => setNewSlot(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={e => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">End Time</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={e => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="mt-4 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,216,0,0.3)] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
                  color: '#0a0e1a',
                }}
              >
                {isAdding ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          )}

          {/* Recurring Schedule Form */}
          {addMode === 'recurring' && (
            <form
              onSubmit={handleAddRecurring}
              className="p-5 rounded-xl"
              style={formContainerStyle}
            >
              <p className="text-white font-medium mb-4">Recurring Schedule</p>

              {/* Days of Week */}
              <div className="mb-5">
                <label className="block text-[#a1a1aa] text-sm mb-3">Days of the Week</label>

                {/* Quick select buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setDayPreset('weekdays')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                    style={{
                      background: WEEKDAYS.every(d => recurring.days.includes(d))
                        ? 'rgba(255, 216, 0, 0.15)'
                        : 'rgba(103, 232, 249, 0.05)',
                      color: WEEKDAYS.every(d => recurring.days.includes(d)) ? '#ffd800' : '#6b7a90',
                      border: WEEKDAYS.every(d => recurring.days.includes(d))
                        ? '1px solid rgba(255, 216, 0, 0.3)'
                        : '1px solid rgba(103, 232, 249, 0.1)',
                    }}
                  >
                    Weekdays
                  </button>
                  <button
                    type="button"
                    onClick={() => setDayPreset('weekend')}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                    style={{
                      background: WEEKEND.every(d => recurring.days.includes(d))
                        ? 'rgba(255, 216, 0, 0.15)'
                        : 'rgba(103, 232, 249, 0.05)',
                      color: WEEKEND.every(d => recurring.days.includes(d)) ? '#ffd800' : '#6b7a90',
                      border: WEEKEND.every(d => recurring.days.includes(d))
                        ? '1px solid rgba(255, 216, 0, 0.3)'
                        : '1px solid rgba(103, 232, 249, 0.1)',
                    }}
                  >
                    Weekend
                  </button>
                </div>

                {/* Individual day toggles */}
                <div className="flex gap-2 flex-wrap">
                  {DAY_LABELS.map((label, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className="w-12 h-12 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{
                        background: recurring.days.includes(index)
                          ? 'rgba(103, 232, 249, 0.2)'
                          : 'rgba(103, 232, 249, 0.03)',
                        color: recurring.days.includes(index) ? '#67e8f9' : '#6b7a90',
                        border: recurring.days.includes(index)
                          ? '1px solid rgba(103, 232, 249, 0.5)'
                          : '1px solid rgba(103, 232, 249, 0.1)',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Window */}
              <div className="grid gap-4 sm:grid-cols-2 mb-5">
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">Available From</label>
                  <input
                    type="time"
                    value={recurring.startTime}
                    onChange={e => setRecurring(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">Available Until</label>
                  <input
                    type="time"
                    value={recurring.endTime}
                    onChange={e => setRecurring(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="grid gap-4 sm:grid-cols-2 mb-5">
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">From Date</label>
                  <input
                    type="date"
                    value={recurring.fromDate}
                    onChange={e => setRecurring(prev => ({ ...prev, fromDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-[#a1a1aa] text-sm mb-2">To Date</label>
                  <input
                    type="date"
                    value={recurring.toDate}
                    onChange={e => setRecurring(prev => ({ ...prev, toDate: e.target.value }))}
                    min={recurring.fromDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Preview */}
              {recurringPreview && (
                <div
                  className="mb-5 p-4 rounded-lg flex items-center gap-3"
                  style={{
                    background: 'rgba(103, 232, 249, 0.05)',
                    border: '1px solid rgba(103, 232, 249, 0.15)',
                  }}
                >
                  <svg className="w-5 h-5 text-[#67e8f9] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#a1a1aa] text-sm">
                    This will create <span className="text-[#67e8f9] font-semibold">{recurringPreview.matchingDays} availability window{recurringPreview.matchingDays !== 1 ? 's' : ''}</span>{' '}
                    ({recurringPreview.timeLabel} each)
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isAdding || !recurringPreview}
                className="px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,216,0,0.3)] disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
                  color: '#0a0e1a',
                }}
              >
                {isAdding ? 'Creating...' : `Create ${recurringPreview?.matchingDays || ''} Window${(recurringPreview?.matchingDays || 0) !== 1 ? 's' : ''}`}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Slots List */}
      {slots.length > 0 ? (
        <div className="space-y-3">
          {slots.map(slot => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
              style={{
                background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
                border: '1px solid rgba(103, 232, 249, 0.1)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(103, 232, 249, 0.1)' }}
                >
                  <svg className="w-6 h-6 text-[#67e8f9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formatDate(slot.start_time)}
                  </p>
                  <p className="text-[#6b7a90] text-sm">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteSlot(slot.id)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-[#f87171]/10"
                style={{ color: '#f87171' }}
                title="Delete slot"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
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
          <p className="text-[#6b7a90] mb-2">No availability slots</p>
          <p className="text-[#4a5568] text-sm">Click &quot;Add Availability&quot; to create your first slot</p>
        </div>
      )}
    </div>
  );
}
