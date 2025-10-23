import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/responsive.dart';
import '../../../core/providers/social_provider.dart';
import '../../widgets/social/post_card.dart';
import '../../widgets/social/create_post_dialog.dart';
import '../../widgets/social/story_section.dart';
import '../../widgets/common/loading_shimmer.dart';

class SocialPage extends ConsumerStatefulWidget {
  const SocialPage({super.key});
  
  @override
  ConsumerState<SocialPage> createState() => _SocialPageState();
}

class _SocialPageState extends ConsumerState<SocialPage> {
  final ScrollController _scrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    
    // Load initial posts
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(socialProvider.notifier).loadPosts();
      ref.read(socialProvider.notifier).loadStories();
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
      ref.read(socialProvider.notifier).loadMorePosts();
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final socialState = ref.watch(socialProvider);
    final responsive = Responsive(context);
    
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(socialProvider.notifier).refreshPosts();
        },
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // App Bar
            SliverAppBar(
              floating: true,
              snap: true,
              title: Row(
                children: [
                  Icon(
                    LucideIcons.users,
                    color: Theme.of(context).primaryColor,
                  ),
                  const SizedBox(width: 8),
                  const Text('Social Feed'),
                ],
              ),
              actions: [
                IconButton(
                  icon: const Icon(LucideIcons.userPlus),
                  onPressed: () => context.go('/social/connections'),
                ),
                IconButton(
                  icon: const Icon(LucideIcons.messageCircle),
                  onPressed: () => context.go('/chat'),
                ),
              ],
            ),
            
            // Stories Section
            if (!responsive.isMobile)
              SliverToBoxAdapter(
                child: Container(
                  height: 120,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: StorySection(
                    stories: socialState.stories,
                    onAddStory: () => _showAddStoryDialog(context),
                    onViewStory: (storyId) => _viewStory(context, storyId),
                  ),
                ),
              ),
            
            // Create Post Card
            SliverToBoxAdapter(
              child: Container(
                margin: EdgeInsets.symmetric(
                  horizontal: responsive.isMobile ? 16 : 24,
                  vertical: 16,
                ),
                child: _buildCreatePostCard(context),
              ),
            ),
            
            // Stories for mobile (horizontal scroll)
            if (responsive.isMobile)
              SliverToBoxAdapter(
                child: Container(
                  height: 100,
                  margin: const EdgeInsets.only(bottom: 16),
                  child: StorySection(
                    stories: socialState.stories,
                    onAddStory: () => _showAddStoryDialog(context),
                    onViewStory: (storyId) => _viewStory(context, storyId),
                  ),
                ),
              ),
            
            // Posts Feed
            if (socialState.isLoading && socialState.posts.isEmpty)
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => Container(
                    margin: EdgeInsets.symmetric(
                      horizontal: responsive.isMobile ? 16 : 24,
                      vertical: 8,
                    ),
                    child: const LoadingShimmer(height: 400),
                  ),
                  childCount: 3,
                ),
              )
            else if (socialState.posts.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        LucideIcons.users,
                        size: 64,
                        color: Theme.of(context).disabledColor,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No posts yet',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Be the first to share something!',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).textTheme.bodySmall?.color,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () => _showCreatePostDialog(context),
                        icon: const Icon(LucideIcons.plus),
                        label: const Text('Create Post'),
                      ),
                    ],
                  ),
                ),
              )
            else
              SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    if (index == socialState.posts.length) {
                      return const Center(
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: CircularProgressIndicator(),
                        ),
                      );
                    }
                    
                    final post = socialState.posts[index];
                    return Container(
                      margin: EdgeInsets.symmetric(
                        horizontal: responsive.isMobile ? 16 : 24,
                        vertical: 8,
                      ),
                      child: PostCard(
                        post: post,
                        onLike: () => ref.read(socialProvider.notifier).toggleLike(post.id),
                        onComment: () => _showCommentsSheet(context, post.id),
                        onShare: () => _sharePost(context, post),
                        onUserTap: () => context.go('/profile/${post.authorHandle}'),
                        onDelete: post.isOwner 
                            ? () => ref.read(socialProvider.notifier).deletePost(post.id)
                            : null,
                      ),
                    );
                  },
                  childCount: socialState.posts.length + 
                            (socialState.hasMore ? 1 : 0),
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showCreatePostDialog(context),
        backgroundColor: Theme.of(context).primaryColor,
        child: const Icon(LucideIcons.plus, color: Colors.white),
      ),
    );
  }
  
  Widget _buildCreatePostCard(BuildContext context) {
    final user = ref.watch(authProvider).user;
    
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: Theme.of(context).dividerColor.withOpacity(0.5),
        ),
      ),
      child: InkWell(
        onTap: () => _showCreatePostDialog(context),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: user?.userMetadata?['avatar_url'] != null
                    ? CachedNetworkImageProvider(user!.userMetadata!['avatar_url'])
                    : null,
                child: user?.userMetadata?['avatar_url'] == null
                    ? Text(
                        user?.email?[0].toUpperCase() ?? 'U',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Theme.of(context).dividerColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Text(
                    "What's on your mind?",
                    style: TextStyle(
                      color: Theme.of(context).textTheme.bodySmall?.color,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              IconButton(
                icon: const Icon(LucideIcons.image),
                onPressed: () => _showCreatePostDialog(context, withImage: true),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  void _showCreatePostDialog(BuildContext context, {bool withImage = false}) {
    showDialog(
      context: context,
      builder: (context) => CreatePostDialog(
        onPost: (content, images) async {
          await ref.read(socialProvider.notifier).createPost(
            content: content,
            images: images,
          );
          if (mounted) {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Post created successfully!')),
            );
          }
        },
        initialWithImage: withImage,
      ),
    );
  }
  
  void _showCommentsSheet(BuildContext context, String postId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (context, scrollController) => CommentsSheet(
          postId: postId,
          scrollController: scrollController,
        ),
      ),
    );
  }
  
  void _sharePost(BuildContext context, dynamic post) {
    // Implement share functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Share feature coming soon!')),
    );
  }
  
  void _showAddStoryDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Story'),
        content: const Text('Story feature will be available soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
  
  void _viewStory(BuildContext context, String storyId) {
    // Navigate to story viewer
    context.go('/social/story/$storyId');
  }
}

// Comments Sheet Widget
class CommentsSheet extends ConsumerStatefulWidget {
  final String postId;
  final ScrollController scrollController;
  
  const CommentsSheet({
    super.key,
    required this.postId,
    required this.scrollController,
  });
  
  @override
  ConsumerState<CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends ConsumerState<CommentsSheet> {
  final TextEditingController _commentController = TextEditingController();
  
  @override
  void initState() {
    super.initState();
    // Load comments
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(socialProvider.notifier).loadComments(widget.postId);
    });
  }
  
  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final comments = ref.watch(socialProvider).currentPostComments;
    
    return Container(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: Theme.of(context).dividerColor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          
          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Text(
                  'Comments',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Text(
                  '${comments.length}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
          
          const Divider(height: 24),
          
          // Comments list
          Expanded(
            child: ListView.builder(
              controller: widget.scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: comments.length,
              itemBuilder: (context, index) {
                final comment = comments[index];
                return _buildCommentItem(context, comment);
              },
            ),
          ),
          
          // Comment input
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              border: Border(
                top: BorderSide(
                  color: Theme.of(context).dividerColor,
                ),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    decoration: InputDecoration(
                      hintText: 'Write a comment...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Theme.of(context).dividerColor.withOpacity(0.1),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: () async {
                    if (_commentController.text.isNotEmpty) {
                      await ref.read(socialProvider.notifier).addComment(
                        widget.postId,
                        _commentController.text,
                      );
                      _commentController.clear();
                    }
                  },
                  icon: Icon(
                    LucideIcons.send,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildCommentItem(BuildContext context, dynamic comment) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundImage: comment.authorAvatar != null
                ? CachedNetworkImageProvider(comment.authorAvatar)
                : null,
            child: comment.authorAvatar == null
                ? Text(
                    comment.authorName[0].toUpperCase(),
                    style: const TextStyle(fontSize: 12),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      comment.authorName,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      comment.timeAgo,
                      style: TextStyle(
                        fontSize: 12,
                        color: Theme.of(context).textTheme.bodySmall?.color,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(comment.content),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
