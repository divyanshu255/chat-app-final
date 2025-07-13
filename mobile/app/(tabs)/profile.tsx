import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/authSlice';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: user?.profileUrl || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f4f6fc', 
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.11,
    shadowRadius: 30,
    elevation: 8,
    minWidth: 300,
  },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    marginBottom: 18, 
    borderWidth: 2, 
    borderColor: '#7b83eb', 
    backgroundColor: '#e8eaf6',
  },
  username: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 6, 
    color: '#18214d',
    letterSpacing: 0.3,
  },
  email: { 
    fontSize: 16, 
    color: '#7b83eb', 
    marginBottom: 28, 
    letterSpacing: 0.2,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 22,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 17, 
    letterSpacing: 0.5,
  },
});