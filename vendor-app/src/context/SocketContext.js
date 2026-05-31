import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { vendor } = useAuth();
  
  // Use IP address for physical devices, localhost for web/emulators
  const socketUrl = Platform.OS === 'web' 
    ? 'http://localhost:5000' 
    : 'http://192.168.29.236:5000';

  useEffect(() => {
    if (!vendor?._id) return;

    const newSocket = io(socketUrl);
    
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join_vendor', vendor._id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [vendor]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
