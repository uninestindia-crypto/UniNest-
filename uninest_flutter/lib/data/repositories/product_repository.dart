import '../models/product_model.dart';
import '../services/supabase_service.dart';

class ProductRepository {
  final SupabaseService _supabaseService;
  
  ProductRepository(this._supabaseService);
  
  Future<List<ProductModel>> getProducts({
    String? category,
    String? vendorId,
    String? searchQuery,
    String? sortBy,
    int? limit,
    int? offset,
  }) async {
    try {
      var query = _supabaseService.client
          .from('products')
          .select('''
            *,
            vendor:vendor_id (
              id,
              full_name,
              avatar_url,
              rating,
              verified
            ),
            category:category_id (
              id,
              name,
              icon
            )
          ''');
      
      // Apply filters
      if (category != null && category != 'all') {
        query = query.eq('category', category);
      }
      
      if (vendorId != null) {
        query = query.eq('vendor_id', vendorId);
      }
      
      if (searchQuery != null && searchQuery.isNotEmpty) {
        query = query.textSearch('name', searchQuery);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', ascending: true);
          break;
        case 'price_high':
          query = query.order('price', ascending: false);
          break;
        case 'popular':
          query = query.order('sales_count', ascending: false);
          break;
        case 'rating':
          query = query.order('rating', ascending: false);
          break;
        default:
          query = query.order('created_at', ascending: false);
      }
      
      // Apply pagination
      if (limit != null) {
        query = query.limit(limit);
      }
      
      if (offset != null) {
        query = query.range(offset, offset + (limit ?? 10) - 1);
      }
      
      final response = await query;
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load products: $e');
    }
  }
  
  Future<ProductModel?> getProductById(String productId) async {
    try {
      final response = await _supabaseService.client
          .from('products')
          .select('''
            *,
            vendor:vendor_id (
              id,
              full_name,
              avatar_url,
              rating,
              verified,
              bio
            ),
            category:category_id (
              id,
              name,
              icon
            ),
            reviews (
              *,
              user:user_id (
                full_name,
                avatar_url
              )
            )
          ''')
          .eq('id', productId)
          .maybeSingle();
      
      if (response == null) return null;
      
      return ProductModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to load product: $e');
    }
  }
  
  Future<ProductModel> createProduct(Map<String, dynamic> productData) async {
    try {
      final response = await _supabaseService.client
          .from('products')
          .insert(productData)
          .select()
          .single();
      
      return ProductModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create product: $e');
    }
  }
  
  Future<ProductModel> updateProduct(String productId, Map<String, dynamic> updates) async {
    try {
      final response = await _supabaseService.client
          .from('products')
          .update(updates)
          .eq('id', productId)
          .select()
          .single();
      
      return ProductModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to update product: $e');
    }
  }
  
  Future<void> deleteProduct(String productId) async {
    try {
      await _supabaseService.client
          .from('products')
          .delete()
          .eq('id', productId);
    } catch (e) {
      throw Exception('Failed to delete product: $e');
    }
  }
  
  Future<List<ProductModel>> getVendorProducts(String vendorId) async {
    try {
      final response = await _supabaseService.client
          .from('products')
          .select('''
            *,
            category:category_id (
              id,
              name,
              icon
            )
          ''')
          .eq('vendor_id', vendorId)
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load vendor products: $e');
    }
  }
  
  Future<List<ProductModel>> getFeaturedProducts({int limit = 8}) async {
    try {
      final response = await _supabaseService.client
          .from('products')
          .select('''
            *,
            vendor:vendor_id (
              id,
              full_name,
              avatar_url,
              verified
            )
          ''')
          .eq('featured', true)
          .limit(limit)
          .order('created_at', ascending: false);
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load featured products: $e');
    }
  }
  
  Future<List<ProductModel>> getRelatedProducts(String productId, String category, {int limit = 4}) async {
    try {
      final response = await _supabaseService.client
          .from('products')
          .select('''
            *,
            vendor:vendor_id (
              id,
              full_name,
              avatar_url
            )
          ''')
          .eq('category', category)
          .neq('id', productId)
          .limit(limit)
          .order('rating', ascending: false);
      
      return (response as List)
          .map((json) => ProductModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load related products: $e');
    }
  }
  
  Future<void> incrementViewCount(String productId) async {
    try {
      await _supabaseService.client.rpc('increment_product_views', params: {
        'product_id': productId,
      });
    } catch (e) {
      // Non-critical error, don't throw
      print('Failed to increment view count: $e');
    }
  }
  
  Future<Map<String, dynamic>> getProductStats(String vendorId) async {
    try {
      final response = await _supabaseService.client.rpc('get_product_stats', params: {
        'vendor_id': vendorId,
      });
      
      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to load product stats: $e');
    }
  }
}
