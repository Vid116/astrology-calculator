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

// GET - List all keywords (public - needed for calculator)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'planet' or 'sign'

    let query = supabaseAdmin.from('keywords').select('*');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching keywords:', error);
      return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 });
    }

    return NextResponse.json({ keywords: data });
  } catch (error) {
    console.error('Keywords GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update keywords for a planet/sign (superuser only)
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
    const { id, keywords } = body;

    if (!id || !Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { error: updateError } = await supabaseAdmin
      .from('keywords')
      .update({ keywords })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating keywords:', updateError);
      return NextResponse.json({ error: 'Failed to update keywords' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Keywords PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a keyword to a planet/sign (superuser only)
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
    const { id, keyword } = body;

    if (!id || !keyword || typeof keyword !== 'string') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Get current keywords
    const { data: current } = await supabaseAdmin
      .from('keywords')
      .select('keywords')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Keyword set not found' }, { status: 404 });
    }

    // Add new keyword if not already present
    const updatedKeywords = [...(current.keywords as string[])];
    if (!updatedKeywords.includes(keyword)) {
      updatedKeywords.push(keyword);
      updatedKeywords.sort();
    }

    const { error: updateError } = await supabaseAdmin
      .from('keywords')
      .update({ keywords: updatedKeywords })
      .eq('id', id);

    if (updateError) {
      console.error('Error adding keyword:', updateError);
      return NextResponse.json({ error: 'Failed to add keyword' }, { status: 500 });
    }

    return NextResponse.json({ success: true, keywords: updatedKeywords });
  } catch (error) {
    console.error('Keywords POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a keyword from a planet/sign (superuser only)
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
    const keyword = searchParams.get('keyword');
    const deleteAll = searchParams.get('deleteAll');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    if (!deleteAll && !keyword) {
      return NextResponse.json({ error: 'Missing keyword parameter' }, { status: 400 });
    }

    // Get current keywords
    const { data: current } = await supabaseAdmin
      .from('keywords')
      .select('keywords')
      .eq('id', id)
      .single();

    if (!current) {
      return NextResponse.json({ error: 'Keyword set not found' }, { status: 404 });
    }

    // Delete all or remove single keyword
    const updatedKeywords = deleteAll === 'true'
      ? []
      : (current.keywords as string[]).filter(k => k !== keyword);

    const { error: updateError } = await supabaseAdmin
      .from('keywords')
      .update({ keywords: updatedKeywords })
      .eq('id', id);

    if (updateError) {
      console.error('Error removing keyword:', updateError);
      return NextResponse.json({ error: 'Failed to remove keyword' }, { status: 500 });
    }

    return NextResponse.json({ success: true, keywords: updatedKeywords });
  } catch (error) {
    console.error('Keywords DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
