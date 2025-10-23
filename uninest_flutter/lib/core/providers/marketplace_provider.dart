import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/product_model.dart';
import '../../data/repositories/product_repository.dart';
import 'providers.dart';

class MarketplaceState {
  final List<ProductModel> products;
  final bool isLoading;
  final bool hasMore;
  final String? error;
  final String currentCategory;
  final String currentSort;
  final String searchQuery;
  final int currentPage;
  
  const MarketplaceState({
    this.products = const [],
    this.isLoading = false,
    this.hasMore = true,
    this.error,
    this.currentCategory = 'all',
    this.currentSort = 'latest',
    this.searchQuery = '',
    this.currentPage = 0,
  });
  
  MarketplaceState copyWith({
    List<ProductModel>? products,
    bool? isLoading,
    bool? hasMore,
    String? error,
    String? currentCategory,
    String? currentSort,
    String? searchQuery,
    int? currentPage,
  }) {
    return MarketplaceState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      error: error ?? this.error,
      currentCategory: currentCategory ?? this.currentCategory,
      currentSort: currentSort ?? this.currentSort,
      searchQuery: searchQuery ?? this.searchQuery,
      currentPage: currentPage ?? this.currentPage,
    );
  }
}

class MarketplaceNotifier extends StateNotifier<MarketplaceState> {
  final ProductRepository _repository;
  static const int _pageSize = 20;
  
  MarketplaceNotifier(this._repository) : super(const MarketplaceState());
  
  Future<void> loadProducts() async {
    if (state.isLoading) return;
    
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final products = await _repository.getProducts(
        category: state.currentCategory != 'all' ? state.currentCategory : null,
        sortBy: state.currentSort,
        limit: _pageSize,
        offset: 0,
      );
      
      state = state.copyWith(
        products: products,
        isLoading: false,
        hasMore: products.length == _pageSize,
        currentPage: 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> loadMoreProducts() async {
    if (state.isLoading || !state.hasMore) return;
    
    state = state.copyWith(isLoading: true);
    
    try {
      final products = await _repository.getProducts(
        category: state.currentCategory != 'all' ? state.currentCategory : null,
        sortBy: state.currentSort,
        searchQuery: state.searchQuery.isNotEmpty ? state.searchQuery : null,
        limit: _pageSize,
        offset: state.currentPage * _pageSize,
      );
      
      state = state.copyWith(
        products: [...state.products, ...products],
        isLoading: false,
        hasMore: products.length == _pageSize,
        currentPage: state.currentPage + 1,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> refreshProducts() async {
    state = state.copyWith(currentPage: 0, hasMore: true);
    await loadProducts();
  }
  
  Future<void> searchProducts(String query) async {
    state = state.copyWith(
      searchQuery: query,
      currentPage: 0,
      hasMore: true,
    );
    await loadProducts();
  }
  
  Future<void> filterByCategory(String category) async {
    state = state.copyWith(
      currentCategory: category,
      currentPage: 0,
      hasMore: true,
    );
    await loadProducts();
  }
  
  Future<void> sortProducts(String sortBy) async {
    state = state.copyWith(
      currentSort: sortBy,
      currentPage: 0,
      hasMore: true,
    );
    await loadProducts();
  }
}

final marketplaceProvider = StateNotifierProvider<MarketplaceNotifier, MarketplaceState>((ref) {
  final repository = ref.watch(productRepositoryProvider);
  return MarketplaceNotifier(repository);
});
