# Fitbit.ai Admin Dashboard

A Flutter Web Admin Dashboard for the Fitbit.ai ecosystem with ultra-minimalist design, Neo-Mint Green (#00E676) brand color, and dark mode (#121212).

## Features

### Page 1: Overview Dashboard
- **DAU (Daily Active Users)**: Current count with trend percentage
- **MAU (Monthly Active Users)**: 30-day unique users
- **Avg. Session Time**: Engagement tracking in minutes
- **Active Subscriptions**: Premium vs Free breakdown
- **User Growth Chart**: Neo-Mint glowing line chart (fl_chart)
- **Revenue Snapshot**: Monthly earnings with DAU/MAU ratio

### Page 2: User Management
- **PaginatedDataTable** with Avatar, Name, Email, Join Date, Last Active, Goal, Status
- **Search Bar**: Find users by email/name
- **Diet Filter**: Filter by dietary restrictions (Keto, Vegan, etc.)
- **Side Drawer**: Click row to view user's meal history

### Page 3: Subscription & Billing
- **Transaction List**: Status (Success/Pending/Failed)
- **Churn Rate Indicator**: Track subscription renewals
- **Revenue & Subscription Breakdown**

## Technical Stack

- **Flutter Web** with Material 3
- **GoRouter** for web-friendly URLs (`/admin`, `/admin/users`, `/admin/billing`)
- **fl_chart** for data visualization
- **Responsive Design**: Sidebar collapses on mobile
- **Glassmorphism UI**: Frosted glass effects on sidebar/drawer

## Running the Project

```bash
cd admin_dashboard
flutter pub get
flutter run -d chrome
```

## Building for Production

```bash
flutter build web
```

## Connecting to Backend

The mock data service (`lib/core/mock_data.dart`) is structured for easy Supabase/Firebase integration:

```dart
// Replace MockDataService calls with actual API calls
class DataService {
  final supabase = Supabase.instance.client;
  
  Future<DashboardStats> getDashboardStats() async {
    // Fetch from Supabase
  }
}
```

## Key Metrics Explanation

- **DAU/MAU Ratio**: App "stickiness" - how often users return
- **Avg Session Time**: Engagement depth (5-10 min = good)
- **Churn Rate**: Critical for subscription model optimization
