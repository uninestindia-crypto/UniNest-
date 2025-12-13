import * as SecureStore from 'expo-secure-store';
import type { StorageAdapter } from './storage';

/**
 * Secure storage adapter for React Native using expo-secure-store
 * Stores tokens in iOS Keychain / Android Keystore
 */
export const secureStorage: StorageAdapter = {
    getItem: async (key: string) => {
        try {
            return await SecureStore.getItemAsync(key);
        } catch (error) {
            console.error('SecureStore getItem error:', error);
            return null;
        }
    },
    setItem: async (key: string, value: string) => {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch (error) {
            console.error('SecureStore setItem error:', error);
        }
    },
    removeItem: async (key: string) => {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch (error) {
            console.error('SecureStore removeItem error:', error);
        }
    },
};

export default secureStorage;
