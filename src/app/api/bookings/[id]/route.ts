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

// GET - Fetch single booking details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: booking, error } = await supabaseAdmin
      .from('consultation_bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has permission to view this booking
    const isSuperuser = await canManageBookings(user.id);
    if (booking.user_id !== user.id && (!isSuperuser || booking.superuser_id !== user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, rejection_reason } = body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch current booking
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('consultation_bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isSuperuser = await canManageBookings(user.id);

    // Determine allowed actions based on role
    if (booking.user_id === user.id) {
      // User can only cancel their own pending bookings
      if (status !== 'cancelled') {
        return NextResponse.json({
          error: 'You can only cancel your own bookings'
        }, { status: 403 });
      }
      if (booking.status !== 'pending') {
        return NextResponse.json({
          error: 'You can only cancel pending bookings'
        }, { status: 400 });
      }
    } else if (isSuperuser && booking.superuser_id === user.id) {
      // Superuser can approve, reject, or mark as completed
      if (!['approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({
          error: 'Invalid status update'
        }, { status: 400 });
      }

      // Require rejection reason when rejecting
      if (status === 'rejected' && !rejection_reason) {
        return NextResponse.json({
          error: 'Rejection reason is required'
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update object
    const updateData: Record<string, unknown> = { status };

    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
    }

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason;
    }

    // Update the booking
    const { data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('consultation_bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking:', updateError);
      return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Booking PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
