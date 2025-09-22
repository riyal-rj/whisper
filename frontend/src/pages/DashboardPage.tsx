import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import MessagingPanel from '../components/MessagingPanel';
import CreateChatDialog from '../components/CreateChatDialog';
import CreateGroupChatDialog from '../components/CreateGroupChatDialog';
import axios from 'axios';
import { toast } from 'sonner';

interface ChatUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

interface LatestMessage {
  text: string;
  sender: string;
}

interface Chat {
  _id: string;
  users: string[];
  latestMessage?: LatestMessage;
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  members?: string[];
  unseenCount?: number;
  user?: ChatUser;
}

interface ChatListItem {
  chat: Chat;
  user?: ChatUser;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null); 
  const [isCreateChatDialogOpen, setIsCreateChatDialogOpen] = useState(false);
  const [isCreateGroupChatDialogOpen, setIsCreateGroupChatDialogOpen] = useState(false);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5002/api/v1/chat/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChats(response.data.chats);
      console.log("Fetched chats:", response.data.chats);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch chats');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchChats();
    }
  }, [user, navigate]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleDeleteChat = (chatId: string) => {
  toast.warning("Are you sure you want to delete this chat?", {
    action: {
      label: "Delete",
      onClick: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5002/api/v1/chat/${chatId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          toast.success("Chat deleted successfully!");
          fetchChats();
          if (selectedChat?._id === chatId) {
            setSelectedChat(null);
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to delete chat');
        }
      },
    },
  });
};

  const handleChatCreated = () => {
    fetchChats(); // Refresh the chat list when a new chat is created
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 pt-16">
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-gray-800 shadow-md p-4 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Chats</h2>
            <Button className="w-full mb-2" onClick={() => setIsCreateChatDialogOpen(true)}>Create Chat</Button>
            <Button className="w-full" onClick={() => setIsCreateGroupChatDialogOpen(true)}>Create Group</Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {user && <ChatList chats={chats} onSelectChat={handleSelectChat} onDeleteChat={handleDeleteChat} currentUserId={user._id} />}
          </div>
        </aside>

        {/* Messaging Panel */}
        <main className="flex-1 p-6">
          <MessagingPanel selectedChat={selectedChat} />
        </main>
      </div>

      <CreateChatDialog
        isOpen={isCreateChatDialogOpen}
        onClose={() => setIsCreateChatDialogOpen(false)}
        onChatCreated={handleChatCreated}
      />

      <CreateGroupChatDialog
        isOpen={isCreateGroupChatDialogOpen}
        onClose={() => setIsCreateGroupChatDialogOpen(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default DashboardPage;