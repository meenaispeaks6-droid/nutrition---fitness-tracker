import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, is_admin, created_at')
      .eq('is_admin', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ admins: data || [] });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, is_admin')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    if (existingProfile) {
      if (existingProfile.is_admin) {
        return NextResponse.json({ error: 'This user is already an admin' }, { status: 400 });
      }

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', existingProfile.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        message: 'Admin access granted to existing user',
        admin: { ...existingProfile, is_admin: true }
      });
    }

    const tempPassword = `Admin${Math.random().toString(36).slice(2, 10)}!`;
    
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Admin User' }
    });

    if (authError) throw authError;

    const { error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: email.toLowerCase().trim(),
        full_name: 'Admin User',
        is_admin: true
      });

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      message: 'New admin user created',
      admin: {
        id: authUser.user.id,
        email: email.toLowerCase().trim(),
        full_name: 'Admin User',
        is_admin: true
      },
      tempPassword
    });
  } catch (error: any) {
    console.error('Error adding admin:', error);
    return NextResponse.json({ error: error.message || 'Failed to add admin' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { adminId } = await request.json();

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 400 });
    }

    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);

    if ((count || 0) <= 1) {
      return NextResponse.json({ error: 'Cannot remove the last admin' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: false })
      .eq('id', adminId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing admin:', error);
    return NextResponse.json({ error: 'Failed to remove admin' }, { status: 500 });
  }
}
