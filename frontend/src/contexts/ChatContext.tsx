import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { UserInterface, Chat, MessageInterface, ChatResponse } from '@/types/chat';
import { useAuth } from './AuthContext';
import { getAllUsers } from '@/services/userService';

// 1. New State and Action Types
interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: { [chatId: string]: MessageInterface[] };
  onlineUsers: Set<string>;
  
}

type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_ACTIVE_CHAT'; payload: Chat | null }
  | { type: 'ADD_MESSAGE'; payload: MessageInterface }
  | { type: 'SET_MESSAGES'; payload: { chatId: string; messages: MessageInterface[] } }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; isOnline: boolean } }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'MARK_CHAT_READ'; payload: string }
  | { type: 'SET_ONLINE_USERS'; payload: string[] }
  | { type: 'LOGOUT' };

interface ChatContextType extends ChatState {
  sendMessage: (content: string) => void;
  sendMedia: (file: File, caption?: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  deleteMessage: (chatId: string, msgId: string) => Promise<void>;
  createChat: (userId: string) => Promise<void>;
  createGroupChat: (userIds: string[], groupName: string) => Promise<void>;
  addUserToGroup: (chatId: string, userId: string) => Promise<void>;
  removeUserFromGroup: (chatId: string, userId: string) => Promise<void>;
  renameGroup: (chatId: string, name: string) => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  markAsRead: (chatId: string) => void;
}

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  onlineUsers: new Set<string>(),
};

// 2. Reducer (mostly the same, but with corrected types)
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.payload };
    case 'ADD_MESSAGE':
      const { chatId } = action.payload;
      // de-duplicate by _id
      const existing = state.messages[chatId] || [];
      const has = existing.some(m => m._id === action.payload._id);
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: has ? existing : [...existing, action.payload],
        },
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages,
        },
      };
    case 'UPDATE_USER_STATUS':
      const updatedOnlineUsers = new Set(state.onlineUsers);
      if (action.payload.isOnline) {
        updatedOnlineUsers.add(action.payload.userId);
      } else {
        updatedOnlineUsers.delete(action.payload.userId);
      }
      return { ...state, onlineUsers: updatedOnlineUsers };
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: new Set(action.payload) };
    case 'ADD_CHAT':
      // Avoid adding duplicate chats
      if (state.chats.some(chat => chat._id === action.payload._id)) {
        return state;
      }
      return { ...state, chats: [action.payload, ...state.chats] };
    case 'MARK_CHAT_READ':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat._id === action.payload ? { ...chat, unreadCount: 0 } : chat
        ),
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let socket: Socket | null = null;

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user: currentUser, isAuthenticated } = useAuth(); // Get user from AuthContext

  // 3. Refactored API calls
  const getAllChats = async (): Promise<Chat[]> => {
    try {
      const response = await fetch('http://localhost:5002/api/v1/chat/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }
      // Assuming the API returns { chats: ChatResponse[] }
      const data: { chats: ChatResponse[] } = await response.json();

      let usersIndex: Record<string, any> | null = null;
      try {
        const allUsers = await getAllUsers();
        usersIndex = Object.fromEntries(allUsers.map(u => [u._id, u]));
      } catch (e) {
        usersIndex = null;
      }
      
      // Map to Chat[] and enrich members
      const chats: Chat[] = data.chats.map(chatResponse => {
        const rawChat: any = chatResponse.chat;
        if (rawChat.isGroupChat) {
          const rawMembers: string[] = Array.isArray(rawChat.members) ? rawChat.members : [];
          if (usersIndex) {
            rawChat.members = rawMembers.map(id => usersIndex![id] || { _id: id, name: 'Unknown User' });
          } else {
            rawChat.members = rawMembers.map(id => ({ _id: id, name: 'Unknown User' }));
          }
        } else {
          // Direct chat: store the other user for convenience
          rawChat.members = [chatResponse.user];
        }
        return rawChat as Chat;
      });

      dispatch({ type: 'SET_CHATS', payload: chats });
      return chats;
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      return [];
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      getAllChats();

      socket = io('http://localhost:5002', {
        autoConnect: true,
        query: { userId: currentUser._id },
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        // join active chat room if any
        if (state.activeChat?._id) {
          socket?.emit('joinChat', state.activeChat._id);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('newMessage', (message: MessageInterface) => {
        dispatch({ type: 'ADD_MESSAGE', payload: message });
      });

      socket.on('messagesSeen', ({ chatId, messageIds }) => {
        const current = (state.messages as any)[chatId] || [];
        if (current.length) {
          const updated = current.map((m: any) => (
            messageIds.includes(m._id) ? { ...m, seen: true, seenAt: new Date() } : m
          ));
          dispatch({ type: 'SET_MESSAGES', payload: { chatId, messages: updated } });
        }
      });

      socket.on('userStatus', ({ userId, isOnline }) => {
        dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId, isOnline } });
      });

      socket.on('onlineUsers', (users: string[]) => {
        dispatch({ type: 'SET_ONLINE_USERS', payload: users });
      });

      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [isAuthenticated, currentUser]);

  const sendMessage = async (content: string) => {
    if (!state.activeChat || !currentUser) return;

    // 4. Send JSON instead of FormData
    try {
      const response = await fetch('http://localhost:5002/api/v1/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          chatId: state.activeChat._id,
          text: content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessage: MessageInterface = (data && (data as any).message) ? (data as any).message : data;
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const sendMedia = async (file: File, caption?: string) => {
    if (!state.activeChat || !currentUser) return;

    try {
      const formData = new FormData();
      formData.append('chatId', state.activeChat._id);
      if (caption) formData.append('text', caption);
      formData.append('file', file);

      const response = await fetch('http://localhost:5002/api/v1/chat/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send media');
      }

      const data = await response.json();
      const newMessage: MessageInterface = (data && (data as any).message) ? (data as any).message : data;
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    } catch (error) {
      console.error('Failed to send media:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/chat/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete chat');

      const filtered = state.chats.filter(c => c._id !== chatId);
      dispatch({ type: 'SET_CHATS', payload: filtered });
      if (state.activeChat?._id === chatId) {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: null });
      }
      // Clear cached messages for the deleted chat
      dispatch({ type: 'SET_MESSAGES', payload: { chatId, messages: [] } });
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const deleteMessage = async (chatId: string, msgId: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/chat/msg/${msgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete message');

      const current = state.messages[chatId] || [];
      const updated = current.filter(m => m._id !== msgId);
      dispatch({ type: 'SET_MESSAGES', payload: { chatId, messages: updated } });
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const createChat = async (userId: string) => {
    try {
      const response = await fetch('http://localhost:5002/api/v1/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ otherUserId: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const data = await response.json();
      const createdChatId: string | undefined = (data && data.chatId) ? data.chatId : (data && data._id ? data._id : undefined);
      const updatedChats = await getAllChats();

      if (createdChatId) {
        const createdChat = updatedChats.find(c => c._id === createdChatId) || null;
        if (createdChat) setActiveChat(createdChat);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const createGroupChat = async (userIds: string[], groupName: string) => {
    try {
      const response = await fetch('http://localhost:5002/api/v1/chat/group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ members: userIds, name: groupName }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group chat');
      }

      const data = await response.json();
      const createdChatId: string | undefined = (data && data.chatId) ? data.chatId : (data && data._id ? data._id : undefined);
      const updatedChats = await getAllChats();

      if (createdChatId) {
        const createdChat = updatedChats.find(c => c._id === createdChatId) || null;
        if (createdChat) setActiveChat(createdChat);
      }
    } catch (error) {
      console.error('Failed to create group chat:', error);
    }
  };

  const addUserToGroup = async (chatId: string, userId: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/chat/${chatId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to add member');
      await getAllChats();
      if (state.activeChat?._id === chatId) {
        const updated = (await getAllChats()).find(c => c._id === chatId) || null;
        if (updated) dispatch({ type: 'SET_ACTIVE_CHAT', payload: updated });
      }
    } catch (e) { console.error(e); }
  };

  const removeUserFromGroup = async (chatId: string, userId: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/chat/${chatId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to remove member');
      await getAllChats();
      if (state.activeChat?._id === chatId) {
        const updated = (await getAllChats()).find(c => c._id === chatId) || null;
        if (updated) dispatch({ type: 'SET_ACTIVE_CHAT', payload: updated });
      }
    } catch (e) { console.error(e); }
  };

  const renameGroup = async (chatId: string, name: string) => {
    try {
      const response = await fetch(`http://localhost:5002/api/v1/chat/${chatId}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to rename group');
      await getAllChats();
      if (state.activeChat?._id === chatId) {
        const updated = (await getAllChats()).find(c => c._id === chatId) || null;
        if (updated) dispatch({ type: 'SET_ACTIVE_CHAT', payload: updated });
      }
    } catch (e) { console.error(e); }
  };

  const setActiveChat = async (chat: Chat | null) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chat });
    if (chat) {
      // join room for realtime updates
      try {
        socket?.emit('joinChat', chat._id);
      } catch {}
      markAsRead(chat._id);
      // 6. Fetch messages from a dedicated endpoint
      console.log("Fetching messages for chat from setActiveChat:", chat)
      try {
        const response = await fetch(`http://localhost:5002/api/v1/chat/${chat._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        const messages: MessageInterface[] = Array.isArray(data) ? data : data.messages;
        dispatch({ type: 'SET_MESSAGES', payload: { chatId: chat._id, messages } });
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    }
  };

  const markAsRead = (chatId: string) => {
    // Here you might want to also notify the backend
    dispatch({ type: 'MARK_CHAT_READ', payload: chatId });
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        sendMedia,
        deleteChat,
        deleteMessage,
        createChat,
        createGroupChat,
        addUserToGroup,
        removeUserFromGroup,
        renameGroup,
        setActiveChat,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
