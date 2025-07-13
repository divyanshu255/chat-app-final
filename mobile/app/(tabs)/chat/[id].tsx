
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import API from '../../../utils/api';
import { connectSocket, getSocket } from '../../../utils/socket';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  content: string;
  timestamp?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  profileUrl?: string;
}

export default function ChatScreen() {
  const { id: receiverId } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [messages, setMessages] = useState<Message[]>([]);
  const [receiver, setReceiver] = useState<User | null>(null);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user?._id) {
      connectSocket(user._id);
      const socket = getSocket();

      socket.on('receiveMessage', (data: Message) => {
        if (data.sender === receiverId) {
          setMessages((prev) => [...prev, data]);
        }
      });
    }
    return () => {
      getSocket().off('receiveMessage');
    };
  }, [receiverId]);

  useEffect(() => {
    if (token && receiverId) {
      fetchMessages();
      fetchReceiver();
    }
  }, [receiverId]);

  const fetchMessages = async () => {
    try {
      const res = await API.get(`/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (err) {
      console.error('Failed to fetch messages:', err.response?.data || err.message);
    }
  };

  const fetchReceiver = async () => {
    try {
      const res = await API.get('/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = res.data.find((u: User) => u._id === receiverId);
      setReceiver(found || null);
    } catch (err) {
      console.error('Failed to fetch receiver info:', err.response?.data || err.message);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMsg: Message = {
      sender: user!._id,
      receiver: receiverId!,
      content: input,
    };

    getSocket().emit('sendMessage', newMsg);

    try {
      await API.post('/messages', newMsg, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to save message:', err.response?.data || err.message);
    }

    setMessages((prev) => [...prev, { ...newMsg, timestamp: new Date().toISOString() }]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender === user?._id;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' },
        ]}
      >
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={styles.messageText}>{item.content}</Text>
        </View>
        <Text style={[styles.timeText, isMe ? { textAlign: 'right' } : { textAlign: 'left' }]}>
          {item.timestamp
            ? new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }).toLowerCase()
            : ''}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBack}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Image
            source={{ uri: receiver?.profileUrl || 'https://via.placeholder.com/40' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{receiver?.username || 'Loading...'}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 6, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type message..."
            value={input}
            onChangeText={setInput}
            onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)}
            placeholderTextColor="#bbb"
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  headerBack: {
    marginRight: 8,
    padding: 4,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ddd',
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  messageContainer: {
    maxWidth: '100%',
    marginHorizontal: 12,
    marginTop: 14,
    marginBottom: 2,
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    minWidth: 48,
  },
  myBubble: {
    backgroundColor: '#e8f0fe',
    borderTopRightRadius: 6,
    alignSelf: 'flex-end',
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 6,
    borderWidth: 0.5,
    borderColor: '#ededed',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 2,
    marginHorizontal: 4,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 10,
    borderTopWidth: 0.5,
    borderColor: '#ededed',
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 13 : 10,
    borderRadius: 25,
    fontSize: 17,
    color: '#222',
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: '#ededed',
  },
  sendButton: {
    backgroundColor: '#1687fa',
    padding: 10,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});