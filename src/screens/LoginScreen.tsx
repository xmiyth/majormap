import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../components/Typography';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/theme';

type Props = { onLogin: (identifier: string, password: string) => Promise<string | null>; onGoogleLogin: () => Promise<string | null>; onSignUp: () => void };

export function LoginScreen({ onLogin, onGoogleLogin, onSignUp }: Props) {
  const { isDark } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!identifier.trim() || !password) {
      setError('Enter your username or email and password.');
      return;
    }
    if (loading) return;
    setLoading(true);
    const loginError = await onLogin(identifier.trim().toLowerCase(), password);
    if (loginError) setError(loginError);
    setLoading(false);
  };

  const continueWithGoogle = async () => {
    if (googleLoading) return;
    setError('');
    setGoogleLoading(true);
    const loginError = await onGoogleLogin();
    if (loginError) setError(loginError);
    setGoogleLoading(false);
  };

  return <View style={s.page}>
    <Text style={s.brand}>MajorMap</Text>
    <Text style={s.title}>Welcome back</Text>
    <Text style={s.sub}>Log in to continue with your saved profile.</Text>
    <View style={[s.card, isDark && d.card]}>
      <Pressable disabled={googleLoading} style={({ pressed }) => [s.googleButton, isDark && d.googleButton, pressed && s.googleButtonPressed, googleLoading && s.googleButtonDisabled]} onPress={continueWithGoogle} accessibilityRole="button" accessibilityLabel="Continue with Google">
        {googleLoading ? <ActivityIndicator size="small" color={isDark ? '#F4F7FC' : '#34415E'} /> : <View style={s.googleMark}><Text style={s.googleMarkText}>G</Text></View>}
        <Text style={[s.googleButtonText, isDark && d.googleButtonText]}>{googleLoading ? 'Connecting to Google…' : 'Continue with Google'}</Text>
      </Pressable>
      <View style={s.divider}><View style={[s.dividerLine, isDark && d.dividerLine]} /><Text style={s.dividerText}>OR USE YOUR PASSWORD</Text><View style={[s.dividerLine, isDark && d.dividerLine]} /></View>
      <TextInput style={[s.input, isDark && d.input]} value={identifier} onChangeText={setIdentifier} placeholder="Username or email" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} autoCapitalize="none" autoCorrect={false} returnKeyType="next" />
      <View style={s.passwordContainer}>
        <TextInput style={[s.input, s.passwordInput, isDark && d.input]} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={isDark ? '#687087' : '#98A0B0'} secureTextEntry={!passwordVisible} autoCapitalize="none" autoCorrect={false} returnKeyType="done" onSubmitEditing={submit} />
        <Pressable style={s.eyeButton} onPress={() => setPasswordVisible((visible) => !visible)} accessibilityRole="button" accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}><Feather name={passwordVisible ? 'eye-off' : 'eye'} size={19} color="#667188" /></Pressable>
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Pressable disabled={loading} style={[s.primary, loading && s.primaryDisabled]} onPress={submit}><Text style={s.primaryText}>{loading ? 'Logging in…' : 'Log in'}</Text></Pressable>
      <Pressable onPress={onSignUp}><Text style={s.link}>Need an account? Sign up</Text></Pressable>
    </View>
  </View>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#4056C6', padding: 24, justifyContent: 'center' },
  brand: { color: '#FFF', fontWeight: '900', fontSize: 20, marginBottom: 34 },
  title: { color: '#FFF', fontSize: 31, fontWeight: '800', marginBottom: 8 },
  sub: { color: '#E5E8FF', lineHeight: 21, marginBottom: 22 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 22 },
  googleButton: { minHeight: 50, borderRadius: 13, borderWidth: 1, borderColor: '#DCE0E9', backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 17 },
  googleButtonPressed: { backgroundColor: '#F6F7FA', transform: [{ scale: .99 }] },
  googleButtonDisabled: { opacity: .65 },
  googleButtonText: { color: '#34415E', fontSize: 14, fontWeight: '800' },
  googleMark: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#E1E5EE', alignItems: 'center', justifyContent: 'center' },
  googleMarkText: { color: '#4285F4', fontSize: 15, fontWeight: '900' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E8EF' },
  dividerText: { color: '#939CAE', fontSize: 8, fontWeight: '900', letterSpacing: .7 },
  input: { height: 48, borderWidth: 1, borderColor: '#E1E5EE', borderRadius: 12, paddingHorizontal: 13, marginBottom: 12, color: '#263250' },
  passwordContainer: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', top: 0, right: 0, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#B23B52', fontSize: 12, marginBottom: 8 },
  primary: { backgroundColor: '#4056C6', borderRadius: 12, padding: 14, alignItems: 'center' },
  primaryDisabled: { backgroundColor: '#AAB3DB' },
  primaryText: { color: '#FFF', fontWeight: '800' },
  link: { color: '#4056C6', fontWeight: '800', textAlign: 'center', marginTop: 17 },
});

const d = StyleSheet.create({
  card: { backgroundColor: '#131B2D', borderWidth: 1, borderColor: '#2A3852' },
  input: { backgroundColor: '#0E1626', borderColor: '#30405D', color: '#F4F7FC' },
  googleButton: { backgroundColor: '#172136', borderColor: '#30405D' },
  googleButtonText: { color: '#F4F7FC' },
  dividerLine: { backgroundColor: '#30405D' },
});
