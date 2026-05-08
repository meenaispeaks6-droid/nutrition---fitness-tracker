import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/dashboard/overview_page.dart';
import '../features/users/users_page.dart';
import '../features/billing/billing_page.dart';
import '../shared/widgets/admin_shell.dart';

final appRouter = GoRouter(
  initialLocation: '/admin',
  routes: [
    ShellRoute(
      builder: (context, state, child) => AdminShell(child: child),
      routes: [
        GoRoute(
          path: '/admin',
          name: 'overview',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: OverviewPage(),
          ),
        ),
        GoRoute(
          path: '/admin/users',
          name: 'users',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: UsersPage(),
          ),
        ),
        GoRoute(
          path: '/admin/billing',
          name: 'billing',
          pageBuilder: (context, state) => const NoTransitionPage(
            child: BillingPage(),
          ),
        ),
      ],
    ),
  ],
);
