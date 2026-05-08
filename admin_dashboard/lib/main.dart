import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/router.dart';
import 'core/theme.dart';

void main() {
  runApp(const FitbitAIAdminApp());
}

class FitbitAIAdminApp extends StatelessWidget {
  const FitbitAIAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Fitbit.ai Admin',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: appRouter,
    );
  }
}
