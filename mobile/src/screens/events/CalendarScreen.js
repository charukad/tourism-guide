import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Text, Appbar, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';

// Import components
import CalendarEventItem from '../../components/events/CalendarEventItem';
import EmptyState from '../../components/common/EmptyState';

// Import redux actions
import { fetchEventsByDate } from '../../store/slices/eventsSlice';

// Import theme
import { COLORS, FONTS } from '../../constants/theme';

const CalendarScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { eventsByDate, eventDates, loading } = useSelector(state => state.events);
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  
  // Fetch events for selected date
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchEventsByDate({ date: selectedDate, categories: selectedCategories }));
    }, [dispatch, selectedDate, selectedCategories])
  );
  
  // Update marked dates when eventDates changes
  useEffect(() => {
    const marked = {};
    
    // Mark today's date
    const today = format(new Date(), 'yyyy-MM-dd');
    marked[today] = { 
      selected: selectedDate === today,
      selectedColor: COLORS.primary,
      marked: eventDates.includes(today),
      dotColor: COLORS.primary
    };
    
    // Mark dates with events
    eventDates.forEach(date => {
      if (date !== today) {
        marked[date] = {
          selected: selectedDate === date,
          selectedColor: COLORS.primary,
          marked: true,
          dotColor: COLORS.primary
        };
      }
    });
    
    // Mark selected date if different from today and not in eventDates
    if (selectedDate !== today && !eventDates.includes(selectedDate)) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: COLORS.primary
      };
    }
    
    setMarkedDates(marked);
  }, [eventDates, selectedDate]);
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };
  
  // Handle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(cat => cat !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'EEEE, MMMM d, yyyy');
  };
  
  // Get visible categories from current events
  const getEventCategories = () => {
    const categories = new Set();
    
    if (eventsByDate) {
      eventsByDate.forEach(event => {
        if (event.categories && event.categories.length > 0) {
          event.categories.forEach(category => {
            categories.add(category);
          });
        }
      });
    }
    
    return Array.from(categories);
  };
  
  // Filter events by selected categories
  const getFilteredEvents = () => {
    if (!eventsByDate) return [];
    if (selectedCategories.length === 0) return eventsByDate;
    
    return eventsByDate.filter(event => {
      if (!event.categories || event.categories.length === 0) return false;
      return event.categories.some(category => selectedCategories.includes(category));
    });
  };
  
  const filteredEvents = getFilteredEvents();
  const visibleCategories = getEventCategories();
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Event Calendar" />
      </Appbar.Header>
      
      <Calendar
        current={selectedDate}
        onDayPress={handleDateSelect}
        markedDates={markedDates}
        theme={{
          todayTextColor: COLORS.primary,
          arrowColor: COLORS.primary,
          dotColor: COLORS.primary,
          selectedDayBackgroundColor: COLORS.primary,
        }}
      />
      
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>{formatDisplayDate(selectedDate)}</Text>
        
        {visibleCategories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContainer}
          >
            {visibleCategories.map(category => (
              <Chip
                key={category}
                selected={selectedCategories.includes(category)}
                onPress={() => toggleCategory(category)}
                style={styles.categoryChip}
                selectedColor={COLORS.primary}
              >
                {category}
              </Chip>
            ))}
          </ScrollView>
        )}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredEvents.length > 0 ? (
        <FlatList
          data={filteredEvents}
          renderItem={({ item }) => <CalendarEventItem event={item} />}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.eventListContainer}
        />
      ) : (
        <EmptyState
          icon="calendar-blank"
          title="No events on this day"
          message={
            selectedCategories.length > 0
              ? "Try adjusting your category filters"
              : "There are no events scheduled for this date"
          }
          actionLabel={selectedCategories.length > 0 ? "Clear Filters" : null}
          onAction={selectedCategories.length > 0 ? () => setSelectedCategories([]) : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  selectedDateContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedDateText: {
    ...FONTS.h3,
    marginBottom: 8,
  },
  categoryContainer: {
    paddingVertical: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  eventListContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CalendarScreen;