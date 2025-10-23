import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../../presentation/layouts/main_layout.dart';
import '../../presentation/layouts/vendor_layout.dart';
import '../../presentation/layouts/admin_layout.dart';
import '../../presentation/pages/home/home_page.dart';
import '../../presentation/pages/auth/login_page.dart';
import '../../presentation/pages/auth/signup_page.dart';
import '../../presentation/pages/auth/password_reset_page.dart';
import '../../presentation/pages/social/social_page.dart';
import '../../presentation/pages/social/connections_page.dart';
import '../../presentation/pages/marketplace/marketplace_page.dart';
import '../../presentation/pages/marketplace/product_detail_page.dart';
import '../../presentation/pages/marketplace/library_detail_page.dart';
import '../../presentation/pages/workspace/workspace_page.dart';
import '../../presentation/pages/workspace/internships_page.dart';
import '../../presentation/pages/workspace/competitions_page.dart';
import '../../presentation/pages/notes/notes_page.dart';
import '../../presentation/pages/about/about_page.dart';
import '../../presentation/pages/support/support_page.dart';
import '../../presentation/pages/donate/donate_page.dart';
import '../../presentation/pages/profile/profile_page.dart';
import '../../presentation/pages/profile/profile_setup_page.dart';
import '../../presentation/pages/settings/settings_page.dart';
import '../../presentation/pages/hostels/hostels_page.dart';
import '../../presentation/pages/hostels/hostel_detail_page.dart';
import '../../presentation/pages/booking/booking_page.dart';
import '../../presentation/pages/feed/feed_page.dart';
import '../../presentation/pages/search/search_page.dart';
import '../../presentation/pages/chat/chat_page.dart';
import '../../presentation/pages/vendor/vendor_dashboard_page.dart';
import '../../presentation/pages/vendor/vendor_products_page.dart';
import '../../presentation/pages/vendor/vendor_orders_page.dart';
import '../../presentation/pages/vendor/vendor_analytics_page.dart';
import '../../presentation/pages/vendor/vendor_subscription_page.dart';
import '../../presentation/pages/vendor/vendor_settings_page.dart';
import '../../presentation/pages/vendor/vendor_onboarding_page.dart';
import '../../presentation/pages/vendor/vendor_promotions_page.dart';
import '../../presentation/pages/vendor/vendor_chat_page.dart';
import '../../presentation/pages/vendor/vendor_category_dashboard_page.dart';
import '../../presentation/pages/vendor/add_product_page.dart';
import '../../presentation/pages/admin/admin_dashboard_page.dart';
import '../../presentation/pages/admin/admin_users_page.dart';
import '../../presentation/pages/admin/admin_listings_page.dart';
import '../../presentation/pages/admin/admin_tickets_page.dart';
import '../../presentation/pages/admin/admin_settings_page.dart';
import '../../presentation/pages/admin/admin_marketing_page.dart';
import '../../presentation/pages/admin/admin_internships_page.dart';
import '../../presentation/pages/admin/admin_competitions_page.dart';
import '../../presentation/pages/admin/admin_suggestions_page.dart';
import '../../presentation/pages/admin/admin_logs_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    refreshListenable: RouterNotifier(ref),
    redirect: (context, state) {
      final isLoggedIn = authState.user != null;
      final isLoading = authState.loading;
      final userRole = authState.role;
      
      // Don't redirect while loading
      if (isLoading) return null;
      
      // Auth pages
      final isAuthPage = state.matchedLocation == '/login' ||
          state.matchedLocation == '/signup' ||
          state.matchedLocation == '/password-reset';
      
      // Vendor pages
      final isVendorPage = state.matchedLocation.startsWith('/vendor');
      
      // Admin pages
      final isAdminPage = state.matchedLocation.startsWith('/admin');
      
      // Redirect logic
      if (!isLoggedIn && !isAuthPage) {
        // Allow access to public pages without login
        final publicPages = [
          '/',
          '/about',
          '/marketplace',
          '/workspace',
          '/notes',
          '/social',
          '/donate',
          '/support',
          '/search',
          '/hostels',
          '/feed',
        ];
        
        final isPublicPage = publicPages.any((page) => 
          state.matchedLocation == page || 
          state.matchedLocation.startsWith('$page/'));
        
        if (!isPublicPage) {
          return '/login';
        }
      }
      
      // Role-based access control
      if (isVendorPage && userRole != UserRole.vendor && userRole != UserRole.admin) {
        return '/';
      }
      
      if (isAdminPage && userRole != UserRole.admin && userRole != UserRole.coAdmin) {
        return '/';
      }
      
      // Redirect admin users from main site to admin dashboard
      if (userRole == UserRole.admin && !isAdminPage && !isVendorPage) {
        final allowedPublicPrefixes = [
          '/',
          '/marketplace',
          '/workspace',
          '/notes',
          '/social',
          '/donate',
          '/support',
          '/about',
          '/search',
          '/profile',
          '/hostels',
          '/booking',
          '/feed',
        ];
        
        final isAllowedPublicRoute = allowedPublicPrefixes.any((prefix) =>
          prefix == '/' ? state.matchedLocation == '/' : 
          state.matchedLocation == prefix || 
          state.matchedLocation.startsWith('$prefix/'));
        
        if (!isAllowedPublicRoute) {
          return '/admin/dashboard';
        }
      }
      
      return null;
    },
    routes: [
      // Main app routes with MainLayout
      ShellRoute(
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: '/login',
            builder: (context, state) => const LoginPage(),
          ),
          GoRoute(
            path: '/signup',
            builder: (context, state) => const SignupPage(),
          ),
          GoRoute(
            path: '/password-reset',
            builder: (context, state) => const PasswordResetPage(),
          ),
          GoRoute(
            path: '/social',
            builder: (context, state) => const SocialPage(),
            routes: [
              GoRoute(
                path: 'connections',
                builder: (context, state) => const ConnectionsPage(),
              ),
            ],
          ),
          GoRoute(
            path: '/marketplace',
            builder: (context, state) => const MarketplacePage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return ProductDetailPage(productId: id);
                },
              ),
              GoRoute(
                path: 'library/:id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return LibraryDetailPage(libraryId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/workspace',
            builder: (context, state) => const WorkspacePage(),
            routes: [
              GoRoute(
                path: 'internships',
                builder: (context, state) => const InternshipsPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return InternshipDetailPage(internshipId: id);
                    },
                  ),
                ],
              ),
              GoRoute(
                path: 'competitions',
                builder: (context, state) => const CompetitionsPage(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return CompetitionDetailPage(competitionId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: '/notes',
            builder: (context, state) => const NotesPage(),
          ),
          GoRoute(
            path: '/about',
            builder: (context, state) => const AboutPage(),
          ),
          GoRoute(
            path: '/support',
            builder: (context, state) => const SupportPage(),
          ),
          GoRoute(
            path: '/donate',
            builder: (context, state) => const DonatePage(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
            routes: [
              GoRoute(
                path: 'setup',
                builder: (context, state) => const ProfileSetupPage(),
              ),
              GoRoute(
                path: ':handle',
                builder: (context, state) {
                  final handle = state.pathParameters['handle']!;
                  return ProfilePage(handle: handle);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsPage(),
          ),
          GoRoute(
            path: '/hostels',
            builder: (context, state) => const HostelsPage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return HostelDetailPage(hostelId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/booking',
            builder: (context, state) => const BookingPage(),
          ),
          GoRoute(
            path: '/feed',
            builder: (context, state) => const FeedPage(),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => const SearchPage(),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => const ChatPage(),
          ),
        ],
      ),
      
      // Vendor routes with VendorLayout
      ShellRoute(
        builder: (context, state, child) => VendorLayout(child: child),
        routes: [
          GoRoute(
            path: '/vendor/dashboard',
            builder: (context, state) => const VendorDashboardPage(),
            routes: [
              GoRoute(
                path: ':category',
                builder: (context, state) {
                  final category = state.pathParameters['category']!;
                  return VendorCategoryDashboardPage(category: category);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/vendor/products',
            builder: (context, state) => const VendorProductsPage(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const AddProductPage(),
              ),
            ],
          ),
          GoRoute(
            path: '/vendor/orders',
            builder: (context, state) => const VendorOrdersPage(),
          ),
          GoRoute(
            path: '/vendor/analytics',
            builder: (context, state) => const VendorAnalyticsPage(),
          ),
          GoRoute(
            path: '/vendor/subscription',
            builder: (context, state) => const VendorSubscriptionPage(),
          ),
          GoRoute(
            path: '/vendor/settings',
            builder: (context, state) => const VendorSettingsPage(),
          ),
          GoRoute(
            path: '/vendor/onboarding',
            builder: (context, state) => const VendorOnboardingPage(),
          ),
          GoRoute(
            path: '/vendor/promotions',
            builder: (context, state) => const VendorPromotionsPage(),
          ),
          GoRoute(
            path: '/vendor/chat',
            builder: (context, state) => const VendorChatPage(),
          ),
        ],
      ),
      
      // Admin routes with AdminLayout
      ShellRoute(
        builder: (context, state, child) => AdminLayout(child: child),
        routes: [
          GoRoute(
            path: '/admin/dashboard',
            builder: (context, state) => const AdminDashboardPage(),
          ),
          GoRoute(
            path: '/admin/users',
            builder: (context, state) => const AdminUsersPage(),
          ),
          GoRoute(
            path: '/admin/listings',
            builder: (context, state) => const AdminListingsPage(),
          ),
          GoRoute(
            path: '/admin/tickets',
            builder: (context, state) => const AdminTicketsPage(),
          ),
          GoRoute(
            path: '/admin/settings',
            builder: (context, state) => const AdminSettingsPage(),
          ),
          GoRoute(
            path: '/admin/marketing',
            builder: (context, state) => const AdminMarketingPage(),
            routes: [
              GoRoute(
                path: 'donations',
                builder: (context, state) => const AdminDonationsPage(),
              ),
            ],
          ),
          GoRoute(
            path: '/admin/internships',
            builder: (context, state) => const AdminInternshipsPage(),
          ),
          GoRoute(
            path: '/admin/competitions',
            builder: (context, state) => const AdminCompetitionsPage(),
          ),
          GoRoute(
            path: '/admin/suggestions',
            builder: (context, state) => const AdminSuggestionsPage(),
          ),
          GoRoute(
            path: '/admin/logs',
            builder: (context, state) => const AdminLogsPage(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => ErrorPage(error: state.error),
  );
});

// Router notifier for auth state changes
class RouterNotifier extends ChangeNotifier {
  final Ref _ref;
  
  RouterNotifier(this._ref) {
    _ref.listen(authProvider, (_, __) => notifyListeners());
  }
}

// Error page
class ErrorPage extends StatelessWidget {
  final Exception? error;
  
  const ErrorPage({super.key, this.error});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Oops! Something went wrong',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              error?.toString() ?? 'Unknown error',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    );
  }
}
