class AppUser {
  final String id;
  final String name;
  final String email;
  final String avatarUrl;
  final DateTime joinDate;
  final DateTime lastActive;
  final String goal;
  final String status;
  final List<String> dietaryRestrictions;
  final List<MealSnapshot> mealHistory;

  AppUser({
    required this.id,
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.joinDate,
    required this.lastActive,
    required this.goal,
    required this.status,
    required this.dietaryRestrictions,
    required this.mealHistory,
  });
}

class MealSnapshot {
  final String id;
  final String name;
  final int calories;
  final String imageUrl;
  final DateTime loggedAt;

  MealSnapshot({
    required this.id,
    required this.name,
    required this.calories,
    required this.imageUrl,
    required this.loggedAt,
  });
}

class Transaction {
  final String id;
  final String userId;
  final String userName;
  final double amount;
  final String plan;
  final String status;
  final DateTime date;

  Transaction({
    required this.id,
    required this.userId,
    required this.userName,
    required this.amount,
    required this.plan,
    required this.status,
    required this.date,
  });
}

class DashboardStats {
  final int dau;
  final double dauChange;
  final int mau;
  final double mauChange;
  final double avgSessionTime;
  final double sessionChange;
  final int premiumUsers;
  final int freeUsers;
  final double monthlyRevenue;
  final double revenueChange;
  final double churnRate;
  final List<DataPoint> userGrowth;

  DashboardStats({
    required this.dau,
    required this.dauChange,
    required this.mau,
    required this.mauChange,
    required this.avgSessionTime,
    required this.sessionChange,
    required this.premiumUsers,
    required this.freeUsers,
    required this.monthlyRevenue,
    required this.revenueChange,
    required this.churnRate,
    required this.userGrowth,
  });
}

class DataPoint {
  final DateTime date;
  final double value;

  DataPoint({required this.date, required this.value});
}
