import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar, Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, spacing } from '../../constants/theme';
import Loading from '../../components/common/Loading';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../constants/api';

// Validation schema
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phoneNumber: Yup.string()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Phone number is not valid')
    .optional(),
  preferredLanguage: Yup.string().oneOf(['en', 'si', 'ta']).required('Preferred language is required'),
});

const EditProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  if (!user) {
    return <Loading />;
  }

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      
      const response = await api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, values);
      
      setSnackbarMessage('Profile updated successfully');
      setSnackbarVisible(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to update profile');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Upload image to server
        await uploadProfileImage(selectedImage.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setSnackbarMessage('Failed to pick image');
      setSnackbarVisible(true);
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      setImageUploading(true);
      
      // Create form data
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('profileImage', {
        uri,
        name: filename,
        type,
      });
      
      // Upload to server
      const response = await api.post(
        API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update local state
      setProfileImage(response.data.data.profileImage);
      setSnackbarMessage('Profile picture updated successfully');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      setSnackbarMessage('Failed to upload profile image');
      setSnackbarVisible(true);
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePick} disabled={imageUploading}>
          {profileImage ? (
            <Avatar.Image size={120} source={{ uri: profileImage }} />
          ) : (
            <Avatar.Text
              size={120}
              label={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
            />
          )}
          
          {imageUploading ? (
            <View style={styles.uploadingOverlay}>
              <Text style={styles.uploadingText}>Uploading...</Text>
            </View>
          ) : (
            <View style={styles.editAvatarButton}>
              <Text style={styles.editAvatarText}>Edit</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Formik
        initialValues={{
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          preferredLanguage: user.preferredLanguage || 'en',
        }}
        validationSchema={ProfileSchema}
        onSubmit={handleUpdateProfile}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <TextInput
              label="First Name"
              value={values.firstName}
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              style={styles.input}
              error={touched.firstName && errors.firstName}
            />
            {touched.firstName && errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}

            <TextInput
              label="Last Name"
              value={values.lastName}
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              style={styles.input}
              error={touched.lastName && errors.lastName}
            />
            {touched.lastName && errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}

            <TextInput
              label="Phone Number"
              value={values.phoneNumber}
              onChangeText={handleChange('phoneNumber')}
              onBlur={handleBlur('phoneNumber')}
              style={styles.input}
              keyboardType="phone-pad"
              error={touched.phoneNumber && errors.phoneNumber}
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}

            <Text style={styles.labelText}>Preferred Language</Text>
            <View style={styles.languageContainer}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  values.preferredLanguage === 'en' && styles.selectedLanguage,
                ]}
                onPress={() => handleChange('preferredLanguage')('en')}
              >
                <Text
                  style={[
                    styles.languageText,
                    values.preferredLanguage === 'en' && styles.selectedLanguageText,
                  ]}
                >
                  English
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  values.preferredLanguage === 'si' && styles.selectedLanguage,
                ]}
                onPress={() => handleChange('preferredLanguage')('si')}
              >
                <Text
                  style={[
                    styles.languageText,
                    values.preferredLanguage === 'si' && styles.selectedLanguageText,
                  ]}
                >
                  Sinhala
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  values.preferredLanguage === 'ta' && styles.selectedLanguage,
                ]}
                onPress={() => handleChange('preferredLanguage')('ta')}
              >
                <Text
                  style={[
                    styles.languageText,
                    values.preferredLanguage === 'ta' && styles.selectedLanguageText,
                  ]}
                >
                  Tamil
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonsContainer}>
              <Button
                mode="outlined"
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                style={styles.saveButton}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              >
                Save Changes
              </Button>
            </View>
          </View>
        )}
      </Formik>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: COLORS.primary,
  },
  avatarContainer: {
    position: 'relative',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background + '80',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  uploadingText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  editAvatarText: {
    color: COLORS.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
    backgroundColor: COLORS.surface,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  labelText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  languageOption: {
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: COLORS.primary,
  },
  languageText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  selectedLanguageText: {
    color: COLORS.background,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});

export default EditProfileScreen;