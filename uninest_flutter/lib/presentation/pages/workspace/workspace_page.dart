import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../core/providers/workspace_provider.dart';
import '../../widgets/workspace/internship_card.dart';
import '../../widgets/workspace/competition_card.dart';
import '../../widgets/workspace/opportunity_filter.dart';
import '../../widgets/common/loading_shimmer.dart';

class WorkspacePage extends ConsumerStatefulWidget {
  const WorkspacePage({super.key});
  
  @override
  ConsumerState<WorkspacePage> createState() => _WorkspacePageState();
}

class _WorkspacePageState extends ConsumerState<WorkspacePage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedCategory = 'all';
  String _selectedLocation = 'all';
  String _selectedDuration = 'all';
  bool _showOnlyActive = true;
  
  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    
    // Load initial data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(workspaceProvider.notifier).loadInternships();
      ref.read(workspaceProvider.notifier).loadCompetitions();
    });
  }
  
  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final workspaceState = ref.watch(workspaceProvider);
    final responsive = Responsive(context);
    
    return Scaffold(
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                ),
                child: SafeArea(
                  child: Padding(
                    padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          'Workspace',
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Discover internships, competitions, and opportunities',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 20),
                        // Stats row
                        Row(
                          children: [
                            _buildStatChip(
                              context,
                              icon: LucideIcons.briefcase,
                              label: '${workspaceState.internships.length} Internships',
                            ),
                            const SizedBox(width: 16),
                            _buildStatChip(
                              context,
                              icon: LucideIcons.trophy,
                              label: '${workspaceState.competitions.length} Competitions',
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            bottom: TabBar(
              controller: _tabController,
              indicatorColor: Colors.white,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              tabs: const [
                Tab(
                  icon: Icon(LucideIcons.briefcase),
                  text: 'Internships',
                ),
                Tab(
                  icon: Icon(LucideIcons.trophy),
                  text: 'Competitions',
                ),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            // Internships Tab
            _buildInternshipsTab(context, workspaceState, responsive),
            // Competitions Tab
            _buildCompetitionsTab(context, workspaceState, responsive),
          ],
        ),
      ),
      floatingActionButton: _buildFAB(context),
    );
  }
  
  Widget _buildStatChip(BuildContext context, {
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildInternshipsTab(
    BuildContext context,
    WorkspaceState state,
    Responsive responsive,
  ) {
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(workspaceProvider.notifier).refreshInternships();
      },
      child: CustomScrollView(
        slivers: [
          // Filter bar
          SliverToBoxAdapter(
            child: OpportunityFilter(
              selectedCategory: _selectedCategory,
              selectedLocation: _selectedLocation,
              selectedDuration: _selectedDuration,
              showOnlyActive: _showOnlyActive,
              onCategoryChanged: (value) {
                setState(() => _selectedCategory = value);
                ref.read(workspaceProvider.notifier).filterInternships(
                  category: value,
                  location: _selectedLocation,
                  duration: _selectedDuration,
                );
              },
              onLocationChanged: (value) {
                setState(() => _selectedLocation = value);
                ref.read(workspaceProvider.notifier).filterInternships(
                  category: _selectedCategory,
                  location: value,
                  duration: _selectedDuration,
                );
              },
              onDurationChanged: (value) {
                setState(() => _selectedDuration = value);
                ref.read(workspaceProvider.notifier).filterInternships(
                  category: _selectedCategory,
                  location: _selectedLocation,
                  duration: value,
                );
              },
              onActiveToggled: (value) {
                setState(() => _showOnlyActive = value);
                ref.read(workspaceProvider.notifier).toggleActiveOnly(value);
              },
            ),
          ),
          
          // Internships list
          if (state.isLoadingInternships && state.internships.isEmpty)
            SliverPadding(
              padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => const LoadingShimmer(height: 200),
                  childCount: 3,
                ),
              ),
            )
          else if (state.internships.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      LucideIcons.briefcase,
                      size: 64,
                      color: Theme.of(context).disabledColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No internships found',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Check back later for new opportunities',
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
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final internship = state.internships[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: InternshipCard(
                        internship: internship,
                        onTap: () => context.go('/workspace/internships/${internship.id}'),
                        onApply: () => _applyForInternship(context, internship.id),
                        onSave: () => ref.read(workspaceProvider.notifier)
                            .toggleSaveInternship(internship.id),
                      ),
                    );
                  },
                  childCount: state.internships.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildCompetitionsTab(
    BuildContext context,
    WorkspaceState state,
    Responsive responsive,
  ) {
    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(workspaceProvider.notifier).refreshCompetitions();
      },
      child: CustomScrollView(
        slivers: [
          // Filter bar
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Search competitions...',
                        prefixIcon: const Icon(LucideIcons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                      ),
                      onChanged: (query) {
                        ref.read(workspaceProvider.notifier).searchCompetitions(query);
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  IconButton(
                    icon: const Icon(LucideIcons.filter),
                    onPressed: () => _showCompetitionFilters(context),
                  ),
                ],
              ),
            ),
          ),
          
          // Competitions grid
          if (state.isLoadingCompetitions && state.competitions.isEmpty)
            SliverPadding(
              padding: EdgeInsets.all(responsive.isMobile ? 16 : 24),
              sliver: SliverGrid(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: responsive.value(
                    mobile: 1,
                    tablet: 2,
                    desktop: 3,
                  ),
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) => const LoadingShimmer(),
                  childCount: 6,
                ),
              ),
            )
          else if (state.competitions.isEmpty)
            SliverFillRemaining(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      LucideIcons.trophy,
                      size: 64,
                      color: Theme.of(context).disabledColor,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'No competitions found',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Check back later for new competitions',
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
                    mobile: 1,
                    tablet: 2,
                    desktop: 3,
                  ),
                  mainAxisSpacing: 16,
                  crossAxisSpacing: 16,
                  childAspectRatio: 1.2,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final competition = state.competitions[index];
                    return CompetitionCard(
                      competition: competition,
                      onTap: () => context.go('/workspace/competitions/${competition.id}'),
                      onRegister: () => _registerForCompetition(context, competition.id),
                    );
                  },
                  childCount: state.competitions.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Widget _buildFAB(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: () => _showCreateOpportunity(context),
      backgroundColor: Theme.of(context).primaryColor,
      icon: const Icon(LucideIcons.plus, color: Colors.white),
      label: const Text(
        'Post Opportunity',
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
      ),
    );
  }
  
  void _applyForInternship(BuildContext context, String internshipId) {
    context.go('/workspace/internships/$internshipId/apply');
  }
  
  void _registerForCompetition(BuildContext context, String competitionId) {
    context.go('/workspace/competitions/$competitionId/register');
  }
  
  void _showCompetitionFilters(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Filter Competitions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),
            // Add filter options here
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Apply Filters'),
            ),
          ],
        ),
      ),
    );
  }
  
  void _showCreateOpportunity(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Post Opportunity'),
        content: const Text(
          'You need to have an admin or verified account to post internships and competitions.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              context.go('/admin/internships/new');
            },
            child: const Text('Continue'),
          ),
        ],
      ),
    );
  }
}
