import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, ActivityIndicator, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { COLORS } from '../../constants/theme';

const ImageUploader = ({
  endpoint,
  initialImage,
  onSuccess,
  onError,
  buttonText = 'Upload Image',
  style
}) => {
  const [image, setImage] = useState(initialImage || null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      onError('Permission to access media library was denied');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        uploadImage(selectedAsset.uri);
      }
    } catch (error) {
      onError('Error picking image: ' + error.message);
    }
  };

  const uploadImage = async (uri) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('image', {
        uri,
        name: filename,
        type
      });

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.imageUrl) {
        setImage(response.data.imageUrl);
        onSuccess(response.data);
      } else {
        onError('Invalid response from server');
      }
    } catch (error) {
      onError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {image ? (
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: image }} style={styles.image} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.placeholder} 
          onPress={pickImage}
        >
          <Text style={styles.placeholderText}>No image selected</Text>
        </TouchableOpacity>
      )}
      
      {loading ? (
        <ActivityIndicator style={styles.loading} color={COLORS.primary} />
      ) : (
        <Button 
          mode="outlined" 
          onPress={pickImage} 
          style={styles.button}
          color={COLORS.primary}
        >
          {buttonText}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#888',
    textAlign: 'center',
    padding: 10,
  },
  button: {
    marginTop: 10,
  },
  loading: {
    marginTop: 10,
  }
});

export default ImageUploader; 