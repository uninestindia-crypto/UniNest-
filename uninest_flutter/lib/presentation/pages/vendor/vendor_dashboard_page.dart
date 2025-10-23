import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../widgets/vendor/dashboard/stats_card.dart';
import '../../widgets/vendor/dashboard/revenue_chart.dart';
import '../../widgets/vendor/dashboard/recent_orders.dart';
import '../../widgets/vendor/dashboard/product_performance.dart';
import '../../widgets/vendor/dashboard/quick_actions.dart';

class VendorDashboardPage extends ConsumerStatefulWidget {
  const VendorDashboardPage({super.key});
  
  @override
  ConsumerState<VendorDashboardPage> createState() => _VendorDashboardPageState();
}

class _VendorDashboardPageState extends ConsumerState<VendorDashboardPage> {
  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final responsive = Responsive(context);
    
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SingleChildScrollView(
        padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            _buildWelcomeHeader(context, authState),
            SizedBox(height: responsive.mediumSpacing),
            
            // Quick Actions
            _buildQuickActions(context, responsive),
            SizedBox(height: responsive.largeSpacing),
            
            // Stats Grid
            _buildStatsGrid(context, responsive),
            SizedBox(height: responsive.largeSpacing),
            
            // Charts Row
            _buildChartsSection(context, responsive),
            SizedBox(height: responsive.largeSpacing),
            
            // Recent Activity
            _buildRecentActivity(context, responsive),
          ],
        ),
      ),
    );
  }
  
  Widget _buildWelcomeHeader(BuildContext context, AuthState authState) {
    final user = authState.user;
    final greeting = _getGreeting();
    
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryBlue.withOpacity(0.1),
            AppTheme.primaryPurple.withOpacity(0.1),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).dividerColor.withOpacity(0.5),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$greeting, ${user?.userMetadata?['full_name'] ?? 'Vendor'}!',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Here\'s what\'s happening with your store today.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Theme.of(context).textTheme.bodySmall?.color,
                  ),
                ),
                const SizedBox(height: 16),
                // Subscription Status Badge
                if (authState.vendorSubscriptionStatus.isVendorActive)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
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
                        const Icon(
                          LucideIcons.checkCircle,
                          size: 16,
                          color: Colors.green,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          authState.vendorSubscriptionStatus.isTrialActive
                              ? 'Trial Active - Upgrade for full features'
                              : 'Premium Active',
                          style: const TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              LucideIcons.store,
              size: 48,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildQuickActions(BuildContext context, Responsive responsive) {
    final actions = [
      QuickAction(
        icon: LucideIcons.plusCircle,
        label: 'Add Product',
        color: Colors.blue,
        onTap: () => Navigator.pushNamed(context, '/vendor/products/new'),
      ),
      QuickAction(
        icon: LucideIcons.megaphone,
        label: 'Create Promotion',
        color: Colors.orange,
        onTap: () => Navigator.pushNamed(context, '/vendor/promotions'),
      ),
      QuickAction(
        icon: LucideIcons.sparkles,
        label: 'AI Optimizer',
        color: Colors.purple,
        onTap: () => _showAIOptimizer(context),
      ),
      QuickAction(
        icon: LucideIcons.messageSquare,
        label: 'Messages',
        color: Colors.green,
        badge: '3',
        onTap: () => Navigator.pushNamed(context, '/vendor/chat'),
      ),
    ];
    
    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: actions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final action = actions[index];
          return _buildQuickActionCard(context, action);
        },
      ),
    );
  }
  
  Widget _buildQuickActionCard(BuildContext context, QuickAction action) {
    return InkWell(
      onTap: action.onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        width: 120,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Theme.of(context).dividerColor.withOpacity(0.5),
          ),
          boxShadow: [
            BoxShadow(
              color: action.color.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: action.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    action.icon,
                    color: action.color,
                    size: 24,
                  ),
                ),
                if (action.badge != null)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        action.badge!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              action.label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).textTheme.bodyMedium?.color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatsGrid(BuildContext context, Responsive responsive) {
    final stats = [
      StatData(
        title: 'Total Revenue',
        value: '₹45,231',
        change: '+12.5%',
        isPositive: true,
        icon: LucideIcons.dollarSign,
        color: Colors.green,
      ),
      StatData(
        title: 'Total Orders',
        value: '156',
        change: '+8.2%',
        isPositive: true,
        icon: LucideIcons.shoppingCart,
        color: Colors.blue,
      ),
      StatData(
        title: 'Active Products',
        value: '24',
        change: '+2',
        isPositive: true,
        icon: LucideIcons.package,
        color: Colors.orange,
      ),
      StatData(
        title: 'Customer Rating',
        value: '4.8',
        change: '+0.2',
        isPositive: true,
        icon: LucideIcons.star,
        color: Colors.purple,
      ),
    ];
    
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: responsive.isMobile ? 2 : 4,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
        childAspectRatio: responsive.isMobile ? 1.2 : 1.3,
      ),
      itemCount: stats.length,
      itemBuilder: (context, index) {
        return StatsCard(data: stats[index]);
      },
    );
  }
  
  Widget _buildChartsSection(BuildContext context, Responsive responsive) {
    if (responsive.isMobile) {
      return Column(
        children: [
          _buildRevenueChart(context),
          const SizedBox(height: 16),
          _buildProductPerformance(context),
        ],
      );
    }
    
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: _buildRevenueChart(context),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildProductPerformance(context),
        ),
      ],
    );
  }
  
  Widget _buildRevenueChart(BuildContext context) {
    return Container(
      height: 350,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).dividerColor.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Revenue Overview',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Last 7 days',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          const Expanded(
            child: RevenueChart(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildProductPerformance(BuildContext context) {
    return Container(
      height: 350,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).dividerColor.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Top Products',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 20),
          const Expanded(
            child: ProductPerformance(),
          ),
        ],
      ),
    );
  }
  
  Widget _buildRecentActivity(BuildContext context, Responsive responsive) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).dividerColor.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Orders',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/vendor/orders'),
                child: const Text('View All'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const RecentOrders(),
        ],
      ),
    );
  }
  
  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
  
  void _showAIOptimizer(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('AI Listing Optimizer'),
        content: const Text(
          'The AI optimizer will analyze your product listings and suggest improvements for better visibility and sales.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              // Implement AI optimization
            },
            child: const Text('Optimize Now'),
          ),
        ],
      ),
    );
  }
}

class QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final String? badge;
  final VoidCallback onTap;
  
  QuickAction({
    required this.icon,
    required this.label,
    required this.color,
    this.badge,
    required this.onTap,
  });
}

class StatData {
  final String title;
  final String value;
  final String change;
  final bool isPositive;
  final IconData icon;
  final Color color;
  
  StatData({
    required this.title,
    required this.value,
    required this.change,
    required this.isPositive,
    required this.icon,
    required this.color,
  });
}
