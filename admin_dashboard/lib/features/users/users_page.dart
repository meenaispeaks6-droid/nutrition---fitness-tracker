import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/theme.dart';
import '../../core/models.dart';
import '../../core/mock_data.dart';

class UsersPage extends StatefulWidget {
  const UsersPage({super.key});

  @override
  State<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends State<UsersPage> {
  late List<AppUser> allUsers;
  late List<AppUser> filteredUsers;
  String searchQuery = '';
  String? selectedDietFilter;
  AppUser? selectedUser;
  int currentPage = 0;
  final int rowsPerPage = 8;

  final List<String> dietFilters = ['All', 'Keto', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Paleo', 'None'];

  @override
  void initState() {
    super.initState();
    allUsers = MockDataService.getUsers();
    filteredUsers = allUsers;
  }

  void _filterUsers() {
    setState(() {
      filteredUsers = allUsers.where((user) {
        final matchesSearch = searchQuery.isEmpty ||
            user.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().contains(searchQuery.toLowerCase());
        
        final matchesDiet = selectedDietFilter == null ||
            selectedDietFilter == 'All' ||
            user.dietaryRestrictions.contains(selectedDietFilter);
        
        return matchesSearch && matchesDiet;
      }).toList();
      currentPage = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isMobile = width < 768;

    return Scaffold(
      backgroundColor: AppTheme.background,
      endDrawer: selectedUser != null ? _buildUserDrawer(isMobile) : null,
      body: Row(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(isMobile ? 16 : 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  const SizedBox(height: 24),
                  _buildSearchAndFilters(isMobile),
                  const SizedBox(height: 24),
                  _buildUsersTable(isMobile),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'User Management',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${allUsers.length} total users',
              style: const TextStyle(
                fontSize: 14,
                color: AppTheme.textMuted,
              ),
            ),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            gradient: const LinearGradient(
              colors: [AppTheme.neoMint, AppTheme.neoMintDark],
            ),
          ),
          child: Row(
            children: const [
              Icon(Icons.person_add_rounded, color: AppTheme.background, size: 18),
              SizedBox(width: 8),
              Text(
                'Add User',
                style: TextStyle(
                  color: AppTheme.background,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSearchAndFilters(bool isMobile) {
    return Wrap(
      spacing: 16,
      runSpacing: 16,
      children: [
        SizedBox(
          width: isMobile ? double.infinity : 320,
          child: TextField(
            onChanged: (value) {
              searchQuery = value;
              _filterUsers();
            },
            style: const TextStyle(color: AppTheme.textPrimary),
            decoration: InputDecoration(
              hintText: 'Search by name or email...',
              hintStyle: const TextStyle(color: AppTheme.textMuted),
              prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textMuted),
              filled: true,
              fillColor: AppTheme.surface,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            color: AppTheme.surface,
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: selectedDietFilter ?? 'All',
              hint: const Text('Diet Filter', style: TextStyle(color: AppTheme.textMuted)),
              dropdownColor: AppTheme.surface,
              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppTheme.textMuted),
              items: dietFilters.map((diet) {
                return DropdownMenuItem(
                  value: diet,
                  child: Text(
                    diet,
                    style: const TextStyle(color: AppTheme.textSecondary),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                selectedDietFilter = value;
                _filterUsers();
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUsersTable(bool isMobile) {
    final startIndex = currentPage * rowsPerPage;
    final endIndex = (startIndex + rowsPerPage).clamp(0, filteredUsers.length);
    final pageUsers = filteredUsers.sublist(startIndex, endIndex);
    final totalPages = (filteredUsers.length / rowsPerPage).ceil();

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: AppTheme.surface,
      ),
      child: Column(
        children: [
          if (!isMobile) _buildTableHeader(),
          ...pageUsers.map((user) => _buildUserRow(user, isMobile)),
          _buildPagination(totalPages),
        ],
      ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: AppTheme.surfaceLight, width: 1),
        ),
      ),
      child: Row(
        children: const [
          SizedBox(width: 56),
          Expanded(flex: 2, child: Text('Name', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600))),
          Expanded(flex: 2, child: Text('Email', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600))),
          Expanded(child: Text('Joined', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600))),
          Expanded(child: Text('Last Active', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600))),
          Expanded(child: Text('Goal', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600))),
          SizedBox(width: 80, child: Text('Status', style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }

  Widget _buildUserRow(AppUser user, bool isMobile) {
    if (isMobile) {
      return InkWell(
        onTap: () => _showUserDrawer(user),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(color: AppTheme.surfaceLight.withOpacity(0.5)),
            ),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppTheme.neoMint.withOpacity(0.2),
                child: Text(
                  user.name[0].toUpperCase(),
                  style: const TextStyle(color: AppTheme.neoMint, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user.email,
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(user.status),
            ],
          ),
        ),
      );
    }

    return InkWell(
      onTap: () => _showUserDrawer(user),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(color: AppTheme.surfaceLight.withOpacity(0.5)),
          ),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: AppTheme.neoMint.withOpacity(0.2),
              child: Text(
                user.name[0].toUpperCase(),
                style: const TextStyle(color: AppTheme.neoMint, fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: Text(
                user.name,
                style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.w500),
              ),
            ),
            Expanded(
              flex: 2,
              child: Text(
                user.email,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
            ),
            Expanded(
              child: Text(
                DateFormat('MMM d, yy').format(user.joinDate),
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
            ),
            Expanded(
              child: Text(
                _formatLastActive(user.lastActive),
                style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
              ),
            ),
            Expanded(
              child: Text(
                user.goal,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
            ),
            SizedBox(width: 80, child: _buildStatusBadge(user.status)),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    final isActive = status == 'Active';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: isActive ? AppTheme.success.withOpacity(0.15) : AppTheme.error.withOpacity(0.15),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: isActive ? AppTheme.success : AppTheme.error,
        ),
      ),
    );
  }

  String _formatLastActive(DateTime lastActive) {
    final diff = DateTime.now().difference(lastActive);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  Widget _buildPagination(int totalPages) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Showing ${currentPage * rowsPerPage + 1}-${((currentPage + 1) * rowsPerPage).clamp(0, filteredUsers.length)} of ${filteredUsers.length}',
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 13),
          ),
          Row(
            children: [
              IconButton(
                onPressed: currentPage > 0 ? () => setState(() => currentPage--) : null,
                icon: Icon(
                  Icons.chevron_left_rounded,
                  color: currentPage > 0 ? AppTheme.textSecondary : AppTheme.textMuted,
                ),
              ),
              ...List.generate(totalPages.clamp(0, 5), (i) {
                final pageNum = i;
                return InkWell(
                  onTap: () => setState(() => currentPage = pageNum),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: currentPage == pageNum ? AppTheme.neoMint : Colors.transparent,
                    ),
                    child: Text(
                      '${pageNum + 1}',
                      style: TextStyle(
                        color: currentPage == pageNum ? AppTheme.background : AppTheme.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                );
              }),
              IconButton(
                onPressed: currentPage < totalPages - 1 ? () => setState(() => currentPage++) : null,
                icon: Icon(
                  Icons.chevron_right_rounded,
                  color: currentPage < totalPages - 1 ? AppTheme.textSecondary : AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showUserDrawer(AppUser user) {
    setState(() => selectedUser = user);
    Scaffold.of(context).openEndDrawer();
  }

  Widget _buildUserDrawer(bool isMobile) {
    final user = selectedUser!;
    return Drawer(
      width: isMobile ? MediaQuery.of(context).size.width * 0.85 : 400,
      backgroundColor: Colors.transparent,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
          child: Container(
            decoration: BoxDecoration(
              color: AppTheme.surface.withOpacity(0.95),
              border: Border(
                left: BorderSide(color: AppTheme.neoMint.withOpacity(0.2)),
              ),
            ),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        AppTheme.neoMint.withOpacity(0.2),
                        AppTheme.surface,
                      ],
                    ),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'User Details',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                          IconButton(
                            onPressed: () => Navigator.pop(context),
                            icon: const Icon(Icons.close_rounded, color: AppTheme.textMuted),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      CircleAvatar(
                        radius: 48,
                        backgroundColor: AppTheme.neoMint.withOpacity(0.2),
                        child: Text(
                          user.name[0].toUpperCase(),
                          style: const TextStyle(
                            color: AppTheme.neoMint,
                            fontWeight: FontWeight.bold,
                            fontSize: 32,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        user.name,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.email,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildStatusBadge(user.status),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildInfoRow('Goal', user.goal),
                        _buildInfoRow('Diet', user.dietaryRestrictions.join(', ')),
                        _buildInfoRow('Joined', DateFormat('MMMM d, yyyy').format(user.joinDate)),
                        _buildInfoRow('Last Active', _formatLastActive(user.lastActive)),
                        const SizedBox(height: 24),
                        const Text(
                          'Recent Meals',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...user.mealHistory.map((meal) => _buildMealCard(meal)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: AppTheme.textMuted, fontSize: 14),
          ),
          Text(
            value,
            style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }

  Widget _buildMealCard(MealSnapshot meal) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        color: AppTheme.surfaceLight,
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: AppTheme.neoMint.withOpacity(0.15),
            ),
            child: const Icon(Icons.restaurant_rounded, color: AppTheme.neoMint, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  meal.name,
                  style: const TextStyle(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w500,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  DateFormat('MMM d, h:mm a').format(meal.loggedAt),
                  style: const TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: AppTheme.neoMint.withOpacity(0.15),
            ),
            child: Text(
              '${meal.calories} kcal',
              style: const TextStyle(
                color: AppTheme.neoMint,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
