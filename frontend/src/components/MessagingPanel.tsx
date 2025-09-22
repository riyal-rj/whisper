import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Send, Image as ImageIcon, X, Trash2 } from "lucide-react";
import { Label } from "./ui/label";

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
  user?: {
    // This will be the other user's data for direct chats
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
  const [newMessage, setNewMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!selectedChat || !user) return;
    try {
      const token = localStorage.getItem("token");
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
      toast.error(error.response?.data?.message || "Failed to fetch messages");
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
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("chatId", selectedChat._id);

      if (newMessage.trim()) {
        formData.append("text", newMessage);
        formData.append("messageType", "text");
      }

      if (selectedFile) {
        formData.append("file", selectedFile);
        const type = selectedFile.type.startsWith("image") ? "image" : "video";
        formData.append("messageType", type);
      }

      const response = await axios.post(
        "http://localhost:5002/api/v1/chat/send",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage("");
      setSelectedFile(null);
      setPreviewUrl(null);
      toast.success("Message sent!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };
const handleDeleteMessage = async (messageId: string) => {
  try {
    console.log("Deleting message with ID:", messageId);
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5002/api/v1/chat/msg/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    toast.success("Message deleted");
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete message");
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
        <h2 className="text-xl font-semibold">
          {selectedChat.isGroupChat
            ? selectedChat.groupName
            : selectedChat.user?.name}
        </h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          console.log(msg),
          <div
    key={msg._id}
    className={`flex ${
      msg.sender === user?._id ? "justify-end" : "justify-start"
    }`}
  >
    <div className="relative">
      <div
        className={`p-3 rounded-lg max-w-[70%] ${
          msg.sender === user?._id
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        }`}
      >
        {msg.messageType === "text" && <p>{msg.text}</p>}
        {msg.messageType === "image" && msg.image && (
          <img
            src={msg.image.url}
            alt="message image"
            className="max-w-xs rounded-md"
          />
        )}
        {msg.messageType === "video" && msg.video && (
          <video
            controls
            src={msg.video.url}
            className="max-w-xs rounded-md"
          />
        )}
        <p className="text-xs mt-1 opacity-75">
          {new Date(msg.createdAt).toLocaleTimeString()}
        </p>
      </div>
      {/* Show delete icon only if current user sent the message */}
      {msg.sender === user?._id && (
        <button
          onClick={() => handleDeleteMessage(msg._id)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          title="Delete message"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t dark:border-gray-700 flex flex-col space-y-2"
      >
        {previewUrl && (
          <div className="relative w-fit">
            {selectedFile?.type.startsWith("image") ? (
              <img
                src={previewUrl}
                alt="preview"
                className="max-w-xs rounded-md"
              />
            ) : (
              <video
                controls
                src={previewUrl}
                className="max-w-xs rounded-md"
              />
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            className="flex-1"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Label htmlFor="file-upload" className="cursor-pointer">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,video/*"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleIconClick}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </Label>
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default MessagingPanel;
