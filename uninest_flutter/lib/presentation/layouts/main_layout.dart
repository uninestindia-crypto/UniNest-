import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/responsive.dart';
import '../widgets/common/logo_widget.dart';
import '../widgets/common/avatar_widget.dart';
import '../widgets/navigation/sidebar_nav.dart';
import '../widgets/navigation/mobile_bottom_nav.dart';
import '../widgets/navigation/notifications_dropdown.dart';
import '../widgets/navigation/user_dropdown.dart';

class MainLayout extends ConsumerStatefulWidget {
  final Widget child;
  
  const MainLayout({
    super.key,
    required this.child,
  });
  
  @override
  ConsumerState<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends ConsumerState<MainLayout> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final currentRoute = GoRouterState.of(context).matchedLocation;
    final responsive = Responsive(context);
    
    // Check if current page is admin or vendor
    final isAdminPage = currentRoute.startsWith('/admin');
    final isVendorPage = currentRoute.startsWith('/vendor');
    final isHomePage = currentRoute == '/';
    
    // Return child directly for admin/vendor pages
    if (isAdminPage || isVendorPage) {
      return widget.child;
    }
    
    // Loading state
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
              Text(
                'Loading...',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ],
          ),
        ),
      );
    }
    
    return Scaffold(
      key: _scaffoldKey,
      drawer: responsive.isMobile ? _buildDrawer(context, authState) : null,
      appBar: _buildAppBar(context, authState, responsive),
      body: Row(
        children: [
          // Desktop sidebar
          if (!responsive.isMobile)
            Container(
              width: 280,
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                border: Border(
                  right: BorderSide(
                    color: Theme.of(context).dividerColor,
                  ),
                ),
              ),
              child: Column(
                children: [
                  // Logo header
                  Container(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            LucideIcons.home,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'UniNest',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Navigation
                  Expanded(
                    child: SidebarNav(
                      user: authState.user,
                      role: authState.role,
                      onSignOut: () => ref.read(authProvider.notifier).signOut(),
                    ),
                  ),
                  // User footer
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(
                          color: Theme.of(context).dividerColor,
                        ),
                      ),
                    ),
                    child: _buildUserFooter(context, authState),
                  ),
                ],
              ),
            ),
          // Main content
          Expanded(
            child: Container(
              color: Theme.of(context).scaffoldBackgroundColor,
              child: widget.child,
            ),
          ),
        ],
      ),
      bottomNavigationBar: responsive.isMobile 
          ? MobileBottomNav(
              currentRoute: currentRoute,
              user: authState.user,
              role: authState.role,
            )
          : null,
    );
  }
  
  PreferredSizeWidget _buildAppBar(
    BuildContext context,
    AuthState authState,
    Responsive responsive,
  ) {
    return AppBar(
      elevation: 0,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor.withOpacity(0.95),
      leading: responsive.isMobile
          ? IconButton(
              icon: const Icon(LucideIcons.menu),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
            )
          : null,
      title: responsive.isMobile
          ? Row(
              children: [
                const LogoWidget(size: 28),
                const SizedBox(width: 8),
                const Text(
                  'UniNest',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            )
          : null,
      actions: [
        // Instagram link
        IconButton(
          icon: const Icon(LucideIcons.instagram),
          onPressed: () {
            // Launch Instagram URL
          },
        ),
        // Notifications
        if (authState.user != null)
          NotificationsDropdown(
            notifications: authState.notifications,
            unreadCount: authState.unreadCount,
            onMarkAsRead: (id) => ref.read(authProvider.notifier).markAsRead(id),
          ),
        // User dropdown
        UserDropdown(
          user: authState.user,
          role: authState.role,
          onSignOut: () => ref.read(authProvider.notifier).signOut(),
        ),
        const SizedBox(width: 8),
      ],
    );
  }
  
  Widget _buildDrawer(BuildContext context, AuthState authState) {
    return Drawer(
      child: Column(
        children: [
          // Drawer header
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
                        LucideIcons.home,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'UniNest',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  'Your Digital Campus Hub',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.9),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          // Navigation
          Expanded(
            child: SidebarNav(
              user: authState.user,
              role: authState.role,
              onSignOut: () {
                Navigator.pop(context); // Close drawer
                ref.read(authProvider.notifier).signOut();
              },
            ),
          ),
          // User section
          if (authState.user != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                border: Border(
                  top: BorderSide(
                    color: Theme.of(context).dividerColor,
                  ),
                ),
              ),
              child: _buildUserFooter(context, authState),
            ),
        ],
      ),
    );
  }
  
  Widget _buildUserFooter(BuildContext context, AuthState authState) {
    final user = authState.user;
    
    if (user == null) {
      return Row(
        children: [
          const AvatarWidget(
            size: 36,
            fallback: 'G',
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Guest',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                GestureDetector(
                  onTap: () => context.go('/login'),
                  child: ShaderMask(
                    shaderCallback: (bounds) => AppTheme.primaryGradient.createShader(bounds),
                    child: const Text(
                      'Login',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }
    
    final userHandle = user.userMetadata?['handle'] as String?;
    final profileLink = userHandle != null ? '/profile/$userHandle' : '/profile';
    
    return GestureDetector(
      onTap: () => context.go(profileLink),
      child: Row(
        children: [
          AvatarWidget(
            imageUrl: user.userMetadata?['avatar_url'] as String?,
            fallback: user.email?[0].toUpperCase() ?? 'U',
            size: 36,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.userMetadata?['full_name'] as String? ?? 'User',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  user.email ?? '',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
