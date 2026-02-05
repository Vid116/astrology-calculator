import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Check if user is admin or superuser (can manage availability)
async function canManageAvailability(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('is_admin, is_superuser')
    .eq('user_id', userId)
    .single();

  return data?.is_admin === true || data?.is_superuser === true;
}

// GET - Fetch available slots
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const superuserId = searchParams.get('superuser_id');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let query = supabaseAdmin
      .from('availability_slots')
      .select('*')
      .eq('is_available', true);

    if (superuserId) {
      query = query.eq('superuser_id', superuserId);
    }

    if (from) {
      query = query.gte('start_time', from);
    }

    if (to) {
      query = query.lte('start_time', to);
    }

    // Only show future slots
    query = query.gte('start_time', new Date().toISOString());

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching availability:', error);
      return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }

    return NextResponse.json({ slots: data });
  } catch (error) {
    console.error('Availability GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new availability slot (superuser only)
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
    const { start_time, end_time } = body;

    if (!start_time || !end_time) {
      return NextResponse.json({ error: 'start_time and end_time are required' }, { status: 400 });
    }

    // Validate time range
    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 });
    }

    // Check for overlapping slots
    const { data: existingSlots } = await supabaseAdmin
      .from('availability_slots')
      .select('id')
      .eq('superuser_id', user.id)
      .eq('is_available', true)
      .or(`and(start_time.lt.${end_time},end_time.gt.${start_time})`);

    if (existingSlots && existingSlots.length > 0) {
      return NextResponse.json({ error: 'This time slot overlaps with an existing slot' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('availability_slots')
      .insert({
        superuser_id: user.id,
        start_time,
        end_time,
        is_available: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating availability slot:', error);
      return NextResponse.json({ error: 'Failed to create availability slot' }, { status: 500 });
    }

    return NextResponse.json({ slot: data });
  } catch (error) {
    console.error('Availability POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove availability slot (superuser only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await canManageAvailability(user.id)) {
      return NextResponse.json({ error: 'Forbidden - Admin or Superuser access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing slot id' }, { status: 400 });
    }

    // Verify the slot belongs to this superuser
    const { data: slot } = await supabaseAdmin
      .from('availability_slots')
      .select('superuser_id')
      .eq('id', id)
      .single();

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (slot.superuser_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own slots' }, { status: 403 });
    }

    // Check if there are any pending bookings for this slot
    const { data: bookings } = await supabaseAdmin
      .from('consultation_bookings')
      .select('id')
      .eq('slot_id', id)
      .in('status', ['pending', 'approved']);

    if (bookings && bookings.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete slot with pending or approved bookings'
      }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('availability_slots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting availability slot:', error);
      return NextResponse.json({ error: 'Failed to delete availability slot' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Availability DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
