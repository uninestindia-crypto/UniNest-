import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

class VendorSidebarNav extends StatelessWidget {
  final List<String> vendorCategories;
  final bool isCollapsed;
  final VoidCallback onSignOut;
  
  const VendorSidebarNav({
    super.key,
    required this.vendorCategories,
    required this.isCollapsed,
    required this.onSignOut,
  });
  
  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).matchedLocation;
    
    return ListView(
      padding: const EdgeInsets.symmetric(vertical: 8),
      children: [
        // Main dashboard
        _VendorNavItem(
          icon: LucideIcons.layoutDashboard,
          label: 'Dashboard',
          isActive: currentRoute == '/vendor/dashboard',
          isCollapsed: isCollapsed,
          onTap: () => context.go('/vendor/dashboard'),
        ),
        
        // Add new product
        _VendorNavItem(
          icon: LucideIcons.plusCircle,
          label: 'Add New Product',
          isActive: currentRoute == '/vendor/products/new',
          isCollapsed: isCollapsed,
          onTap: () => context.go('/vendor/products/new'),
          isPrimary: true,
        ),
        
        // Category-specific dashboards
        if (vendorCategories.isNotEmpty) ...[
          if (!isCollapsed)
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text(
                'Service Hubs',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey,
                ),
              ),
            ),
          ..._getCategoryDashboards().where((item) {
            return vendorCategories.contains(item.id.replaceAll('-', ' '));
          }).map((item) {
            final isActive = currentRoute == '/vendor/dashboard/${item.id}';
            return _VendorNavItem(
              icon: item.icon,
              label: item.label,
              isActive: isActive,
              isCollapsed: isCollapsed,
              onTap: () => context.go('/vendor/dashboard/${item.id}'),
            );
          }),
        ],
        
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Divider(),
        ),
        
        // General navigation items
        if (!isCollapsed)
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: Text(
              'General',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
          ),
        
        ..._getGeneralNavItems().map((item) {
          final isActive = currentRoute.startsWith(item.href);
          return _VendorNavItem(
            icon: item.icon,
            label: item.label,
            isActive: isActive,
            isCollapsed: isCollapsed,
            onTap: () => context.go(item.href),
          );
        }),
        
        const Spacer(),
        
        // Settings
        _VendorNavItem(
          icon: LucideIcons.settings,
          label: 'Settings',
          isActive: currentRoute.startsWith('/vendor/settings'),
          isCollapsed: isCollapsed,
          onTap: () => context.go('/vendor/settings'),
        ),
      ],
    );
  }
  
  List<_CategoryDashboard> _getCategoryDashboards() {
    return [
      _CategoryDashboard(
        id: 'library',
        label: 'Library Hub',
        icon: LucideIcons.library,
      ),
      _CategoryDashboard(
        id: 'food-mess',
        label: 'Food Mess Hub',
        icon: LucideIcons.utensils,
      ),
      _CategoryDashboard(
        id: 'hostels',
        label: 'Hostel Hub',
        icon: LucideIcons.bed,
      ),
      _CategoryDashboard(
        id: 'cybercafe',
        label: 'Cybercafé Hub',
        icon: LucideIcons.laptop,
      ),
    ];
  }
  
  List<_NavItemData> _getGeneralNavItems() {
    return [
      _NavItemData(
        href: '/vendor/onboarding',
        label: 'Onboarding',
        icon: LucideIcons.checkCircle2,
      ),
      _NavItemData(
        href: '/vendor/analytics',
        label: 'Analytics',
        icon: LucideIcons.lineChart,
      ),
      _NavItemData(
        href: '/vendor/subscription',
        label: 'Subscription',
        icon: LucideIcons.shieldCheck,
      ),
      _NavItemData(
        href: '/vendor/promotions',
        label: 'Promotions',
        icon: LucideIcons.megaphone,
      ),
      _NavItemData(
        href: '/vendor/products',
        label: 'All Products',
        icon: LucideIcons.package,
      ),
      _NavItemData(
        href: '/vendor/orders',
        label: 'All Orders',
        icon: LucideIcons.shoppingCart,
      ),
      _NavItemData(
        href: '/vendor/chat',
        label: 'Messages',
        icon: LucideIcons.messageSquare,
      ),
    ];
  }
}

class _VendorNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final bool isCollapsed;
  final VoidCallback onTap;
  final bool isPrimary;
  
  const _VendorNavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.isCollapsed,
    required this.onTap,
    this.isPrimary = false,
  });
  
  @override
  Widget build(BuildContext context) {
    final color = isPrimary
        ? Theme.of(context).primaryColor
        : isActive
            ? Theme.of(context).primaryColor
            : null;
    
    final backgroundColor = isPrimary
        ? Theme.of(context).primaryColor.withOpacity(0.1)
        : isActive
            ? Theme.of(context).primaryColor.withOpacity(0.08)
            : Colors.transparent;
    
    if (isCollapsed) {
      return Tooltip(
        message: label,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
          child: Material(
            color: backgroundColor,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.all(12),
                child: Icon(
                  icon,
                  size: 20,
                  color: color,
                ),
              ),
            ),
          ),
        ),
      );
    }
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Material(
        color: backgroundColor,
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
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: isPrimary || isActive 
                          ? FontWeight.w600 
                          : FontWeight.normal,
                      color: color,
                    ),
                  ),
                ),
                if (isPrimary)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'NEW',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Theme.of(context).primaryColor,
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
}

class _NavItemData {
  final String href;
  final String label;
  final IconData icon;
  
  const _NavItemData({
    required this.href,
    required this.label,
    required this.icon,
  });
}

class _CategoryDashboard {
  final String id;
  final String label;
  final IconData icon;
  
  const _CategoryDashboard({
    required this.id,
    required this.label,
    required this.icon,
  });
}
