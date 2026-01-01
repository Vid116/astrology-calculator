import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

// Check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', userId)
    .single();

  return data?.is_admin === true;
}

// GET - List all users with their roles
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!await isUserAdmin(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users from auth.users
    const { data: authUsers, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Fetch all user roles
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('*');

    const rolesMap = new Map(roles?.map(r => [r.user_id, r]) || []);

    // Combine users with their roles
    const usersWithRoles = authUsers.users.map(u => {
      const role = rolesMap.get(u.id);
      return {
        id: u.id,
        email: u.email || '',
        full_name: u.user_metadata?.full_name || null,
        created_at: u.created_at,
        is_admin: role?.is_admin || false,
        is_superuser: role?.is_superuser || false,
      };
    });

    // Sort: admins first, then superusers, then by email
    usersWithRoles.sort((a, b) => {
      if (a.is_admin !== b.is_admin) return a.is_admin ? -1 : 1;
      if (a.is_superuser !== b.is_superuser) return a.is_superuser ? -1 : 1;
      return a.email.localeCompare(b.email);
    });

    return NextResponse.json({ users: usersWithRoles });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user role (superuser status)
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!await isUserAdmin(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, is_superuser } = body;

    if (!userId || typeof is_superuser !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Check if target user is an admin (cannot modify admin's superuser status)
    const { data: targetRole } = await supabaseAdmin
      .from('user_roles')
      .select('is_admin')
      .eq('user_id', userId)
      .single();

    if (targetRole?.is_admin) {
      return NextResponse.json({ error: 'Cannot modify admin user' }, { status: 403 });
    }

    // Upsert the user role
    const { error: upsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        is_superuser,
        is_admin: false,
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Error updating user role:', upsertError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
