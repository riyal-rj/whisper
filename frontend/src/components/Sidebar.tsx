import React from 'react';
import { Plus, Users, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreateChatModal } from '@/components/CreateChatModal';
import { CreateGroupChatModal } from '@/components/CreateGroupChatModal';

export const Sidebar: React.FC = () => {
  const { chats, activeChat, setActiveChat, onlineUsers } = useChat();
  const { user: currentUser } = useAuth();
  const [showCreateChat, setShowCreateChat] = React.useState(false);
  const [showCreateGroup, setShowCreateGroup] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredChats = chats.filter(chat => {
    if (!chat.members || chat.members.length === 0) return false;
    const chatName = chat.isGroupChat ?
      chat.members.find(m => m._id === currentUser?._id)?.name || chat.groupName || 'Group Chat' :
      chat.members.find(p => p._id !== currentUser?._id)?.name || 'Unknown';
    return chatName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTime = (date: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return `${hours}h`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <>
      <div className="w-72 bg-surface border-r border-border flex flex-col h-full">
        {/* Search and Create buttons */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant="clean" 
              size="sm" 
              onClick={() => setShowCreateChat(true)}
              className="flex-1"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </Button>
            <Button 
              variant="clean" 
              size="sm" 
              onClick={() => setShowCreateGroup(true)}
              className="flex-1"
            >
              <Users className="w-4 h-4" />
              New Group
            </Button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No chats found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat) => {
                const otherParticipant = chat.members.find(p => p._id !== currentUser?._id);
                const chatName = chat.isGroupChat ? chat.groupName || 'Group Chat' : otherParticipant?.name || 'Unknown';
                const isOnline = chat.isGroupChat ? 
                  chat.members.some(p => onlineUsers.has(p._id)) :
                  otherParticipant && onlineUsers.has(otherParticipant._id);

                return (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChat(chat)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeChat?._id === chat._id 
                        ? 'bg-accent' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={chat.isGroupChat ? undefined : otherParticipant?.profilePicture} 
                            alt={chatName} 
                          />
                          <AvatarFallback className="bg-muted text-foreground text-sm">
                            {chat.isGroupChat ? <Users className="w-4 h-4" /> : chatName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {!chat.isGroupChat && isOnline && (
                          <div className="status-dot status-online absolute -bottom-0 -right-0" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {chatName}
                          </h3>
                          {chat.latestMessage?.createdAt && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(chat.latestMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">
                            {chat.latestMessage?.text || 'No messages yet'}
                          </p>
                          {chat.unreadCount > 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs min-w-5 h-5 rounded-full">
                              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateChatModal 
        isOpen={showCreateChat} 
        onClose={() => setShowCreateChat(false)} 
      />
      <CreateGroupChatModal 
        isOpen={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
      />
    </>
  );
};