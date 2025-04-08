import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import FeedScreen from '../screens/social/FeedScreen';
import CreatePostScreen from '../screens/social/CreatePostScreen';
import PostDetailScreen from '../screens/social/PostDetailScreen';

const Stack = createStackNavigator();

const SocialNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ 
          title: 'Travel Community',
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ 
          title: 'Share Experience',
        }}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ 
          title: 'Post',
        }}
      />
    </Stack.Navigator>
  );
};

export default SocialNavigator;