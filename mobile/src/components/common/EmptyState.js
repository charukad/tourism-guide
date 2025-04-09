import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  FlatList,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import {
  Appbar,
  Text,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  Divider,
  ActivityIndicator,
  IconButton,
  List,
  Portal,
  Dialog,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import MapView, { Marker } from 'react-native-maps';