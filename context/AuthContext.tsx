import React, { createContext, useState, useContext, useEffect } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Platform } from 'react-native';

// Define the base URL for API calls
const API_URL = 'http://localhost:3000/api';

// Define the shape of the user object
interface User {
  _id: string;
  email: string;
  username: string;
  profilePicture?: string;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for the auth token
const TOKEN_KEY = 'dogcafe6ix_auth_token';

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up axios with auth token
  const setupAxios = async () => {
    const token = await getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Get the auth token from secure storage
  const getToken = async () => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Save the auth token to secure storage
  const saveToken = async (token: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  };

  // Remove the auth token from secure storage
  const removeToken = async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  };

  // Load the user data from the API
  const loadUser = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      await setupAxios();
      const response = await axios.get(`${API_URL}/users/me`);
      setUser(response.data);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error loading user:', error);
      await removeToken();
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email
  const signIn = async (email: string) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/signin`, { email });
      // After sending the email, we'll redirect to the verification screen
      // The actual token will be obtained after verification
      router.push({
        pathname: '/(auth)/verify',
        params: { email }
      });
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the code sent to the email
  const verifyCode = async (email: string, code: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/verify`, { email, code });
      const { token, user: userData } = response.data;
      
      await saveToken(token);
      await setupAxios();
      setUser(userData);
      
      router.replace('/(tabs)');
      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await removeToken();
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the user profile
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/users/profile`, data);
      setUser(response.data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load the user data on mount
  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        verifyCode,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};