import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Avatar, Text, List, Divider, Button, Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';
import { logout, updateProfile } from '../../store/slices/authSlice';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../constants/api';

const DEFAULT_AVATAR = require('../../../assets/default-avatar.png');

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  // Fetch user profile image when component mounts
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.PROFILE.GET_IMAGES);
        if (response?.data?.success && response.data.data.length > 0) {
          // Find active profile image
          const activeImage = response.data.data.find(img => img.isActive);
          
          if (activeImage && activeImage.imageUrl) {
            console.log('Found active profile image:', activeImage.imageUrl);
            setProfileImage(activeImage);
            
            // Update user avatar if different
            if (user && (!user.avatar || user.avatar !== activeImage.imageUrl)) {
              dispatch(updateProfile({ 
                avatar: `${activeImage.imageUrl}?t=${new Date().getTime()}` 
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile images:', error);
      }
    };
    
    if (user) {
      fetchProfileImage();
    }
  }, [user?.id, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleChangeProfileImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (imageAsset) => {
    try {
      setUploading(true);

      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile-image.jpg',
      });

      // Upload to server using the correct endpoint
      const response = await api.post(API_ENDPOINTS.PROFILE.UPLOAD_IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      // Update local user state with new avatar
      if (response?.data?.success) {
        // Get the image URL from the response
        let imageUrl = '';
        
        if (response.data.data.profileImage && response.data.data.profileImage.imageUrl) {
          imageUrl = response.data.data.profileImage.imageUrl;
        } else if (response.data.data.imageUrl) {
          imageUrl = response.data.data.imageUrl;
        } else if (response.data.data.user && response.data.data.user.avatar) {
          imageUrl = response.data.data.user.avatar;
        }
        
        console.log('New profile image URL:', imageUrl);
        
        // Force reload by adding timestamp
        const timestampedUrl = `${imageUrl}?t=${new Date().getTime()}`;
        
        // Use the action creator
        dispatch(updateProfile({ avatar: timestampedUrl }));
        
        // Force a refresh of the app
        setTimeout(() => {
          // Fetch updated user data
          try {
            const fetchUser = async () => {
              const userResponse = await api.get(API_ENDPOINTS.AUTH.ME);
              if (userResponse?.data?.data?.user) {
                dispatch(updateProfile({ 
                  ...userResponse.data.data.user,
                  avatar: `${userResponse.data.data.user.avatar}?t=${new Date().getTime()}`
                }));
              }
            };
            fetchUser();
          } catch (err) {
            console.error('Error fetching updated user:', err);
          }
        }, 500);
        
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        throw new Error(response?.data?.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response) {
        // Server responded with an error
        errorMessage = error.response.data?.error?.message || 
                      error.response.data?.message ||
                      error.message;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No user data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={
              // Use profileImage first if available, then fallback to user.avatar
              profileImage?.imageUrl 
              ? { 
                  uri: `${profileImage.imageUrl}?t=${new Date().getTime()}`,
                  cache: 'reload'
                }
              : user?.avatar 
                ? { 
                    uri: user.avatar.includes('?') ? user.avatar : `${user.avatar}?t=${new Date().getTime()}`,
                    cache: 'reload'
                  } 
                : DEFAULT_AVATAR
            }
            style={styles.avatar}
            key={`avatar-${profileImage?.imageUrl || user?.avatar || 'default'}-${new Date().getTime()}`}
          />
          
          {/* Display the avatar URL for debugging */}
          {__DEV__ && (
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4, maxWidth: 250 }}>
              {profileImage?.imageUrl ? profileImage.imageUrl.substring(0, 30) : 
               user?.avatar ? user.avatar.substring(0, 30) : 'No Avatar'}...
            </Text>
          )}
          
          <Button
            mode="contained"
            onPress={handleChangeProfileImage}
            style={styles.changePhotoButton}
            labelStyle={styles.changePhotoLabel}
            icon={({ size, color }) => (
              <MaterialIcons name="camera-alt" size={size} color={color} />
            )}
            loading={uploading}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Change Photo'}
          </Button>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.role}>Professional Tour Guide</Text>
      </View>

      <View style={styles.section}>
        <List.Section>
          <List.Subheader>Personal Information</List.Subheader>
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Phone"
            description={user?.phoneNumber || 'Not specified'}
            left={props => <List.Icon {...props} icon="phone" />}
          />
          <Divider />
          <List.Item
            title="Location"
            description={user?.guide?.serviceAreas?.join(', ') || 'Not specified'}
            left={props => <List.Icon {...props} icon="map-marker" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Professional Information</List.Subheader>
          <Card style={styles.bioCard}>
            <Card.Content>
              <Text style={styles.bioTitle}>About Me</Text>
              <Text style={styles.bioText}>
                {user?.guide?.bio || 'No bio available. Add a brief description about yourself and your experience as a tour guide.'}
              </Text>
            </Card.Content>
          </Card>
          <List.Item
            title="Experience"
            description={`${user?.guide?.experience || 0} years`}
            left={props => <List.Icon {...props} icon="briefcase" />}
          />
          <Divider />
          <List.Item
            title="Languages"
            description={user?.guide?.languages?.join(', ') || 'Not specified'}
            left={props => <List.Icon {...props} icon="translate" />}
          />
          <Divider />
          <List.Item
            title="Expertise"
            description={user?.guide?.expertise?.join(', ') || 'Not specified'}
            left={props => <List.Icon {...props} icon="star" />}
          />
        </List.Section>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => {}}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Logout
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  changePhotoButton: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  changePhotoLabel: {
    fontSize: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  bioCard: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.primary,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  editButton: {
    marginBottom: 10,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
});

export default ProfileScreen; 