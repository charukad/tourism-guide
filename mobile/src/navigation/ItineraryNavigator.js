import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ItinerariesScreen from '../screens/itinerary/ItinerariesScreen';
import CreateItineraryScreen from '../screens/itinerary/CreateItineraryScreen';
import ItineraryDetailScreen from '../screens/itinerary/ItineraryDetailScreen';

const Stack = createStackNavigator();

const ItineraryNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ItineraryList"
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ItineraryList"
        component={ItinerariesScreen}
        options={{ 
          title: 'My Trips',
        }}
      />
      <Stack.Screen
        name="CreateItinerary"
        component={CreateItineraryScreen}
        options={{ 
          title: 'Plan New Trip',
        }}
      />
      <Stack.Screen
        name="ItineraryDetail"
        component={ItineraryDetailScreen}
        options={({ route }) => ({ 
          title: route.params?.name || 'Trip Details',
        })}
      />
    </Stack.Navigator>
  );
};

export default ItineraryNavigator;