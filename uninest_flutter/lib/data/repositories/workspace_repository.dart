import '../models/internship_model.dart';
import '../models/competition_model.dart';
import '../services/supabase_service.dart';

class WorkspaceRepository {
  final SupabaseService _supabaseService;
  
  WorkspaceRepository(this._supabaseService);
  
  // Internship methods
  Future<List<InternshipModel>> getInternships({
    Map<String, dynamic>? filters,
    int? limit,
    int? offset,
  }) async {
    try {
      var query = _supabaseService.client
          .from('internships')
          .select('''
            *,
            company:company_id (
              id,
              name,
              logo_url,
              location,
              verified
            ),
            applications:internship_applications (
              count
            )
          ''');
      
      // Apply filters
      if (filters != null) {
        if (filters['category'] != null) {
          query = query.eq('category', filters['category']);
        }
        if (filters['location'] != null) {
          query = query.eq('location', filters['location']);
        }
        if (filters['duration'] != null) {
          query = query.eq('duration', filters['duration']);
        }
        if (filters['active_only'] == true) {
          query = query.eq('is_active', true)
                      .gte('deadline', DateTime.now().toIso8601String());
        }
      }
      
      // Apply pagination
      if (limit != null) {
        query = query.limit(limit);
      }
      if (offset != null) {
        query = query.range(offset, offset + (limit ?? 10) - 1);
      }
      
      // Order by created date
      query = query.order('created_at', ascending: false);
      
      final response = await query;
      
      return (response as List)
          .map((json) => InternshipModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load internships: $e');
    }
  }
  
  Future<InternshipModel?> getInternshipById(String internshipId) async {
    try {
      final response = await _supabaseService.client
          .from('internships')
          .select('''
            *,
            company:company_id (
              *
            ),
            applications:internship_applications (
              *,
              user:user_id (
                full_name,
                avatar_url,
                email
              )
            )
          ''')
          .eq('id', internshipId)
          .maybeSingle();
      
      if (response == null) return null;
      
      return InternshipModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to load internship: $e');
    }
  }
  
  Future<void> applyForInternship({
    required String internshipId,
    required String userId,
    required Map<String, dynamic> applicationData,
  }) async {
    try {
      await _supabaseService.client
          .from('internship_applications')
          .insert({
            'internship_id': internshipId,
            'user_id': userId,
            'status': 'pending',
            ...applicationData,
          });
    } catch (e) {
      throw Exception('Failed to apply for internship: $e');
    }
  }
  
  Future<void> saveInternship(String internshipId) async {
    try {
      final userId = _supabaseService.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');
      
      await _supabaseService.client
          .from('saved_internships')
          .insert({
            'user_id': userId,
            'internship_id': internshipId,
          });
    } catch (e) {
      throw Exception('Failed to save internship: $e');
    }
  }
  
  Future<void> unsaveInternship(String internshipId) async {
    try {
      final userId = _supabaseService.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');
      
      await _supabaseService.client
          .from('saved_internships')
          .delete()
          .eq('user_id', userId)
          .eq('internship_id', internshipId);
    } catch (e) {
      throw Exception('Failed to unsave internship: $e');
    }
  }
  
  Future<List<String>> getUserSavedInternships(String userId) async {
    try {
      final response = await _supabaseService.client
          .from('saved_internships')
          .select('internship_id')
          .eq('user_id', userId);
      
      return (response as List)
          .map((item) => item['internship_id'] as String)
          .toList();
    } catch (e) {
      throw Exception('Failed to load saved internships: $e');
    }
  }
  
  // Competition methods
  Future<List<CompetitionModel>> getCompetitions({
    Map<String, dynamic>? filters,
    int? limit,
    int? offset,
  }) async {
    try {
      var query = _supabaseService.client
          .from('competitions')
          .select('''
            *,
            organizer:organizer_id (
              id,
              name,
              logo_url,
              verified
            ),
            registrations:competition_registrations (
              count
            )
          ''');
      
      // Apply filters
      if (filters != null) {
        if (filters['search'] != null && filters['search'].isNotEmpty) {
          query = query.textSearch('title', filters['search']);
        }
        if (filters['category'] != null) {
          query = query.eq('category', filters['category']);
        }
        if (filters['status'] != null) {
          query = query.eq('status', filters['status']);
        }
      }
      
      // Apply pagination
      if (limit != null) {
        query = query.limit(limit);
      }
      if (offset != null) {
        query = query.range(offset, offset + (limit ?? 10) - 1);
      }
      
      // Order by start date
      query = query.order('start_date', ascending: false);
      
      final response = await query;
      
      return (response as List)
          .map((json) => CompetitionModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to load competitions: $e');
    }
  }
  
  Future<CompetitionModel?> getCompetitionById(String competitionId) async {
    try {
      final response = await _supabaseService.client
          .from('competitions')
          .select('''
            *,
            organizer:organizer_id (
              *
            ),
            registrations:competition_registrations (
              *,
              user:user_id (
                full_name,
                avatar_url,
                email
              )
            ),
            winners:competition_winners (
              *,
              user:user_id (
                full_name,
                avatar_url
              )
            )
          ''')
          .eq('id', competitionId)
          .maybeSingle();
      
      if (response == null) return null;
      
      return CompetitionModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to load competition: $e');
    }
  }
  
  Future<void> registerForCompetition(String competitionId) async {
    try {
      final userId = _supabaseService.currentUser?.id;
      if (userId == null) throw Exception('User not authenticated');
      
      await _supabaseService.client
          .from('competition_registrations')
          .insert({
            'competition_id': competitionId,
            'user_id': userId,
            'status': 'registered',
          });
    } catch (e) {
      throw Exception('Failed to register for competition: $e');
    }
  }
  
  Future<List<String>> getUserRegisteredCompetitions(String userId) async {
    try {
      final response = await _supabaseService.client
          .from('competition_registrations')
          .select('competition_id')
          .eq('user_id', userId);
      
      return (response as List)
          .map((item) => item['competition_id'] as String)
          .toList();
    } catch (e) {
      throw Exception('Failed to load registered competitions: $e');
    }
  }
  
  // Admin methods
  Future<InternshipModel> createInternship(Map<String, dynamic> internshipData) async {
    try {
      final response = await _supabaseService.client
          .from('internships')
          .insert(internshipData)
          .select()
          .single();
      
      return InternshipModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create internship: $e');
    }
  }
  
  Future<CompetitionModel> createCompetition(Map<String, dynamic> competitionData) async {
    try {
      final response = await _supabaseService.client
          .from('competitions')
          .insert(competitionData)
          .select()
          .single();
      
      return CompetitionModel.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create competition: $e');
    }
  }
  
  Future<void> updateInternship(String internshipId, Map<String, dynamic> updates) async {
    try {
      await _supabaseService.client
          .from('internships')
          .update(updates)
          .eq('id', internshipId);
    } catch (e) {
      throw Exception('Failed to update internship: $e');
    }
  }
  
  Future<void> updateCompetition(String competitionId, Map<String, dynamic> updates) async {
    try {
      await _supabaseService.client
          .from('competitions')
          .update(updates)
          .eq('id', competitionId);
    } catch (e) {
      throw Exception('Failed to update competition: $e');
    }
  }
  
  Future<void> deleteInternship(String internshipId) async {
    try {
      await _supabaseService.client
          .from('internships')
          .delete()
          .eq('id', internshipId);
    } catch (e) {
      throw Exception('Failed to delete internship: $e');
    }
  }
  
  Future<void> deleteCompetition(String competitionId) async {
    try {
      await _supabaseService.client
          .from('competitions')
          .delete()
          .eq('id', competitionId);
    } catch (e) {
      throw Exception('Failed to delete competition: $e');
    }
  }
}
