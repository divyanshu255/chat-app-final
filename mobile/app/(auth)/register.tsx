import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import API from '../../utils/api';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/authSlice';

export default function RegisterScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      return Alert.alert('All fields are required');
    }

    try {
      const res = await API.post('/auth/register', {
        username,
        email,
        password,
        profileUrl,
      });

      dispatch(loginSuccess(res.data));
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Register failed', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Register</Text>

      <View style={styles.card}>
        <TextInput
          placeholder="Username"
          style={styles.input}
          onChangeText={setUsername}
          placeholderTextColor="#b4b4b4"
        />
        <TextInput
          placeholder="Email"
          style={styles.input}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#b4b4b4"
        />
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          placeholderTextColor="#b4b4b4"
        />
        <TextInput
          placeholder="Profile Picture URL (optional)"
          style={styles.input}
          onChangeText={setProfileUrl}
          placeholderTextColor="#b4b4b4"
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#EEF1FA',
    padding: 20,
  },
  heading: {
    fontSize: 29,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    color: '#4650DD',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#7898FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E3EF',
    marginBottom: 16,
    padding: 13,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#F5F6FA',
    color: '#222',
  },
  button: {
    backgroundColor: '#4650DD',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    shadowColor: '#4650DD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  link: {
    marginTop: 12,
    color: '#4650DD',
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
    letterSpacing: 0.1,
  },
});