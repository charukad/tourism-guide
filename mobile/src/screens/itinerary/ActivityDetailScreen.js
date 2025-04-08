import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  Appbar,
  Text,
  Divider,
  Portal,
  Dialog,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import Carousel from 'react-native-snap-carousel';

// Import components and utilities
import { COLORS, FONTS } from '../../constants/theme';
import { fetchItineraryItemById, deleteItineraryItem } from '../../store/slices/itinerariesSlice';

// Activity type definitions
const ACTIVITY_TYPES = {
  visit: {
    icon: 'map-marker',
    color: COLORS.primary,
    label: 'Visit'
  },
  food: {
    icon: 'food-fork-drink',
    color: '#FF8C00',
    label: 'Food'
  },
  transport: {
    icon: 'car',
    color: '#4682B4',
    label: 'Transport'
  },
  accommodation: {
    icon: 'bed',
    color: '#8A2BE2',
    label: 'Accommodation'
  },
  activity: {
    icon: 'hiking',
    color: '#32CD32',
    label: 'Activity'
  },
  other: {
    icon: 'dots-horizontal',
    color: '#708090',
    label: 'Other'
  }
};

// Format time (e.g., "09:30 AM")
const formatTime = (timeString) => {
  if (!timeString) return 'All day';
  
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return format(date, 'h:mm a');
  } catch (error) {
    return timeString;
  }
};

// Calculate duration in hours and minutes
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  try {
    const [startHours, startMinutes] = startTime.split(':').map(num => parseInt(num, 10));
    const [endHours, endMinutes] = endTime.split(':').map(num => parseInt(num, 10));
    
    let durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight activities
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    }
  } catch (error) {
    return '';
  }
};

const screenWidth = Dimensions.get('window').width;

const ActivityDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { itineraryId, activityId } = route.params;
  
  const { currentItineraryItem, loading } = useSelector(state => state.itineraries);
  
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  
  // Fetch activity details when screen loads
  useEffect(() => {
    dispatch(fetchItineraryItemById({ itineraryId, itemId: activityId }));
  }, [dispatch, itineraryId, activityId]);
  
  if (!currentItineraryItem || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  const activity = currentItineraryItem;
  const activityType = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.other;
  const duration = calculateDuration(activity.startTime, activity.endTime);
  
  // Handle opening maps for directions
  const handleGetDirections = () => {
    if (activity.location && activity.location.coordinates) {
      const { latitude, longitude } = activity.location.coordinates;
      const url = Platform.OS === 'ios'
        ? `maps:0,0?q=${activity.location.name}@${latitude},${longitude}`
        : `geo:0,0?q=${latitude},${longitude}(${activity.location.name})`;
      
      Linking.openURL(url).catch(err => 
        console.error('An error occurred while opening maps:', err)
      );
    }
  };
  
  // Handle delete activity
  const handleDeleteActivity = () => {
    setDeleteDialogVisible(true);
  };
  
  const confirmDelete = () => {
    dispatch(deleteItineraryItem({ itineraryId, itemId: activityId }))
      .unwrap()
      .then(() => {
        setDeleteDialogVisible(false);
        navigation.goBack();
      });
  };
  
  // Render photo carousel
  const renderCarouselItem = ({ item }) => {
    return (
      <Image
        source={{ uri: item }}
        style={styles.carouselImage}
        resizeMode="cover"
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.white} />
        <Appbar.Content title="" color={COLORS.white} />
        <Appbar.Action 
          icon="pencil" 
          color={COLORS.white} 
          onPress={() => navigation.navigate('EditActivity', { itineraryId, activityId })} 
        />
        <Appbar.Action 
          icon="delete" 
          color={COLORS.white} 
          onPress={handleDeleteActivity} 
        />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        {/* Photos Carousel */}
        {activity.photos && activity.photos.length > 0 ? (
          <View style={styles.carouselContainer}>
            <Carousel
              data={activity.photos}
              renderItem={renderCarouselItem}
              sliderWidth={screenWidth}
              itemWidth={screenWidth}
              onSnapToItem={(index) => setCarouselActiveIndex(index)}
              loop={true}
              autoplay={false}
              inactiveSlideOpacity={1}
              inactiveSlideScale={1}
            />
            
            {activity.photos.length > 1 && (
              <View style={styles.paginationContainer}>
                {activity.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === carouselActiveIndex && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.defaultImageContainer}>
            <View style={[styles.activityIconCircle, { backgroundColor: activityType.color }]}>
              <MaterialCommunityIcons name={activityType.icon} size={48} color={COLORS.white} />
            </View>
          </View>
        )}
        
        {/* Activity Content */}
        <View style={styles.contentContainer}>
          {/* Activity Type Badge */}
          <View style={styles.typeBadgeContainer}>
            <View style={[styles.typeBadge, { backgroundColor: activityType.color }]}>
              <MaterialCommunityIcons name={activityType.icon} size={16} color={COLORS.white} />
              <Text style={styles.typeBadgeText}>{activityType.label}</Text>
            </View>
          </View>
          
          {/* Title and Time */}
          <Text style={styles.title}>{activity.title}</Text>
          
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.gray} />
            <Text style={styles.timeText}>
              {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
            </Text>
            {duration && (
              <Text style={styles.durationText}>({duration})</Text>
            )}
          </View>
          
          {/* Date */}
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={18} color={COLORS.gray} />
            <Text style={styles.dateText}>
              {format(new Date(activity.date), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Description */}
          {activity.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{activity.description}</Text>
            </View>
          ) : null}
          
          {/* Location */}
          {activity.location ? (
            <View style={styles.locationContainer}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <View style={styles.locationCard}>
                <Text style={styles.locationName}>{activity.location.name}</Text>
                <Text style={styles.locationAddress}>{activity.location.address}</Text>
                
                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={handleGetDirections}
                >
                  <MaterialCommunityIcons name="directions" size={18} color={COLORS.white} />
                  <Text style={styles.directionsText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          
          {/* Cost */}
          {activity.cost > 0 ? (
            <View style={styles.costContainer}>
              <Text style={styles.sectionTitle}>Cost</Text>
              <View style={styles.costContent}>
                <MaterialCommunityIcons name="currency-usd" size={24} color={COLORS.primary} />
                <Text style={styles.costText}>
                  {activity.cost} {activity.currency || 'USD'}
                </Text>
              </View>
            </View>
          ) : null}
          
          {/* Notes */}
          {activity.notes ? (
            <View style={styles.notesContainer}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notes}>{activity.notes}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
      
      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Activity</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete "{activity.title}"? This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDelete} color={COLORS.error}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appbar: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    elevation: 0,
  },
  scrollView: {
    flex: 1,
  },
  carouselContainer: {
    height: 250,
    backgroundColor: COLORS.lightGray,
  },
  carouselImage: {
    width: screenWidth,
    height: 250,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.white,
  },
  defaultImageContainer: {
    height: 200,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  typeBadgeContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    ...FONTS.body4,
    color: COLORS.white,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  title: {
    ...FONTS.h1,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    ...FONTS.body3,
    marginLeft: 8,
  },
  durationText: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    ...FONTS.body3,
    marginLeft: 8,
  },
  divider: {
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 8,
  },
  description: {
    ...FONTS.body3,
    lineHeight: 24,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationCard: {
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  locationName: {
    ...FONTS.h4,
    marginBottom: 4,
  },
  locationAddress: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginBottom: 12,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  directionsText: {
    ...FONTS.body4,
    color: COLORS.white,
    marginLeft: 8,
  },
  costContainer: {
    marginBottom: 16,
  },
  costContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    ...FONTS.h2,
    color: COLORS.primary,
    marginLeft: 8,
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesCard: {
    padding: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
  },
  notes: {
    ...FONTS.body3,
    lineHeight: 24,
  },
});

export default ActivityDetailScreen;