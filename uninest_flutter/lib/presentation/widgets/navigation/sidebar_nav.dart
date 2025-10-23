import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/providers/auth_provider.dart';

class SidebarNav extends StatelessWidget {
  final dynamic user;
  final UserRole role;
  final VoidCallback onSignOut;
  
  const SidebarNav({
    super.key,
    required this.user,
    required this.role,
    required this.onSignOut,
  });
  
  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).matchedLocation;
    
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        // Main navigation items
        ..._getMainNavItems().map((item) {
          if (!item.roles.contains(role)) return const SizedBox.shrink();
          
          final isActive = item.href == '/' 
              ? currentRoute == '/'
              : currentRoute.startsWith(item.href);
          
          return _NavItem(
            icon: item.icon,
            label: item.label,
            isActive: isActive,
            onTap: () => context.go(item.href),
          );
        }),
        
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Divider(),
        ),
        
        // Secondary navigation items
        ..._getSecondaryNavItems().map((item) {
          if (!item.roles.contains(role)) return const SizedBox.shrink();
          
          final isActive = currentRoute.startsWith(item.href);
          
          return _NavItem(
            icon: item.icon,
            label: item.label,
            isActive: isActive,
            onTap: () => context.go(item.href),
          );
        }),
        
        const Spacer(),
        
        // Donate button
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.amber.shade100,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.amber.shade200,
                width: 2,
              ),
            ),
            child: ListTile(
              leading: Icon(
                LucideIcons.heart,
                color: Colors.amber.shade700,
              ),
              title: Text(
                'Donate',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.amber.shade700,
                ),
              ),
              onTap: () => context.go('/donate'),
            ),
          ),
        ),
        
        // Admin panel link
        if (role == UserRole.admin) ...[
          _NavItem(
            icon: LucideIcons.userCog,
            label: 'Admin Panel',
            isActive: currentRoute.startsWith('/admin') && !currentRoute.startsWith('/admin/marketing'),
            onTap: () => context.go('/admin/dashboard'),
          ),
          _NavItem(
            icon: LucideIcons.sparkles,
            label: 'Donation Settings',
            isActive: currentRoute.startsWith('/admin/marketing'),
            onTap: () => context.go('/admin/marketing/donations'),
          ),
        ],
        
        // Settings and logout for authenticated users
        if (user != null) ...[
          _NavItem(
            icon: LucideIcons.settings,
            label: 'Settings',
            isActive: currentRoute == '/settings',
            onTap: () => context.go('/settings'),
          ),
          _NavItem(
            icon: LucideIcons.logOut,
            label: 'Logout',
            isActive: false,
            onTap: onSignOut,
            isDestructive: true,
          ),
        ],
      ],
    );
  }
  
  List<_NavItemData> _getMainNavItems() {
    return [
      _NavItemData(
        href: '/',
        label: 'Home',
        icon: LucideIcons.home,
        roles: [UserRole.student, UserRole.vendor, UserRole.guest, UserRole.admin],
      ),
      _NavItemData(
        href: '/social',
        label: 'Social',
        icon: LucideIcons.users,
        roles: [UserRole.student, UserRole.guest, UserRole.admin],
      ),
      _NavItemData(
        href: '/marketplace',
        label: 'Marketplace',
        icon: LucideIcons.shoppingBag,
        roles: [UserRole.student, UserRole.guest, UserRole.vendor, UserRole.admin],
      ),
      _NavItemData(
        href: '/workspace',
        label: 'Workspace',
        icon: LucideIcons.layoutGrid,
        roles: [UserRole.student, UserRole.vendor, UserRole.guest, UserRole.admin],
      ),
      _NavItemData(
        href: '/notes',
        label: 'Study Hub',
        icon: LucideIcons.bookOpen,
        roles: [UserRole.student, UserRole.vendor, UserRole.guest, UserRole.admin],
      ),
    ];
  }
  
  List<_NavItemData> _getSecondaryNavItems() {
    return [
      _NavItemData(
        href: '/about',
        label: 'About Us',
        icon: LucideIcons.info,
        roles: [UserRole.student, UserRole.vendor, UserRole.guest, UserRole.admin],
      ),
      _NavItemData(
        href: '/support',
        label: 'Support',
        icon: LucideIcons.lifeBuoy,
        roles: [UserRole.student, UserRole.vendor, UserRole.admin],
      ),
    ];
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final bool isDestructive;
  
  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
    this.isDestructive = false,
  });
  
  @override
  Widget build(BuildContext context) {
    final color = isDestructive
        ? Colors.red
        : isActive
            ? Theme.of(context).primaryColor
            : null;
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: isActive
            ? Theme.of(context).primaryColor.withOpacity(0.1)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: color,
                ),
                const SizedBox(width: 12),
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItemData {
  final String href;
  final String label;
  final IconData icon;
  final List<UserRole> roles;
  
  const _NavItemData({
    required this.href,
    required this.label,
    required this.icon,
    required this.roles,
  });
}
