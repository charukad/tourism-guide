import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Avatar, IconButton, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { COLORS, FONTS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const PostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onDelete,
  isSaved = false,
  isOwner = false,
}) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Format date for display
  const formatDate = (date) => {
    const postDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return format(postDate, 'h:mm a');
    } else if (diffDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffDays < 7) {
      // This week
      return format(postDate, 'EEEE');
    } else {
      // Older
      return format(postDate, 'MMM d, yyyy');
    }
  };

  // Navigate to post detail screen
  const handleViewPost = () => {
    navigation.navigate('PostDetail', { postId: post._id });
  };

  // Navigate to user profile
  const handleViewProfile = () => {
    navigation.navigate('UserProfile', { userId: post.user._id });
  };

  // Navigate to location
  const handleViewLocation = () => {
    if (post.location) {
      navigation.navigate('LocationDetail', { locationId: post.location._id });
    }
  };

  // Handle image navigation
  const handleNextImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
    }
  };

  const handlePreviousImage = () => {
    if (post.images && post.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? post.images.length - 1 : prev - 1
      );
    }
  };

  // Handle post menu
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <Card style={styles.card}>
      {/* Card Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleViewProfile} style={styles.userInfo}>
          <Avatar.Image
            source={{ uri: post.user.profileImage || 'https://via.placeholder.com/40' }}
            size={40}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>{post.user.name}</Text>
            <Text style={styles.postTime}>{formatDate(post.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={openMenu}
            />
          }
        >
          {isOwner ? (
            <>
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  navigation.navigate('EditPost', { postId: post._id });
                }}
                title="Edit Post"
                icon="pencil"
              />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  onDelete && onDelete(post._id);
                }}
                title="Delete Post"
                icon="delete"
              />
            </>
          ) : (
            <>
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  onSave && onSave(post._id);
                }}
                title={isSaved ? "Unsave Post" : "Save Post"}
                icon={isSaved ? "bookmark-minus" : "bookmark-plus"}
              />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  // Handle reporting post
                }}
                title="Report Post"
                icon="flag"
              />
            </>
          )}
        </Menu>
      </View>

      {/* Location Information */}
      {post.location && (
        <TouchableOpacity onPress={handleViewLocation} style={styles.locationContainer}>
          <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
          <Text style={styles.locationText}>{post.location.name}</Text>
        </TouchableOpacity>
      )}

      {/* Post Content */}
      <TouchableOpacity onPress={handleViewPost}>
        {post.content && (
          <Text
            style={styles.content}
            numberOfLines={5}
          >
            {post.content}
          </Text>
        )}

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: post.images[currentImageIndex] }}
              style={styles.image}
              resizeMode="cover"
            />
            
            {post.images.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.imageNavLeft]}
                  onPress={handlePreviousImage}
                >
                  <MaterialCommunityIcons name="chevron-left" size={24} color={COLORS.white} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.imageNavRight]}
                  onPress={handleNextImage}
                >
                  <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.white} />
                </TouchableOpacity>
                
                <View style={styles.imageIndicators}>
                  {post.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.imageIndicator,
                        index === currentImageIndex && styles.imageIndicatorActive
                      ]}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Interaction Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="heart" size={14} color={COLORS.gray} />
          <Text style={styles.statText}>{post.likesCount || 0} likes</Text>
        </View>
        
        <View style={styles.stat}>
          <MaterialCommunityIcons name="comment" size={14} color={COLORS.gray} />
          <Text style={styles.statText}>{post.commentsCount || 0} comments</Text>
        </View>
      </View>

      <Divider />

      {/* Interaction Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike && onLike(post._id)}
        >
          <MaterialCommunityIcons
            name={post.isLiked ? "heart" : "heart-outline"}
            size={22}
            color={post.isLiked ? COLORS.error : COLORS.gray}
          />
          <Text style={[
            styles.actionText,
            post.isLiked && { color: COLORS.error }
          ]}>
            Like
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment && onComment(post._id)}
        >
          <MaterialCommunityIcons name="comment-outline" size={22} color={COLORS.gray} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare && onShare(post._id)}
        >
          <MaterialCommunityIcons name="share-outline" size={22} color={COLORS.gray} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  userName: {
    ...FONTS.body3Bold,
  },
  postTime: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  locationText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginLeft: 4,
  },
  content: {
    ...FONTS.body3,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: width * 0.7, // Aspect ratio 10:7
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNavLeft: {
    left: 8,
  },
  imageNavRight: {
    right: 8,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  imageIndicatorActive: {
    backgroundColor: COLORS.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: 4,
  },
});

export default PostCard;