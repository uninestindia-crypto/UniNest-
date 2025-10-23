import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../widgets/common/logo_widget.dart';
import '../widgets/common/avatar_widget.dart';
import '../widgets/vendor/vendor_sidebar_nav.dart';
import '../widgets/navigation/user_dropdown.dart';

class VendorLayout extends ConsumerStatefulWidget {
  final Widget child;
  
  const VendorLayout({
    super.key,
    required this.child,
  });
  
  @override
  ConsumerState<VendorLayout> createState() => _VendorLayoutState();
}

class _VendorLayoutState extends ConsumerState<VendorLayout> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _isSidebarCollapsed = false;
  
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final responsive = Responsive(context);
    
    // Check authorization
    if (authState.loading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                color: AppTheme.primaryBlue,
              ),
              const SizedBox(height: 16),
              const Text('Verifying vendor access...'),
            ],
          ),
        ),
      );
    }
    
    // Verify vendor or admin role
    final isAuthorized = authState.role == UserRole.vendor || 
                        authState.role == UserRole.admin;
    
    if (!isAuthorized) {
      // Redirect to home if not authorized
      WidgetsBinding.instance.addPostFrameCallback((_) {
        context.go('/');
      });
      return const SizedBox.shrink();
    }
    
    return Scaffold(
      key: _scaffoldKey,
      drawer: responsive.isMobile ? _buildMobileDrawer(context, authState) : null,
      body: Row(
        children: [
          // Desktop sidebar
          if (!responsive.isMobile)
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: _isSidebarCollapsed ? 80 : 280,
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                border: Border(
                  right: BorderSide(
                    color: Theme.of(context).dividerColor,
                  ),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(2, 0),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Header with logo
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: Theme.of(context).dividerColor.withOpacity(0.5),
                        ),
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            LucideIcons.store,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        if (!_isSidebarCollapsed) ...[
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Vendor Hub',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'UniNest',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        IconButton(
                          icon: Icon(
                            _isSidebarCollapsed 
                                ? LucideIcons.chevronRight 
                                : LucideIcons.chevronLeft,
                            size: 20,
                          ),
                          onPressed: () {
                            setState(() {
                              _isSidebarCollapsed = !_isSidebarCollapsed;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                  
                  // Navigation
                  Expanded(
                    child: VendorSidebarNav(
                      vendorCategories: authState.vendorCategories,
                      isCollapsed: _isSidebarCollapsed,
                      onSignOut: () => ref.read(authProvider.notifier).signOut(),
                    ),
                  ),
                  
                  // User footer
                  Container(
                    padding: EdgeInsets.all(_isSidebarCollapsed ? 12 : 16),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.05),
                      border: Border(
                        top: BorderSide(
                          color: Theme.of(context).dividerColor,
                        ),
                      ),
                    ),
                    child: _buildUserFooter(context, authState, _isSidebarCollapsed),
                  ),
                ],
              ),
            ),
          
          // Main content area
          Expanded(
            child: Column(
              children: [
                // Top bar
                Container(
                  height: 64,
                  padding: EdgeInsets.symmetric(
                    horizontal: responsive.isMobile ? 16 : 24,
                  ),
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    border: Border(
                      bottom: BorderSide(
                        color: Theme.of(context).dividerColor.withOpacity(0.5),
                      ),
                    ),
                  ),
                  child: Row(
                    children: [
                      if (responsive.isMobile)
                        IconButton(
                          icon: const Icon(LucideIcons.menu),
                          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
                        ),
                      if (responsive.isMobile) ...[
                        const Icon(LucideIcons.store, size: 20),
                        const SizedBox(width: 8),
                        const Text(
                          'Vendor Hub',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                      const Spacer(),
                      
                      // Subscription status badge
                      if (authState.vendorSubscriptionStatus.isVendorActive)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: Colors.green.withOpacity(0.3),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Colors.green,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                authState.vendorSubscriptionStatus.isTrialActive 
                                    ? 'Trial Active' 
                                    : 'Active',
                                style: const TextStyle(
                                  color: Colors.green,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      
                      const SizedBox(width: 16),
                      
                      // Quick actions
                      IconButton(
                        icon: const Icon(LucideIcons.bell),
                        onPressed: () {
                          // Show notifications
                        },
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.settings),
                        onPressed: () => context.go('/vendor/settings'),
                      ),
                      
                      const SizedBox(width: 8),
                      
                      // User dropdown
                      UserDropdown(
                        user: authState.user,
                        role: authState.role,
                        onSignOut: () => ref.read(authProvider.notifier).signOut(),
                      ),
                    ],
                  ),
                ),
                
                // Page content
                Expanded(
                  child: widget.child,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMobileDrawer(BuildContext context, AuthState authState) {
    return Drawer(
      child: Column(
        children: [
          DrawerHeader(
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        LucideIcons.store,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Vendor Hub',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'UniNest',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: VendorSidebarNav(
              vendorCategories: authState.vendorCategories,
              isCollapsed: false,
              onSignOut: () {
                Navigator.pop(context);
                ref.read(authProvider.notifier).signOut();
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border(
                top: BorderSide(
                  color: Theme.of(context).dividerColor,
                ),
              ),
            ),
            child: _buildUserFooter(context, authState, false),
          ),
        ],
      ),
    );
  }
  
  Widget _buildUserFooter(BuildContext context, AuthState authState, bool isCollapsed) {
    final user = authState.user;
    
    if (user == null) return const SizedBox.shrink();
    
    if (isCollapsed) {
      return Center(
        child: AvatarWidget(
          imageUrl: user.userMetadata?['avatar_url'] as String?,
          fallback: user.email?[0].toUpperCase() ?? 'V',
          size: 36,
        ),
      );
    }
    
    return Row(
      children: [
        AvatarWidget(
          imageUrl: user.userMetadata?['avatar_url'] as String?,
          fallback: user.email?[0].toUpperCase() ?? 'V',
          size: 40,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.userMetadata?['full_name'] as String? ?? 'Vendor',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                authState.role == UserRole.admin ? 'Admin' : 'Vendor',
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).primaryColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
        IconButton(
          icon: const Icon(LucideIcons.logOut, size: 20),
          onPressed: () => ref.read(authProvider.notifier).signOut(),
          tooltip: 'Logout',
        ),
      ],
    );
  }
}
