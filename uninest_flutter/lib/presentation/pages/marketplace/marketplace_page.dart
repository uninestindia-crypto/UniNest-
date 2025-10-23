import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/providers/marketplace_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../data/models/product_model.dart';
import '../../widgets/marketplace/product_card.dart';
import '../../widgets/marketplace/category_filter.dart';
import '../../widgets/marketplace/search_bar.dart';
import '../../widgets/common/loading_shimmer.dart';
import 'package:go_router/go_router.dart';

class MarketplacePage extends ConsumerStatefulWidget {
  const MarketplacePage({super.key});
  
  @override
  ConsumerState<MarketplacePage> createState() => _MarketplacePageState();
}

class _MarketplacePageState extends ConsumerState<MarketplacePage> {
  final ScrollController _scrollController = ScrollController();
  String _selectedCategory = 'all';
  String _searchQuery = '';
  String _sortBy = 'latest';
  
  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    // Load initial products
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(marketplaceProvider.notifier).loadProducts();
    });
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
  
  void _onScroll() {
    if (_scrollController.position.pixels >= 
        _scrollController.position.maxScrollExtent - 200) {
      // Load more products when near bottom
      ref.read(marketplaceProvider.notifier).loadMoreProducts();
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final marketplaceState = ref.watch(marketplaceProvider);
    final responsive = Responsive(context);
    
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(marketplaceProvider.notifier).refreshProducts();
        },
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // Header with search
            SliverToBoxAdapter(
              child: Container(
                padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(24),
                    bottomRight: Radius.circular(24),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Marketplace',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Discover products and services from campus vendors',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.9),
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Search bar
                    MarketplaceSearchBar(
                      onSearch: (query) {
                        setState(() => _searchQuery = query);
                        ref.read(marketplaceProvider.notifier).searchProducts(query);
                      },
                    ),
                  ],
                ),
              ),
            ),
            
            // Categories
            SliverToBoxAdapter(
              child: Container(
                height: 120,
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: CategoryFilter(
                  selectedCategory: _selectedCategory,
                  onCategorySelected: (category) {
                    setState(() => _selectedCategory = category);
                    ref.read(marketplaceProvider.notifier).filterByCategory(category);
                  },
                ),
              ),
            ),
            
            // Filter and sort bar
            SliverPersistentHeader(
              pinned: true,
              delegate: _FilterBarDelegate(
                selectedSort: _sortBy,
                onSortChanged: (sort) {
                  setState(() => _sortBy = sort);
                  ref.read(marketplaceProvider.notifier).sortProducts(sort);
                },
                productCount: marketplaceState.products.length,
              ),
            ),
            
            // Products grid
            if (marketplaceState.isLoading && marketplaceState.products.isEmpty)
              SliverPadding(
                padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
                sliver: SliverGrid(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: responsive.value(
                      mobile: 2,
                      tablet: 3,
                      desktop: 4,
                    ),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.75,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) => const LoadingShimmer(),
                    childCount: 8,
                  ),
                ),
              )
            else if (marketplaceState.products.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        LucideIcons.packageOpen,
                        size: 64,
                        color: Theme.of(context).disabledColor,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No products found',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Try adjusting your filters or search',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverPadding(
                padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
                sliver: SliverGrid(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: responsive.value(
                      mobile: 2,
                      tablet: 3,
                      desktop: 4,
                    ),
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    childAspectRatio: 0.75,
                  ),
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index == marketplaceState.products.length) {
                        // Loading indicator at the end
                        return const Center(
                          child: CircularProgressIndicator(),
                        );
                      }
                      
                      final product = marketplaceState.products[index];
                      return ProductCard(
                        product: product,
                        onTap: () => context.go('/marketplace/${product.id}'),
                        onAddToCart: () {
                          ref.read(cartProvider.notifier).addItem(
                            CartItem(
                              productId: product.id,
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                              imageUrl: product.imageUrl,
                            ),
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${product.name} added to cart'),
                              action: SnackBarAction(
                                label: 'View Cart',
                                onPressed: () => context.go('/cart'),
                              ),
                            ),
                          );
                        },
                      );
                    },
                    childCount: marketplaceState.products.length + 
                              (marketplaceState.hasMore ? 1 : 0),
                  ),
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: responsive.isMobile
          ? FloatingActionButton(
              onPressed: () => context.go('/cart'),
              backgroundColor: Theme.of(context).primaryColor,
              child: Stack(
                children: [
                  const Icon(LucideIcons.shoppingCart, color: Colors.white),
                  if (ref.watch(cartProvider).isNotEmpty)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${ref.watch(cartProvider).length}',
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
            )
          : null,
    );
  }
}

// Custom delegate for sticky filter bar
class _FilterBarDelegate extends SliverPersistentHeaderDelegate {
  final String selectedSort;
  final Function(String) onSortChanged;
  final int productCount;
  
  _FilterBarDelegate({
    required this.selectedSort,
    required this.onSortChanged,
    required this.productCount,
  });
  
  @override
  Widget build(BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Text(
            '$productCount products',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const Spacer(),
          // Sort dropdown
          PopupMenuButton<String>(
            initialValue: selectedSort,
            onSelected: onSortChanged,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                border: Border.all(color: Theme.of(context).dividerColor),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(LucideIcons.arrowUpDown, size: 16),
                  const SizedBox(width: 8),
                  Text(_getSortLabel(selectedSort)),
                  const Icon(LucideIcons.chevronDown, size: 16),
                ],
              ),
            ),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'latest', child: Text('Latest')),
              const PopupMenuItem(value: 'price_low', child: Text('Price: Low to High')),
              const PopupMenuItem(value: 'price_high', child: Text('Price: High to Low')),
              const PopupMenuItem(value: 'popular', child: Text('Most Popular')),
              const PopupMenuItem(value: 'rating', child: Text('Highest Rated')),
            ],
          ),
        ],
      ),
    );
  }
  
  String _getSortLabel(String sort) {
    switch (sort) {
      case 'price_low':
        return 'Price ↑';
      case 'price_high':
        return 'Price ↓';
      case 'popular':
        return 'Popular';
      case 'rating':
        return 'Top Rated';
      default:
        return 'Latest';
    }
  }
  
  @override
  double get maxExtent => 56;
  
  @override
  double get minExtent => 56;
  
  @override
  bool shouldRebuild(covariant _FilterBarDelegate oldDelegate) {
    return oldDelegate.selectedSort != selectedSort ||
           oldDelegate.productCount != productCount;
  }
}
