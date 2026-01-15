import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'You must be logged in to submit feedback' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { category, subject, message } = body;

    // Validate input
    if (!category || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (subject.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Subject must be 100 characters or less' },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message must be 2000 characters or less' },
        { status: 400 }
      );
    }

    const validCategories = ['feature', 'bug', 'improvement', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Insert into suggestions table
    const { error: insertError } = await supabaseAdmin
      .from('suggestions')
      .insert({
        user_id: user.id,
        user_email: user.email,
        category,
        subject,
        message,
      });

    if (insertError) {
      console.error('Error inserting suggestion:', insertError);

      // If table doesn't exist, log and return success anyway
      // (you can create the table later or the suggestion is just logged)
      if (insertError.code === '42P01') {
        console.log('Suggestions table not found. Logging suggestion:', {
          user_id: user.id,
          user_email: user.email,
          category,
          subject,
          message,
          timestamp: new Date().toISOString(),
        });
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { success: false, error: 'Failed to submit feedback. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
