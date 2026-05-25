import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_CONFIG } from '../config';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;
    if (isAuthenticated && user) {
      newSocket = io(API_CONFIG.SOCKET_URL);
      
      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit('join_user', user._id || user.id);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  return useContext(SocketContext);
};
