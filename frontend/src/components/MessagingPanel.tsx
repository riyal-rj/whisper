import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Label } from './ui/label';

interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  video?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image" | "video";
  seen: boolean;
  seenAt?: Date;
  createdAt: string;
}

interface Chat {
  _id: string;
  users: string[];
  latestMessage?: {
    text: string;
    sender: string;
  };
  isGroupChat: boolean;
  groupName?: string;
  groupAdmin?: string;
  members?: string[];
  unseenCount?: number;
  user?: { // This will be the other user's data for direct chats
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

interface MessagingPanelProps {
  selectedChat: Chat | null;
}

const MessagingPanel: React.FC<MessagingPanelProps> = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5002/api/v1/chat/${selectedChat._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessages(response.data.messages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || (!newMessage.trim() && !selectedFile)) return;

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      console.log(selectedChat._id);
      formData.append("chatId", selectedChat._id);
      if (newMessage.trim()) {
        formData.append("text", newMessage);
      }
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const response = await axios.post(
        'http://localhost:5002/api/v1/chat/send',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage('');
      setSelectedFile(null);
      toast.success("Message sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (!selectedChat) {
    return (
      <Card className="h-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-xl">
        Select a chat to start messaging.
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold">{selectedChat.isGroupChat ? selectedChat.groupName : selectedChat.user?.name}</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender === user?._id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[70%] ${msg.sender === user?._id
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"}
              `}
            >
              {msg.messageType === "text" && <p>{msg.text}</p>}
              {msg.messageType === "image" && msg.image && (
                <img src={msg.image.url} alt="message image" className="max-w-xs rounded-md" />
              )}
              {msg.messageType === "video" && msg.video && (
                <video controls src={msg.video.url} className="max-w-xs rounded-md" />
              )}
              <p className="text-xs mt-1 opacity-75">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          className="flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Label htmlFor="file-upload" className="cursor-pointer">
          <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
          <Button type="button" variant="outline" size="icon">
            <ImageIcon className="h-4 w-4" />
          </Button>
        </Label>
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
};

export default MessagingPanel;