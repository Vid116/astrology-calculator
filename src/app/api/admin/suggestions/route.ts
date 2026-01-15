import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get current user and verify admin status
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (!userRole?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all suggestions ordered by newest first
    const { data: suggestions, error: fetchError } = await supabaseAdmin
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      // If table doesn't exist, return empty array
      if (fetchError.code === '42P01') {
        return NextResponse.json({ suggestions: [] });
      }
      console.error('Error fetching suggestions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestions: suggestions || [] });
  } catch (error) {
    console.error('Admin suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
