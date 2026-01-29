import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Check if user is superuser
async function isUserSuperuser(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('is_admin, is_superuser')
    .eq('user_id', userId)
    .single();

  return data?.is_admin === true || data?.is_superuser === true;
}

// GET - List all study notes (public)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_notes')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }

    return NextResponse.json({ notes: data || [] });
  } catch (error) {
    console.error('Notes GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new study note (superuser only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isUserSuperuser(user.id)) {
      return NextResponse.json({ error: 'Forbidden - Superuser access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, image_url } = body;

    if (!title || !description || !category || !image_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get max sort_order
    const { data: maxOrder } = await supabaseAdmin
      .from('study_notes')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const newSortOrder = (maxOrder?.sort_order || 0) + 1;

    const { data, error: insertError } = await supabaseAdmin
      .from('study_notes')
      .insert({
        title,
        description,
        category,
        image_url,
        sort_order: newSortOrder,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating note:', insertError);
      return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data });
  } catch (error) {
    console.error('Notes POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a study note (superuser only)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isUserSuperuser(user.id)) {
      return NextResponse.json({ error: 'Forbidden - Superuser access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, description, category, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing note ID' }, { status: 400 });
    }

    const updateData: Record<string, string> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (image_url) updateData.image_url = image_url;

    const { data, error: updateError } = await supabaseAdmin
      .from('study_notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: data });
  } catch (error) {
    console.error('Notes PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a study note (superuser only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isUserSuperuser(user.id)) {
      return NextResponse.json({ error: 'Forbidden - Superuser access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing note ID' }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('study_notes')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting note:', deleteError);
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notes DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
