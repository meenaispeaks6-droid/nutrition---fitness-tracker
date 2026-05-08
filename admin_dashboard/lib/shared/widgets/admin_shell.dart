import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class AdminShell extends StatefulWidget {
  final Widget child;
  const AdminShell({super.key, required this.child});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  bool _isExpanded = true;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 768;

    if (isMobile) {
      return Scaffold(
        body: widget.child,
        bottomNavigationBar: _buildBottomNav(context),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          _buildSidebar(context),
          Expanded(child: widget.child),
        ],
      ),
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface.withOpacity(0.9),
        border: Border(
          top: BorderSide(color: AppTheme.neoMint.withOpacity(0.1)),
        ),
      ),
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _navItem(context, Icons.dashboard_rounded, 'Overview', '/admin', location),
                _navItem(context, Icons.people_rounded, 'Users', '/admin/users', location),
                _navItem(context, Icons.receipt_long_rounded, 'Billing', '/admin/billing', location),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(BuildContext context, IconData icon, String label, String path, String current) {
    final isActive = current == path;
    return InkWell(
      onTap: () => context.go(path),
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive ? AppTheme.neoMint : AppTheme.textMuted,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                color: isActive ? AppTheme.neoMint : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSidebar(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final sidebarWidth = _isExpanded ? 280.0 : 80.0;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      width: sidebarWidth,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppTheme.surface.withOpacity(0.8),
                  AppTheme.surface.withOpacity(0.6),
                ],
              ),
              border: Border(
                right: BorderSide(
                  color: AppTheme.neoMint.withOpacity(0.1),
                  width: 1,
                ),
              ),
            ),
            child: Column(
              children: [
                const SizedBox(height: 24),
                _buildLogo(),
                const SizedBox(height: 40),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildNavItem(
                        context,
                        Icons.dashboard_rounded,
                        'Overview',
                        '/admin',
                        location == '/admin',
                      ),
                      const SizedBox(height: 8),
                      _buildNavItem(
                        context,
                        Icons.people_rounded,
                        'Users',
                        '/admin/users',
                        location == '/admin/users',
                      ),
                      const SizedBox(height: 8),
                      _buildNavItem(
                        context,
                        Icons.receipt_long_rounded,
                        'Billing',
                        '/admin/billing',
                        location == '/admin/billing',
                      ),
                    ],
                  ),
                ),
                _buildCollapseButton(),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: const LinearGradient(
                colors: [AppTheme.neoMint, AppTheme.neoMintDark],
              ),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.neoMint.withOpacity(0.4),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: const Icon(
              Icons.fitness_center_rounded,
              color: AppTheme.background,
              size: 24,
            ),
          ),
          if (_isExpanded) ...[
            const SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Fitbit.ai',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  'Admin Panel',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppTheme.neoMint.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    IconData icon,
    String label,
    String path,
    bool isActive,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => context.go(path),
        borderRadius: BorderRadius.circular(16),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(
            horizontal: _isExpanded ? 16 : 12,
            vertical: 14,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: isActive ? AppTheme.neoMint.withOpacity(0.15) : Colors.transparent,
            border: isActive
                ? Border.all(color: AppTheme.neoMint.withOpacity(0.3))
                : null,
          ),
          child: Row(
            mainAxisAlignment: _isExpanded ? MainAxisAlignment.start : MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: isActive ? AppTheme.neoMint : AppTheme.textMuted,
                size: 22,
              ),
              if (_isExpanded) ...[
                const SizedBox(width: 14),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    color: isActive ? AppTheme.neoMint : AppTheme.textSecondary,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCollapseButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => setState(() => _isExpanded = !_isExpanded),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: AppTheme.surfaceLight.withOpacity(0.5),
            ),
            child: Row(
              mainAxisAlignment: _isExpanded ? MainAxisAlignment.start : MainAxisAlignment.center,
              children: [
                Icon(
                  _isExpanded ? Icons.chevron_left_rounded : Icons.chevron_right_rounded,
                  color: AppTheme.textMuted,
                  size: 20,
                ),
                if (_isExpanded) ...[
                  const SizedBox(width: 8),
                  Text(
                    'Collapse',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppTheme.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
