import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/internship_model.dart';
import '../../data/models/competition_model.dart';
import '../../data/repositories/workspace_repository.dart';
import 'providers.dart';

class WorkspaceState {
  final List<InternshipModel> internships;
  final List<CompetitionModel> competitions;
  final List<String> savedInternships;
  final List<String> registeredCompetitions;
  final bool isLoadingInternships;
  final bool isLoadingCompetitions;
  final String? error;
  final Map<String, dynamic> filters;
  
  const WorkspaceState({
    this.internships = const [],
    this.competitions = const [],
    this.savedInternships = const [],
    this.registeredCompetitions = const [],
    this.isLoadingInternships = false,
    this.isLoadingCompetitions = false,
    this.error,
    this.filters = const {},
  });
  
  WorkspaceState copyWith({
    List<InternshipModel>? internships,
    List<CompetitionModel>? competitions,
    List<String>? savedInternships,
    List<String>? registeredCompetitions,
    bool? isLoadingInternships,
    bool? isLoadingCompetitions,
    String? error,
    Map<String, dynamic>? filters,
  }) {
    return WorkspaceState(
      internships: internships ?? this.internships,
      competitions: competitions ?? this.competitions,
      savedInternships: savedInternships ?? this.savedInternships,
      registeredCompetitions: registeredCompetitions ?? this.registeredCompetitions,
      isLoadingInternships: isLoadingInternships ?? this.isLoadingInternships,
      isLoadingCompetitions: isLoadingCompetitions ?? this.isLoadingCompetitions,
      error: error ?? this.error,
      filters: filters ?? this.filters,
    );
  }
}

class WorkspaceNotifier extends StateNotifier<WorkspaceState> {
  final WorkspaceRepository _repository;
  
  WorkspaceNotifier(this._repository) : super(const WorkspaceState());
  
  Future<void> loadInternships() async {
    state = state.copyWith(isLoadingInternships: true, error: null);
    
    try {
      final internships = await _repository.getInternships(
        filters: state.filters,
      );
      
      state = state.copyWith(
        internships: internships,
        isLoadingInternships: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingInternships: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> loadCompetitions() async {
    state = state.copyWith(isLoadingCompetitions: true, error: null);
    
    try {
      final competitions = await _repository.getCompetitions(
        filters: state.filters,
      );
      
      state = state.copyWith(
        competitions: competitions,
        isLoadingCompetitions: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoadingCompetitions: false,
        error: e.toString(),
      );
    }
  }
  
  Future<void> refreshInternships() async {
    await loadInternships();
  }
  
  Future<void> refreshCompetitions() async {
    await loadCompetitions();
  }
  
  Future<void> filterInternships({
    String? category,
    String? location,
    String? duration,
  }) async {
    final newFilters = {
      ...state.filters,
      if (category != null && category != 'all') 'category': category,
      if (location != null && location != 'all') 'location': location,
      if (duration != null && duration != 'all') 'duration': duration,
    };
    
    state = state.copyWith(filters: newFilters);
    await loadInternships();
  }
  
  Future<void> searchCompetitions(String query) async {
    if (query.isEmpty) {
      state = state.copyWith(filters: {});
    } else {
      state = state.copyWith(filters: {'search': query});
    }
    await loadCompetitions();
  }
  
  Future<void> toggleActiveOnly(bool activeOnly) async {
    final newFilters = {
      ...state.filters,
      'active_only': activeOnly,
    };
    
    state = state.copyWith(filters: newFilters);
    await loadInternships();
  }
  
  Future<void> toggleSaveInternship(String internshipId) async {
    final saved = List<String>.from(state.savedInternships);
    
    if (saved.contains(internshipId)) {
      saved.remove(internshipId);
      await _repository.unsaveInternship(internshipId);
    } else {
      saved.add(internshipId);
      await _repository.saveInternship(internshipId);
    }
    
    state = state.copyWith(savedInternships: saved);
  }
  
  Future<void> registerForCompetition(String competitionId) async {
    try {
      await _repository.registerForCompetition(competitionId);
      
      final registered = List<String>.from(state.registeredCompetitions);
      registered.add(competitionId);
      
      state = state.copyWith(registeredCompetitions: registered);
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
  
  Future<void> loadUserSavedItems(String userId) async {
    try {
      final saved = await _repository.getUserSavedInternships(userId);
      final registered = await _repository.getUserRegisteredCompetitions(userId);
      
      state = state.copyWith(
        savedInternships: saved,
        registeredCompetitions: registered,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }
}

final workspaceProvider = StateNotifierProvider<WorkspaceNotifier, WorkspaceState>((ref) {
  final repository = ref.watch(workspaceRepositoryProvider);
  return WorkspaceNotifier(repository);
});

final workspaceRepositoryProvider = Provider<WorkspaceRepository>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return WorkspaceRepository(supabaseService);
});
