import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// GET - Compute available time slots within availability windows for a given duration
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const durationStr = searchParams.get('duration');

    if (!durationStr) {
      return NextResponse.json({ error: 'duration query parameter is required' }, { status: 400 });
    }

    const duration = parseInt(durationStr, 10);
    if (![30, 60, 90].includes(duration)) {
      return NextResponse.json({ error: 'Duration must be 30, 60, or 90 minutes' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Fetch all future available windows
    const { data: windows, error: windowsError } = await supabaseAdmin
      .from('availability_slots')
      .select('id, superuser_id, start_time, end_time')
      .eq('is_available', true)
      .gte('start_time', now)
      .order('start_time', { ascending: true });

    if (windowsError) {
      console.error('Error fetching availability windows:', windowsError);
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }

    if (!windows || windows.length === 0) {
      return NextResponse.json({ times: [] });
    }

    // Fetch all pending/approved bookings that overlap with these windows
    const earliestStart = windows[0].start_time;
    const latestEnd = windows[windows.length - 1].end_time;

    const { data: bookings } = await supabaseAdmin
      .from('consultation_bookings')
      .select('superuser_id, scheduled_start, scheduled_end')
      .in('status', ['pending', 'approved'])
      .gte('scheduled_end', earliestStart)
      .lte('scheduled_start', latestEnd);

    // For each window, generate possible time slots and filter out conflicts
    const times: {
      slot_id: string;
      superuser_id: string;
      start_time: string;
      end_time: string;
      duration_minutes: number;
    }[] = [];

    for (const window of windows) {
      const windowStart = new Date(window.start_time).getTime();
      const windowEnd = new Date(window.end_time).getTime();
      const durationMs = duration * 60 * 1000;

      // Get bookings for this superuser that overlap with this window
      const windowBookings = (bookings || []).filter(b =>
        b.superuser_id === window.superuser_id &&
        new Date(b.scheduled_start).getTime() < windowEnd &&
        new Date(b.scheduled_end).getTime() > windowStart
      );

      // Generate possible start times (aligned to the start of the window, stepping by 30 min)
      let currentStart = windowStart;
      while (currentStart + durationMs <= windowEnd) {
        const currentEnd = currentStart + durationMs;

        // Check if this slot conflicts with any booking
        const hasConflict = windowBookings.some(b => {
          const bookStart = new Date(b.scheduled_start).getTime();
          const bookEnd = new Date(b.scheduled_end).getTime();
          return currentStart < bookEnd && currentEnd > bookStart;
        });

        if (!hasConflict) {
          times.push({
            slot_id: window.id,
            superuser_id: window.superuser_id,
            start_time: new Date(currentStart).toISOString(),
            end_time: new Date(currentEnd).toISOString(),
            duration_minutes: duration,
          });
        }

        // Step by 30 minutes for finer granularity
        currentStart += 30 * 60 * 1000;
      }
    }

    return NextResponse.json({ times });
  } catch (error) {
    console.error('Availability times GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
