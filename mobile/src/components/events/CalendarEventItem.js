import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS } from '../../../constants/theme';

const CalendarEventItem = ({ event, isActive = false }) => {
  const navigation = useNavigation();

  // Format time for display (e.g. "09:00 AM - 05:00 PM")
  const formatEventTime = (startTime, endTime) => {
    if (!startTime) return 'All day';
    
    let formattedTime = format(new Date(`2000-01-01T${startTime}`), 'h:mm a');
    
    if (endTime) {
      formattedTime += ` - ${format(new Date(`2000-01-01T${endTime}`), 'h:mm a')}`;
    }
    
    return formattedTime;
  };

  // Handle navigation to event details
  const handlePress = () => {
    navigation.navigate('EventDetail', { eventId: event._id });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.activeContainer
      ]}
      onPress={handlePress}
    >
      <View style={[
        styles.statusIndicator,
        {
          backgroundColor: event.startDate > new Date().toISOString()
            ? COLORS.primary
            : event.endDate > new Date().toISOString()
              ? COLORS.success
              : COLORS.gray
        }
      ]} />
      
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            isActive && styles.activeText
          ]}
          numberOfLines={1}
        >
          {event.title}
        </Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={isActive ? COLORS.white : COLORS.gray}
            />
            <Text
              style={[
                styles.infoText,
                isActive && styles.activeText
              ]}
            >
              {formatEventTime(event.startTime, event.endTime)}
            </Text>
          </View>
          
          {event.location && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={isActive ? COLORS.white : COLORS.gray}
              />
              <Text
                style={[
                  styles.infoText,
                  isActive && styles.activeText
                ]}
                numberOfLines={1}
              >
                {event.location.name}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {event.isFeatured && (
        <MaterialCommunityIcons
          name="star"
          size={16}
          color={isActive ? COLORS.white : COLORS.primary}
          style={styles.featuredIcon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeContainer: {
    backgroundColor: COLORS.primary,
  },
  statusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    ...FONTS.body3Bold,
    marginBottom: 4,
  },
  activeText: {
    color: COLORS.white,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginLeft: 4,
  },
  featuredIcon: {
    alignSelf: 'center',
    marginLeft: 8,
  },
});

export default CalendarEventItem;