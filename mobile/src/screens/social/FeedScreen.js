import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { FAB, Searchbar, Chip, Portal, Dialog, Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import components
import PostCard from '../../components/social/PostCard';
import CreatePostButton from '../../components/social/CreatePostButton';
import EmptyState from '../../components/common/EmptyState';
import Header from '../../components/common/Header';

// Import redux actions
import {
  fetchPosts,
  likePost,
  savePost,
  deletePost,
} from '../../store/slices/socialSlice';

// Import theme
import { COLORS } from '../../constants/theme';

const FeedScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { posts, loading, refreshing } = useSelector(state => state.social);
  const { user } = useSelector(state => state.auth);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  
  // Fetch posts when screen is focused
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchPosts({ filter: activeFilter }));
    }, [dispatch, activeFilter])
  );
  
  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    dispatch(fetchPosts({ filter: activeFilter, refresh: true }));
  }, [dispatch, activeFilter]);
  
  // Handle post interaction
  const handleLike = (postId) => {
    dispatch(likePost(postId));
  };
  
  const handleComment = (postId) => {
    navigation.navigate('PostDetail', { postId, focusComment: true });
  };
  
  const handleShare = (postId) => {
    // Share functionality to be implemented
    Alert.alert('Share', 'Sharing functionality coming soon!');
  };
  
  const handleSave = (postId) => {
    dispatch(savePost(postId));
  };
  
  // Handle post deletion
  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setDeleteDialogVisible(true);
  };
  
  const confirmDeletePost = () => {
    if (postToDelete) {
      dispatch(deletePost(postToDelete));
      setDeleteDialogVisible(false);
      setPostToDelete(null);
    }
  };
  
  // Filter functions
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    dispatch(fetchPosts({ filter, refresh: true }));
  };
  
  // Render post item
  const renderPostItem = ({ item }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onSave={handleSave}
      onDelete={handleDeletePost}
      isSaved={item.isSaved}
      isOwner={item.user._id === user?._id}
    />
  );
  
  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <EmptyState
        icon="post"
        title="No posts found"
        message={
          activeFilter !== 'all'
            ? "Try changing your filters or follow more users"
            : "Start by creating your first post or following other travelers"
        }
        actionLabel="Create Post"
        onAction={() => navigation.navigate('CreatePost')}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <Header title="Travel Feed" />
      
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Search posts"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      {/* Filters */}
      <View style={styles.filterContainer}>
        <Chip
          selected={activeFilter === 'all'}
          onPress={() => handleFilterChange('all')}
          style={styles.filterChip}
        >
          All Posts
        </Chip>
        <Chip
          selected={activeFilter === 'following'}
          onPress={() => handleFilterChange('following')}
          style={styles.filterChip}
        >
          Following
        </Chip>
        <Chip
          selected={activeFilter === 'trending'}
          onPress={() => handleFilterChange('trending')}
          style={styles.filterChip}
        >
          Trending
        </Chip>
        <Chip
          selected={activeFilter === 'nearby'}
          onPress={() => handleFilterChange('nearby')}
          style={styles.filterChip}
        >
          Nearby
        </Chip>
      </View>
      
      {/* Create Post Button */}
      <CreatePostButton user={user} />
      
      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          loading && posts.length > 0 ? (
            <ActivityIndicator
              color={COLORS.primary}
              size="large"
              style={styles.loadingFooter}
            />
          ) : null
        }
      />
      
      {/* FAB for creating post */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="Post"
        onPress={() => navigation.navigate('CreatePost')}
        color={COLORS.white}
      />
      
      {/* Delete Post Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Post</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this post? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDeletePost} color={COLORS.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80, // Extra padding for FAB
  },
  loadingFooter: {
    paddingVertical: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default FeedScreen;