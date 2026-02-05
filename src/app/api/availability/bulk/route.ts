import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

async function canManageAvailability(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('is_admin, is_superuser')
    .eq('user_id', userId)
    .single();

  return data?.is_admin === true || data?.is_superuser === true;
}

// POST - Create recurring availability windows (one per matching day)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await canManageAvailability(user.id)) {
      return NextResponse.json({ error: 'Forbidden - Admin or Superuser access required' }, { status: 403 });
    }

    const body = await request.json();
    const { days, startTime, endTime, fromDate, toDate, timezone } = body;

    if (!days || !Array.isArray(days) || days.length === 0) {
      return NextResponse.json({ error: 'At least one day of the week is required' }, { status: 400 });
    }

    if (!startTime || !endTime || !fromDate || !toDate) {
      return NextResponse.json({ error: 'startTime, endTime, fromDate, and toDate are required' }, { status: 400 });
    }

    if (days.some((d: number) => d < 0 || d > 6)) {
      return NextResponse.json({ error: 'Days must be between 0 (Sunday) and 6 (Saturday)' }, { status: 400 });
    }

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Build dates as ISO strings preserving the client's timezone.
    // The client sends dates like "2026-02-10" and times like "09:00"
    // plus their IANA timezone (e.g. "Europe/Ljubljana").
    // We construct proper ISO datetime strings so the server interprets them
    // in the superuser's timezone, not in server UTC.
    const startTimeStr = startTime.padStart(5, '0'); // ensure "9:00" -> "09:00"
    const endTimeStr = endTime.padStart(5, '0');

    // Use the first date to figure out day-of-week iteration
    // Parse dates as plain date strings (no time component)
    const fromParts = fromDate.split('-').map(Number); // [YYYY, MM, DD]
    const toParts = toDate.split('-').map(Number);
    const fromDateObj = new Date(fromParts[0], fromParts[1] - 1, fromParts[2]);
    const toDateObj = new Date(toParts[0], toParts[1] - 1, toParts[2]);
    const now = new Date();

    if (toDateObj < fromDateObj) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const maxDays = 90;
    const daysDiff = Math.ceil((toDateObj.getTime() - fromDateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > maxDays) {
      return NextResponse.json({ error: `Date range cannot exceed ${maxDays} days` }, { status: 400 });
    }

    // Generate one availability window per matching day
    const candidateWindows: { start_time: string; end_time: string }[] = [];
    const currentDate = new Date(fromDateObj);

    while (currentDate <= toDateObj) {
      if (days.includes(currentDate.getDay())) {
        const yyyy = currentDate.getFullYear();
        const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dd = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        // Construct ISO strings in the client's timezone by using Date parsing
        // with explicit date+time (which JS interprets as local time)
        const windowStart = new Date(`${dateStr}T${startTimeStr}:00`);
        const windowEnd = new Date(`${dateStr}T${endTimeStr}:00`);

        // If timezone was provided, we need to compute the offset.
        // The client constructs these times in their local tz, but the server
        // may be in a different tz. We apply the offset manually.
        if (timezone) {
          // Get the offset between UTC and the target timezone for this date
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
          });

          // Create a reference point at the start time in UTC
          const refUtc = new Date(`${dateStr}T${startTimeStr}:00Z`);
          const tzParts = formatter.formatToParts(refUtc);
          const tzHour = Number(tzParts.find(p => p.type === 'hour')?.value || 0);
          const tzMin = Number(tzParts.find(p => p.type === 'minute')?.value || 0);
          const utcHour = refUtc.getUTCHours();
          const utcMin = refUtc.getUTCMinutes();

          // offsetMinutes = how many minutes ahead the tz is from UTC
          let offsetMinutes = (tzHour * 60 + tzMin) - (utcHour * 60 + utcMin);
          // Handle day boundary wrap
          if (offsetMinutes > 720) offsetMinutes -= 1440;
          if (offsetMinutes < -720) offsetMinutes += 1440;

          // We want: stored UTC = local time - offset
          // So: windowStart = dateStr + startTime interpreted in tz = dateStr + startTime UTC - offset
          const startUtc = new Date(`${dateStr}T${startTimeStr}:00Z`);
          startUtc.setMinutes(startUtc.getMinutes() - offsetMinutes);

          const endUtc = new Date(`${dateStr}T${endTimeStr}:00Z`);
          endUtc.setMinutes(endUtc.getMinutes() - offsetMinutes);

          if (startUtc > now) {
            candidateWindows.push({
              start_time: startUtc.toISOString(),
              end_time: endUtc.toISOString(),
            });
          }
        } else {
          // No timezone provided - fall back to server time
          if (windowStart > now) {
            candidateWindows.push({
              start_time: windowStart.toISOString(),
              end_time: windowEnd.toISOString(),
            });
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (candidateWindows.length === 0) {
      return NextResponse.json({ error: 'No valid future windows in the selected range' }, { status: 400 });
    }

    // Fetch existing available windows for overlap check
    const { data: existingSlots } = await supabaseAdmin
      .from('availability_slots')
      .select('start_time, end_time')
      .eq('superuser_id', user.id)
      .eq('is_available', true)
      .gte('start_time', candidateWindows[0].start_time)
      .lte('start_time', candidateWindows[candidateWindows.length - 1].end_time);

    // Filter out overlapping windows
    const nonOverlapping = candidateWindows.filter(candidate => {
      if (!existingSlots) return true;
      return !existingSlots.some(existing => {
        const existStart = new Date(existing.start_time).getTime();
        const existEnd = new Date(existing.end_time).getTime();
        const candStart = new Date(candidate.start_time).getTime();
        const candEnd = new Date(candidate.end_time).getTime();
        return candStart < existEnd && candEnd > existStart;
      });
    });

    const skipped = candidateWindows.length - nonOverlapping.length;

    if (nonOverlapping.length === 0) {
      return NextResponse.json({
        error: 'All windows overlap with existing availability',
        skipped,
      }, { status: 400 });
    }

    const windowsToInsert = nonOverlapping.map(window => ({
      superuser_id: user.id,
      start_time: window.start_time,
      end_time: window.end_time,
      is_available: true,
    }));

    const { data, error } = await supabaseAdmin
      .from('availability_slots')
      .insert(windowsToInsert)
      .select();

    if (error) {
      console.error('Error creating bulk availability windows:', error);
      return NextResponse.json({ error: 'Failed to create availability windows' }, { status: 500 });
    }

    return NextResponse.json({ slots: data, skipped });
  } catch (error) {
    console.error('Bulk availability POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
