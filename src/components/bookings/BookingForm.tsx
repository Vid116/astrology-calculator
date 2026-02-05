'use client';

import { useState } from 'react';
import { SelectedTimeSlot } from '@/types/supabase';
import { User } from '@supabase/supabase-js';

interface BookingFormProps {
  timeSlot: SelectedTimeSlot;
  user: User | null;
  onSubmit: (data: BookingFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface BookingFormData {
  slot_id: string;
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  consultation_topic: string;
  additional_notes: string;
}

const CONSULTATION_TOPICS = [
  { value: '', label: 'Select a topic...' },
  { value: 'natal_chart', label: 'Natal Chart Reading' },
  { value: 'transit_reading', label: 'Transit Reading' },
  { value: 'relationship', label: 'Relationship Compatibility' },
  { value: 'career', label: 'Career & Life Path' },
  { value: 'yearly_forecast', label: 'Yearly Forecast' },
  { value: 'general', label: 'General Consultation' },
];

function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
}

export function BookingForm({
  timeSlot,
  user,
  onSubmit,
  onCancel,
  isSubmitting,
}: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    slot_id: timeSlot.slot_id,
    scheduled_start: timeSlot.start_time,
    scheduled_end: timeSlot.end_time,
    duration_minutes: timeSlot.duration_minutes,
    user_name: user?.user_metadata?.full_name || '',
    user_email: user?.email || '',
    user_phone: '',
    birth_date: '',
    birth_time: '',
    birth_place: '',
    consultation_topic: '',
    additional_notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Name is required';
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const inputStyle = {
    paddingLeft: '4px',
    paddingRight: '4px',
    background: 'rgba(103, 232, 249, 0.05)',
    border: '1px solid rgba(103, 232, 249, 0.2)',
  };

  const errorInputStyle = {
    paddingLeft: '4px',
    paddingRight: '4px',
    background: 'rgba(248, 113, 113, 0.05)',
    border: '1px solid rgba(248, 113, 113, 0.3)',
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%)',
        border: '1px solid rgba(103, 232, 249, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div
        className="p-5 border-b"
        style={{
          paddingLeft: '32px',
          background: 'linear-gradient(180deg, rgba(103, 232, 249, 0.05) 0%, transparent 100%)',
          borderColor: 'rgba(103, 232, 249, 0.1)',
        }}
      >
        <h3 className="text-white font-semibold text-lg">Book Consultation</h3>
        <p className="text-[#67e8f9] text-sm mt-1">
          {formatDateTime(timeSlot.start_time)} ({timeSlot.duration_minutes} min)
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-5 space-y-5" style={{ paddingLeft: '7px' }}>
        {/* Contact Information */}
        <div>
          <p className="text-[#67e8f9] text-xs font-semibold uppercase tracking-wide mb-4" style={{ paddingTop: '12px' }}>
            Contact Information
          </p>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="user_name" className="block text-[#a1a1aa] text-sm mb-2">
                Full Name <span className="text-[#f87171]">*</span>
              </label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full py-3 rounded-lg text-white placeholder-[#4a5568] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                style={errors.user_name ? errorInputStyle : inputStyle}
              />
              {errors.user_name && (
                <p className="text-[#f87171] text-xs mt-1">{errors.user_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="user_email" className="block text-[#a1a1aa] text-sm mb-2">
                Email <span className="text-[#f87171]">*</span>
              </label>
              <input
                type="email"
                id="user_email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full py-3 rounded-lg text-white placeholder-[#4a5568] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                style={errors.user_email ? errorInputStyle : inputStyle}
              />
              {errors.user_email && (
                <p className="text-[#f87171] text-xs mt-1">{errors.user_email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="user_phone" className="block text-[#a1a1aa] text-sm mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="user_phone"
                name="user_phone"
                value={formData.user_phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full py-3 rounded-lg text-white placeholder-[#4a5568] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Birth Information */}
        <div>
          <p className="text-[#ffd800] text-xs font-semibold uppercase tracking-wide mb-4" style={{ paddingTop: '7px' }}>
            Birth Information (Optional)
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Birth Date */}
            <div>
              <label htmlFor="birth_date" className="block text-[#a1a1aa] text-sm mb-2">
                Birth Date
              </label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                style={inputStyle}
              />
            </div>

            {/* Birth Time */}
            <div>
              <label htmlFor="birth_time" className="block text-[#a1a1aa] text-sm mb-2">
                Birth Time
              </label>
              <input
                type="time"
                id="birth_time"
                name="birth_time"
                value={formData.birth_time}
                onChange={handleChange}
                className="w-full py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Birth Place */}
          <div className="mt-4">
            <label htmlFor="birth_place" className="block text-[#a1a1aa] text-sm mb-2">
              Birth Place
            </label>
            <input
              type="text"
              id="birth_place"
              name="birth_place"
              value={formData.birth_place}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full py-3 rounded-lg text-white placeholder-[#4a5568] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Consultation Details */}
        <div>
          <p className="text-[#67e8f9] text-xs font-semibold uppercase tracking-wide mb-4" style={{ paddingTop: '7px' }}>
            Consultation Details
          </p>

          {/* Topic */}
          <div className="mb-4">
            <label htmlFor="consultation_topic" className="block text-[#a1a1aa] text-sm mb-2">
              What would you like to discuss?
            </label>
            <select
              id="consultation_topic"
              name="consultation_topic"
              value={formData.consultation_topic}
              onChange={handleChange}
              className="w-full py-3 rounded-lg text-white outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50"
              style={inputStyle}
            >
              {CONSULTATION_TOPICS.map(topic => (
                <option key={topic.value} value={topic.value} style={{ background: '#0a0e1a' }}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="additional_notes" className="block text-[#a1a1aa] text-sm mb-2" style={{ paddingTop: '7px' }}>
              Additional Notes
            </label>
            <textarea
              id="additional_notes"
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleChange}
              placeholder="Any specific questions or areas you'd like to focus on..."
              rows={4}
              maxLength={500}
              className="w-full py-3 rounded-lg text-white placeholder-[#4a5568] outline-none transition-all duration-200 focus:ring-2 focus:ring-[#67e8f9]/50 resize-none"
              style={inputStyle}
            />
            <p className="text-[#4a5568] text-xs mt-1 text-right">
              {formData.additional_notes.length}/500
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2" style={{ paddingBottom: '16px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/[0.04] disabled:opacity-50"
            style={{
              background: 'rgba(107, 122, 144, 0.1)',
              color: '#6b7a90',
              border: '1px solid rgba(107, 122, 144, 0.2)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,216,0,0.3)] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
              color: '#0a0e1a',
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              'Request Booking'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
