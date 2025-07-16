

import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useRouter } from 'expo-router';
import API from '../../utils/api';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


interface User {
  _id: string;
  username: string;
  email: string;
  profileUrl?: string;
}

interface Message {
  content: string;
  sender: string;
  receiver: string;
  timestamp?: string;
}

interface Summary {
  lastMessage: Message | null;
  unseenCount: number;
}

export default function UserListScreen() {
  const router = useRouter();
  const { token, user: currentUser } = useSelector((state: RootState) => state.auth);
  const [users, setUsers] = useState<User[]>([]);
  const [summaries, setSummaries] = useState<{ [userId: string]: Summary }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const others = res.data.filter((u: User) => u._id !== currentUser?._id);
      await fetchSummaries(others);
    } catch (err) {
      console.error('Fetch users error:', err.response?.data || err.message);
      setLoading(false);
    }
  };
  useFocusEffect(
  useCallback(() => {
    if (token) {
      fetchUsers();
    }
  }, [token])
);


  const fetchSummaries = async (userList: User[]) => {
    const results = await Promise.all(
      userList.map(async (u) => {
        try {
          const res = await API.get(`/messages/summary/${u._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          return { user: u, summary: res.data };
        } catch {
          return { user: u, summary: { lastMessage: null, unseenCount: 0 } };
        }
      })
    );
   

    const summaryMap: { [userId: string]: Summary } = {};
    results.forEach(({ user, summary }) => {
      summaryMap[user._id] = summary;
    });

    const sortedUsers = results.map(({ user }) => user);

    setUsers(sortedUsers);
    setSummaries(summaryMap);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: User }) => {
    const summary = summaries[item._id];
    const msg = summary?.lastMessage;

    const isMe = msg?.sender === currentUser?._id;
    const messagePreview = msg?.content
      ? `${isMe ? 'You: ' : ''}${msg.content}`
      : 'Say Hi 👋';

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => router.push(`/chat/${item._id}`)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.profileUrl || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item.username}</Text>
          <Text numberOfLines={1} style={styles.lastMessage}>
            {messagePreview}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
        {/* <Image
          source={{ uri: currentUser?.profileUrl || 'https://via.placeholder.com/40' }}
          style={styles.headerAvatar}
        /> */}
        <TouchableOpacity onPress={() => router.push('/profile')}>
  <Image
    source={{ uri: currentUser?.profileUrl || 'https://via.placeholder.com/40' }}
    style={styles.headerAvatar}
  />
</TouchableOpacity>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#7B83EB',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ccc' },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12, backgroundColor: '#eee' },
  username: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 3 },
  lastMessage: { fontSize: 15, color: '#666' },
});
