

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  socket = io('https://chat-app1-432f.onrender.com');
  socket.emit('join', userId);
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error('Socket not connected');
  return socket;
};
