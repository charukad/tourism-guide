import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import navigators
import ExploreNavigator from './ExploreNavigator';
import ItineraryNavigator from './ItineraryNavigator';
import SocialNavigator from './SocialNavigator';
import ProfileNavigator from './ProfileNavigator';

// Import theme
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Explore"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Explore') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Itinerary') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen name="Explore" component={ExploreNavigator} />
      <Tab.Screen name="Itinerary" component={ItineraryNavigator} />
      <Tab.Screen name="Social" component={SocialNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;