import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Chip, Divider, HelperText, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../constants/api';
import { updateProfile } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Initialize form state from Redux state
  const [bio, setBio] = useState(user?.guide?.bio || '');
  const [experience, setExperience] = useState(user?.guide?.experience ? user.guide.experience.toString() : '');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState(user?.guide?.serviceAreas || []);
  const [language, setLanguage] = useState('');
  const [languages, setLanguages] = useState(user?.guide?.languages || []);
  const [expertise, setExpertise] = useState('');
  const [expertises, setExpertises] = useState(user?.guide?.expertise || []);
  const [hourlyRate, setHourlyRate] = useState(user?.guide?.rates?.hourly ? user.guide.rates.hourly.toString() : '');
  const [dailyRate, setDailyRate] = useState(user?.guide?.rates?.daily ? user.guide.rates.daily.toString() : '');

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Check network connection first
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection available. Please check your network settings.');
      }
      
      // Validate required fields
      if (!bio || bio.trim().length < 10) {
        Alert.alert('Validation Error', 'Please provide a bio with at least 10 characters');
        setSaving(false);
        return;
      }
      
      if (bio.trim().length > 500) {
        Alert.alert('Validation Error', 'Bio cannot exceed 500 characters');
        setSaving(false);
        return;
      }
      
      if (locations.length === 0) {
        Alert.alert('Validation Error', 'Please add at least one service area');
        setSaving(false);
        return;
      }

      if (languages.length === 0) {
        Alert.alert('Validation Error', 'Please add at least one language');
        setSaving(false);
        return;
      }

      if (expertises.length === 0) {
        Alert.alert('Validation Error', 'Please add at least one area of expertise');
        setSaving(false);
        return;
      }
      
      // Prepare data
      const profileData = {
        bio,
        experience: experience ? parseInt(experience, 10) : 0,
        serviceAreas: locations,
        languages,
        expertise: expertises,
        rates: {
          hourly: hourlyRate ? parseFloat(hourlyRate) : 0,
          daily: dailyRate ? parseFloat(dailyRate) : 0,
        }
      };
      
      // Save profile with timeout
      const response = await api.put(API_ENDPOINTS.GUIDES.PROFILE, profileData, {
        timeout: 15000 // 15 second timeout
      });
      
      if (response.data && response.data.status === 'success') {
        // Directly update Redux with the guide data from the server response
        if (response.data.data && response.data.data.guide) {
          dispatch(updateProfile({
            guide: response.data.data.guide
          }));
        } else {
          // Fallback to constructed guide object if response doesn't contain the full guide data
          dispatch(updateProfile({
            guide: {
              bio,
              experience: experience ? parseInt(experience, 10) : 0,
              serviceAreas: locations,
              languages,
              expertise: expertises,
              rates: {
                hourly: hourlyRate ? parseFloat(hourlyRate) : 0,
                daily: dailyRate ? parseFloat(dailyRate) : 0,
              }
            }
          }));
        }
        
        // Force reload user data to sync with server
        try {
          const userResponse = await api.get(API_ENDPOINTS.AUTH.ME);
          if (userResponse.data && userResponse.data.data && userResponse.data.data.user) {
            // Replace the entire user object instead of merging to ensure all fields are up to date
            dispatch(updateProfile(userResponse.data.data.user));
            
            // Cache the guide data in AsyncStorage for offline access
            try {
              await AsyncStorage.setItem('cachedGuideData', JSON.stringify(userResponse.data.data.user.guide));
            } catch (cacheError) {
              console.log('Failed to cache guide data:', cacheError);
            }
          }
        } catch (refreshError) {
          console.error('Error refreshing user data:', refreshError);
        }
        
        Alert.alert('Success', 'Your guide profile has been updated successfully');
        
        // Go back to profile screen
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating guide profile:', error);
      
      let errorMessage = 'Failed to update your guide profile.';
      
      if (error.message.includes('Network Error') || error.message.includes('internet connection')) {
        errorMessage = 'Network error: Please check your internet connection and server availability.';
      } else if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to update this profile.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Our team has been notified.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request made but no response received (server down or unreachable)
        errorMessage = 'Could not connect to the server. Please try again later.';
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (item, list, setList, field) => {
    if (!item || item.trim() === '') return;
    
    if (list.includes(item.trim())) {
      Alert.alert('Already Added', `This ${field} is already in your list`);
      return;
    }
    
    setList([...list, item.trim()]);
    
    // Clear input field
    switch (field) {
      case 'location':
        setLocation('');
        break;
      case 'language':
        setLanguage('');
        break;
      case 'expertise':
        setExpertise('');
        break;
      default:
        break;
    }
  };

  const removeItem = (item, list, setList) => {
    setList(list.filter(i => i !== item));
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Guide Profile</Text>
          <Text style={styles.headerSubtitle}>
            Complete your profile to attract more tourists
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <Text style={styles.inputLabel}>Bio</Text>
          <TextInput
            mode="outlined"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell tourists about yourself, your experience and specialties"
            multiline
            maxLength={500}
            numberOfLines={4}
            style={styles.textArea}
          />
          <HelperText type="info" visible={true}>
            Min 10 characters. {bio ? `${bio.length}/500 characters` : '0/500 characters'}
          </HelperText>
          
          <Text style={styles.inputLabel}>Years of Experience</Text>
          <TextInput
            mode="outlined"
            value={experience}
            onChangeText={text => {
              // Only allow numbers
              if (/^\d*$/.test(text)) {
                setExperience(text);
              }
            }}
            placeholder="Years of experience as a guide"
            keyboardType="number-pad"
            style={styles.input}
          />
          
          <Text style={styles.inputLabel}>Service Areas</Text>
          <View style={styles.chipInputContainer}>
            <TextInput
              mode="outlined"
              value={location}
              onChangeText={setLocation}
              placeholder="Add cities or regions you serve"
              style={styles.chipInput}
            />
            <Button 
              mode="contained" 
              onPress={() => addItem(location, locations, setLocations, 'location')}
              style={styles.addButton}
            >
              Add
            </Button>
          </View>
          
          <View style={styles.chipContainer}>
            {locations.map(loc => (
              <Chip
                key={loc}
                mode="outlined"
                onClose={() => removeItem(loc, locations, setLocations)}
                style={styles.chip}
              >
                {loc}
              </Chip>
            ))}
          </View>
          
          <Text style={styles.inputLabel}>Languages</Text>
          <View style={styles.chipInputContainer}>
            <TextInput
              mode="outlined"
              value={language}
              onChangeText={setLanguage}
              placeholder="Add languages you speak"
              style={styles.chipInput}
            />
            <Button 
              mode="contained" 
              onPress={() => addItem(language, languages, setLanguages, 'language')}
              style={styles.addButton}
            >
              Add
            </Button>
          </View>
          
          <View style={styles.chipContainer}>
            {languages.map(lang => (
              <Chip
                key={lang}
                mode="outlined"
                onClose={() => removeItem(lang, languages, setLanguages)}
                style={styles.chip}
              >
                {lang}
              </Chip>
            ))}
          </View>
          
          <Text style={styles.inputLabel}>Areas of Expertise</Text>
          <View style={styles.chipInputContainer}>
            <TextInput
              mode="outlined"
              value={expertise}
              onChangeText={setExpertise}
              placeholder="Add your specializations"
              style={styles.chipInput}
            />
            <Button 
              mode="contained" 
              onPress={() => addItem(expertise, expertises, setExpertises, 'expertise')}
              style={styles.addButton}
            >
              Add
            </Button>
          </View>
          
          <View style={styles.chipContainer}>
            {expertises.map(exp => (
              <Chip
                key={exp}
                mode="outlined"
                onClose={() => removeItem(exp, expertises, setExpertises)}
                style={styles.chip}
              >
                {exp}
              </Chip>
            ))}
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Rates (LKR)</Text>
          
          <Text style={styles.inputLabel}>Hourly Rate</Text>
          <TextInput
            mode="outlined"
            value={hourlyRate}
            onChangeText={text => {
              // Only allow numbers and decimal point
              if (/^\d*\.?\d*$/.test(text)) {
                setHourlyRate(text);
              }
            }}
            placeholder="Your hourly rate in LKR"
            keyboardType="decimal-pad"
            style={styles.input}
            left={<TextInput.Affix text="LKR" />}
          />
          
          <Text style={styles.inputLabel}>Daily Rate</Text>
          <TextInput
            mode="outlined"
            value={dailyRate}
            onChangeText={text => {
              // Only allow numbers and decimal point
              if (/^\d*\.?\d*$/.test(text)) {
                setDailyRate(text);
              }
            }}
            placeholder="Your daily rate in LKR"
            keyboardType="decimal-pad"
            style={styles.input}
            left={<TextInput.Affix text="LKR" />}
          />
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={saving}
              disabled={saving}
            >
              Save Profile
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={saving}
            >
              Cancel
            </Button>
          </View>
        </View>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={5000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
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
    backgroundColor: '#fff',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 16,
    width: 160,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.primary,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
    color: '#333',
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  textArea: {
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    height: 100,
  },
  chipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chipInput: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    margin: 4,
  },
  divider: {
    marginVertical: 20,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    marginBottom: 10,
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: COLORS.error,
    paddingVertical: 8,
  },
});

export default EditProfileScreen; 