import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Avatar, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, formatDistanceToNow } from 'date-fns';

import { COLORS, FONTS } from '../../../constants/theme';

const CommentItem = ({
  comment,
  onLike,
  onReply,
  onDelete,
  isOwner = false,
}) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  // Format date for display
  const formatDate = (date) => {
    const commentDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - commentDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Less than a day ago
      return formatDistanceToNow(commentDate, { addSuffix: true });
    } else if (diffDays < 7) {
      // Less than a week ago
      return format(commentDate, 'EEEE h:mm a');
    } else {
      // More than a week ago
      return format(commentDate, 'MMM d, yyyy h:mm a');
    }
  };

  // Handle profile navigation
  const handleViewProfile = () => {
    navigation.navigate('UserProfile', { userId: comment.user._id });
  };

  // Handle menu
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleViewProfile}>
        <Avatar.Image
          source={{ uri: comment.user.profileImage || 'https://via.placeholder.com/32' }}
          size={32}
        />
      </TouchableOpacity>
      
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <TouchableOpacity onPress={handleViewProfile}>
            <Text style={styles.userName}>{comment.user.name}</Text>
          </TouchableOpacity>
          
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            onPress={() => onLike && onLike(comment._id)}
            style={styles.actionButton}
          >
            <Text style={[
              styles.actionText,
              comment.isLiked && styles.actionTextActive
            ]}>
              Like
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => onReply && onReply(comment._id)}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
          
          <Text style={styles.timeText}>{formatDate(comment.createdAt)}</Text>
        </View>
        
        {/* Replies Section (if applicable) */}
        {comment.replies && comment.replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => (
              <View key={reply._id} style={styles.replyItem}>
                <Avatar.Image
                  source={{ uri: reply.user.profileImage || 'https://via.placeholder.com/24' }}
                  size={24}
                />
                
                <View style={styles.replyContent}>
                  <View style={styles.replyBubble}>
                    <Text style={styles.replyUserName}>{reply.user.name}</Text>
                    <Text style={styles.replyText}>{reply.content}</Text>
                  </View>
                  
                  <View style={styles.replyActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionText}>Like</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.timeText}>{formatDate(reply.createdAt)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* Menu Button */}
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <MaterialCommunityIcons name="dots-vertical" size={16} color={COLORS.gray} />
          </TouchableOpacity>
        }
      >
        {isOwner ? (
          <Menu.Item
            onPress={() => {
              closeMenu();
              onDelete && onDelete(comment._id);
            }}
            title="Delete Comment"
            icon="delete"
          />
        ) : (
          <Menu.Item
            onPress={() => {
              closeMenu();
              // Handle reporting comment
            }}
            title="Report Comment"
            icon="flag"
          />
        )}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
  },
  commentBubble: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 12,
  },
  userName: {
    ...FONTS.body3Bold,
    marginBottom: 4,
  },
  commentText: {
    ...FONTS.body3,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 8,
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  actionTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  timeText: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  repliesContainer: {
    marginTop: 8,
    marginLeft: 16,
  },
  replyItem: {
    flexDirection: 'row',
    marginTop: 8,
  },
  replyContent: {
    flex: 1,
    marginLeft: 8,
  },
  replyBubble: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 8,
  },
  replyUserName: {
    ...FONTS.body4Bold,
    marginBottom: 2,
  },
  replyText: {
    ...FONTS.body4,
  },
  replyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginLeft: 8,
  },
  menuButton: {
    padding: 4,
  },
});

export default CommentItem;