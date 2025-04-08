import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Avatar, List, Divider, Button, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../../store/slices/authSlice';
import { colors, spacing } from '../../constants/theme';

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.profileImage ? (
            <Avatar.Image size={100} source={{ uri: user.profileImage }} />
          ) : (
            <Avatar.Text
              size={100}
              label={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
              backgroundColor={theme.colors.primary}
            />
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Ionicons name="camera" size={22} color={colors.background} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
        <Text style={styles.role}>{user.role === 'vehicleOwner' ? 'Vehicle Owner' : user.role}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          Edit Profile
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <List.Item
          title="My Bookings"
          left={props => <List.Icon {...props} icon="calendar" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('MyBookings')}
        />
        <Divider />
        <List.Item
          title="Notification Settings"
          left={props => <List.Icon {...props} icon="bell" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
        <Divider />
        <List.Item
          title="Change Password"
          left={props => <List.Icon {...props} icon="lock" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <List.Item
          title="Help & FAQ"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('Help')}
        />
        <Divider />
        <List.Item
          title="Contact Us"
          left={props => <List.Icon {...props} icon="message" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ContactUs')}
        />
        <Divider />
        <List.Item
          title="About"
          left={props => <List.Icon {...props} icon="information" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('About')}
        />
      </View>

      <Button
        mode="outlined"
        style={styles.logoutButton}
        labelStyle={styles.logoutButtonLabel}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: spacing.xs,
  },
  role: {
    fontSize: 16,
    color: colors.background,
    textTransform: 'capitalize',
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  editButton: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    marginVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.divider,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: spacing.md,
    paddingBottom: spacing.sm,
    color: colors.textLight,
  },
  logoutButton: {
    margin: spacing.lg,
    marginTop: spacing.md,
    borderColor: colors.error,
  },
  logoutButtonLabel: {
    color: colors.error,
  },
});

export default ProfileScreen;