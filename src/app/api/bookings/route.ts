import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Check if user is admin or superuser (can manage bookings)
async function canManageBookings(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('is_admin, is_superuser')
    .eq('user_id', userId)
    .single();

  return data?.is_admin === true || data?.is_superuser === true;
}

// GET - Fetch bookings (user's own or superuser's incoming requests)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // comma-separated list
    const role = searchParams.get('role'); // 'user' or 'superuser'

    const isSuperuser = await canManageBookings(user.id);

    let query = supabaseAdmin
      .from('consultation_bookings')
      .select('*');

    // Filter by role
    if (role === 'superuser' && isSuperuser) {
      query = query.eq('superuser_id', user.id);
    } else {
      query = query.eq('user_id', user.id);
    }

    // Filter by status
    if (status) {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    const { data, error } = await query.order('scheduled_start', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new booking request
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      slot_id,
      scheduled_start,
      scheduled_end,
      duration_minutes,
      user_name,
      user_email,
      user_phone,
      birth_date,
      birth_time,
      birth_place,
      consultation_topic,
      additional_notes,
    } = body;

    // Validate required fields
    if (!slot_id || !scheduled_start || !scheduled_end || !duration_minutes || !user_name || !user_email) {
      return NextResponse.json({
        error: 'slot_id, scheduled_start, scheduled_end, duration_minutes, user_name, and user_email are required'
      }, { status: 400 });
    }

    // Validate duration
    if (![30, 60, 90].includes(duration_minutes)) {
      return NextResponse.json({ error: 'Duration must be 30, 60, or 90 minutes' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Fetch the availability window
    const { data: slot, error: slotError } = await supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('id', slot_id)
      .eq('is_available', true)
      .single();

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Availability window not found' }, { status: 404 });
    }

    // Check if requested time is in the future
    if (new Date(scheduled_start) <= new Date()) {
      return NextResponse.json({ error: 'Cannot book a time in the past' }, { status: 400 });
    }

    // Validate requested time is within the availability window
    const reqStart = new Date(scheduled_start).getTime();
    const reqEnd = new Date(scheduled_end).getTime();
    const winStart = new Date(slot.start_time).getTime();
    const winEnd = new Date(slot.end_time).getTime();

    if (reqStart < winStart || reqEnd > winEnd) {
      return NextResponse.json({ error: 'Requested time is outside the availability window' }, { status: 400 });
    }

    // Check for overlapping bookings within this superuser's schedule
    const { data: overlappingBookings } = await supabaseAdmin
      .from('consultation_bookings')
      .select('id')
      .eq('superuser_id', slot.superuser_id)
      .in('status', ['pending', 'approved'])
      .lt('scheduled_start', scheduled_end)
      .gt('scheduled_end', scheduled_start);

    if (overlappingBookings && overlappingBookings.length > 0) {
      return NextResponse.json({
        error: 'This time is no longer available'
      }, { status: 400 });
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('consultation_bookings')
      .insert({
        slot_id,
        user_id: user.id,
        superuser_id: slot.superuser_id,
        scheduled_start,
        scheduled_end,
        duration_minutes,
        status: 'pending',
        user_name,
        user_email,
        user_phone: user_phone || null,
        birth_date: birth_date || null,
        birth_time: birth_time || null,
        birth_place: birth_place || null,
        consultation_topic: consultation_topic || null,
        additional_notes: additional_notes || null,
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Bookings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
