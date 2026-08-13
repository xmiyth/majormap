import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import PocketBase, { AsyncAuthStore, RecordModel } from 'pocketbase';
import { Platform } from 'react-native';
import NativeEventSource from 'react-native-sse';

if (Platform.OS !== 'web' && typeof globalThis.EventSource === 'undefined') {
  globalThis.EventSource = NativeEventSource as unknown as typeof globalThis.EventSource;
}

const authStorageKey = 'majormap.pocketbase.auth';
const authStorage = Platform.OS === 'web'
  ? {
      get: () => AsyncStorage.getItem(authStorageKey),
      save: (value: string) => AsyncStorage.setItem(authStorageKey, value),
      clear: () => AsyncStorage.removeItem(authStorageKey),
    }
  : {
      get: () => SecureStore.getItemAsync(authStorageKey),
      save: (value: string) => SecureStore.setItemAsync(authStorageKey, value),
      clear: () => SecureStore.deleteItemAsync(authStorageKey),
    };

const initialAuth = authStorage.get();
const authStore = new AsyncAuthStore({
  initial: initialAuth,
  save: authStorage.save,
  clear: authStorage.clear,
});

export const pocketbaseUrl = (process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090').replace(/\/+$/, '');
export const pb = new PocketBase(pocketbaseUrl, authStore);
export const pocketbaseAuthReady = initialAuth.then(() => undefined);

pb.autoCancellation(false);

export function pocketBaseErrorMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { message?: string; data?: Record<string, { message?: string }> } })?.response;
  const fieldMessage = response?.data && Object.values(response.data).find((item) => item?.message)?.message;
  if (fieldMessage) return fieldMessage;
  if (response?.message && response.message !== 'Failed to create record.') return response.message;
  return fallback;
}

export type PocketBaseUserRecord = RecordModel & {
  username?: string;
  name?: string;
  grade?: string;
  school?: string;
  schoolId?: string;
  schoolCity?: string;
  schoolState?: string;
  gpa?: string;
  sat?: string;
  psat?: string;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  gmail?: string;
  shareProfileDetails?: boolean;
  interests?: string[];
  schoolCommunities?: string[];
  schoolMemberships?: string | string[];
  dailySatStreak?: number;
  dailySatBest?: number;
  dailySatLastCompleted?: string;
  dailySatFreezeWeek?: string;
};

export type PocketBasePublicProfileRecord = RecordModel & Pick<PocketBaseUserRecord, 'name' | 'username' | 'grade' | 'school' | 'interests' | 'dailySatStreak'>;
