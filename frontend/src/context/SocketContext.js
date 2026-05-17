import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    socketRef.current = io('/', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    socketRef.current.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);
  const joinRoom = (room) => emit('joinSession', room);
  const leaveRoom = (room) => emit('leaveSession', room);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, notifications, clearNotifications, emit, joinRoom, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
