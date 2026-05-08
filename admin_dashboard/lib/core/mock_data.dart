import 'dart:math';
import 'models.dart';

class MockDataService {
  static final _random = Random(42);

  static DashboardStats getDashboardStats() {
    final now = DateTime.now();
    final userGrowth = List.generate(30, (i) {
      return DataPoint(
        date: now.subtract(Duration(days: 29 - i)),
        value: 1200 + (i * 45) + _random.nextInt(100).toDouble(),
      );
    });

    return DashboardStats(
      dau: 2847,
      dauChange: 12.5,
      mau: 18420,
      mauChange: 8.3,
      avgSessionTime: 8.5,
      sessionChange: 15.2,
      premiumUsers: 4250,
      freeUsers: 14170,
      monthlyRevenue: 42580.00,
      revenueChange: 23.4,
      churnRate: 4.2,
      userGrowth: userGrowth,
    );
  }

  static List<AppUser> getUsers() {
    final goals = ['Lose Weight', 'Gain Muscle', 'Maintain', 'Keto', 'Vegan'];
    final diets = ['Keto', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Paleo', 'None'];
    final statuses = ['Active', 'Active', 'Active', 'Active', 'Banned'];
    final names = [
      'Sarah Johnson', 'Ahmed Khan', 'Maria Garcia', 'James Wilson',
      'Priya Sharma', 'Michael Brown', 'Emma Davis', 'Ali Hassan',
      'Sofia Rodriguez', 'David Lee', 'Aisha Patel', 'John Smith',
      'Fatima Noor', 'Chris Taylor', 'Zara Ahmed', 'Ryan Murphy',
      'Ananya Gupta', 'Tom Anderson', 'Layla Ibrahim', 'Jake Thompson',
    ];

    return List.generate(names.length, (i) {
      final now = DateTime.now();
      final joinDate = now.subtract(Duration(days: _random.nextInt(365)));
      final lastActive = now.subtract(Duration(hours: _random.nextInt(72)));
      
      return AppUser(
        id: 'user_${i + 1}',
        name: names[i],
        email: '${names[i].toLowerCase().replaceAll(' ', '.')}@email.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=${names[i]}',
        joinDate: joinDate,
        lastActive: lastActive,
        goal: goals[_random.nextInt(goals.length)],
        status: statuses[_random.nextInt(statuses.length)],
        dietaryRestrictions: [diets[_random.nextInt(diets.length)]],
        mealHistory: _generateMealHistory(),
      );
    });
  }

  static List<MealSnapshot> _generateMealHistory() {
    final meals = [
      ('Grilled Chicken Salad', 450),
      ('Avocado Toast', 320),
      ('Protein Smoothie', 280),
      ('Quinoa Bowl', 520),
      ('Greek Yogurt Parfait', 350),
      ('Salmon with Veggies', 580),
      ('Oatmeal with Berries', 290),
    ];

    return List.generate(5, (i) {
      final meal = meals[_random.nextInt(meals.length)];
      return MealSnapshot(
        id: 'meal_$i',
        name: meal.$1,
        calories: meal.$2,
        imageUrl: 'https://source.unsplash.com/100x100/?${meal.$1.replaceAll(' ', '-')}',
        loggedAt: DateTime.now().subtract(Duration(hours: i * 6)),
      );
    });
  }

  static List<Transaction> getTransactions() {
    final plans = ['Monthly Premium', 'Annual Premium', 'Family Plan'];
    final statuses = ['Success', 'Success', 'Success', 'Pending', 'Failed'];
    final amounts = [9.99, 79.99, 14.99];

    return List.generate(20, (i) {
      final planIndex = _random.nextInt(plans.length);
      return Transaction(
        id: 'txn_${1000 + i}',
        userId: 'user_${_random.nextInt(20) + 1}',
        userName: 'User ${_random.nextInt(20) + 1}',
        amount: amounts[planIndex],
        plan: plans[planIndex],
        status: statuses[_random.nextInt(statuses.length)],
        date: DateTime.now().subtract(Duration(days: i)),
      );
    });
  }
}
