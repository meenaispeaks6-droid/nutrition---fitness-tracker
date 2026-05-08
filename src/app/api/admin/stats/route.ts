import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { count: totalUsers } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: adminCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayMeals } = await supabaseAdmin
      .from('meals')
      .select('user_id')
      .gte('created_at', today.toISOString());
    
    const uniqueTodayUsers = new Set(todayMeals?.map(m => m.user_id) || []).size;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: monthMeals } = await supabaseAdmin
      .from('meals')
      .select('user_id')
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    const uniqueMonthUsers = new Set(monthMeals?.map(m => m.user_id) || []).size;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { count: newUsersThisWeek } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: totalMeals } = await supabaseAdmin
      .from('meals')
      .select('*', { count: 'exact', head: true });

    const { data: dailyStatsData } = await supabaseAdmin
      .from('daily_stats')
      .select('calories_consumed')
      .limit(100);

    const avgCalories = dailyStatsData && dailyStatsData.length > 0
      ? Math.round(dailyStatsData.reduce((sum, d) => sum + (d.calories_consumed || 0), 0) / dailyStatsData.length)
      : 0;

    const userGrowth: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const { count } = await supabaseAdmin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', nextDate.toISOString());
      
      userGrowth.push(count || 0);
    }

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      adminCount: adminCount || 0,
      activeToday: uniqueTodayUsers,
      activeMonth: uniqueMonthUsers,
      newUsersThisWeek: newUsersThisWeek || 0,
      totalMeals: totalMeals || 0,
      avgCalories,
      userGrowth,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
