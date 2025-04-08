import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider, useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { I18nextProvider } from 'react-i18next';

// Import store, theme, and i18n
import store from './src/store';
import { theme, colors } from './src/constants/theme';
import i18n from './src/i18n';

// Import navigation
import AppNavigator from './src/navigation/AppNavigator';

// Import authentication actions
import { loadUser } from './src/store/slices/authSlice';

// Import loading component
import Loading from './src/components/common/Loading';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Main App component that provides the necessary context providers
export default function App() {
  return (
    <StoreProvider store={store}>
      <I18nextProvider i18n={i18n}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <NavigationContainer>
              <AppContent />
              <StatusBar style="auto" />
            </NavigationContainer>
          </SafeAreaProvider>
        </PaperProvider>
      </I18nextProvider>
    </StoreProvider>
  );
}

// Preload assets (fonts and images)
async function cacheResourcesAsync() {
  const images = [
    require('./assets/images/logo-placeholder.png'),
    require('./assets/images/splash.png'),
  ];

  const cacheImages = images.map(image => {
    return Asset.fromModule(image).downloadAsync();
  });

  // Load fonts
  const fontAssets = Font.loadAsync({
    'roboto-regular': require('./assets/fonts/Roboto-Regular.ttf'),
    'roboto-bold': require('./assets/fonts/Roboto-Bold.ttf'),
    'roboto-medium': require('./assets/fonts/Roboto-Medium.ttf'),
  });

  return Promise.all([...cacheImages, fontAssets]);
}

// App content component that has access to Redux state
function AppContent() {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  // Set up splash screen and check authentication
  useEffect(() => {
    async function prepare() {
      try {
        // Check for auth token
        const token = await AsyncStorage.getItem('authToken');
        
        // Preload assets
        await cacheResourcesAsync();
        
        // Try to load user data if token exists
        if (token) {
          dispatch(loadUser());
        }
        
        // Artificial delay for smooth transition from splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setInitialAuthChecked(true);
      } catch (error) {
        console.warn('Error preparing app:', error);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [dispatch]);

  // Render null until we're ready
  if (!appIsReady) {
    return null;
  }

  // Show loading spinner while checking authentication
  if (isLoading && !initialAuthChecked) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={require('./assets/images/logo-placeholder.png')} 
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return <AppNavigator />;
}

// Styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingLogo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textLight,
  },
});