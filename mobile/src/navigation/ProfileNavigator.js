import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ReviewNavigator from './ReviewNavigator';

// Import screens
import GuideProfileScreen from '../screens/guide/ProfileScreen';
import TouristProfileScreen from '../screens/tourist/ProfileScreen';
import GuideEditProfileScreen from '../screens/guide/EditProfileScreen';
import TouristEditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';

const Stack = createStackNavigator();

const ProfileNavigator = ({ route }) => {
  // Determine which screens to use based on user role
  const userRole = route?.params?.userRole || 'tourist';
  const ProfileComponent = userRole === 'guide' ? GuideProfileScreen : TouristProfileScreen;
  const EditProfileComponent = userRole === 'guide' ? GuideEditProfileScreen : TouristEditProfileScreen;

  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileComponent} />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileComponent} 
        options={{
          headerShown: true,
          title: userRole === 'guide' ? 'Edit Guide Profile' : 'Edit Profile',
          headerStyle: {
            backgroundColor: '#f8f8f8',
            elevation: 0,
            shadowOpacity: 0,
          },
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ 
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ 
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ 
          title: 'My Bookings',
        }}
      />
      <Stack.Screen 
        name="Reviews" 
        component={ReviewNavigator} 
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;