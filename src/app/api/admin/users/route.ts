import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const diet = searchParams.get('diet') || '';

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (diet && diet !== 'All') {
      query = query.contains('dietary_restrictions', [diet]);
    }

    const { data, count, error } = await query.range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;

    return NextResponse.json({
      users: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    await supabaseAdmin.from('meals').delete().eq('user_id', userId);
    await supabaseAdmin.from('daily_stats').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_goals').delete().eq('user_id', userId);
    
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', userId);
    
    if (error) throw error;

    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
