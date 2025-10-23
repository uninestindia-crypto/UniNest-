import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../widgets/common/gradient_card.dart';
import '../../widgets/common/feature_card.dart';
import '../../widgets/home/hero_section.dart';
import '../../widgets/home/quick_actions.dart';
import '../../widgets/home/featured_products.dart';
import '../../widgets/home/upcoming_events.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final responsive = Responsive(context);
    
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero Section
          SliverToBoxAdapter(
            child: HeroSection(
              user: authState.user,
              role: authState.role,
            ),
          ),
          
          // Quick Actions Grid
          if (authState.user != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: responsive.isMobile ? 16 : 24,
                  vertical: 24,
                ),
                child: QuickActions(
                  role: authState.role,
                  onActionTap: (route) => context.go(route),
                ),
              ),
            ),
          
          // Main Features Grid
          SliverPadding(
            padding: EdgeInsets.symmetric(
              horizontal: responsive.isMobile ? 16 : 24,
            ),
            sliver: SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: responsive.isMobile ? 1 : responsive.isTablet ? 2 : 3,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: responsive.isMobile ? 1.5 : 1.2,
              ),
              delegate: SliverChildListDelegate([
                _buildFeatureCard(
                  context: context,
                  title: 'Marketplace',
                  description: 'Discover products and services from campus vendors',
                  icon: LucideIcons.shoppingBag,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF667EEA), Color(0xFF764BA2)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  onTap: () => context.go('/marketplace'),
                ),
                _buildFeatureCard(
                  context: context,
                  title: 'Study Hub',
                  description: 'Access notes, resources, and study materials',
                  icon: LucideIcons.bookOpen,
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF093FB), Color(0xFFF5576C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  onTap: () => context.go('/notes'),
                ),
                _buildFeatureCard(
                  context: context,
                  title: 'Workspace',
                  description: 'Find internships, competitions, and opportunities',
                  icon: LucideIcons.briefcase,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4FACFE), Color(0xFF00F2FE)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  onTap: () => context.go('/workspace'),
                ),
                _buildFeatureCard(
                  context: context,
                  title: 'Social Feed',
                  description: 'Connect with your campus community',
                  icon: LucideIcons.users,
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFA709A), Color(0xFFFEE140)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  onTap: () => context.go('/social'),
                ),
                _buildFeatureCard(
                  context: context,
                  title: 'Hostels',
                  description: 'Browse and book accommodation',
                  icon: LucideIcons.home,
                  gradient: const LinearGradient(
                    colors: [Color(0xFF30CFD0), Color(0xFF330867)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  onTap: () => context.go('/hostels'),
                ),
                _buildFeatureCard(
                  context: context,
                  title: 'Support',
                  description: 'Get help and submit feedback',
                  icon: LucideIcons.helpCircle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFFA8EDEA), Color(0xFFFED6E3)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  onTap: () => context.go('/support'),
                ),
              ]),
            ),
          ),
          
          // Featured Products Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 40),
              child: FeaturedProducts(
                onProductTap: (productId) => context.go('/marketplace/$productId'),
                onViewAll: () => context.go('/marketplace'),
              ),
            ),
          ),
          
          // Upcoming Events Section
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.only(top: 40, bottom: 40),
              child: UpcomingEvents(
                onEventTap: (eventId) => context.go('/workspace/competitions/$eventId'),
                onViewAll: () => context.go('/workspace'),
              ),
            ),
          ),
          
          // Call to Action
          if (authState.user == null)
            SliverToBoxAdapter(
              child: Container(
                margin: EdgeInsets.all(responsive.isMobile ? 16 : 24),
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Join UniNest Today!',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Connect with your campus community and unlock exclusive features',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ElevatedButton(
                          onPressed: () => context.go('/signup'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.white,
                            foregroundColor: AppTheme.primaryBlue,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                          ),
                          child: const Text(
                            'Sign Up',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        OutlinedButton(
                          onPressed: () => context.go('/login'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white, width: 2),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 32,
                              vertical: 16,
                            ),
                          ),
                          child: const Text(
                            'Login',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildFeatureCard({
    required BuildContext context,
    required String title,
    required String description,
    required IconData icon,
    required Gradient gradient,
    required VoidCallback onTap,
  }) {
    return GradientCard(
      gradient: gradient,
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 32,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              description,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
